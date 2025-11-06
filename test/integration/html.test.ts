import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';
import { HtmlHandler } from '../../src/handlers/html';
import { TestWorkspace } from '../helpers/workspace';

suite('HtmlHandler Integration Tests', () => {
    let handler: HtmlHandler;
    let workspace: TestWorkspace;

    suiteSetup(async () => {
        workspace = new TestWorkspace();
        await workspace.setup();
        handler = new HtmlHandler();
    });

    suiteTeardown(async () => {
        await workspace.cleanup();
    });

    test('should extract reference from HTML page', async () => {
        const htmlPath = path.join(workspace.rootPath, 'index.html');
        const content = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Test Page</title>
</head>
<body>
    <header id="main-header">
        <nav id="navigation">
            <ul>
                <li><a href="#home">Home</a></li>
                <li><a href="#about">About</a></li>
            </ul>
        </nav>
    </header>

    <main id="content">
        <section id="home" class="section">
            <h1>Welcome</h1>
            <p>This is the home section.</p>
        </section>

        <section id="about" class="section">
            <h2>About Us</h2>
            <p>Information about our company.</p>
        </section>
    </main>

    <footer id="main-footer">
        <p>&copy; 2024 Test Company</p>
    </footer>
</body>
</html>`;

        const uri = vscode.Uri.file(htmlPath);
        await workspace.writeFile(htmlPath, content);

        const document = await vscode.workspace.openTextDocument(uri);

        // Test reference at header
        const headerPos = new vscode.Position(7, 15);
        const headerRef = await handler.extractReference(document, headerPos);
        assert.notStrictEqual(headerRef, null);
        if (headerRef) {
            assert.strictEqual(headerRef.toString(), 'index.html#main-header');
        }

        // Test reference at navigation
        const navPos = new vscode.Position(8, 20);
        const navRef = await handler.extractReference(document, navPos);
        assert.notStrictEqual(navRef, null);
        if (navRef) {
            assert.strictEqual(navRef.toString(), 'index.html#navigation');
        }

        // Test reference at section
        const sectionPos = new vscode.Position(17, 25);
        const sectionRef = await handler.extractReference(document, sectionPos);
        assert.notStrictEqual(sectionRef, null);
        if (sectionRef) {
            assert.strictEqual(sectionRef.toString(), 'index.html#home');
        }
    });

    test('should handle complex component structure', async () => {
        const componentPath = path.join(workspace.rootPath, 'components', 'card.html');
        const content = `<div class="card-container" data-component="card">
    <div class="card" id="product-card">
        <div class="card-header">
            <img src="product.jpg" alt="Product" class="card-image" id="product-image">
            <h3 class="card-title" id="product-title">Product Name</h3>
        </div>
        <div class="card-body">
            <p class="card-description" id="product-desc">
                This is a product description.
            </p>
            <div class="card-actions">
                <button class="btn btn-primary" id="add-to-cart">Add to Cart</button>
                <button class="btn btn-secondary" id="view-details">View Details</button>
            </div>
        </div>
        <div class="card-footer">
            <span class="price" id="product-price">$99.99</span>
            <span class="rating" id="product-rating" data-rating="4.5">★★★★☆</span>
        </div>
    </div>
</div>`;

        const uri = vscode.Uri.file(componentPath);
        await workspace.createDirectory(path.dirname(componentPath));
        await workspace.writeFile(componentPath, content);

        const document = await vscode.workspace.openTextDocument(uri);

        // Test various element references
        const buttonPos = new vscode.Position(11, 40);
        const buttonRef = await handler.extractReference(document, buttonPos);
        assert.notStrictEqual(buttonRef, null);
        if (buttonRef) {
            assert.strictEqual(buttonRef.toString(), 'components/card.html#add-to-cart');
        }

        const imagePos = new vscode.Position(3, 30);
        const imageRef = await handler.extractReference(document, imagePos);
        assert.notStrictEqual(imageRef, null);
        if (imageRef) {
            assert.strictEqual(imageRef.toString(), 'components/card.html#product-image');
        }

        const ratingPos = new vscode.Position(17, 30);
        const ratingRef = await handler.extractReference(document, ratingPos);
        assert.notStrictEqual(ratingRef, null);
        if (ratingRef) {
            assert.strictEqual(ratingRef.toString(), 'components/card.html#product-rating');
        }
    });

    test('should handle XML configuration files', async () => {
        const xmlPath = path.join(workspace.rootPath, 'config.xml');
        const content = `<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <database id="main-db">
        <host>localhost</host>
        <port>5432</port>
        <name>testdb</name>
        <credentials id="db-creds">
            <username>admin</username>
            <password encrypted="true">***</password>
        </credentials>
    </database>

    <cache id="redis-cache">
        <type>redis</type>
        <host>localhost</host>
        <port>6379</port>
        <ttl>3600</ttl>
    </cache>

    <logging id="app-logging">
        <level>info</level>
        <output>
            <file id="log-file">app.log</file>
            <console enabled="true" />
        </output>
    </logging>
</configuration>`;

        const uri = vscode.Uri.file(xmlPath);
        await workspace.writeFile(xmlPath, content);

        const document = await vscode.workspace.openTextDocument(uri);

        // Test database reference
        const dbPos = new vscode.Position(2, 15);
        const dbRef = await handler.extractReference(document, dbPos);
        assert.notStrictEqual(dbRef, null);
        if (dbRef) {
            assert.strictEqual(dbRef.toString(), 'config.xml#main-db');
        }

        // Test nested credentials reference
        const credsPos = new vscode.Position(6, 25);
        const credsRef = await handler.extractReference(document, credsPos);
        assert.notStrictEqual(credsRef, null);
        if (credsRef) {
            assert.strictEqual(credsRef.toString(), 'config.xml#db-creds');
        }

        // Test logging file reference
        const logPos = new vscode.Position(21, 20);
        const logRef = await handler.extractReference(document, logPos);
        assert.notStrictEqual(logRef, null);
        if (logRef) {
            assert.strictEqual(logRef.toString(), 'config.xml#log-file');
        }
    });

    test('should handle SVG graphics', async () => {
        const svgPath = path.join(workspace.rootPath, 'icons.svg');
        const content = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <defs>
        <linearGradient id="gradient1">
            <stop offset="0%" style="stop-color:rgb(255,255,0);stop-opacity:1" />
            <stop offset="100%" style="stop-color:rgb(255,0,0);stop-opacity:1" />
        </linearGradient>
    </defs>

    <g id="icon-home">
        <path d="M50 10 L80 40 L80 80 L20 80 L20 40 Z" fill="url(#gradient1)" />
        <rect x="35" y="50" width="30" height="30" id="door" fill="#8B4513" />
        <circle cx="50" cy="65" r="2" id="doorknob" fill="#FFD700" />
    </g>

    <g id="icon-user">
        <circle cx="50" cy="30" r="15" id="head" fill="#FFB6C1" />
        <ellipse cx="50" cy="70" rx="25" ry="20" id="body" fill="#87CEEB" />
    </g>

    <symbol id="icon-star" viewBox="0 0 24 24">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </symbol>
</svg>`;

        const uri = vscode.Uri.file(svgPath);
        await workspace.writeFile(svgPath, content);

        const document = await vscode.workspace.openTextDocument(uri);

        // Test gradient reference
        const gradientPos = new vscode.Position(2, 30);
        const gradientRef = await handler.extractReference(document, gradientPos);
        assert.notStrictEqual(gradientRef, null);
        if (gradientRef) {
            assert.strictEqual(gradientRef.toString(), 'icons.svg#gradient1');
        }

        // Test icon group reference
        const iconPos = new vscode.Position(8, 10);
        const iconRef = await handler.extractReference(document, iconPos);
        assert.notStrictEqual(iconRef, null);
        if (iconRef) {
            assert.strictEqual(iconRef.toString(), 'icons.svg#icon-home');
        }

        // Test nested element reference
        const doorPos = new vscode.Position(10, 40);
        const doorRef = await handler.extractReference(document, doorPos);
        assert.notStrictEqual(doorRef, null);
        if (doorRef) {
            assert.strictEqual(doorRef.toString(), 'icons.svg#door');
        }

        // Test symbol reference
        const symbolPos = new vscode.Position(19, 15);
        const symbolRef = await handler.extractReference(document, symbolPos);
        assert.notStrictEqual(symbolRef, null);
        if (symbolRef) {
            assert.strictEqual(symbolRef.toString(), 'icons.svg#icon-star');
        }
    });

    test('should handle form elements', async () => {
        const formPath = path.join(workspace.rootPath, 'forms', 'registration.html');
        const content = `<!DOCTYPE html>
<html>
<body>
    <form id="registration-form" action="/register" method="post">
        <fieldset id="personal-info">
            <legend>Personal Information</legend>
            <div class="form-group">
                <label for="username">Username:</label>
                <input type="text" id="username" name="username" required>
            </div>
            <div class="form-group">
                <label for="email">Email:</label>
                <input type="email" id="email" name="email" required>
            </div>
            <div class="form-group">
                <label for="password">Password:</label>
                <input type="password" id="password" name="password" required>
            </div>
        </fieldset>

        <fieldset id="preferences">
            <legend>Preferences</legend>
            <div class="form-group">
                <label for="newsletter">
                    <input type="checkbox" id="newsletter" name="newsletter">
                    Subscribe to newsletter
                </label>
            </div>
            <div class="form-group">
                <label for="country">Country:</label>
                <select id="country" name="country">
                    <option value="us">United States</option>
                    <option value="uk">United Kingdom</option>
                    <option value="ca">Canada</option>
                </select>
            </div>
        </fieldset>

        <div class="form-actions">
            <button type="submit" id="submit-btn">Register</button>
            <button type="reset" id="reset-btn">Clear</button>
        </div>
    </form>
</body>
</html>`;

        const uri = vscode.Uri.file(formPath);
        await workspace.createDirectory(path.dirname(formPath));
        await workspace.writeFile(formPath, content);

        const document = await vscode.workspace.openTextDocument(uri);

        // Test form reference
        const formPos = new vscode.Position(3, 20);
        const formRef = await handler.extractReference(document, formPos);
        assert.notStrictEqual(formRef, null);
        if (formRef) {
            assert.strictEqual(formRef.toString(), 'forms/registration.html#registration-form');
        }

        // Test fieldset reference
        const fieldsetPos = new vscode.Position(4, 25);
        const fieldsetRef = await handler.extractReference(document, fieldsetPos);
        assert.notStrictEqual(fieldsetRef, null);
        if (fieldsetRef) {
            assert.strictEqual(fieldsetRef.toString(), 'forms/registration.html#personal-info');
        }

        // Test input reference
        const inputPos = new vscode.Position(8, 35);
        const inputRef = await handler.extractReference(document, inputPos);
        assert.notStrictEqual(inputRef, null);
        if (inputRef) {
            assert.strictEqual(inputRef.toString(), 'forms/registration.html#username');
        }

        // Test select reference
        const selectPos = new vscode.Position(30, 25);
        const selectRef = await handler.extractReference(document, selectPos);
        assert.notStrictEqual(selectRef, null);
        if (selectRef) {
            assert.strictEqual(selectRef.toString(), 'forms/registration.html#country');
        }
    });

    test('should handle template syntax', async () => {
        const templatePath = path.join(workspace.rootPath, 'templates', 'vue-component.html');
        const content = `<template id="user-card-template">
    <div class="user-card" :id="'user-' + user.id">
        <img :src="user.avatar" :alt="user.name" class="avatar">
        <div class="user-info">
            <h3 v-text="user.name"></h3>
            <p v-html="user.bio"></p>
            <div v-if="user.isOnline" class="status online" id="online-status">
                Online
            </div>
            <div v-else class="status offline" id="offline-status">
                Offline
            </div>
        </div>
        <div class="actions">
            <button @click="sendMessage" id="message-btn">Message</button>
            <button @click="viewProfile" id="profile-btn">View Profile</button>
        </div>
    </div>
</template>`;

        const uri = vscode.Uri.file(templatePath);
        await workspace.createDirectory(path.dirname(templatePath));
        await workspace.writeFile(templatePath, content);

        const document = await vscode.workspace.openTextDocument(uri);

        // Test template reference
        const templatePos = new vscode.Position(0, 15);
        const templateRef = await handler.extractReference(document, templatePos);
        assert.notStrictEqual(templateRef, null);
        if (templateRef) {
            assert.strictEqual(templateRef.toString(), 'templates/vue-component.html#user-card-template');
        }

        // Test dynamic element references
        const statusPos = new vscode.Position(6, 50);
        const statusRef = await handler.extractReference(document, statusPos);
        assert.notStrictEqual(statusRef, null);
        if (statusRef) {
            assert.strictEqual(statusRef.toString(), 'templates/vue-component.html#online-status');
        }

        const buttonPos = new vscode.Position(14, 35);
        const buttonRef = await handler.extractReference(document, buttonPos);
        assert.notStrictEqual(buttonRef, null);
        if (buttonRef) {
            assert.strictEqual(buttonRef.toString(), 'templates/vue-component.html#message-btn');
        }
    });

    test('should handle performance with large documents', async () => {
        const largePath = path.join(workspace.rootPath, 'large.html');

        // Generate a large HTML document
        let content = '<!DOCTYPE html>\n<html>\n<body>\n';
        for (let i = 1; i <= 100; i++) {
            content += `  <section id="section-${i}">\n`;
            content += `    <h2>Section ${i}</h2>\n`;
            for (let j = 1; j <= 10; j++) {
                content += `    <div id="section-${i}-item-${j}" class="item">\n`;
                content += `      <p>Content for item ${j} in section ${i}</p>\n`;
                content += `    </div>\n`;
            }
            content += `  </section>\n`;
        }
        content += '</body>\n</html>';

        const uri = vscode.Uri.file(largePath);
        await workspace.writeFile(largePath, content);

        const document = await vscode.workspace.openTextDocument(uri);

        // Test extraction performance
        const startTime = Date.now();

        // Extract references at multiple positions
        const positions = [
            new vscode.Position(10, 20),
            new vscode.Position(100, 25),
            new vscode.Position(500, 30),
            new vscode.Position(1000, 15)
        ];

        for (const pos of positions) {
            const ref = await handler.extractReference(document, pos);
            assert.notStrictEqual(ref, null);
        }

        const endTime = Date.now();
        const duration = endTime - startTime;

        // Should complete within reasonable time (< 1 second for all extractions)
        assert.ok(duration < 1000, `Extraction took too long: ${duration}ms`);
    });

    test('should handle XHTML documents', async () => {
        const xhtmlPath = path.join(workspace.rootPath, 'document.xhtml');
        const content = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN"
    "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en">
<head>
    <title>XHTML Document</title>
</head>
<body>
    <div id="header">
        <h1>XHTML Strict Document</h1>
    </div>
    <div id="content">
        <p id="intro">This is a valid XHTML document.</p>
        <ul id="list">
            <li>Item 1</li>
            <li>Item 2</li>
        </ul>
    </div>
    <div id="footer">
        <p>Footer content</p>
    </div>
</body>
</html>`;

        const uri = vscode.Uri.file(xhtmlPath);
        await workspace.writeFile(xhtmlPath, content);

        const document = await vscode.workspace.openTextDocument(uri);

        // Test XHTML element references
        const headerPos = new vscode.Position(8, 15);
        const headerRef = await handler.extractReference(document, headerPos);
        assert.notStrictEqual(headerRef, null);
        if (headerRef) {
            assert.strictEqual(headerRef.toString(), 'document.xhtml#header');
        }

        const listPos = new vscode.Position(13, 15);
        const listRef = await handler.extractReference(document, listPos);
        assert.notStrictEqual(listRef, null);
        if (listRef) {
            assert.strictEqual(listRef.toString(), 'document.xhtml#list');
        }
    });
});
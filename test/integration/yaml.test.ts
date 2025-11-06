import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';
import { YamlHandler } from '../../src/handlers/yaml';
import { TestWorkspace } from '../helpers/workspace';

suite('YamlHandler Integration Tests', () => {
    let handler: YamlHandler;
    let workspace: TestWorkspace;

    suiteSetup(async () => {
        workspace = new TestWorkspace();
        await workspace.setup();
        handler = new YamlHandler();
    });

    suiteTeardown(async () => {
        await workspace.cleanup();
    });

    test('should extract reference from configuration file', async () => {
        const configPath = path.join(workspace.rootPath, 'config.yml');
        const content = `# Application Configuration
name: MyApp
version: 1.2.3

server:
  host: localhost
  port: 8080
  ssl:
    enabled: true
    certificate: /path/to/cert.pem
    key: /path/to/key.pem

database:
  type: postgresql
  connection:
    host: db.example.com
    port: 5432
    database: myapp
    username: appuser
    password: \${DB_PASSWORD}

cache:
  type: redis
  host: cache.example.com
  port: 6379
  ttl: 3600

logging:
  level: info
  outputs:
    - type: console
      format: json
    - type: file
      path: /var/log/myapp.log
      rotate: daily`;

        const uri = vscode.Uri.file(configPath);
        await workspace.writeFile(configPath, content);

        const document = await vscode.workspace.openTextDocument(uri);

        // Test top-level key reference
        const namePos = new vscode.Position(1, 5);
        const nameRef = await handler.extractReference(document, namePos);
        assert.notStrictEqual(nameRef, null);
        if (nameRef) {
            assert.strictEqual(nameRef.toString(), 'config.yml:name');
        }

        // Test nested key reference
        const sslPos = new vscode.Position(8, 10);
        const sslRef = await handler.extractReference(document, sslPos);
        assert.notStrictEqual(sslRef, null);
        if (sslRef) {
            assert.strictEqual(sslRef.toString(), 'config.yml:server.ssl.enabled');
        }

        // Test deep nested reference
        const dbHostPos = new vscode.Position(15, 10);
        const dbHostRef = await handler.extractReference(document, dbHostPos);
        assert.notStrictEqual(dbHostRef, null);
        if (dbHostRef) {
            assert.strictEqual(dbHostRef.toString(), 'config.yml:database.connection.host');
        }

        // Test array item reference
        const logOutputPos = new vscode.Position(29, 10);
        const logOutputRef = await handler.extractReference(document, logOutputPos);
        assert.notStrictEqual(logOutputRef, null);
        if (logOutputRef) {
            assert.ok(logOutputRef.toString().includes('logging.outputs'));
        }
    });

    test('should handle Docker Compose file', async () => {
        const dockerPath = path.join(workspace.rootPath, 'docker-compose.yml');
        const content = `version: '3.8'

services:
  web:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./html:/usr/share/nginx/html
      - ./nginx.conf:/etc/nginx/nginx.conf
    networks:
      - webnet
    environment:
      - NODE_ENV=production
      - API_URL=http://api:3000

  api:
    build:
      context: ./api
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      DB_HOST: database
      DB_PORT: 5432
      DB_NAME: myapp
    depends_on:
      - database
    networks:
      - webnet
      - dbnet

  database:
    image: postgres:13
    environment:
      POSTGRES_DB: myapp
      POSTGRES_USER: appuser
      POSTGRES_PASSWORD: secretpass
    volumes:
      - db_data:/var/lib/postgresql/data
    networks:
      - dbnet

networks:
  webnet:
    driver: bridge
  dbnet:
    driver: bridge

volumes:
  db_data:
    driver: local`;

        const uri = vscode.Uri.file(dockerPath);
        await workspace.writeFile(dockerPath, content);

        const document = await vscode.workspace.openTextDocument(uri);

        // Test service reference
        const webServicePos = new vscode.Position(3, 2);
        const webServiceRef = await handler.extractReference(document, webServicePos);
        assert.notStrictEqual(webServiceRef, null);
        if (webServiceRef) {
            assert.strictEqual(webServiceRef.toString(), 'docker-compose.yml:services.web');
        }

        // Test nested service property
        const imagePos = new vscode.Position(4, 10);
        const imageRef = await handler.extractReference(document, imagePos);
        assert.notStrictEqual(imageRef, null);
        if (imageRef) {
            assert.strictEqual(imageRef.toString(), 'docker-compose.yml:services.web.image');
        }

        // Test port mapping array
        const portPos = new vscode.Position(6, 10);
        const portRef = await handler.extractReference(document, portPos);
        assert.notStrictEqual(portRef, null);
        if (portRef) {
            assert.ok(portRef.toString().includes('services.web.ports'));
        }

        // Test network reference
        const networkPos = new vscode.Position(44, 5);
        const networkRef = await handler.extractReference(document, networkPos);
        assert.notStrictEqual(networkRef, null);
        if (networkRef) {
            assert.strictEqual(networkRef.toString(), 'docker-compose.yml:networks.webnet');
        }
    });

    test('should handle Kubernetes manifest', async () => {
        const k8sPath = path.join(workspace.rootPath, 'deployment.yaml');
        const content = `apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
  labels:
    app: nginx
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:1.14.2
        ports:
        - containerPort: 80
        resources:
          limits:
            memory: "128Mi"
            cpu: "500m"
          requests:
            memory: "64Mi"
            cpu: "250m"
        volumeMounts:
        - name: config
          mountPath: /etc/nginx/conf.d
      volumes:
      - name: config
        configMap:
          name: nginx-config`;

        const uri = vscode.Uri.file(k8sPath);
        await workspace.writeFile(k8sPath, content);

        const document = await vscode.workspace.openTextDocument(uri);

        // Test metadata reference
        const metadataPos = new vscode.Position(3, 8);
        const metadataRef = await handler.extractReference(document, metadataPos);
        assert.notStrictEqual(metadataRef, null);
        if (metadataRef) {
            assert.strictEqual(metadataRef.toString(), 'deployment.yaml:metadata.name');
        }

        // Test spec replicas
        const replicasPos = new vscode.Position(7, 10);
        const replicasRef = await handler.extractReference(document, replicasPos);
        assert.notStrictEqual(replicasRef, null);
        if (replicasRef) {
            assert.strictEqual(replicasRef.toString(), 'deployment.yaml:spec.replicas');
        }

        // Test container reference
        const containerPos = new vscode.Position(17, 15);
        const containerRef = await handler.extractReference(document, containerPos);
        assert.notStrictEqual(containerRef, null);
        if (containerRef) {
            assert.ok(containerRef.toString().includes('spec.template.spec.containers'));
        }

        // Test resources limits
        const limitsPos = new vscode.Position(23, 15);
        const limitsRef = await handler.extractReference(document, limitsPos);
        assert.notStrictEqual(limitsRef, null);
        if (limitsRef) {
            assert.ok(limitsRef.toString().includes('resources.limits'));
        }
    });

    test('should handle GitHub Actions workflow', async () => {
        const workflowPath = path.join(workspace.rootPath, '.github', 'workflows', 'ci.yml');
        const content = `name: CI Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

env:
  NODE_VERSION: 16

jobs:
  test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [14, 16, 18]

    steps:
    - uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: \${{ matrix.node-version }}

    - name: Install dependencies
      run: npm ci

    - name: Run tests
      run: npm test

    - name: Upload coverage
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info

  build:
    needs: test
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Build Docker image
      run: docker build -t myapp:latest .

    - name: Push to registry
      if: github.ref == 'refs/heads/main'
      run: |
        echo \${{ secrets.DOCKER_PASSWORD }} | docker login -u \${{ secrets.DOCKER_USERNAME }} --password-stdin
        docker push myapp:latest`;

        const uri = vscode.Uri.file(workflowPath);
        await workspace.createDirectory(path.dirname(workflowPath));
        await workspace.writeFile(workflowPath, content);

        const document = await vscode.workspace.openTextDocument(uri);

        // Test workflow name
        const namePos = new vscode.Position(0, 6);
        const nameRef = await handler.extractReference(document, namePos);
        assert.notStrictEqual(nameRef, null);
        if (nameRef) {
            assert.strictEqual(nameRef.toString(), '.github/workflows/ci.yml:name');
        }

        // Test trigger branch
        const branchPos = new vscode.Position(4, 15);
        const branchRef = await handler.extractReference(document, branchPos);
        assert.notStrictEqual(branchRef, null);
        if (branchRef) {
            assert.ok(branchRef.toString().includes('on.push.branches'));
        }

        // Test job reference
        const jobPos = new vscode.Position(12, 5);
        const jobRef = await handler.extractReference(document, jobPos);
        assert.notStrictEqual(jobRef, null);
        if (jobRef) {
            assert.strictEqual(jobRef.toString(), '.github/workflows/ci.yml:jobs.test');
        }

        // Test step reference
        const stepPos = new vscode.Position(22, 10);
        const stepRef = await handler.extractReference(document, stepPos);
        assert.notStrictEqual(stepRef, null);
        if (stepRef) {
            assert.ok(stepRef.toString().includes('jobs.test.steps'));
        }
    });

    test('should handle Ansible playbook', async () => {
        const playbookPath = path.join(workspace.rootPath, 'playbook.yml');
        const content = `---
- name: Configure web servers
  hosts: webservers
  become: yes
  vars:
    http_port: 80
    max_clients: 200

  tasks:
    - name: Install nginx
      package:
        name: nginx
        state: present

    - name: Start nginx service
      service:
        name: nginx
        state: started
        enabled: yes

    - name: Configure firewall
      firewalld:
        service: http
        permanent: yes
        state: enabled
        immediate: yes

- name: Configure database servers
  hosts: dbservers
  become: yes
  vars:
    mysql_root_password: "{{ vault_mysql_root_password }}"

  tasks:
    - name: Install MySQL
      package:
        name: mysql-server
        state: present

    - name: Start MySQL service
      service:
        name: mysqld
        state: started
        enabled: yes`;

        const uri = vscode.Uri.file(playbookPath);
        await workspace.writeFile(playbookPath, content);

        const document = await vscode.workspace.openTextDocument(uri);

        // Test play name
        const playPos = new vscode.Position(1, 8);
        const playRef = await handler.extractReference(document, playPos);
        assert.notStrictEqual(playRef, null);
        if (playRef) {
            assert.ok(playRef.toString().includes('name'));
        }

        // Test hosts reference
        const hostsPos = new vscode.Position(2, 10);
        const hostsRef = await handler.extractReference(document, hostsPos);
        assert.notStrictEqual(hostsRef, null);
        if (hostsRef) {
            assert.ok(hostsRef.toString().includes('hosts'));
        }

        // Test task reference
        const taskPos = new vscode.Position(9, 10);
        const taskRef = await handler.extractReference(document, taskPos);
        assert.notStrictEqual(taskRef, null);
        if (taskRef) {
            assert.ok(taskRef.toString().includes('tasks'));
        }

        // Test module parameter
        const modulePos = new vscode.Position(11, 10);
        const moduleRef = await handler.extractReference(document, modulePos);
        assert.notStrictEqual(moduleRef, null);
        if (moduleRef) {
            assert.ok(moduleRef.toString().includes('package'));
        }
    });

    test('should handle OpenAPI specification', async () => {
        const apiPath = path.join(workspace.rootPath, 'openapi.yaml');
        const content = `openapi: 3.0.0
info:
  title: Sample API
  description: A sample API to demonstrate OpenAPI
  version: 1.0.0

servers:
  - url: https://api.example.com/v1
    description: Production server
  - url: https://staging-api.example.com/v1
    description: Staging server

paths:
  /users:
    get:
      summary: List all users
      operationId: listUsers
      tags:
        - users
      parameters:
        - name: limit
          in: query
          description: How many items to return
          required: false
          schema:
            type: integer
            default: 20
      responses:
        '200':
          description: A paged array of users
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/User'

components:
  schemas:
    User:
      type: object
      required:
        - id
        - name
      properties:
        id:
          type: integer
          format: int64
        name:
          type: string
        email:
          type: string
          format: email`;

        const uri = vscode.Uri.file(apiPath);
        await workspace.writeFile(apiPath, content);

        const document = await vscode.workspace.openTextDocument(uri);

        // Test info title
        const titlePos = new vscode.Position(2, 10);
        const titleRef = await handler.extractReference(document, titlePos);
        assert.notStrictEqual(titleRef, null);
        if (titleRef) {
            assert.strictEqual(titleRef.toString(), 'openapi.yaml:info.title');
        }

        // Test path reference
        const pathPos = new vscode.Position(13, 5);
        const pathRef = await handler.extractReference(document, pathPos);
        assert.notStrictEqual(pathRef, null);
        if (pathRef) {
            assert.ok(pathRef.toString().includes('paths'));
        }

        // Test operation reference
        const operationPos = new vscode.Position(16, 20);
        const operationRef = await handler.extractReference(document, operationPos);
        assert.notStrictEqual(operationRef, null);
        if (operationRef) {
            assert.ok(pathRef.toString().includes('paths'));
        }

        // Test schema reference
        const schemaPos = new vscode.Position(37, 10);
        const schemaRef = await handler.extractReference(document, schemaPos);
        assert.notStrictEqual(schemaRef, null);
        if (schemaRef) {
            assert.strictEqual(schemaRef.toString(), 'openapi.yaml:components.schemas.User');
        }
    });

    test('should handle multi-document YAML', async () => {
        const multiPath = path.join(workspace.rootPath, 'multi-doc.yaml');
        const content = `---
# Development configuration
environment: development
debug: true
database:
  host: localhost
  port: 5432
---
# Staging configuration
environment: staging
debug: false
database:
  host: staging.db.example.com
  port: 5432
---
# Production configuration
environment: production
debug: false
database:
  host: prod.db.example.com
  port: 5432
  ssl: true`;

        const uri = vscode.Uri.file(multiPath);
        await workspace.writeFile(multiPath, content);

        const document = await vscode.workspace.openTextDocument(uri);

        // Test first document
        const devPos = new vscode.Position(2, 15);
        const devRef = await handler.extractReference(document, devPos);
        assert.notStrictEqual(devRef, null);
        if (devRef) {
            assert.ok(devRef.toString().includes('environment'));
        }

        // Test second document
        const stagingPos = new vscode.Position(9, 15);
        const stagingRef = await handler.extractReference(document, stagingPos);
        assert.notStrictEqual(stagingRef, null);
        if (stagingRef) {
            assert.ok(stagingRef.toString().includes('environment'));
        }

        // Test third document
        const prodPos = new vscode.Position(18, 10);
        const prodRef = await handler.extractReference(document, prodPos);
        assert.notStrictEqual(prodRef, null);
        if (prodRef) {
            assert.ok(prodRef.toString().includes('database'));
        }
    });

    test('should handle performance with large YAML files', async () => {
        const largePath = path.join(workspace.rootPath, 'large.yml');

        // Generate a large YAML document
        let content = 'root:\n';
        for (let i = 1; i <= 100; i++) {
            content += `  section_${i}:\n`;
            content += `    name: Section ${i}\n`;
            content += `    description: This is section number ${i}\n`;
            content += `    items:\n`;
            for (let j = 1; j <= 10; j++) {
                content += `      - id: item_${i}_${j}\n`;
                content += `        value: ${i * j}\n`;
                content += `        enabled: true\n`;
            }
            content += `    metadata:\n`;
            content += `      created: 2024-01-01\n`;
            content += `      updated: 2024-01-15\n`;
        }

        const uri = vscode.Uri.file(largePath);
        await workspace.writeFile(largePath, content);

        const document = await vscode.workspace.openTextDocument(uri);

        // Test extraction performance
        const startTime = Date.now();

        // Extract references at multiple positions
        const positions = [
            new vscode.Position(10, 10),
            new vscode.Position(100, 15),
            new vscode.Position(500, 20),
            new vscode.Position(1000, 10)
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
});
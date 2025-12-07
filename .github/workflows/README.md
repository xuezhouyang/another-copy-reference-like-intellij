# GitHub Actions Workflows

This directory contains automated CI/CD workflows for the Copy Reference extension.

## Workflows

### 1. CI (`ci.yml`)
**Trigger**: Push to main/master/develop branches, PRs

**Purpose**: Continuous Integration testing across multiple Node.js versions

**Steps**:
- Checkout code
- Install dependencies
- Run linter
- Compile TypeScript
- Run tests
- Build production
- Package extension
- Upload VSIX as artifact

**Matrix**: Node.js 16.x, 18.x, 20.x

---

### 2. Release (`release.yml`)
**Trigger**: Push tags matching `v*.*.*` (e.g., v1.0.1)

**Purpose**: Automated release to GitHub and VS Code Marketplace

**Steps**:
- Build and package extension
- Extract changelog for version
- Create GitHub Release with VSIX attachment
- Publish to VS Code Marketplace (requires `VSCE_PAT` secret)

**Required Secrets**:
- `VSCE_PAT`: Personal Access Token for VS Code Marketplace
  - Create at: https://dev.azure.com → Personal Access Tokens
  - Scope: Marketplace → Manage
  - Add to: GitHub repo → Settings → Secrets → Actions

---

### 3. PR Check (`pr-check.yml`)
**Trigger**: Pull request opened/updated

**Purpose**: Validate PRs before merging

**Steps**:
- Run linter and type check
- Run tests
- Build and package
- Check package size (warn if > 10MB)
- Comment on PR with build status

---

### 4. Nightly Build (`nightly.yml`)
**Trigger**: Daily at 2 AM UTC, or manual dispatch

**Purpose**: Continuous testing and nightly builds

**Steps**:
- Run full test suite
- Build and package
- Upload nightly build artifact (retained for 30 days)

---

## Setup Instructions

### 1. Enable GitHub Actions
Ensure GitHub Actions is enabled in your repository settings.

### 2. Add Required Secrets

Go to: **Settings → Secrets and variables → Actions**

Add the following secrets:

- **VSCE_PAT**: Your VS Code Marketplace Personal Access Token
  ```
  1. Visit https://dev.azure.com
  2. User Settings → Personal Access Tokens
  3. New Token → Marketplace → Manage
  4. Copy token and add as GitHub secret
  ```

### 3. Create a Release

To trigger an automated release:

```bash
# Tag a new version
git tag -a v1.0.1 -m "Release v1.0.1"

# Push the tag
git push origin v1.0.1
```

The release workflow will:
1. ✅ Build and test the extension
2. 📦 Package as .vsix
3. 🚀 Create GitHub Release
4. 📤 Upload to VS Code Marketplace

### 4. Manual Workflow Dispatch

Some workflows can be triggered manually:

1. Go to **Actions** tab
2. Select workflow (e.g., "Nightly Build")
3. Click **Run workflow**

---

## Workflow Status Badges

Add these badges to your README.md:

```markdown
[![CI](https://github.com/xuezhouyang/another-copy-reference-like-intellij/actions/workflows/ci.yml/badge.svg)](https://github.com/xuezhouyang/another-copy-reference-like-intellij/actions/workflows/ci.yml)
[![Release](https://github.com/xuezhouyang/another-copy-reference-like-intellij/actions/workflows/release.yml/badge.svg)](https://github.com/xuezhouyang/another-copy-reference-like-intellij/actions/workflows/release.yml)
```

---

## Troubleshooting

### Release workflow fails to publish to Marketplace

**Issue**: `VSCE_PAT` secret not set or invalid

**Solution**:
1. Check that secret is added in Settings → Secrets
2. Verify token has Marketplace → Manage scope
3. Check token hasn't expired

### Package size warning

**Issue**: VSIX exceeds 10 MB

**Solution**:
1. Review `webpack.config.js` for optimization opportunities
2. Check for unnecessary files in package
3. Update `.vscodeignore` to exclude large files

### Tests fail in CI but pass locally

**Issue**: Environment differences

**Solution**:
1. Check Node.js version matches
2. Run `npm ci` instead of `npm install`
3. Review test logs in Actions tab

---

## Best Practices

1. **Tag format**: Always use `v` prefix (e.g., `v1.0.1`)
2. **Changelog**: Update CHANGELOG.md before tagging
3. **Version**: Bump version in package.json
4. **Testing**: Ensure all tests pass before releasing
5. **Secrets**: Never commit secrets to repository

---

## Local Testing

Test workflows locally using [act](https://github.com/nektos/act):

```bash
# Install act
brew install act  # macOS
# or
curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash

# Run CI workflow
act push

# Run release workflow
act -j release
```

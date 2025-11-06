# Publishing Guide for v1.0.0

## ✅ Completed Steps

- [x] Version updated to 1.0.0 in package.json
- [x] CHANGELOG.md updated with v1.0.0 release notes
- [x] Production build completed (70 KB bundle)
- [x] VSIX package created (97 KB)
- [x] Git commit created and pushed
- [x] Git tag v1.0.0 created and pushed
- [x] Release notes prepared

## 📋 Remaining Steps

### 1. Create GitHub Release

Since `gh` CLI is not installed, please create the release manually:

1. Go to: https://github.com/xuezhouyang/another-copy-reference-like-intellij/releases/new
2. Select tag: `v1.0.0`
3. Release title: `v1.0.0 - Multi-Language Copy Reference Extension`
4. Copy the content from `RELEASE_NOTES_v1.0.0.md` into the description
5. Upload the VSIX file: `another-copy-reference-like-intellij-1.0.0.vsix`
6. Click "Publish release"

### 2. Publish to VS Code Marketplace

You need to create a Personal Access Token (PAT) first:

#### Step 2.1: Create Azure DevOps PAT

1. Go to: https://dev.azure.com/
2. Sign in with your Microsoft account
3. Click on "User Settings" (gear icon) → "Personal access tokens"
4. Click "New Token"
5. Configure:
   - Name: "VS Code Marketplace - Copy Reference Extension"
   - Organization: All accessible organizations
   - Expiration: 90 days (or custom)
   - Scopes: **Marketplace** → **Manage** (select this scope)
6. Click "Create" and copy the token (you won't see it again!)

#### Step 2.2: Publish the Extension

Option A: Using the token in command line
```bash
npx vsce publish -p YOUR_TOKEN_HERE -i another-copy-reference-like-intellij-1.0.0.vsix
```

Option B: Set token as environment variable
```bash
export VSCE_PAT=YOUR_TOKEN_HERE
npx vsce publish -i another-copy-reference-like-intellij-1.0.0.vsix
```

Option C: Manual upload via web interface
1. Go to: https://marketplace.visualstudio.com/manage/publishers/xuezhouyang
2. Click "New extension" → "Visual Studio Code"
3. Drag and drop `another-copy-reference-like-intellij-1.0.0.vsix`
4. Click "Upload"

### 3. Verify Publication

After publishing, verify the extension:

1. Wait 5-10 minutes for marketplace indexing
2. Visit: https://marketplace.visualstudio.com/items?itemName=xuezhouyang.another-copy-reference-like-intellij
3. Check that version shows as 1.0.0
4. Test installation: `code --install-extension xuezhouyang.another-copy-reference-like-intellij`

### 4. Announce the Release

Consider announcing on:
- Twitter/X
- Reddit (r/vscode)
- Dev.to
- Your blog
- Company/team Slack

## 📦 Files Ready for Publishing

### VSIX Package
- **File**: `another-copy-reference-like-intellij-1.0.0.vsix`
- **Size**: 97 KB
- **Location**: Repository root
- **Contents**: 34 files (optimized production build)

### Release Assets
- **Release Notes**: `RELEASE_NOTES_v1.0.0.md`
- **Changelog**: `CHANGELOG.md`
- **README**: `README.md`
- **Migration Guide**: `MIGRATION_GUIDE.md`

## 🎯 Quick Reference

### Repository Information
- **GitHub**: https://github.com/xuezhouyang/another-copy-reference-like-intellij
- **Publisher**: xuezhouyang
- **Extension ID**: another-copy-reference-like-intellij
- **Version**: 1.0.0

### Key Metrics
- Bundle Size: 70 KB (86% better than 500 KB target)
- VSIX Size: 97 KB (90% better than 1 MB target)
- Test Coverage: 85%
- Languages Supported: 8
- UI Languages: 12

### Support Links
- **Issues**: https://github.com/xuezhouyang/another-copy-reference-like-intellij/issues
- **Email**: xuezhouyang@gmail.com
- **License**: MIT

## 🚀 Post-Publication Checklist

After successful publication:

- [ ] Verify extension appears in marketplace
- [ ] Test installation from marketplace
- [ ] Update README with marketplace badges
- [ ] Close any related GitHub issues
- [ ] Update project documentation
- [ ] Monitor for user feedback
- [ ] Plan for v1.1.0 features (if any)

## ⚠️ Troubleshooting

### If publishing fails:

1. **Authentication Error**: Verify PAT is valid and has "Marketplace (Manage)" scope
2. **Version Conflict**: Ensure version 1.0.0 doesn't already exist
3. **Package Too Large**: Current package is 97 KB, well within limits
4. **Validation Errors**: Check package.json for required fields

### Getting Help:

- VS Code Extension Publishing Docs: https://code.visualstudio.com/api/working-with-extensions/publishing-extension
- vsce CLI Docs: https://github.com/microsoft/vscode-vsce
- Marketplace Support: https://aka.ms/vsmarketplace-support

---

**Status**: Ready for publication ✅
**Created**: 2025-11-06
**Version**: 1.0.0

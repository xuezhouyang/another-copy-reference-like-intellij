# 发布指南 v1.2.0

## 发布前检查清单

- [x] 代码已完成并测试
- [x] 版本号已更新（package.json: 1.2.0）
- [x] CHANGELOG.md 已更新
- [x] README.md 已更新
- [x] 所有测试通过
- [x] GitHub Actions 成功运行
- [ ] 本地构建并测试 VSIX 包
- [ ] 创建 Git tag
- [ ] 推送到 GitHub
- [ ] 发布到 VS Code Marketplace
- [ ] 创建 GitHub Release

## 步骤 1: 本地构建和测试

### 1.1 清理旧文件
```bash
# 清理旧的构建文件
rm -rf out/ dist/ *.vsix

# 重新安装依赖（可选）
rm -rf node_modules package-lock.json
npm install
```

### 1.2 运行完整构建流程
```bash
# 1. Lint 检查
npm run lint

# 2. 编译 TypeScript
npm run compile

# 3. 运行测试（可选，需要 VS Code）
npm test

# 4. 生产构建
npm run build:prod

# 5. 打包 VSIX
npm run package
```

### 1.3 验证 VSIX 包
```bash
# 检查包是否生成
ls -lh *.vsix

# 应该看到类似：
# another-copy-reference-like-intellij-1.2.0.vsix (约 100KB)
```

### 1.4 本地安装测试（重要！）
```bash
# 在 VS Code 中安装 VSIX 进行测试
code --install-extension another-copy-reference-like-intellij-1.2.0.vsix

# 测试功能：
# 1. 打开 Java/JavaScript/Python 文件
# 2. 测试 Alt+Shift+C (默认格式)
# 3. 测试 Alt+Shift+F (格式选择器)
# 4. 验证所有 6 种格式都能正常工作
# 5. 测试自定义格式（如果配置了）
```

测试通过后继续下一步。

## 步骤 2: 创建 Git Tag 并推送

### 2.1 提交所有更改
```bash
# 确保所有更改都已提交
git status

# 如果有未提交的更改
git add .
git commit -m "chore: Prepare for v1.2.0 release"
```

### 2.2 创建并推送 Tag
```bash
# 创建 annotated tag
git tag -a v1.2.0 -m "Release v1.2.0: Multi-format reference system

Major features:
- 6 built-in reference formats
- Interactive format picker (Alt+Shift+F)
- Custom format templates
- Language-specific formats (Javadoc, Stack Trace)
- Comprehensive test coverage (133+ tests)
- Full backward compatibility

See CHANGELOG.md for complete details."

# 查看 tag
git tag -l

# 推送 tag 到 GitHub
git push origin v1.2.0

# 推送所有代码（如果还没推送）
git push origin claude/fix-java-copy-reference-01LReLnoF8vDKw1AHKyR6TzU
```

**重要**: 推送 tag 后会自动触发 GitHub Actions 的 Release workflow！

## 步骤 3: 发布到 VS Code Marketplace

### 3.1 创建 Azure DevOps Personal Access Token (首次发布)

如果你已经有 PAT，跳到步骤 3.2。

1. **访问 Azure DevOps**
   - 打开: https://dev.azure.com/
   - 使用 Microsoft 账号登录（如果没有账号，需要先注册）

2. **创建 Personal Access Token**
   - 点击右上角用户图标 → "Personal access tokens"
   - 或直接访问: https://dev.azure.com/[你的用户名]/_usersSettings/tokens
   - 点击 "+ New Token"

3. **配置 Token**
   - **Name**: `VS Code Marketplace - Copy Reference Extension`
   - **Organization**: All accessible organizations
   - **Expiration**: 90 days（或自定义）
   - **Scopes**: 选择 "Custom defined"
     - 展开 "Marketplace"
     - ✅ 勾选 "Manage"（这会自动勾选 Acquire 和 Publish）
   - 点击 "Create"

4. **保存 Token**
   - **重要**: 复制显示的 token，它只会显示一次！
   - 格式类似: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - 保存到安全的地方（如密码管理器）

### 3.2 方式 A: 使用命令行发布（推荐）

```bash
# 方法 1: 直接使用 token 发布
npx vsce publish -p YOUR_TOKEN_HERE

# 方法 2: 设置环境变量后发布
export VSCE_PAT=YOUR_TOKEN_HERE
npm run publish

# 发布成功后会显示：
# ✔ Published xuezhouyang.another-copy-reference-like-intellij@1.2.0
```

### 3.3 方式 B: 手动上传到 Marketplace

如果命令行发布失败，可以手动上传：

1. **访问 VS Code Marketplace 管理页面**
   - https://marketplace.visualstudio.com/manage

2. **上传 VSIX**
   - 登录 Microsoft 账号
   - 点击 "New extension" 或找到现有扩展
   - 上传 `another-copy-reference-like-intellij-1.2.0.vsix`
   - 填写/更新扩展信息
   - 点击 "Upload"

### 3.4 验证发布

发布成功后（可能需要几分钟）：

1. **访问扩展页面**
   - https://marketplace.visualstudio.com/items?itemName=xuezhouyang.another-copy-reference-like-intellij

2. **检查版本**
   - 确认版本显示为 1.2.0
   - 检查 README 和 CHANGELOG 是否正确显示
   - 查看截图和描述

3. **测试安装**
   ```bash
   # 从 Marketplace 安装
   code --install-extension xuezhouyang.another-copy-reference-like-intellij
   
   # 或在 VS Code 中搜索 "Copy Reference"
   ```

## 步骤 4: 创建 GitHub Release

### 4.1 自动创建（通过 GitHub Actions）

如果步骤 2 中推送了 tag，GitHub Actions 的 Release workflow 会自动：

1. 编译和打包扩展
2. 从 CHANGELOG.md 提取发布说明
3. 创建 GitHub Release
4. 上传 VSIX 文件

检查 Release:
- 访问: https://github.com/xuezhouyang/another-copy-reference-like-intellij/releases
- 应该能看到 `v1.2.0` release

### 4.2 手动创建（如果自动失败）

1. **访问 GitHub Releases 页面**
   - https://github.com/xuezhouyang/another-copy-reference-like-intellij/releases/new

2. **填写 Release 信息**
   - **Tag**: v1.2.0 (选择刚创建的 tag)
   - **Release title**: `v1.2.0 - Multi-Format Reference System`
   - **Description**: 从 CHANGELOG.md 复制 v1.2.0 部分的内容

3. **上传 VSIX**
   - 拖拽或选择 `another-copy-reference-like-intellij-1.2.0.vsix`

4. **发布**
   - 确认不是 Pre-release
   - 点击 "Publish release"

## 步骤 5: 发布后验证

### 5.1 检查所有平台

- [ ] **GitHub Release**: https://github.com/xuezhouyang/another-copy-reference-like-intellij/releases/tag/v1.2.0
  - VSIX 文件可下载
  - Release notes 正确

- [ ] **VS Code Marketplace**: https://marketplace.visualstudio.com/items?itemName=xuezhouyang.another-copy-reference-like-intellij
  - 版本号为 1.2.0
  - 描述和截图正确
  - 可以安装

- [ ] **GitHub Actions**:
  - CI workflow 通过
  - Release workflow 成功

### 5.2 功能测试

安装发布版本后测试：

```bash
# 从 Marketplace 安装
code --install-extension xuezhouyang.another-copy-reference-like-intellij

# 在 VS Code 中：
# 1. 打开 Java 文件，测试 Alt+Shift+C
# 2. 测试 Alt+Shift+F 打开格式选择器
# 3. 测试所有 6 种格式
# 4. 测试不同语言（JavaScript, Python, TypeScript）
# 5. 验证自定义格式配置
```

### 5.3 更新文档

- [ ] 在 README.md 中更新徽章（如果有）
- [ ] 在项目主页添加发布公告
- [ ] 发送邮件通知用户（如果有邮件列表）
- [ ] 在社交媒体分享（如果适用）

## 常见问题和解决方案

### Q1: `vsce publish` 失败 - 401 Unauthorized
**原因**: PAT token 无效或已过期

**解决**:
```bash
# 重新生成 token（步骤 3.1）
# 然后重新发布
npx vsce publish -p NEW_TOKEN_HERE
```

### Q2: `vsce package` 失败 - File is not defined
**原因**: Node.js 版本太低

**解决**:
```bash
# 升级到 Node.js 20+
nvm install 20
nvm use 20

# 重新打包
npm run package
```

### Q3: GitHub Actions 失败
**原因**: 多种可能

**解决**:
```bash
# 查看 Actions 日志
# https://github.com/xuezhouyang/another-copy-reference-like-intellij/actions

# 常见问题：
# 1. VSCE_PAT secret 未设置 → 在 GitHub Settings 中添加
# 2. 权限问题 → 检查 workflow permissions
# 3. 依赖问题 → 删除 node_modules 重新安装
```

### Q4: VSIX 包太大
**当前大小**: ~100KB (正常范围)

**如果超过限制**:
```bash
# 检查包内容
unzip -l another-copy-reference-like-intellij-1.2.0.vsix

# 优化：
# 1. 确保 .vscodeignore 正确配置
# 2. 排除测试文件和开发依赖
# 3. 检查 webpack 配置是否启用压缩
```

### Q5: 发布后版本不更新
**原因**: Marketplace 缓存

**解决**:
- 等待 5-10 分钟
- 清除浏览器缓存
- 使用隐私模式浏览

## 回滚发布

如果发现严重 bug，需要回滚：

### 方案 1: 发布 hotfix 版本
```bash
# 修复 bug
git checkout -b hotfix/v1.2.1

# 修改版本号
# package.json: "version": "1.2.1"

# 提交并发布
git commit -am "fix: Critical bug fix"
git tag v1.2.1
git push origin v1.2.1

# 重新发布到 Marketplace
npm run package
npx vsce publish -p YOUR_TOKEN
```

### 方案 2: 取消发布（不推荐）
```bash
# 从 Marketplace 移除版本
npx vsce unpublish xuezhouyang.another-copy-reference-like-intellij@1.2.0

# 警告：这会影响所有已安装的用户！
```

## 发布检查清单（最终）

完成后确认：

- [ ] Git tag v1.2.0 已创建并推送
- [ ] GitHub Release 已创建，包含 VSIX
- [ ] VS Code Marketplace 显示 v1.2.0
- [ ] 从 Marketplace 可以成功安装
- [ ] 所有功能正常工作
- [ ] GitHub Actions workflows 全部通过
- [ ] CHANGELOG.md 已更新
- [ ] README.md 已更新
- [ ] 文档已更新

## 下一步

发布成功后：

1. **监控反馈**
   - 检查 GitHub Issues
   - 查看 VS Code Marketplace 评论
   - 监控错误报告

2. **准备下一版本**
   - 创建 v1.2.1 或 v1.3.0 的 milestone
   - 收集用户反馈和功能请求
   - 规划下一个迭代

3. **宣传推广**
   - 在技术博客发布文章
   - 在开发者社区分享
   - 收集用户使用案例

---

**祝发布顺利！** 🎉

如有问题，请查看 GitHub Actions 日志或联系维护者。

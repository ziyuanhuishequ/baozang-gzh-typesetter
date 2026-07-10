# 宝藏排版器 3.0 发布说明与 GitHub 更新步骤

这份文档可以直接放到 GitHub Release Notes，或者复制到仓库说明、博客文章里使用。

## Release 标题

```text
宝藏排版器 v3.0.0
```

## Release 简介

宝藏排版器 3.0 是一次从“离线 Markdown 排版器”到“公众号写作工作台”的升级。这个版本在 2.0 的基础上，重点增强了表情包管理、组件设计、样机预览、文章背景、封面署名预设和启动体验。

本项目基于 [isjiamu/gzh-design-skill](https://github.com/isjiamu/gzh-design-skill) 改造而来，感谢原作者 **甲木 × 摸鱼小李** 提供优秀的公众号排版主题和组件体系。

## 3.0 更新内容

- 新增表情包管理，支持单张导入和文件夹批量导入。
- 支持 GIF 动图表情预览和插入。
- 新增“表情包插入”弹窗，可选择小图或原图插入模式。
- 原图表情默认按 20% 插入，避免插入后过大。
- 新增组件设计面板，可切换头图信息卡、目录组件、章节标题、引用、图片和结尾样式。
- 支持保存组件预设，方便下次继续使用。
- 支持保存封面与署名预设。
- 支持手机端和电脑端样机预览。
- 新增文章背景设置，支持原始、网格、纸感、点阵、雾白、青绿等效果。
- 背景支持颜色和深浅调节。
- 优化公众号富文本复制提示弹窗。
- 新增图片全清按钮，并加入毛玻璃确认弹窗防止误触。
- 优化启动速度，减少历史图片缓存导致的首次空白等待。
- 软件版本号升级为 `3.0.0`。

## 2.0 与 3.0 对比

| 对比项 | 2.0 版本 | 3.0 版本 |
| --- | --- | --- |
| 软件定位 | 离线 Markdown 排版器 | 公众号写作、排版、预览工作台 |
| 表情包 | 初步支持插入 | 表情包管理、批量导入、GIF、小图/原图模式 |
| 组件样式 | 跟随主题为主 | 可视化组件设计和组件预设 |
| 样机预览 | 基础预览 | 默认、手机端、电脑端多视图 |
| 文章背景 | 基础背景效果 | 多种透明纹理背景，支持颜色和深浅 |
| 封面署名 | 基础填写 | 可保存预设，空内容自动隐藏样式 |
| 图片管理 | 粘贴和导入 | 图片全清确认、复制兼容优化 |
| 启动体验 | 容易受历史缓存影响 | 减少旧缓存恢复，打开更轻快 |

## GitHub README 截图引用

如果要在 GitHub README 或 Release Notes 中插入截图，可以使用下面这些相对路径：

```markdown
![主界面和实时预览](docs/images/v3-main-workbench.png)
![表情包弹窗](docs/images/v3-emoji-popover.png)
![干净模式主界面](docs/images/v3-clean-workbench.png)
![表情包管理](docs/images/v3-emoji-manager.png)
![手机端样机预览](docs/images/v3-mobile-mockup.png)
![文章背景设置](docs/images/v3-background-settings.png)
```

## 要上传到 GitHub 的文件

源码仓库需要上传：

- `src/`
- `resources/skill/`
- `scripts/`
- `build/`
- `docs/`
- `README.md`
- `GITHUB_RELEASE_V3.md`
- `OPENSOURCE_RELEASE_GUIDE.md`
- `NOTICE.md`
- `LICENSE`
- `package.json`
- `package-lock.json`
- `.gitignore`

不要上传到源码仓库：

- `node_modules/`
- `release/`
- `win-unpacked/`
- 本地临时文件
- 用户自己的表情包素材库
- 密码、Token、Cookie、`.env`

安装包和源码压缩包建议放到 GitHub Release 里，不放进 Git 仓库。

## 使用 GitHub Desktop 更新源码

1. 打开 GitHub Desktop。
2. 左上角确认当前仓库是 `baozang-gzh-typesetter`。
3. 如果没有看到这个仓库，点 `File` -> `Add local repository`。
4. 选择本地目录：

```text
C:\Users\Administrator\Documents\Codex\2026-07-09\https-github-com-isjiamu-gzh-design\outputs\gzh-electron-app
```

5. 左侧会显示本次修改的文件。
6. 在左下角 Summary 填：

```text
Release v3.0.0
```

7. Description 可以填：

```text
Update README screenshots, add v3 release notes, improve startup behavior, package v3.0.0.
```

8. 点击 `Commit to main`。
9. 点击右上角 `Push origin`。
10. 等待上传完成。

## 使用命令行更新源码

如果你不用 GitHub Desktop，也可以在项目目录执行：

```powershell
cd C:\Users\Administrator\Documents\Codex\2026-07-09\https-github-com-isjiamu-gzh-design\outputs\gzh-electron-app
git status
git add .
git commit -m "Release v3.0.0"
git push origin main
```

如果遇到网络错误，可以重新执行：

```powershell
git push origin main
```

## 发布 3.0 安装包

源码上传后，再创建 GitHub Release：

1. 打开你的 GitHub 仓库页面。
2. 点击右侧 `Releases`。
3. 点击 `Draft a new release` 或 `Create a new release`。
4. Tag 填：

```text
v3.0.0
```

5. Release title 填：

```text
宝藏排版器 v3.0.0
```

6. 上传安装包：

```text
release/宝藏排版器-3.0.0-清喜默认版-win-portable.exe
```

7. 上传源码压缩包：

```text
release/宝藏排版器-3.0.0-source.zip
```

8. Release notes 粘贴本文件上方的“Release 简介”和“3.0 更新内容”。
9. 点击 `Publish release`。

## 开源致谢文案

可以放在 README、Release Notes 或网页底部：

```text
宝藏排版器基于开源项目 gzh-design-skill 改造而来。
原项目作者：甲木 × 摸鱼小李
原项目地址：https://github.com/isjiamu/gzh-design-skill
当前版本由清喜进行本地化修改，加入 Electron 离线界面、Markdown 实时预览、表情包管理、图片粘贴缓存、组件设计、样机预览和公众号富文本复制等功能。
本项目遵循 GNU AGPL-3.0-or-later 协议开源。
清喜博客：https://sucaizy.com
```

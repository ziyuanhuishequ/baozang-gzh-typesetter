# 宝藏排版器开源发布操作手册

这份手册给第一次开源项目使用，按顺序做即可。

## 1. 先确认协议

本软件基于 `isjiamu/gzh-design-skill` 改造，原项目使用 GNU AGPL-3.0 协议。

你需要做到：

- 保留原作者署名：甲木 × 摸鱼小李。
- 保留原项目地址：https://github.com/isjiamu/gzh-design-skill
- 使用 AGPL-3.0 或兼容协议继续开源。
- 发布软件、分发安装包、提供网页服务时，同步提供完整源代码。
- 不要把它改成闭源、专有或只付费可见的代码仓库。

## 2. 开源前不要上传这些内容

不要上传：

- `node_modules/`
- `release/`
- `.env`、密钥、账号密码、Token
- 本地临时文件、截图缓存、用户自己的表情包素材库

可以上传：

- `src/`
- `resources/skill/`
- `scripts/`
- `build/app-icon.ico`
- `package.json`
- `package-lock.json`
- `README.md`
- `NOTICE.md`
- `LICENSE`

## 3. GitHub 创建仓库

1. 打开 https://github.com
2. 右上角点击 `+`
3. 选择 `New repository`
4. Repository name 建议填写：`baozang-gzh-typesetter`
5. Description 可填写：`宝藏排版器：基于 gzh-design-skill 改造的离线公众号 Markdown 排版器`
6. 选择 `Public`
7. 不要勾选 `Add a README file`
8. License 选择 `GNU Affero General Public License v3.0`
9. 点击 `Create repository`

## 4. 本地初始化 Git

进入软件目录：

```powershell
cd C:\Users\Administrator\Documents\Codex\2026-07-09\https-github-com-isjiamu-gzh-design\outputs\gzh-electron-app
```

初始化：

```powershell
git init
git branch -M main
```

检查将要上传的文件：

```powershell
git status
```

如果看到 `node_modules/` 或 `release/` 要被上传，先停下来检查 `.gitignore`。

## 5. 提交代码

```powershell
git add .
git commit -m "Initial open source release"
```

## 6. 连接 GitHub 仓库

把下面的地址换成你自己新建的仓库地址：

```powershell
git remote add origin https://github.com/你的GitHub用户名/baozang-gzh-typesetter.git
git push -u origin main
```

第一次 push 可能要求登录 GitHub，按提示登录即可。

## 7. 发布安装包

源码上传后，再发布安装包：

1. 打开 GitHub 仓库页面
2. 点击右侧 `Releases`
3. 点击 `Create a new release`
4. Tag 填：`v2.0.0`
5. Title 填：`宝藏排版器 v2.0.0`
6. 上传 `release/宝藏排版器-2.0.0-win-portable.exe`
7. 上传 `release/宝藏排版器-2.0.0-source.zip`
8. Release notes 写清楚：
   - 基于 `gzh-design-skill` 改造
   - 原项目作者：甲木 × 摸鱼小李
   - 当前改造：清喜
   - 协议：AGPL-3.0
9. 点击 `Publish release`

## 8. WordPress 展示页怎么放

1. 在 GitHub Release 里复制 `.exe` 下载链接。
2. 打开 WordPress 后台。
3. 新建页面，例如：`宝藏排版器`
4. 添加 `自定义 HTML` 区块。
5. 粘贴展示页 HTML。
6. 把下载按钮链接替换成 GitHub Release 的 `.exe` 链接。
7. 把源码按钮链接替换成 GitHub 仓库地址。
8. 发布页面。

## 9. 推荐公开说明文案

可以放在 README 或 WordPress 页面底部：

```text
宝藏排版器基于开源项目 gzh-design-skill 改造而来。
原项目作者：甲木 × 摸鱼小李
原项目地址：https://github.com/isjiamu/gzh-design-skill
当前版本由清喜进行本地化修改，加入 Electron 离线界面、Markdown 实时预览、表情包管理、图片粘贴缓存和公众号富文本复制等功能。
本项目遵循 GNU AGPL-3.0 协议开源。
清喜博客：https://sucaizy.com
```

# GZH Markdown 排版工作台

离线 Electron 版公众号 Markdown 排版工具。

## 功能

- 从本地 `resources/skill` 加载 `gzh-design-skill` 的全部 reference 文件。
- 按 `theme-index.md` 自动加载 6 套已注册主题。
- 支持 Markdown 实时预览、HTML 查看、模板库搜索。
- 支持点击语法按钮插入 Markdown：
  - 标题、章节、小标题
  - 加粗、高亮、下划线、引用
  - 无序列表、有序列表、图片、代码块、分割线
- 支持 `Ctrl+V` 粘贴剪贴板图片。
- 支持插入图片 URL 和本地图片。
- 支持复制富文本到微信公众号编辑器。

## 测试运行

```powershell
npm start
```

如果本机已经全局安装 Electron，也可以：

```powershell
electron .
```

## 自检

```powershell
npm run check
```

## 离线资源

Skill 文件位于：

```text
resources/skill
```

当前应用运行不依赖网络，也不依赖用户目录下的 `.codex/skills`。

## 后续打包

当前未配置打包脚本。测试确认后，可继续接入 `electron-builder` 或 `electron-forge`。

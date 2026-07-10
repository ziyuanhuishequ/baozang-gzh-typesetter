const { app, BrowserWindow, ipcMain, clipboard, nativeImage, dialog, Menu, shell } = require("electron");
const path = require("path");
const fs = require("fs");

const isDev = !app.isPackaged;

function getSkillRoot() {
  return isDev
    ? path.join(__dirname, "..", "resources", "skill")
    : path.join(process.resourcesPath, "skill");
}

function readText(file) {
  return fs.readFileSync(file, "utf8");
}

function imageCacheDir() {
  const dir = path.join(app.getPath("userData"), "gzh-image-cache");
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function extFromMime(mime) {
  if (mime === "image/jpeg") return ".jpg";
  if (mime === "image/gif") return ".gif";
  if (mime === "image/webp") return ".webp";
  if (mime === "image/bmp") return ".bmp";
  if (mime === "image/svg+xml") return ".svg";
  return ".png";
}

function mimeFromFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".gif") return "image/gif";
  if (ext === ".webp") return "image/webp";
  if (ext === ".bmp") return "image/bmp";
  if (ext === ".avif") return "image/avif";
  if (ext === ".svg") return "image/svg+xml";
  return "image/png";
}

function fileUrl(filePath) {
  return `file:///${filePath.replace(/\\/g, "/")}`;
}

function cacheDataUrlImage(name, dataUrl) {
  const match = String(dataUrl || "").match(/^data:(image\/[\w.+-]+);base64,(.+)$/);
  if (!match) return null;
  const mime = match[1];
  const buffer = Buffer.from(match[2], "base64");
  const safeName = String(name || "image")
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "-")
    .replace(/\s+/g, "-")
    .slice(0, 80);
  const ext = extFromMime(mime);
  const filePath = path.join(imageCacheDir(), `${Date.now()}-${safeName.replace(/\.[^.]+$/, "")}${ext}`);
  fs.writeFileSync(filePath, buffer);
  return { filePath, fileUrl: fileUrl(filePath), mime };
}

function readImageFile(filePath) {
  const mime = mimeFromFile(filePath);
  const dataUrl = `data:${mime};base64,${fs.readFileSync(filePath).toString("base64")}`;
  return { filePath, fileUrl: fileUrl(filePath), name: path.basename(filePath), dataUrl, mime };
}

function imageFileInfo(filePath, includeDataUrl = false) {
  const mime = mimeFromFile(filePath);
  return {
    filePath,
    fileUrl: fileUrl(filePath),
    name: path.basename(filePath),
    dataUrl: includeDataUrl ? `data:${mime};base64,${fs.readFileSync(filePath).toString("base64")}` : "",
    mime
  };
}

function isImageFile(file) {
  return /\.(png|jpe?g|gif|webp|bmp|avif)$/i.test(file);
}

function resolveRendererImage(src) {
  const raw = String(src || "").trim();
  if (!raw || /^[a-z]+:/i.test(raw) || raw.startsWith("asset://")) return null;
  const clean = decodeURIComponent(raw.replace(/[?#].*$/, "").replace(/^\.?[\\/]/, ""));
  const rendererRoot = path.join(__dirname, "renderer");
  const candidates = [
    path.resolve(rendererRoot, clean),
    path.resolve(rendererRoot, "assets", clean.replace(/^assets[\\/]/, "")),
    path.resolve(__dirname, clean)
  ];
  const filePath = candidates.find((candidate) => {
    const relative = path.relative(rendererRoot, candidate);
    return !relative.startsWith("..") && !path.isAbsolute(relative) && fs.existsSync(candidate);
  });
  if (!filePath) return null;
  const mime = mimeFromFile(filePath);
  const dataUrl = `data:${mime};base64,${fs.readFileSync(filePath).toString("base64")}`;
  const cached = cacheDataUrlImage(path.basename(filePath), dataUrl);
  return {
    name: path.basename(filePath),
    dataUrl,
    filePath: cached?.filePath || filePath,
    fileUrl: cached?.fileUrl || fileUrl(filePath),
    mime
  };
}

function parseThemeIndex(markdown) {
  const rows = markdown.split(/\r?\n/).filter((line) => /^\|\s*[^|-]/.test(line));
  const themes = [];
  for (const row of rows) {
    if (/涓婚\s*\|/.test(row) || /---/.test(row)) continue;
    const cols = row.split("|").slice(1, -1).map((x) => x.trim());
    if (cols.length < 5) continue;
    const file = cols[3].replace(/`/g, "");
    if (!/^references\/theme-[\w-]+\.md$/.test(file)) continue;
    const id = file.replace(/^references\/theme-/, "").replace(/\.md$/, "");
    const mainColor = (cols[1].match(/#[0-9a-fA-F]{6}/) || [])[0] || "#059669";
    const underlineColor = (cols[4].match(/#[0-9a-fA-F]{6}/) || [])[0] || mainColor;
    themes.push({
      id,
      name: cols[0],
      mainColor,
      underlineColor,
      scene: cols[2],
      file,
      label: id.toUpperCase().replace(/-/g, " ")
    });
  }
  return themes;
}

function loadSkillData() {
  const root = getSkillRoot();
  const references = path.join(root, "references");
  const indexText = readText(path.join(references, "theme-index.md"));
  const themes = parseThemeIndex(indexText).map((theme) => {
    const filePath = path.join(root, theme.file.replace(/\//g, path.sep));
    return {
      ...theme,
      markdown: fs.existsSync(filePath) ? readText(filePath) : "",
      fileName: path.basename(filePath)
    };
  });
  const referenceFiles = fs.readdirSync(references)
    .filter((file) => file.endsWith(".md"))
    .sort()
    .map((file) => ({
      name: file,
      path: `references/${file}`,
      content: readText(path.join(references, file))
    }));
  return {
    root,
    skill: readText(path.join(root, "SKILL.md")),
    themeIndex: indexText,
    commonComponents: readText(path.join(references, "common-components.md")),
    themes,
    referenceFiles
  };
}

function createWindow() {
  const iconPath = path.join(__dirname, "renderer", "assets", "app-icon.svg");
  const win = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1060,
    minHeight: 720,
    title: "宝藏排版器",
    icon: nativeImage.createFromPath(iconPath),
    backgroundColor: "#f6f7f9",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  win.loadFile(path.join(__dirname, "renderer", "index.html"));
}

function wechatUrl(target = "login") {
  return target === "drafts"
    ? "https://mp.weixin.qq.com/cgi-bin/appmsgdraft?action=list&lang=zh_CN"
    : "https://mp.weixin.qq.com/";
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  ipcMain.handle("skill:load", () => loadSkillData());
  ipcMain.handle("clipboard:writeHtml", (_event, html, text, imagePath) => {
    const payload = { html, text };
    if (imagePath && fs.existsSync(imagePath)) {
      const image = nativeImage.createFromPath(imagePath);
      if (!image.isEmpty()) payload.image = image;
    }
    clipboard.write(payload);
    return true;
  });
  ipcMain.handle("image:cache", (_event, name, dataUrl) => cacheDataUrlImage(name, dataUrl));
  ipcMain.handle("image:readFile", (_event, filePath) => {
    if (!filePath || !fs.existsSync(filePath)) return null;
    return readImageFile(filePath);
  });
  ipcMain.handle("image:resolveLocal", (_event, src) => resolveRendererImage(src));
  ipcMain.handle("clipboard:readImage", () => {
    const image = clipboard.readImage();
    if (!image || image.isEmpty()) return null;
    const dataUrl = image.toDataURL({ scaleFactor: 1 });
    const cached = cacheDataUrlImage(`clipboard-${Date.now()}.png`, dataUrl);
    return {
      name: `clipboard-${Date.now()}.png`,
      dataUrl,
      filePath: cached?.filePath,
      fileUrl: cached?.fileUrl,
      mime: cached?.mime || "image/png"
    };
  });
  ipcMain.handle("dialog:pickImage", async () => {
    const result = await dialog.showOpenDialog({
      title: "选择图片",
      properties: ["openFile"],
      filters: [{ name: "Images", extensions: ["png", "jpg", "jpeg", "gif", "webp", "bmp"] }]
    });
    if (result.canceled || !result.filePaths[0]) return null;
    const filePath = result.filePaths[0];
    const image = nativeImage.createFromPath(filePath);
    const mime = mimeFromFile(filePath);
    const dataUrl = image.isEmpty()
      ? fileUrl(filePath)
      : image.toDataURL({ scaleFactor: 1 });
    return { filePath, fileUrl: fileUrl(filePath), name: path.basename(filePath), dataUrl, mime };
  });
  ipcMain.handle("dialog:pickEmojiImages", async () => {
    const result = await dialog.showOpenDialog({
      title: "选择表情包图片",
      properties: ["openFile", "multiSelections"],
      filters: [{ name: "Images", extensions: ["png", "jpg", "jpeg", "gif", "webp", "bmp", "avif"] }]
    });
    if (result.canceled) return [];
    return result.filePaths.map((filePath) => imageFileInfo(filePath, false));
  });
  ipcMain.handle("dialog:pickEmojiFolder", async () => {
    const result = await dialog.showOpenDialog({
      title: "选择表情包文件夹",
      properties: ["openDirectory"]
    });
    if (result.canceled || !result.filePaths[0]) return [];
    const root = result.filePaths[0];
    const files = [];
    const walk = (dir) => {
      for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
        const filePath = path.join(dir, item.name);
        if (item.isDirectory()) walk(filePath);
        else if (item.isFile() && isImageFile(item.name)) files.push(filePath);
      }
    };
    walk(root);
    return files.slice(0, 500).map((filePath) => imageFileInfo(filePath, false));
  });
  ipcMain.handle("external:open", (_event, url) => {
    shell.openExternal(url);
    return true;
  });
  ipcMain.handle("wechat:open", (_event, target) => {
    shell.openExternal(wechatUrl(target));
    return true;
  });

  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});


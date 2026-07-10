const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("gzhApp", {
  loadSkill: () => ipcRenderer.invoke("skill:load"),
  writeHtml: (html, text, imagePath) => ipcRenderer.invoke("clipboard:writeHtml", html, text, imagePath),
  cacheImage: (name, dataUrl) => ipcRenderer.invoke("image:cache", name, dataUrl),
  resolveLocalImage: (src) => ipcRenderer.invoke("image:resolveLocal", src),
  readImage: () => ipcRenderer.invoke("clipboard:readImage"),
  pickImage: () => ipcRenderer.invoke("dialog:pickImage"),
  pickEmojiImages: () => ipcRenderer.invoke("dialog:pickEmojiImages"),
  pickEmojiFolder: () => ipcRenderer.invoke("dialog:pickEmojiFolder"),
  openWechat: (target) => ipcRenderer.invoke("wechat:open", target),
  openExternal: (url) => ipcRenderer.invoke("external:open", url)
});

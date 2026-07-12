const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("gzhApp", {
  loadSkill: () => ipcRenderer.invoke("skill:load"),
  writeHtml: (html, text, imagePath) => ipcRenderer.invoke("clipboard:writeHtml", html, text, imagePath),
  cacheImage: (name, dataUrl) => ipcRenderer.invoke("image:cache", name, dataUrl),
  readImageFile: (filePath) => ipcRenderer.invoke("image:readFile", filePath),
  resolveLocalImage: (src) => ipcRenderer.invoke("image:resolveLocal", src),
  readImage: () => ipcRenderer.invoke("clipboard:readImage"),
  pickImage: () => ipcRenderer.invoke("dialog:pickImage"),
  pickEmojiImages: () => ipcRenderer.invoke("dialog:pickEmojiImages"),
  pickEmojiFolder: () => ipcRenderer.invoke("dialog:pickEmojiFolder"),
  exportDocument: (type, html, title) => ipcRenderer.invoke("document:export", type, html, title),
  listDrafts: () => ipcRenderer.invoke("drafts:list"),
  saveDraft: (draft) => ipcRenderer.invoke("drafts:save", draft),
  deleteDraft: (id) => ipcRenderer.invoke("drafts:delete", id),
  pickDraftDir: () => ipcRenderer.invoke("drafts:pickDir"),
  openWechat: (target) => ipcRenderer.invoke("wechat:open", target),
  openExternal: (url) => ipcRenderer.invoke("external:open", url)
});

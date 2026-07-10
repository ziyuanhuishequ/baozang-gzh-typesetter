const state = {
  skill: null,
  themes: [],
  assets: {},
  emojis: [],
  emojiInsertMode: "tiny",
  currentHtml: "",
  mode: "preview",
  sourceSelection: { start: 0, end: 0 },
  editedAt: "",
  previewBackground: "none",
  previewFollowFrame: 0,
  renderFrame: 0,
  saveTimer: 0,
  syncingTitle: false,
  skipNextPreviewFollow: false,
  settingsCollapsed: true,
  syntaxCollapsed: false,
  backgroundColor: "#94a3b8",
  backgroundStrength: 18
};

const els = {
  themeSelect: document.getElementById("themeSelect"),
  themeScene: document.getElementById("themeScene"),
  templateCount: document.getElementById("templateCount"),
  source: document.getElementById("source"),
  previewWrap: document.getElementById("previewWrap"),
  preview: document.getElementById("preview"),
  htmlOut: document.getElementById("htmlOut"),
  status: document.getElementById("status"),
  meta: document.getElementById("meta"),
  quality: document.getElementById("quality"),
  articleTitle: document.getElementById("articleTitle"),
  coverLabel: document.getElementById("coverLabel"),
  coverSubtitle: document.getElementById("coverSubtitle"),
  authorName: document.getElementById("authorName"),
  authorBio: document.getElementById("authorBio"),
  ctaText: document.getElementById("ctaText"),
  imageUrl: document.getElementById("imageUrl"),
  assetStrip: document.getElementById("assetStrip"),
  backgroundSwitch: document.getElementById("backgroundSwitch"),
  backgroundColor: document.getElementById("backgroundColor"),
  backgroundStrength: document.getElementById("backgroundStrength"),
  backgroundStrengthValue: document.getElementById("backgroundStrengthValue"),
  syntaxBar: document.getElementById("syntaxBar"),
  syntaxToggle: document.getElementById("syntaxToggle"),
  templateFileSelect: document.getElementById("templateFileSelect"),
  templateSearch: document.getElementById("templateSearch"),
  templateContent: document.getElementById("templateContent"),
  templateSummary: document.getElementById("templateSummary"),
  emojiTab: document.getElementById("emojiTab"),
  emojiPanel: document.getElementById("emojiPanel"),
  emojiImportBtn: document.getElementById("emojiImportBtn"),
  emojiFolderBtn: document.getElementById("emojiFolderBtn"),
  emojiClearBtn: document.getElementById("emojiClearBtn"),
  emojiQuickBtn: document.getElementById("emojiQuickBtn"),
  emojiQuickPopover: document.getElementById("emojiQuickPopover"),
  emojiQuickGrid: document.getElementById("emojiQuickGrid"),
  emojiGrid: document.getElementById("emojiGrid"),
  wechatLoginBtn: document.getElementById("wechatLoginBtn"),
  wechatNetworkHint: document.getElementById("wechatNetworkHint"),
  copyToast: document.getElementById("copyToast"),
  copyToastClose: document.getElementById("copyToastClose"),
  copyToastText: document.getElementById("copyToastText"),
  copyToastWechat: document.getElementById("copyToastWechat"),
  copyToastMore: document.getElementById("copyToastMore"),
  settingsToggle: document.getElementById("settingsToggle"),
  profilePresetSelect: document.getElementById("profilePresetSelect"),
  profilePresetName: document.getElementById("profilePresetName"),
  saveProfilePresetBtn: document.getElementById("saveProfilePresetBtn"),
  resetProfileBtn: document.getElementById("resetProfileBtn"),
  deleteProfilePresetBtn: document.getElementById("deleteProfilePresetBtn")
};

const defaultProfile = {
  articleTitle: "公众号 Markdown 排版",
  coverLabel: "GZH WORKBENCH",
  coverSubtitle: "离线模板 · 实时预览 · 一键复制到公众号",
  authorName: "清喜",
  authorBio: "持续分享 AI 工具、效率软件和实用黑科技",
  ctaText: "如果觉得有用，欢迎点赞、在看、转发给需要的朋友。"
};

const profilePresetKey = "gzh-profile-presets";

function profileFields() {
  return {
    articleTitle: els.articleTitle.value,
    coverLabel: els.coverLabel.value,
    coverSubtitle: els.coverSubtitle.value,
    authorName: els.authorName.value,
    authorBio: els.authorBio.value,
    ctaText: els.ctaText.value
  };
}

function applyProfile(profile) {
  els.articleTitle.value = profile.articleTitle || "";
  els.coverLabel.value = profile.coverLabel || "";
  els.coverSubtitle.value = profile.coverSubtitle || "";
  els.authorName.value = profile.authorName || "";
  els.authorBio.value = profile.authorBio || "";
  els.ctaText.value = profile.ctaText || "";
  syncMarkdownTitleFromField();
  state.editedAt = todayStamp();
  renderArticle();
}

function readProfilePresets() {
  try {
    const data = JSON.parse(localStorage.getItem(profilePresetKey) || "[]");
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function writeProfilePresets(presets) {
  localStorage.setItem(profilePresetKey, JSON.stringify(presets));
}

function renderProfilePresets(selectedName = "__default") {
  if (!els.profilePresetSelect) return;
  const presets = readProfilePresets();
  els.profilePresetSelect.innerHTML = `<option value="__default">默认文案</option>`;
  for (const preset of presets) {
    const opt = document.createElement("option");
    opt.value = preset.name;
    opt.textContent = preset.name;
    els.profilePresetSelect.appendChild(opt);
  }
  els.profilePresetSelect.value = presets.some((item) => item.name === selectedName) ? selectedName : "__default";
}

function saveProfilePreset() {
  const fallback = els.authorName.value.trim() || els.articleTitle.value.trim() || "我的预设";
  const name = (els.profilePresetName?.value || fallback).trim();
  if (!name) {
    els.status.textContent = "请先输入预设名称";
    return;
  }
  const presets = readProfilePresets().filter((item) => item.name !== name);
  presets.unshift({ name, ...profileFields(), updatedAt: new Date().toISOString() });
  writeProfilePresets(presets.slice(0, 20));
  renderProfilePresets(name);
  els.profilePresetSelect.value = name;
  if (els.profilePresetName) els.profilePresetName.value = "";
  els.status.textContent = `已保存预设：${name}`;
}

function deleteProfilePreset() {
  const name = els.profilePresetSelect?.value;
  if (!name || name === "__default") return;
  const presets = readProfilePresets().filter((item) => item.name !== name);
  writeProfilePresets(presets);
  renderProfilePresets("__default");
  els.status.textContent = `已删除预设：${name}`;
}

function todayStamp() {
  const now = new Date();
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0")
  ].join(".");
}

function markdownTitle() {
  const match = els.source.value.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : "";
}

function syncMarkdownTitleFromField() {
  if (state.syncingTitle) return;
  const title = els.articleTitle.value.trim();
  if (!title) return;
  const nextLine = `# ${title}`;
  const current = markdownTitle();
  if (current === title) return;
  state.syncingTitle = true;
  if (/^#\s+.+$/m.test(els.source.value)) {
    els.source.value = els.source.value.replace(/^#\s+.+$/m, nextLine);
  } else {
    els.source.value = `${nextLine}\n\n${els.source.value}`;
  }
  state.syncingTitle = false;
}

function syncArticleTitleFromMarkdown() {
  if (state.syncingTitle) return;
  const title = markdownTitle();
  if (!title || els.articleTitle.value.trim() === title) return;
  state.syncingTitle = true;
  els.articleTitle.value = title;
  state.syncingTitle = false;
}

const markdownSample = `# 公众号 Markdown 排版工作台
> 这是一款基于 gzh-design-skill 改造的本地离线排版工具，适合把 Markdown 快速转换成可复制到公众号编辑器的富文本。

## 01 这款工具能做什么
左侧输入 Markdown，右侧实时预览公众号文章效果。你可以使用 **加粗文字**、*斜体文字*、==高亮重点==、++下划线关键词++，也可以插入链接：[清喜博客](https://sucaizy.com)。

当你移动光标或继续写作时，右侧预览会自动跟随到对应段落，方便一边写文章，一边检查排版效果。

### 常用写作场景
- 工具教程和操作指南
- AI 工具清单和效率软件测评
- 项目复盘、观点分析、公众号长文

## 02 Markdown 语法演示
> 引用可以用来放一句观点、金句或摘要，让读者先抓住文章主线。

1. 点击上方语法按钮可以插入 Markdown 模板
2. 使用快捷键也可以快速包裹选中文字
3. 最后点击“复制到公众号”即可粘贴富文本

---

## 03 图片与代码块
图片支持直接 Ctrl+V 粘贴，也可以使用 Markdown 图片语法：

![软件预览演示图](./assets/demo-preview.png)

代码块适合放命令、Prompt 或配置示例：

\`\`\`bash
npm start
electron .
\`\`\`

## 04 文章背景
现在左侧的文章背景会写入正文最外层 section，复制到公众号时会一起带过去。你可以选择网格、纸感、点阵、雾白、青绿等轻量背景，尽量保持美观但不影响阅读。

## 05 表情包管理
现在软件新增了本地表情包功能，适合在教程、测评和日常分享里插入一些轻量的小表情，让文章读起来更自然。

你可以在右侧打开 **表情包管理**，导入单个表情包，也可以直接导入整个表情包文件夹。表情包只引用本地文件，不会打进软件本体里，所以不会让软件体积越来越大 {{emoji:demo-emoji-aru}}。

左上方的 **表情包插入** 按钮会弹出一个类似微信聊天的表情面板。你只需要先选择一次插入方式：

- 小图：适合插入到一句话后面，比如这里可以放一个小表情 {{emoji:demo-emoji-aru}}，和文字自然排在一起
- 原图：适合把 GIF、动图或大表情作为单独图片插入文章

原图插入后会自动带上比例参数，例如：

\`\`\`markdown
![0003.gif](asset://asset-xxx){20%}
\`\`\`

你可以把 20% 改成 30%、50% 或 100%，自由调整表情包在公众号预览里的大小。

这里也放一个原图表情示例：

![示例原图表情](asset://demo-emoji-aru){20%}

## 06 开发和使用方式
这个软件基于开源项目 gzh-design-skill 改造而来，作者是：**甲木 × 摸鱼小李**

现在由清喜进行本地化修改，加入了 Electron 离线界面、Markdown 实时预览、样机切换、图片粘贴缓存和公众号富文本复制。

支持实时预览，边写边排版，只能说大佬的主题简直太好看了；现在的边写边排版功能，也让使用使用更加便捷

## 写在最后
如果你经常写公众号文章，这个工具可以作为一个 ++公众号排版前置工作台++。它不替你写文章，但能让 Markdown 更快变成可以发布的公众号成稿。

## 历史文章
- 《从零搭建一个离线公众号排版器》
- 《Markdown 写作如何复制到微信公众号》
- 《AI 工具测评文章的排版清单》`;
const syntaxActions = [
  { label: "H1 标题", mark: "#", shortcut: "Ctrl+Alt+1", run: () => insertLine("# 文章标题") },
  { label: "H2 章节", mark: "##", shortcut: "Ctrl+Alt+2", run: () => insertLine("## 新章节") },
  { label: "H3 小标题", mark: "###", shortcut: "Ctrl+Alt+3", run: () => insertLine("### 小标题") },
  { label: "加粗", mark: "B", shortcut: "Ctrl+B", run: () => wrapSelection("**", "**", "加粗文字") },
  { label: "斜体", mark: "I", shortcut: "Ctrl+I", run: () => wrapSelection("*", "*", "斜体文字") },
  { label: "链接", mark: "LINK", shortcut: "Ctrl+K", run: () => insertLink() },
  { label: "高亮", mark: "==", shortcut: "Ctrl+Shift+H", run: () => wrapSelection("==", "==", "高亮文字") },
  { label: "下划线", mark: "U", shortcut: "Ctrl+U", run: () => wrapSelection("++", "++", "关键词") },
  { label: "引用", mark: ">", shortcut: "Ctrl+Shift+Q", run: () => insertLine("> 这里是一句引用或金句") },
  { label: "无序列表", mark: "-", shortcut: "Ctrl+Shift+8", run: () => insertLine("- 列表项") },
  { label: "有序列表", mark: "1.", shortcut: "Ctrl+Shift+7", run: () => insertLine("1. 第一步") },
  { label: "图片", mark: "IMG", shortcut: "Ctrl+Shift+I", run: () => insertText("\n![图片说明](https://example.com/image.png)\n", { selectStart: 3, selectEnd: 7 }) },
  { label: "代码块", mark: "</>", shortcut: "Ctrl+`", run: () => insertText("\n```bash\nnpm start\n```\n", { selectStart: 9, selectEnd: 18 }) },
  { label: "分割线", mark: "---", shortcut: "Ctrl+Shift+-", run: () => insertText("\n---\n") }
];

function esc(text) {
  return String(text ?? "").replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[ch]));
}

function leaf(text) {
  return `<span leaf="">${esc(text)}</span>`;
}

function normalizePunct(text) {
  return String(text ?? "")
    .replace(/([\u4e00-\u9fff]),/g, "$1，")
    .replace(/([\u4e00-\u9fff]);/g, "$1；")
    .replace(/([\u4e00-\u9fff])!/g, "$1！")
    .replace(/([\u4e00-\u9fff])\?/g, "$1？")
    .replace(/"([^"]+)"/g, "“$1”")
    .replace(/'([^']+)'/g, "‘$1’");
}

function hexToRgb(hex) {
  const clean = (hex || "#059669").replace("#", "");
  return [
    parseInt(clean.slice(0, 2), 16),
    parseInt(clean.slice(2, 4), 16),
    parseInt(clean.slice(4, 6), 16)
  ];
}

function rgbToHex(r, g, b) {
  return "#" + [r, g, b].map((n) => n.toString(16).padStart(2, "0")).join("");
}

function tint(hex, amount) {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(
    Math.round(r + (255 - r) * amount),
    Math.round(g + (255 - g) * amount),
    Math.round(b + (255 - b) * amount)
  );
}

function shade(hex, amount) {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(Math.round(r * amount), Math.round(g * amount), Math.round(b * amount));
}

function themeSoft(theme) {
  return theme.softColor || tint(theme.mainColor, 0.92);
}

function themeDeep(theme) {
  return theme.deepColor || shade(theme.mainColor, 0.42);
}

function pickKeyword(text) {
  const clean = text.replace(/[锛屻€傦紒锛燂紱锛氥€佲€溾€濃€樷€欙紙锛?)]/g, " ").trim();
  const words = clean.match(/[\u4e00-\u9fffA-Za-z0-9]{4,15}/g) || [];
  return words.find((w) => !/^(杩欎釜|濡傛灉|鍥犱负|鎵€浠浣嗘槸|鍙互|涓€涓獆鎴戜滑|浠栦滑|浣犱滑|杩欓噷|鐢ㄤ簬)$/.test(w)) || "";
}

function inline(text, theme) {
  let safe = esc(normalizePunct(text));
  safe = safe.replace(/\{\{emoji:([\w-]+)\}\}/g, (_match, id) => {
    const asset = state.assets[id];
    const src = asset?.dataUrl || asset?.fileUrl || "";
    if (!src) return "";
    return `<img src="${esc(src)}" alt="${esc(asset.name || "表情")}" style="width:22px;height:22px;display:inline-block;vertical-align:-5px;margin:0 2px;border:0;object-fit:contain;">`;
  });
  safe = safe.replace(/`([^`]+)`/g, `<span style="background:#F3F4F6;color:${theme.mainColor};padding:2px 6px;border-radius:4px;font-size:13px;font-weight:600;"><span leaf="">$1</span></span>`);
  safe = safe.replace(/\[([^\]]+)\]\(([^)]+)\)/g, `<span style="color:${theme.mainColor};border-bottom:1px solid ${theme.underlineColor};font-weight:600;"><span leaf="">$1</span></span>`);
  safe = safe.replace(/\*\*([^*]+)\*\*/g, `<strong style="color:${theme.mainColor};"><span leaf="">$1</span></strong>`);
  safe = safe.replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, `$1<em style="color:#374151;font-style:italic;"><span leaf="">$2</span></em>`);
  safe = safe.replace(/==([^=]+)==/g, `<span style="background:linear-gradient(120deg,#FDE68A 0%,rgba(255,255,255,0) 100%);padding:0 4px;border-radius:2px;font-weight:600;color:#111827;"><span leaf="">$1</span></span>`);
  safe = safe.replace(/\+\+([^+]+)\+\+/g, `<span style="border-bottom:2px solid ${theme.underlineColor};font-weight:600;"><span leaf="">$1</span></span>`);
  safe = safe.replace(/&lt;u&gt;(.+?)&lt;\/u&gt;/g, `<span style="border-bottom:2px solid ${theme.underlineColor};font-weight:600;"><span leaf="">$1</span></span>`);
  if (!/(span leaf|<strong|<em|border-bottom)/.test(safe)) {
    const raw = normalizePunct(text).trim();
    const keyword = pickKeyword(raw);
    if (keyword && raw.length > keyword.length + 8) {
      return esc(raw).replace(esc(keyword), `<span style="border-bottom:2px solid ${theme.underlineColor};font-weight:600;"><span leaf="">${esc(keyword)}</span></span>`);
    }
  }
  return safe.includes("span leaf") || safe.includes("<img") ? safe : leaf(normalizePunct(text));
}

function parseBlocks(text) {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const blocks = [];
  let para = [];
  let paraStart = 1;
  let code = null;

  const flush = (endLine) => {
    if (para.length) {
      blocks.push({ type: "p", text: para.join("\n"), startLine: paraStart, endLine });
      para = [];
    }
  };

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const lineNo = index + 1;
    const raw = line;
    const t = raw.trim();
    if (t.startsWith("```")) {
      if (code) {
        blocks.push({ type: "code", lang: code.lang, text: code.lines.join("\n"), startLine: code.startLine, endLine: lineNo });
        code = null;
      } else {
        flush(lineNo - 1);
        code = { lang: t.slice(3).trim() || "code", lines: [], startLine: lineNo };
      }
      continue;
    }
    if (code) {
      code.lines.push(raw);
      continue;
    }
    if (!t) {
      flush(lineNo - 1);
      continue;
    }
    if (/^---+$/.test(t) || /^\*\*\*+$/.test(t)) {
      flush(lineNo - 1);
      blocks.push({ type: "hr", startLine: lineNo, endLine: lineNo });
    } else if (/^###\s+/.test(t)) {
      flush(lineNo - 1);
      blocks.push({ type: "h3", text: t.replace(/^###\s+/, ""), startLine: lineNo, endLine: lineNo });
    } else if (/^##\s+/.test(t)) {
      flush(lineNo - 1);
      blocks.push({ type: "h2", text: t.replace(/^##\s+/, ""), startLine: lineNo, endLine: lineNo });
    } else if (/^#\s+/.test(t)) {
      flush(lineNo - 1);
      blocks.push({ type: "title", text: t.replace(/^#\s+/, ""), startLine: lineNo, endLine: lineNo });
    } else if (/^>\s?/.test(t)) {
      flush(lineNo - 1);
      blocks.push({ type: "quote", text: t.replace(/^>\s?/, ""), startLine: lineNo, endLine: lineNo });
    } else if (/^!\[[^\]]*\]\([^)]+\)/.test(t)) {
      flush(lineNo - 1);
      const m = t.match(/^!\[([^\]]*)\]\(([^)]+)\)(?:\{(\d{1,3})%\})?/);
      blocks.push({ type: "image", alt: m[1], src: m[2], scale: Math.max(10, Math.min(100, Number(m[3]) || 100)), startLine: lineNo, endLine: lineNo });
    } else if (/^[-*]\s+/.test(t) || /^\d+[.)、]\s+/.test(t)) {
      flush(lineNo - 1);
      blocks.push({ type: "li", text: t.replace(/^([-*]|\d+[.)、])\s+/, ""), startLine: lineNo, endLine: lineNo });
    } else {
      if (!para.length) paraStart = lineNo;
      para.push(t);
    }
  }
  if (code) {
    blocks.push({ type: "code", lang: code.lang, text: code.lines.join("\n"), startLine: code.startLine, endLine: lines.length });
  }
  flush(lines.length);
  return blocks;
}

function createAsset(name, dataUrl, fileUrl = "", filePath = "", meta = {}) {
  const id = `asset-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  state.assets[id] = {
    id,
    name: name || "粘贴图片.png",
    dataUrl,
    fileUrl,
    filePath,
    ...meta
  };
  renderAssets();
  return id;
}

function emojiSrc(emoji) {
  return emoji.dataUrl || emoji.fileUrl || "";
}

function renderEmojiPanel() {
  if (!els.emojiGrid) return;
  els.emojiGrid.innerHTML = "";
  if (!state.emojis.length) {
    els.emojiGrid.innerHTML = `<div class="emoji-empty">还没有导入表情包。点击右上角“导入表情包”，选择本地图片或 GIF。</div>`;
    return;
  }
  for (const emoji of state.emojis) {
    const card = document.createElement("div");
    card.className = "emoji-card";
    card.innerHTML = `<div class="emoji-preview"><img loading="lazy" decoding="async" alt="${esc(emoji.name)}" src="${esc(emojiSrc(emoji))}"></div>
      <p class="emoji-name" title="${esc(emoji.name)}">${esc(emoji.name)}</p>
      <div class="emoji-actions">
        <button type="button" data-mode="tiny">小图</button>
        <button type="button" data-mode="original">原图</button>
        <button type="button" data-mode="delete">删除</button>
      </div>`;
    card.querySelector('[data-mode="tiny"]').addEventListener("click", () => insertEmoji(emoji, "tiny"));
    card.querySelector('[data-mode="original"]').addEventListener("click", () => insertEmoji(emoji, "original"));
    card.querySelector('[data-mode="delete"]').addEventListener("click", (event) => {
      event.stopPropagation();
      deleteEmoji(emoji.id);
    });
    els.emojiGrid.appendChild(card);
  }
  renderEmojiQuickPanel();
}

function renderEmojiQuickPanel() {
  if (!els.emojiQuickGrid) return;
  els.emojiQuickGrid.innerHTML = "";
  if (!state.emojis.length) {
    els.emojiQuickGrid.innerHTML = `<div class="emoji-quick-empty">还没有导入表情包，请先到“表情包管理”导入。</div>`;
    return;
  }
  for (const emoji of state.emojis) {
    const btn = document.createElement("button");
    btn.className = "emoji-quick-item";
    btn.type = "button";
    btn.title = emoji.name;
    btn.innerHTML = `<img loading="lazy" decoding="async" alt="${esc(emoji.name)}" src="${esc(emojiSrc(emoji))}">`;
    btn.addEventListener("click", () => {
      insertEmoji(emoji, state.emojiInsertMode);
      hideEmojiQuickPopover();
    });
    els.emojiQuickGrid.appendChild(btn);
  }
}

function setEmojiInsertMode(mode = "tiny", persist = true) {
  state.emojiInsertMode = mode === "original" ? "original" : "tiny";
  document.querySelectorAll(".emoji-mode-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.emojiMode === state.emojiInsertMode);
  });
  if (persist) saveState();
}

function showEmojiQuickPopover() {
  renderEmojiQuickPanel();
  els.emojiQuickPopover?.classList.add("show");
  els.emojiQuickPopover?.setAttribute("aria-hidden", "false");
}

function hideEmojiQuickPopover() {
  els.emojiQuickPopover?.classList.remove("show");
  els.emojiQuickPopover?.setAttribute("aria-hidden", "true");
}

function toggleEmojiQuickPopover() {
  if (els.emojiQuickPopover?.classList.contains("show")) hideEmojiQuickPopover();
  else showEmojiQuickPopover();
}

async function importEmojiImages(source = "files") {
  const images = source === "folder"
    ? await window.gzhApp.pickEmojiFolder()
    : await window.gzhApp.pickEmojiImages();
  if (!images?.length) return;
  const existing = new Set(state.emojis.map((item) => item.filePath || item.fileUrl));
  for (const image of images) {
    const key = image.filePath || image.fileUrl;
    if (existing.has(key)) continue;
    state.emojis.unshift({
      id: `emoji-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: image.name || "表情包",
      dataUrl: image.dataUrl || "",
      fileUrl: image.fileUrl || "",
      filePath: image.filePath || "",
      mime: image.mime || ""
    });
    existing.add(key);
  }
  renderEmojiPanel();
  saveState();
  els.status.textContent = `已导入 ${images.length} 个表情包`;
}

function insertEmoji(emoji, mode) {
  const id = createAsset(emoji.name, emojiSrc(emoji), emoji.fileUrl || "", emoji.filePath || "", { emojiPlain: mode === "original" });
  if (mode === "tiny") {
    insertText(`{{emoji:${id}}}`);
    setMode("preview");
    els.status.textContent = "已插入超小表情";
    return;
  }
  insertLine(`![${emoji.name}](asset://${id}){20%}`);
  setMode("preview");
  els.status.textContent = "已插入原图表情";
}

function deleteEmoji(id) {
  state.emojis = state.emojis.filter((emoji) => emoji.id !== id);
  renderEmojiPanel();
  saveState();
  els.status.textContent = "表情包已删除";
}

function clearEmojis() {
  state.emojis = [];
  renderEmojiPanel();
  saveState();
  els.status.textContent = "已清空表情包列表";
}

function resolveImageSrc(src) {
  if (!src.startsWith("asset://")) return src;
  const id = src.replace("asset://", "");
  const asset = state.assets[id];
  return asset?.dataUrl || asset?.fileUrl || src;
}

async function seedDemoEmojiAssets() {
  if (!window.gzhApp?.resolveLocalImage) return;
  const demos = [
    { id: "demo-emoji-aru", src: "./assets/demo-emoji-aru.gif", name: "示例表情包" }
  ];
  for (const demo of demos) {
    if (state.assets[demo.id]) continue;
    try {
      const image = await window.gzhApp.resolveLocalImage(demo.src);
      if (!image?.dataUrl) continue;
      state.assets[demo.id] = {
        id: demo.id,
        name: demo.name,
        dataUrl: image.dataUrl,
        fileUrl: image.fileUrl || "",
        filePath: image.filePath || "",
        emojiPlain: true
      };
    } catch (error) {
      console.warn("seed demo emoji failed", error);
    }
  }
}

function isLocalMarkdownImageSrc(src) {
  const value = String(src || "").trim();
  return Boolean(value) && !/^(asset:|data:|https?:|file:|blob:)/i.test(value);
}

async function importLocalMarkdownImages() {
  if (!window.gzhApp?.resolveLocalImage) return false;
  const source = els.source.value;
  const matches = Array.from(source.matchAll(/!\[([^\]]*)\]\(([^)]+)\)/g))
    .filter((match) => isLocalMarkdownImageSrc(match[2]));
  if (!matches.length) return false;

  let next = "";
  let cursor = 0;
  let changed = false;
  for (const match of matches) {
    const [raw, alt, src] = match;
    const start = match.index;
    next += source.slice(cursor, start);
    cursor = start + raw.length;
    try {
      const image = await window.gzhApp.resolveLocalImage(src);
      if (!image?.dataUrl) {
        next += raw;
        continue;
      }
      const name = alt || image.name || "本地图片.png";
      const id = createAsset(name, image.dataUrl, image.fileUrl || "", image.filePath || "");
      next += `![${name}](asset://${id})`;
      changed = true;
    } catch (error) {
      console.warn("resolve local image failed", error);
      next += raw;
    }
  }
  next += source.slice(cursor);
  if (changed) {
    els.source.value = next;
    renderAssets();
    scheduleSaveState();
  }
  return changed;
}

function clipboardHtml(html) {
  let next = stripPreviewMarks(html);
  for (const asset of Object.values(state.assets)) {
    if (!asset?.dataUrl || !asset?.fileUrl) continue;
    next = next.split(esc(asset.dataUrl)).join(esc(asset.fileUrl));
    next = next.split(asset.dataUrl).join(asset.fileUrl);
  }
  return next;
}

function renderAssets() {
  const assets = Object.values(state.assets);
  els.assetStrip.innerHTML = "";
  const addBtn = document.createElement("button");
  addBtn.type = "button";
  addBtn.className = "asset-add";
  addBtn.textContent = "+ 添加图片";
  addBtn.addEventListener("click", insertLocalImage);
  els.assetStrip.appendChild(addBtn);

  const help = document.createElement("div");
  help.className = "asset-help";
  help.textContent = assets.length ? "点击图片可再次插入，右上角可删除" : "可点击添加，也可在文章里 Ctrl+V 粘贴图片";
  els.assetStrip.appendChild(help);

  for (const asset of assets) {
    const assetSrc = asset.dataUrl || asset.fileUrl || "";
    const card = document.createElement("div");
    card.className = "asset-card";
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.title = "点击在光标处再次插入该图片";
    card.innerHTML = `<img alt="" src="${esc(assetSrc)}"><span>${esc(asset.name)}</span><button class="asset-remove" type="button" title="删除图片">×</button>`;
    card.addEventListener("click", () => insertLine(`![${asset.name}](asset://${asset.id})`));
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") insertLine(`![${asset.name}](asset://${asset.id})`);
    });
    card.querySelector(".asset-remove").addEventListener("click", (event) => {
      event.stopPropagation();
      removeAsset(asset.id);
    });
    els.assetStrip.appendChild(card);
  }
}

function removeAsset(id) {
  const asset = state.assets[id];
  if (!asset) return;
  delete state.assets[id];
  const escaped = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const imageLine = new RegExp(`^!?\\[[^\\]]*\\]\\(asset://${escaped}\\)\\s*\\n?`, "gm");
  els.source.value = els.source.value.replace(imageLine, "");
  renderAssets();
  renderArticle();
  els.status.textContent = "图片已删除";
}

function enLabel(text) {
  if (/鏁欑▼|姝ラ|鎿嶄綔|鎸囧崡|璇硶/.test(text)) return "TUTORIAL";
  if (/鎬荤粨|鏈€鍚巪缁撹/.test(text)) return "SUMMARY";
  if (/宸ュ叿|娓呭崟|鐩樼偣|鑳藉姏|鍒楄〃/.test(text)) return "TOOLS";
  if (/瑙傜偣|鎬濊€億鍒嗘瀽|寮曠敤/.test(text)) return "THOUGHTS";
  if (/妗堜緥|瀹炴垬|绀轰緥/.test(text)) return "CASE";
  if (/浠ｇ爜/.test(text)) return "CODE";
  if (/鍥剧墖/.test(text)) return "IMAGE";
  return "SECTION";
}

function renderCover(title, subtitle, theme) {
  const line1 = title.length > 16 ? title.slice(0, 16) : title;
  const line2 = title.length > 16 ? title.slice(16, 34) : "";
  const label = els.coverLabel.value.trim() || theme.label;
  const editDate = state.editedAt || todayStamp();
  return `<section data-profile-target="cover" style="margin:0 0 32px;background:#fff;border:1.5px solid ${theme.underlineColor};border-radius:20px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.06);width:100%;">
  <section style="padding:32px 28px 28px;">
    <section style="display:flex;align-items:center;gap:8px;margin-bottom:28px;">
      <span style="width:6px;height:6px;background:${theme.mainColor};border-radius:50%;"><span leaf=""><br></span></span>
      <span style="font-size:11px;font-weight:700;letter-spacing:3px;color:${theme.mainColor};">${leaf(label)}</span>
      <section style="flex:1;height:1px;overflow:hidden;background:linear-gradient(to right,${theme.underlineColor},transparent);"><span leaf=""><br></span></section>
      <span style="font-size:10px;color:#D1D5DB;font-weight:600;">${leaf(editDate)}</span>
    </section>
    <p style="font-size:26px;font-weight:900;color:#0F172A;margin:0;line-height:1.12;letter-spacing:0.1px;">${leaf(line1)}</p>
    ${line2 ? `<p style="font-size:26px;font-weight:900;color:${theme.mainColor};margin:0 0 16px;line-height:1.12;letter-spacing:0.1px;">${leaf(line2)}</p>` : ""}
    <section style="width:48px;height:3px;background:linear-gradient(to right,${theme.mainColor},${theme.underlineColor});border-radius:2px;margin-bottom:12px;"><span leaf=""><br></span></section>
    <p style="font-size:13px;color:#9CA3AF;margin:0;line-height:1.7;letter-spacing:0.5px;">${leaf(subtitle || "Markdown 语法 · 实时预览 · 离线模板")}</p>
  </section>
</section>`;
}

function renderToc(headings, theme) {
  if (headings.length < 2) return "";
  const palette = [
    [theme.mainColor, themeDeep(theme)],
    ["#0EA5E9", "#0369A1"],
    ["#14B8A6", "#0F766E"],
    ["#8B5CF6", "#6D28D9"],
    ["#F59E0B", "#B45309"],
    ["#EF4444", "#B91C1C"]
  ];
  const cards = headings.slice(0, 6).map((h, i) => {
    const [from, to] = palette[i % palette.length];
    const bg = `background:linear-gradient(135deg,${from},${to});box-shadow:0 4px 12px rgba(15,23,42,0.10);`;
    return `<section style="display:inline-block;white-space:normal;vertical-align:top;width:132px;height:106px;${bg}border-radius:12px;padding:12px;margin-right:8px;overflow:hidden;">
  <p style="font-size:9px;font-weight:700;color:rgba(255,255,255,0.72);letter-spacing:1px;margin:0 0 7px;">${leaf("PART " + String(i + 1).padStart(2, "0"))}</p>
  <p style="font-size:13px;font-weight:850;color:#fff;margin:0 0 5px;line-height:1.45;white-space:normal;">${leaf(h)}</p>
  <p style="font-size:10px;color:rgba(255,255,255,0.72);margin:0;line-height:1.2;">${leaf(enLabel(h))}</p>
</section>`;
  }).join("");
  return `<section style="margin:0 20px 32px;">
  <section style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
    <p style="font-size:10px;color:#9CA3AF;margin:0;text-transform:uppercase;letter-spacing:2px;font-weight:600;">${leaf(headings.length + " PARTS")}</p>
    <p style="font-size:10px;color:#9CA3AF;margin:0;">${leaf("横向滑动")}</p>
  </section>
  <section style="overflow-x:scroll;-webkit-overflow-scrolling:touch;white-space:nowrap;padding-bottom:8px;">${cards}</section>
</section>`;
}

function articleBackgroundStyle(name) {
  const color = state.backgroundColor || "#94a3b8";
  const alpha = Math.max(4, Math.min(32, Number(state.backgroundStrength) || 18)) / 100;
  const soft = `rgba(${hexToRgb(color).join(",")},${alpha.toFixed(2)})`;
  const softer = `rgba(${hexToRgb(color).join(",")},${Math.max(0.03, alpha * 0.62).toFixed(2)})`;
  const styles = {
    none: "background:#ffffff;",
    grid: `background-color:#ffffff;background-image:linear-gradient(90deg,${soft} 1px,transparent 1px),linear-gradient(180deg,${soft} 1px,transparent 1px);background-size:22px 22px;`,
    paper: `background-color:#ffffff;background-image:repeating-linear-gradient(0deg,${softer} 0 1px,transparent 1px 28px);`,
    dots: `background-color:#ffffff;background-image:radial-gradient(circle,${soft} 1px,transparent 1.6px);background-size:18px 18px;`,
    mist: `background-color:#ffffff;background-image:linear-gradient(135deg,${softer},transparent 38%),linear-gradient(315deg,${soft},transparent 46%);`,
    mint: `background-color:#ffffff;background-image:linear-gradient(135deg,${soft},transparent 42%),linear-gradient(315deg,${softer},transparent 46%);`
  };
  return styles[name] || styles.none;
}

function previewMark(block) {
  return ` data-preview-start="${block.startLine || 1}" data-preview-end="${block.endLine || block.startLine || 1}"`;
}

function stripPreviewMarks(html) {
  return html.replace(/\sdata-preview-(start|end)="\d+"/g, "");
}

function replaceEmojiTokens(html) {
  return html.replace(/\{\{emoji:([\w-]+)\}\}/g, (_match, id) => {
    const asset = state.assets[id];
    const src = asset?.dataUrl || asset?.fileUrl || "";
    if (!src) return "";
    return `<img src="${esc(src)}" alt="${esc(asset.name || "表情")}" style="width:22px;height:22px;display:inline-block;vertical-align:-5px;margin:0 2px;border:0;object-fit:contain;">`;
  });
}

function renderArticle() {
  const theme = state.themes.find((t) => t.id === els.themeSelect.value) || state.themes[0];
  if (!theme) return;

  const blocks = parseBlocks(els.source.value);
  const titleBlock = blocks.find((b) => b.type === "title");
  const quoteBlock = blocks.find((b) => b.type === "quote");
  const customTitle = els.articleTitle.value.trim();
  const title = customTitle || titleBlock?.text || "公众号 Markdown 排版";
  const subtitle = els.coverSubtitle.value.trim() || quoteBlock?.text || "";
  const headings = blocks.filter((b) => b.type === "h2").map((b) => b.text);

  let html = `<section style="max-width:677px;margin:0 auto;${articleBackgroundStyle(state.previewBackground)}padding:18px 0;font-family:-apple-system,BlinkMacSystemFont,'HarmonyOS Sans SC','PingFang SC','Microsoft YaHei','Helvetica Neue',Arial,sans-serif;color:#334155;line-height:1.78;letter-spacing:0.2px;overflow-x:hidden;">`;
  html += renderCover(title, subtitle, theme);
  html += renderToc(headings, theme);

  let chapterNo = 0;
  let listOpen = false;
  let historySection = false;
  let historyNo = 0;
  const closeList = () => {
    if (listOpen) {
      html += "</section>";
      listOpen = false;
    }
  };

  for (const block of blocks) {
    if (block.type === "title" || block === quoteBlock) continue;
    if (block.type !== "li") closeList();

    if (block.type === "h2") {
      if (chapterNo > 0) html += "</section>";
      chapterNo += 1;
      historySection = /历史文章|推荐阅读|延伸阅读|往期文章/.test(block.text);
      if (historySection) historyNo = 0;
      const no = /鏈€鍚巪鎬荤粨|缁撹/.test(block.text) ? "///" : String(chapterNo).padStart(2, "0");
      const part = no === "///" ? "LAST" : "PART";
      html += `<section${previewMark(block)} style="margin-top:${chapterNo === 1 ? 16 : 48}px;margin-bottom:32px;padding:0 20px;">
  <section style="display:flex;align-items:center;gap:16px;margin-bottom:24px;">
    <section style="text-align:center;flex-shrink:0;"><p style="margin:0;font-size:28px;font-weight:900;color:${theme.mainColor};line-height:1;">${leaf(no)}</p><p style="margin:0;font-size:8px;font-weight:700;color:#D1D5DB;letter-spacing:2px;">${leaf(part)}</p></section>
    <span style="width:1px;height:36px;background:#E5E7EB;flex-shrink:0;"><span leaf=""><br></span></span>
    <section><p style="margin:0 0 1px;font-size:17px;font-weight:900;color:#111827;letter-spacing:0.3px;">${leaf(block.text)}</p><p style="margin:0;font-size:11px;font-weight:600;color:#9CA3AF;letter-spacing:1.5px;">${leaf(enLabel(block.text))}</p></section>
  </section>`;
    } else if (block.type === "h3") {
      html += `<p${previewMark(block)} style="margin:28px 20px 14px;font-size:16px;font-weight:800;color:#1C1917;line-height:1.5;border-left:4px solid ${theme.mainColor};padding-left:12px;">${leaf(block.text)}</p>`;
    } else if (block.type === "quote") {
      html += `<section${previewMark(block)} style="margin:0 20px 24px;background:${themeSoft(theme)};border-radius:0 10px 10px 0;border-left:4px solid ${theme.mainColor};padding:16px 20px;"><p style="font-size:16px;font-weight:800;color:${themeDeep(theme)};margin:0;line-height:1.8;">${leaf("「" + block.text.replace(/^「|」$/g, "") + "」")}</p></section>`;
    } else if (block.type === "p") {
      const pad = chapterNo ? "" : "padding:0 20px;";
      html += `<section${previewMark(block)} style="${pad}"><p style="margin-bottom:17px;font-size:15px;line-height:1.92;text-align:justify;color:#334155;">${inline(block.text, theme)}</p></section>`;
    } else if (block.type === "li") {
      if (!listOpen) {
        html += `<section style="margin:0 20px 24px;">`;
        listOpen = true;
      }
      if (historySection) {
        historyNo += 1;
        html += `<section${previewMark(block)} style="margin-bottom:12px;background:linear-gradient(135deg,#FFFFFF,${themeSoft(theme)});border:1px solid #E5E7EB;border-radius:14px;padding:14px 14px;box-shadow:0 5px 16px rgba(15,23,42,0.05);">
  <section style="display:flex;gap:12px;align-items:flex-start;">
    <span style="display:inline-block;min-width:34px;height:34px;line-height:34px;text-align:center;border-radius:10px;background:${theme.mainColor};color:#FFFFFF;font-size:12px;font-weight:900;">${leaf(String(historyNo).padStart(2, "0"))}</span>
    <section style="min-width:0;">
      <p style="margin:0;font-size:14px;font-weight:850;color:#111827;line-height:1.65;">${inline(block.text.replace(/^《|》$/g, ""), theme)}</p>
    </section>
  </section>
</section>`;
      } else {
        html += `<section${previewMark(block)} style="margin-bottom:14px;"><p style="margin:0 0 6px;"><span style="display:inline-block;font-size:13px;font-weight:700;color:${theme.mainColor};background:${themeSoft(theme)};padding:3px 10px;border-radius:999px;"><span style="display:inline-block;width:6px;height:6px;background:${theme.mainColor};border-radius:50%;margin-right:5px;vertical-align:middle;"><span leaf=""><br></span></span>${inline(block.text, theme)}</span></p></section>`;
      }
    } else if (block.type === "image") {
      const imageSrc = resolveImageSrc(block.src);
      const imageAsset = block.src.startsWith("asset://") ? state.assets[block.src.replace("asset://", "")] : null;
      const imageMargin = chapterNo ? "0 0 8px" : "0 20px 8px";
      const captionMargin = chapterNo ? "0 0 24px" : "0 20px 24px";
      const imageWidth = `${block.scale || 100}%`;
      if (imageAsset?.emojiPlain) {
        html += `<section${previewMark(block)} style="margin:${imageMargin};text-align:center;"><span leaf=""><img src="${esc(imageSrc)}" style="width:${imageWidth};max-width:100%;height:auto;display:block;margin:0 auto;border:0;box-shadow:none;"></span></section>`;
      } else {
        html += `<section${previewMark(block)} style="background:#FFF;border-radius:12px;padding:3px;border:1px solid #E5E7EB;box-shadow:0 4px 12px -2px rgba(0,0,0,0.08);margin:${imageMargin};"><section style="margin:0;border-radius:8px;overflow:hidden;text-align:center;"><span leaf=""><img src="${esc(imageSrc)}" style="width:${imageWidth};max-width:100%;height:auto;display:block;margin:0 auto;"></span></section></section>`;
      }
      if (block.alt && !imageAsset?.emojiPlain) html += `<p style="font-size:12px;color:#9CA3AF;text-align:center;margin:${captionMargin};">${leaf("— " + block.alt)}</p>`;
    } else if (block.type === "code") {
      const rows = block.text.split("\n").map((line) => `<p style="margin:0;font-family:'SF Mono',Consolas,Monaco,monospace;font-size:13px;line-height:1.6;color:#E2E8F0;">${leaf(line.replace(/  /g, "銆€"))}</p>`).join("");
      html += `<section${previewMark(block)} style="margin:0 20px 20px;border-radius:8px;overflow:hidden;background:#1E293B;box-shadow:0 4px 16px -8px rgba(15,23,42,0.4);"><section style="display:flex;align-items:center;padding:9px 14px;background:#0F172A;"><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#FF5F56;margin-right:7px;font-size:0;line-height:0;overflow:hidden;"><span leaf=""><br></span></span><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#FFBD2E;margin-right:7px;font-size:0;line-height:0;overflow:hidden;"><span leaf=""><br></span></span><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#27C93F;font-size:0;line-height:0;overflow:hidden;"><span leaf=""><br></span></span><span style="margin-left:12px;font-size:12px;color:#64748B;font-family:Consolas,Monaco,monospace;letter-spacing:1px;">${leaf(block.lang)}</span></section><section style="padding:11px 14px;">${rows}</section></section>`;
    } else if (block.type === "hr") {
      html += `<section${previewMark(block)} style="height:1px;background:linear-gradient(to right,transparent,${theme.underlineColor},transparent);margin:28px 20px;"><span leaf=""><br></span></section>`;
    }
  }
  closeList();
  if (chapterNo) html += "</section>";

  const author = els.authorName.value.trim();
  const bio = els.authorBio.value.trim();
  const cta = els.ctaText.value.trim();
  if (author || bio) {
    const authorText = author && bio ? `我是 ${author}，${bio}。` : author ? `我是 ${author}。` : bio;
    html += `<section data-profile-target="author" style="margin:28px 20px 14px;background:linear-gradient(135deg,${themeSoft(theme)},#FFFFFF);border:1px solid ${theme.underlineColor};border-radius:14px;padding:16px 18px;">
  <p style="margin:0 0 6px;font-size:11px;font-weight:800;letter-spacing:1.4px;color:${theme.mainColor};">${leaf("ABOUT AUTHOR")}</p>
  <p style="margin:0;font-size:15px;font-weight:800;line-height:1.85;color:#111827;text-align:justify;">${leaf(authorText)}</p>
</section>`;
  }
  if (cta) {
    html += `<section data-profile-target="cta" style="background:radial-gradient(circle at center,#F9FAFB 0%,#FFFFFF 100%);border:1px solid #E5E7EB;border-radius:16px;padding:32px 20px;text-align:center;box-shadow:0 4px 12px rgba(0,0,0,0.03);margin:0 0 24px;"><p style="font-size:13px;font-weight:bold;color:#111827;margin-bottom:20px;line-height:1.6;">${leaf(cta)}</p><p style="font-size:10px;color:#9CA3AF;letter-spacing:1px;margin:0;">${leaf("THANKS FOR READING")}</p></section>`;
  }
  html += "</section>";

  html = replaceEmojiTokens(html);
  state.currentHtml = clipboardHtml(html);
  els.preview.innerHTML = html;
  els.htmlOut.textContent = state.currentHtml;
  els.meta.textContent = `${els.source.value.length} 字`;
  els.quality.textContent = `${theme.name} · ${chapterNo || 0} 章 · leaf ${(html.match(/leaf=""/g) || []).length}`;
  scheduleSaveState();
  if (state.skipNextPreviewFollow) {
    state.skipNextPreviewFollow = false;
  } else {
    schedulePreviewFollow();
  }
}

function scheduleRenderArticle() {
  cancelAnimationFrame(state.renderFrame || 0);
  state.renderFrame = requestAnimationFrame(renderArticle);
}

function rememberSourceSelection() {
  state.sourceSelection = {
    start: els.source.selectionStart ?? els.source.value.length,
    end: els.source.selectionEnd ?? els.source.value.length
  };
}

function sourceSelection() {
  if (document.activeElement === els.source) rememberSourceSelection();
  const max = els.source.value.length;
  return {
    start: Math.min(state.sourceSelection.start ?? max, max),
    end: Math.min(state.sourceSelection.end ?? max, max)
  };
}

function caretLineNumber() {
  const pos = sourceSelection().start;
  return els.source.value.slice(0, pos).split("\n").length;
}

function scrollPreviewToLine(lineNo) {
  if (state.mode !== "preview") return;
  const nodes = Array.from(els.preview.querySelectorAll("[data-preview-start]"));
  if (!nodes.length) return;
  let target = nodes.find((node) => {
    const start = Number(node.dataset.previewStart || 1);
    const end = Number(node.dataset.previewEnd || start);
    return lineNo >= start && lineNo <= end;
  });
  if (!target) {
    target = nodes.reduce((best, node) => {
      const start = Number(node.dataset.previewStart || 1);
      const bestStart = Number(best.dataset.previewStart || 1);
      return Math.abs(start - lineNo) < Math.abs(bestStart - lineNo) ? node : best;
    }, nodes[0]);
  }
  const wrapRect = els.previewWrap.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();
  const nextTop = els.previewWrap.scrollTop + targetRect.top - wrapRect.top - Math.max(24, wrapRect.height * 0.18);
  els.previewWrap.scrollTo({ top: Math.max(0, nextTop), behavior: "smooth" });
}

function schedulePreviewFollow() {
  cancelAnimationFrame(state.previewFollowFrame || 0);
  state.previewFollowFrame = requestAnimationFrame(() => scrollPreviewToLine(caretLineNumber()));
}

function scrollPreviewToProfileTarget(target) {
  if (state.mode !== "preview") setMode("preview");
  requestAnimationFrame(() => {
    const node = els.preview.querySelector(`[data-profile-target="${target}"]`);
    if (!node) return;
    const wrapRect = els.previewWrap.getBoundingClientRect();
    const targetRect = node.getBoundingClientRect();
    const nextTop = els.previewWrap.scrollTop + targetRect.top - wrapRect.top - Math.max(20, wrapRect.height * 0.16);
    els.previewWrap.scrollTo({ top: Math.max(0, nextTop), behavior: "smooth" });
  });
}

function profileTargetForInput(input) {
  if (input === els.articleTitle || input === els.coverLabel || input === els.coverSubtitle) return "cover";
  if (input === els.authorName || input === els.authorBio) return "author";
  if (input === els.ctaText) return "cta";
  return "";
}

function focusSourceRange(start, end = start) {
  els.source.focus({ preventScroll: true });
  els.source.setSelectionRange(start, end);
  rememberSourceSelection();
  requestAnimationFrame(() => {
    els.source.focus();
    els.source.setSelectionRange(start, end);
  });
}

function replaceSourceSelection(text, options = {}) {
  const range = sourceSelection();
  els.source.focus({ preventScroll: true });
  els.source.setSelectionRange(range.start, range.end);
  const insertedByBrowser = document.execCommand("insertText", false, text);
  if (!insertedByBrowser) {
    els.source.setRangeText(text, range.start, range.end, "end");
    els.source.dispatchEvent(new Event("input", { bubbles: true }));
  }
  const selectionStart = range.start + (options.selectStart ?? text.length);
  const selectionEnd = range.start + (options.selectEnd ?? (options.selectStart ?? text.length));
  focusSourceRange(selectionStart, selectionEnd);
  renderArticle();
}

function editableSpanInLine(text) {
  const image = text.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
  if (image) return { start: 2, end: 2 + image[1].length };
  const markers = ["### ", "## ", "# ", "> ", "- ", "1. "];
  const marker = markers.find((item) => text.startsWith(item));
  if (marker) return { start: marker.length, end: text.length };
  return { start: 0, end: text.length };
}

function insertText(text, options = {}) {
  replaceSourceSelection(text, options);
}

function insertLine(text) {
  const range = sourceSelection();
  const before = els.source.value.slice(0, range.start);
  const prefix = before && !before.endsWith("\n") ? "\n\n" : "";
  const insert = prefix + text + "\n\n";
  const editable = editableSpanInLine(text);
  replaceSourceSelection(insert, {
    selectStart: prefix.length + editable.start,
    selectEnd: prefix.length + editable.end
  });
}

function wrapSelection(prefix, suffix, fallback) {
  const range = sourceSelection();
  const selected = els.source.value.slice(range.start, range.end) || fallback;
  const next = prefix + selected + suffix;
  replaceSourceSelection(next, {
    selectStart: prefix.length,
    selectEnd: prefix.length + selected.length
  });
}

function insertLink() {
  const range = sourceSelection();
  const selected = els.source.value.slice(range.start, range.end) || "链接文字";
  const text = `[${selected}](https://example.com)`;
  replaceSourceSelection(text, {
    selectStart: selected.length + 3,
    selectEnd: selected.length + 22
  });
}

async function insertImageMarkdown(name, dataUrl, fileUrl = "", filePath = "") {
  let copyFileUrl = fileUrl;
  let copyFilePath = filePath;
  if (!copyFileUrl && String(dataUrl || "").startsWith("data:image/")) {
    try {
      const cached = await window.gzhApp.cacheImage(name, dataUrl);
      copyFileUrl = cached?.fileUrl || "";
      copyFilePath = cached?.filePath || "";
    } catch (error) {
      console.warn("cache image failed", error);
    }
  }
  const id = createAsset(name, dataUrl, copyFileUrl, copyFilePath);
  insertLine(`![${name || "粘贴图片"}](asset://${id})`);
  els.status.textContent = copyFileUrl ? "图片已缓存，复制到公众号时会同步带图" : "图片已作为附件插入";
}

async function ensureClipboardImagesCached() {
  let changed = false;
  for (const asset of Object.values(state.assets)) {
    if (!asset?.dataUrl || asset.fileUrl || !String(asset.dataUrl).startsWith("data:image/")) continue;
    try {
      const cached = await window.gzhApp.cacheImage(asset.name, asset.dataUrl);
      if (cached?.fileUrl) {
        asset.fileUrl = cached.fileUrl;
        asset.filePath = cached.filePath || asset.filePath || "";
        changed = true;
      }
    } catch (error) {
      console.warn("cache image failed", error);
    }
  }
  if (changed) {
    renderAssets();
    renderArticle();
  }
}

function primaryClipboardImagePath() {
  const asset = Object.values(state.assets).find((item) => item?.filePath || String(item?.fileUrl || "").startsWith("file:///"));
  if (!asset) return "";
  if (asset.filePath) return asset.filePath;
  try {
    return decodeURIComponent(asset.fileUrl.replace(/^file:\/\/\//, "")).replace(/\//g, "\\");
  } catch {
    return "";
  }
}

function imageCopySummary() {
  const assets = Object.values(state.assets).filter((asset) => String(asset?.dataUrl || "").startsWith("data:image/"));
  const cached = assets.filter((asset) => asset.fileUrl).length;
  return assets.length ? `，图片 ${cached}/${assets.length} 已同步` : "";
}

function copyRichFromDom(html) {
  const holder = document.createElement("section");
  holder.contentEditable = "true";
  holder.style.position = "fixed";
  holder.style.left = "-9999px";
  holder.style.top = "0";
  holder.style.width = "720px";
  holder.style.background = "#fff";
  holder.innerHTML = html;
  document.body.appendChild(holder);
  const range = document.createRange();
  range.selectNodeContents(holder);
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } finally {
    selection.removeAllRanges();
    holder.remove();
  }
  return ok;
}

async function handlePaste(event) {
  const items = Array.from(event.clipboardData?.items || []);
  const imageItem = items.find((item) => item.type && item.type.startsWith("image/"));
  if (imageItem) {
    event.preventDefault();
    const file = imageItem.getAsFile();
    const reader = new FileReader();
    reader.onload = () => insertImageMarkdown(file?.name || `clipboard-${Date.now()}.png`, reader.result);
    reader.readAsDataURL(file);
    return;
  }
  const image = await window.gzhApp.readImage();
  if (image?.dataUrl) {
    event.preventDefault();
    await insertImageMarkdown(image.name, image.dataUrl, image.fileUrl || "", image.filePath || "");
  }
}

async function insertLocalImage() {
  const image = await window.gzhApp.pickImage();
  if (!image) return;
  await insertImageMarkdown(image.name, image.dataUrl, image.fileUrl || "", image.filePath || "");
}

function insertUrlImage() {
  const url = els.imageUrl.value.trim();
  if (!url) {
    els.status.textContent = "先粘贴图片 URL";
    return;
  }
  insertImageMarkdown("图片", url);
  els.imageUrl.value = "";
}

function renderSyntaxBar() {
  els.syntaxBar.innerHTML = "";
  for (const action of syntaxActions) {
    const btn = document.createElement("button");
    btn.className = "syntax-btn";
    btn.type = "button";
    btn.title = action.shortcut ? `${action.label} ${action.shortcut}` : action.label;
    btn.innerHTML = `<strong>${esc(action.mark)}</strong><span>${esc(action.label)}</span>${action.shortcut ? `<kbd>${esc(action.shortcut)}</kbd>` : ""}`;
    btn.addEventListener("mousedown", (event) => event.preventDefault());
    btn.addEventListener("click", action.run);
    els.syntaxBar.appendChild(btn);
  }
}

function setSyntaxCollapsed(collapsed) {
  state.syntaxCollapsed = Boolean(collapsed);
  document.querySelector(".editor")?.classList.toggle("syntax-collapsed", state.syntaxCollapsed);
  if (els.syntaxToggle) {
    els.syntaxToggle.textContent = state.syntaxCollapsed ? "展开语法" : "收起语法";
  }
}

function setSettingsCollapsed(collapsed) {
  state.settingsCollapsed = Boolean(collapsed);
  document.body.classList.toggle("settings-collapsed", state.settingsCollapsed);
  if (els.settingsToggle) {
    els.settingsToggle.textContent = state.settingsCollapsed ? "显示设置" : "隐藏设置";
  }
  schedulePreviewFollow();
}

function shortcutMatches(event, shortcut) {
  const parts = shortcut.toLowerCase().split("+");
  const wantsCtrl = parts.includes("ctrl");
  const wantsShift = parts.includes("shift");
  const wantsAlt = parts.includes("alt");
  const key = parts[parts.length - 1];
  if (event.ctrlKey !== wantsCtrl || event.shiftKey !== wantsShift || event.altKey !== wantsAlt) return false;
  if (key.length === 1) return event.key.toLowerCase() === key || event.code.toLowerCase() === `key${key}`;
  if (/^\d$/.test(key)) return event.key === key || event.code === `Digit${key}`;
  if (key === "`") return event.key === "`" || event.code === "Backquote";
  if (key === "-") return event.key === "-" || event.code === "Minus";
  return event.key.toLowerCase() === key;
}

function handleEditorShortcut(event) {
  const action = syntaxActions.find((item) => item.shortcut && shortcutMatches(event, item.shortcut));
  if (!action) return;
  event.preventDefault();
  rememberSourceSelection();
  action.run();
}

function setMode(mode) {
  state.mode = mode;
  document.body.classList.toggle("mode-html", mode === "html");
  document.body.classList.toggle("mode-templates", mode === "templates");
  document.body.classList.toggle("mode-emojis", mode === "emojis");
  document.getElementById("previewTab").classList.toggle("active", mode === "preview");
  document.getElementById("htmlTab")?.classList.toggle("active", mode === "html");
  document.getElementById("templatesTab").classList.toggle("active", mode === "templates");
  els.emojiTab?.classList.toggle("active", mode === "emojis");
}

function isOnline() {
  return navigator.onLine !== false;
}

function updateWechatNetworkState() {
  if (!els.wechatNetworkHint) return;
  if (isOnline()) {
    els.wechatNetworkHint.textContent = "已连接网络，可打开微信公众号后台登录、编辑草稿或发布。";
    els.wechatNetworkHint.classList.remove("offline");
  } else {
    els.wechatNetworkHint.textContent = "当前未连接网络，需要联网后才能登录微信公众号后台。";
    els.wechatNetworkHint.classList.add("offline");
  }
}

function showCopyToast(message = "现在打开公众号编辑器，直接粘贴即可。") {
  els.copyToastText.textContent = message;
  els.copyToast.classList.add("show");
  els.copyToast.setAttribute("aria-hidden", "false");
}

function hideCopyToast() {
  els.copyToast.classList.remove("show");
  els.copyToast.setAttribute("aria-hidden", "true");
}

function openWechatTarget(target = "login") {
  if (!isOnline()) {
    updateWechatNetworkState();
    showCopyToast("当前没有网络连接，需要联网后才能登录微信公众号后台。");
    return;
  }
  window.gzhApp.openWechat(target);
}

function setMockup(mode) {
  els.previewWrap.classList.toggle("mock-phone", mode === "phone");
  els.previewWrap.classList.toggle("mock-desktop", mode === "desktop");
  document.querySelectorAll(".mockup-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.mode === mode);
  });
}

function setPreviewBackground(name = "none") {
  const backgrounds = ["none", "grid", "paper", "dots", "mist", "mint"];
  const next = backgrounds.includes(name) ? name : "none";
  state.previewBackground = next;
  els.previewWrap.classList.remove("bg-grid", "bg-paper", "bg-dots", "bg-mist", "bg-mint", "bg-slate");
  document.querySelectorAll(".bg-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.bg === next);
  });
}

function setBackgroundTune(color = "#94a3b8", strength = 18) {
  state.backgroundColor = /^#[0-9a-fA-F]{6}$/.test(color) ? color : "#94a3b8";
  state.backgroundStrength = Math.max(4, Math.min(32, Number(strength) || 18));
  if (els.backgroundColor) els.backgroundColor.value = state.backgroundColor;
  if (els.backgroundStrength) els.backgroundStrength.value = String(state.backgroundStrength);
  if (els.backgroundStrengthValue) els.backgroundStrengthValue.textContent = `${state.backgroundStrength}%`;
}

function populateTemplates() {
  if (!els.templateFileSelect) return;
  els.templateFileSelect.innerHTML = "";
  for (const file of state.skill.referenceFiles) {
    const opt = document.createElement("option");
    opt.value = file.name;
    opt.textContent = file.name;
    els.templateFileSelect.appendChild(opt);
  }
  if (state.themes[0]?.fileName) els.templateFileSelect.value = state.themes[0].fileName;
  renderTemplatePanel();
}

function renderTemplatePanel() {
  if (!els.templateSearch || !els.templateFileSelect || !els.templateSummary || !els.templateContent) return;
  const query = els.templateSearch.value.trim().toLowerCase();
  const name = els.templateFileSelect.value;
  const file = state.skill.referenceFiles.find((item) => item.name === name);
  if (!file) return;
  let content = file.content;
  if (query) {
    const lines = content.split(/\r?\n/);
    content = lines.filter((line, index) => lines.slice(Math.max(0, index - 1), index + 2).join("\n").toLowerCase().includes(query)).join("\n");
    if (!content) content = "没有匹配内容。";
  }
  els.templateSummary.textContent = `${state.themes.length} 个主题模板，${state.skill.referenceFiles.length} 个 reference 文件已离线加载 · 当前：${file.path}`;
  els.templateContent.textContent = content;
}

function updateThemeMeta() {
  let theme = state.themes.find((t) => t.id === els.themeSelect.value);
  if (!theme && state.themes[0]) {
    els.themeSelect.value = state.themes[0].id;
    theme = state.themes[0];
  }
  if (!theme) return;
  els.themeScene.textContent = theme.scene;
  document.documentElement.style.setProperty("--accent", theme.mainColor);
  document.documentElement.style.setProperty("--accent-soft", themeSoft(theme));
}

function saveState() {
  clearTimeout(state.saveTimer);
  const lightweightAssets = Object.fromEntries(Object.entries(state.assets).map(([id, asset]) => [id, {
    ...asset,
    dataUrl: asset.fileUrl ? "" : asset.dataUrl
  }]));
  const lightweightEmojis = state.emojis.map((emoji) => ({
    ...emoji,
    dataUrl: emoji.fileUrl ? "" : emoji.dataUrl
  }));
  const data = {
    source: els.source.value,
    theme: els.themeSelect.value,
    articleTitle: els.articleTitle.value,
    coverLabel: els.coverLabel.value,
    coverSubtitle: els.coverSubtitle.value,
    authorName: els.authorName.value,
    authorBio: els.authorBio.value,
    ctaText: els.ctaText.value,
    assets: lightweightAssets,
    emojis: lightweightEmojis,
    emojiInsertMode: state.emojiInsertMode,
    mockup: document.querySelector(".mockup-btn.active")?.dataset.mode || "default",
    previewBackground: state.previewBackground,
    backgroundColor: state.backgroundColor,
    backgroundStrength: state.backgroundStrength,
    syntaxCollapsed: state.syntaxCollapsed,
    settingsCollapsed: state.settingsCollapsed,
    editedAt: state.editedAt
  };
  localStorage.setItem("gzh-electron-state", JSON.stringify(data));
}

function scheduleSaveState(delay = 350) {
  clearTimeout(state.saveTimer);
  state.saveTimer = window.setTimeout(saveState, delay);
}

function loadState() {
  try {
    const data = JSON.parse(localStorage.getItem("gzh-electron-state") || "{}");
    if (data.theme) els.themeSelect.value = data.theme;
    if (data.articleTitle) els.articleTitle.value = data.articleTitle;
    state.assets = data.assets || {};
    state.emojis = data.emojis || [];
    state.emojiInsertMode = data.emojiInsertMode || "tiny";
    state.editedAt = data.editedAt || todayStamp();
    renderAssets();
    renderEmojiPanel();
    setEmojiInsertMode(state.emojiInsertMode, false);
    setMockup(data.mockup || "default");
    setPreviewBackground(data.previewBackground || "none");
    setBackgroundTune(data.backgroundColor || "#94a3b8", data.backgroundStrength || 18);
    setSyntaxCollapsed(data.syntaxCollapsed || false);
    setSettingsCollapsed(true);
    return true;
  } catch {
    return false;
  }
}

async function init() {
  state.skill = await window.gzhApp.loadSkill();
  state.themes = state.skill.themes;
  els.themeSelect.innerHTML = "";
  for (const theme of state.themes) {
    const opt = document.createElement("option");
    opt.value = theme.id;
    opt.textContent = theme.name;
    els.themeSelect.appendChild(opt);
  }
  els.templateCount.textContent = `${state.themes.length} 套`;
  renderSyntaxBar();
  loadState();
  renderEmojiPanel();
  if (!els.articleTitle.value) els.articleTitle.value = defaultProfile.articleTitle;
  els.coverLabel.value = defaultProfile.coverLabel;
  els.coverSubtitle.value = defaultProfile.coverSubtitle;
  els.authorName.value = defaultProfile.authorName;
  els.authorBio.value = defaultProfile.authorBio;
  els.ctaText.value = defaultProfile.ctaText;
  renderProfilePresets("__default");
  if (!state.themes.some((theme) => theme.id === els.themeSelect.value) && state.themes[0]) {
    els.themeSelect.value = state.themes[0].id;
  }
  els.source.value = markdownSample;
  await seedDemoEmojiAssets();
  await importLocalMarkdownImages();
  syncArticleTitleFromMarkdown();
  updateThemeMeta();
  renderArticle();
  updateWechatNetworkState();
  els.status.textContent = "离线模板已加载";
}

document.getElementById("previewTab").addEventListener("click", () => setMode("preview"));
document.getElementById("htmlTab")?.addEventListener("click", () => setMode("html"));
els.emojiTab?.addEventListener("click", () => setMode("emojis"));
document.getElementById("templatesTab").addEventListener("click", () => setMode("templates"));
document.getElementById("githubBtn").addEventListener("click", () => {
  window.gzhApp.openExternal("https://github.com/isjiamu/gzh-design-skill");
});
document.getElementById("sucaizyBtn").addEventListener("click", () => {
  window.gzhApp.openExternal("https://sucaizy.com");
});
els.settingsToggle?.addEventListener("click", () => {
  setSettingsCollapsed(!state.settingsCollapsed);
  saveState();
});
document.querySelectorAll(".mockup-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    setMockup(btn.dataset.mode);
    saveState();
  });
});
document.querySelectorAll(".bg-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    setPreviewBackground(btn.dataset.bg);
    renderArticle();
  });
});
els.backgroundColor?.addEventListener("input", () => {
  setBackgroundTune(els.backgroundColor.value, state.backgroundStrength);
  scheduleRenderArticle();
});
els.backgroundStrength?.addEventListener("input", () => {
  setBackgroundTune(state.backgroundColor, els.backgroundStrength.value);
  scheduleRenderArticle();
});
els.syntaxToggle?.addEventListener("click", () => {
  setSyntaxCollapsed(!state.syntaxCollapsed);
  saveState();
});
document.getElementById("sampleBtn").addEventListener("click", async () => {
  els.source.value = markdownSample;
  await seedDemoEmojiAssets();
  await importLocalMarkdownImages();
  syncArticleTitleFromMarkdown();
  renderArticle();
});
document.getElementById("copyHtmlBtn").addEventListener("click", async () => {
  if (await importLocalMarkdownImages()) renderArticle();
  await ensureClipboardImagesCached();
  await navigator.clipboard.writeText(state.currentHtml);
  els.status.textContent = `HTML 已复制${imageCopySummary()}`;
});
document.getElementById("copyRichBtn").addEventListener("click", async () => {
  if (await importLocalMarkdownImages()) renderArticle();
  await ensureClipboardImagesCached();
  const copiedFromDom = copyRichFromDom(stripPreviewMarks(els.preview.innerHTML));
  if (!copiedFromDom) {
    await window.gzhApp.writeHtml(state.currentHtml, els.preview.innerText, primaryClipboardImagePath());
  }
  els.status.textContent = `富文本已复制，可粘贴到公众号${imageCopySummary()}${copiedFromDom ? "，已使用网页复制模式" : ""}`;
  showCopyToast(`已复制完成${imageCopySummary()}，现在只需粘贴到公众号编辑器即可。`);
});
els.source.addEventListener("paste", handlePaste);
els.source.addEventListener("keydown", handleEditorShortcut);
["click", "keyup", "select", "focus", "input"].forEach((eventName) => {
  els.source.addEventListener(eventName, () => {
    rememberSourceSelection();
    schedulePreviewFollow();
  });
});
document.addEventListener("selectionchange", () => {
  if (document.activeElement === els.source) {
    rememberSourceSelection();
    schedulePreviewFollow();
  }
});
els.templateFileSelect?.addEventListener("change", renderTemplatePanel);
els.templateSearch?.addEventListener("input", renderTemplatePanel);
els.wechatLoginBtn?.addEventListener("click", () => openWechatTarget("login"));
els.copyToastClose?.addEventListener("click", hideCopyToast);
els.copyToast?.addEventListener("click", (event) => {
  if (event.target === els.copyToast) hideCopyToast();
});
els.copyToastWechat?.addEventListener("click", () => openWechatTarget("login"));
els.copyToastMore?.addEventListener("click", () => window.gzhApp.openExternal("https://sucaizy.com"));
els.emojiQuickBtn?.addEventListener("click", (event) => {
  event.stopPropagation();
  toggleEmojiQuickPopover();
});
document.querySelectorAll(".emoji-mode-btn").forEach((btn) => {
  btn.addEventListener("click", () => setEmojiInsertMode(btn.dataset.emojiMode));
});
els.emojiImportBtn?.addEventListener("click", importEmojiImages);
els.emojiFolderBtn?.addEventListener("click", () => importEmojiImages("folder"));
els.emojiClearBtn?.addEventListener("click", clearEmojis);
els.profilePresetSelect?.addEventListener("change", () => {
  const name = els.profilePresetSelect.value;
  if (name === "__default") {
    if (els.profilePresetName) els.profilePresetName.value = "";
    applyProfile(defaultProfile);
    return;
  }
  const preset = readProfilePresets().find((item) => item.name === name);
  if (preset) {
    if (els.profilePresetName) els.profilePresetName.value = preset.name;
    applyProfile(preset);
  }
});
els.saveProfilePresetBtn?.addEventListener("click", saveProfilePreset);
els.resetProfileBtn?.addEventListener("click", () => {
  applyProfile(defaultProfile);
  renderProfilePresets("__default");
});
els.deleteProfilePresetBtn?.addEventListener("click", deleteProfilePreset);
document.addEventListener("click", (event) => {
  if (!els.emojiQuickPopover?.classList.contains("show")) return;
  if (els.emojiQuickPopover.contains(event.target) || event.target === els.emojiQuickBtn) return;
  hideEmojiQuickPopover();
});
window.addEventListener("online", updateWechatNetworkState);
window.addEventListener("offline", updateWechatNetworkState);
els.themeSelect.addEventListener("change", () => {
  updateThemeMeta();
  renderArticle();
});
function handleArticleEdit(event) {
  const profileTarget = profileTargetForInput(event?.target);
  if (profileTarget) state.skipNextPreviewFollow = true;
  if (event?.target === els.articleTitle) {
    syncMarkdownTitleFromField();
  } else if (event?.target === els.source) {
    syncArticleTitleFromMarkdown();
  }
  state.editedAt = todayStamp();
  renderArticle();
  if (profileTarget) scrollPreviewToProfileTarget(profileTarget);
}

[
  els.source,
  els.articleTitle,
  els.coverLabel,
  els.coverSubtitle,
  els.authorName,
  els.authorBio,
  els.ctaText
].forEach((el) => el.addEventListener("input", handleArticleEdit));

init().catch((error) => {
  console.error(error);
  els.status.textContent = `加载失败：${error.message}`;
});





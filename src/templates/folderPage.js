const layout = require("./layout");
const { renderEntryCards } = require("./components");
const { escapeHtml } = require("./utils");
const { darkThemeStyles, enhancedStyles } = require("./styles");

function renderFolderPage({
  title,
  folderKey,
  entries,
  actionLabel = "Open",
}) {
  const safeTitle = escapeHtml(title);
  const folder = folderKey || "";
  const entryList = Array.isArray(entries) ? entries : [];
  const totalFiles = entryList.length;
  const subtitle = totalFiles
    ? `${totalFiles} file siap dibuka`
    : "Belum ada file HTML di folder ini.";
  const content = `
    <div id="main-container" class="mx-auto px-4 py-12 space-y-10">
      <header class="page-toolbar">
        <div>
          <h1 class="page-title">${safeTitle}</h1>
          <p class="page-subtitle">${escapeHtml(subtitle)}</p>
        </div>
        <div class="page-toolbar__actions">
          <button type="button" id="themeToggleBtn" class="setting-button" onclick="toggleTheme()" aria-pressed="false">
            Mode Gelap
          </button>
          <button type="button" id="densityToggleBtn" class="setting-button" onclick="toggleDensity()" aria-pressed="false">
            Mode Kompak
          </button>
          <a href="/" class="entry-button entry-button--primary">Beranda</a>
        </div>
      </header>

      <div id="folders-container" class="page-surface">
        <div class="page-grid">
          ${renderEntryCards(
            entryList,
            folder,
            actionLabel,
            "Tidak ada file yang cocok di folder ini.",
          )}
        </div>
      </div>

      <div id="file-container" class="page-surface hidden">
        <div class="control-buttons">
          <button class="control-button" onclick="minimizeFile()">Minimize</button>
          <button class="control-button" onclick="toggleFullscreen()">Fullscreen</button>
          <button class="control-button" onclick="closeFile()">Close</button>
        </div>
        <h2 id="file-title" class="text-2xl font-bold mb-4"></h2>
        <div id="frame-container" class="w-full" style="height: 80vh;">
          <iframe id="file-frame" class="game-frame"></iframe>
        </div>
      </div>
    </div>
  `;

  return layout({
    title: safeTitle,
    bodyClass: "min-h-screen",
    bodyId: "body",
    styles: `${darkThemeStyles}\n${enhancedStyles}`,
    content,
    scripts: '<script src="/scripts/app.js"></script>',
  });
}

module.exports = renderFolderPage;

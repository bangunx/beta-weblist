const layout = require("./layout");
const { renderEntryCards } = require("./components");
const { escapeHtml } = require("./utils");

function renderFolderPage({
  title,
  folderKey,
  entries,
  actionLabel = "Open",
}) {
  const safeTitle = escapeHtml(title);
  const folder = folderKey || "";
  const content = `
    <div id="main-container" class="container mx-auto px-4 py-8">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-4xl font-bold">${safeTitle}</h1>
        <a href="/" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
          Home
        </a>
      </div>
      <div id="folders-container">
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          ${renderEntryCards(entries ?? [], folder, actionLabel, "No HTML files found in this folder.")}
        </div>
      </div>

      <div id="file-container" class="mt-8 hidden">
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
    bodyClass: "bg-gray-100 min-h-screen",
    bodyId: "body",
    content,
    scripts: '<script src="/scripts/app.js"></script>',
  });
}

module.exports = renderFolderPage;

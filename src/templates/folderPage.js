const layout = require("./layout");

function normalizeFolderUrl(folderUrl) {
  if (!folderUrl) {
    return "";
  }
  return folderUrl.endsWith("/") ? folderUrl.slice(0, -1) : folderUrl;
}

function renderFileCards(files, folderUrl, actionLabel) {
  if (!files.length) {
    return `
      <div class="col-span-full text-center text-gray-500">
        No HTML files found in this folder.
      </div>
    `;
  }

  return files
    .map(
      (file) => `
        <div class="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-300">
          <h3 class="font-semibold mb-2">${file}</h3>
          <div class="flex space-x-2">
            <button class="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-3 rounded text-sm" onclick="loadFile('${folderUrl}', '${file}')">
              ${actionLabel}
            </button>
            <a href="${folderUrl}/${file}" target="_blank" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 rounded text-sm">
              Open
            </a>
          </div>
        </div>
      `,
    )
    .join("");
}

function renderFolderPage({
  title,
  folderUrl,
  files,
  actionLabel = "Open",
}) {
  const normalizedFolderUrl = normalizeFolderUrl(folderUrl);
  const content = `
    <div id="main-container" class="container mx-auto px-4 py-8">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-4xl font-bold">${title}</h1>
        <a href="/" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
          Home
        </a>
      </div>
      <div id="folders-container">
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          ${renderFileCards(files, normalizedFolderUrl, actionLabel)}
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
    title,
    bodyClass: "bg-gray-100 min-h-screen",
    content,
    scripts: '<script src="/scripts/app.js"></script>',
  });
}

module.exports = renderFolderPage;

const layout = require("./layout");
const { ITEMS_PER_PAGE_OPTIONS } = require("../config");

const hackerThemeStyles = `
  .hacker-theme {
    background-color: #0c0c0c;
    color: #00ff00;
    font-family: 'Courier New', monospace;
  }
  .hacker-theme .bg-white {
    background-color: #1c1c1c !important;
  }
  .hacker-theme .text-blue-500 {
    color: #00ff00 !important;
  }
  .hacker-theme .bg-blue-500 {
    background-color: #008000 !important;
  }
  .hacker-theme .bg-green-500 {
    background-color: #006400 !important;
  }
  .hacker-theme .hover\:bg-blue-600:hover {
    background-color: #006400 !important;
  }
  .hacker-theme .hover\:bg-green-600:hover {
    background-color: #004b00 !important;
  }
  .hacker-theme .shadow-md {
    box-shadow: 0 0 10px #00ff00;
  }
  .hacker-theme .hover\:shadow-lg:hover {
    box-shadow: 0 0 15px #00ff00;
  }
`;

const FILTER_OPTIONS = [
  { value: "all", label: "All" },
  { value: "games", label: "Games" },
  { value: "tools", label: "Tools" },
];

function buildOption({ value, label }, selectedValue) {
  const selected = value === selectedValue ? "selected" : "";
  return `<option value="${value}" ${selected}>${label}</option>`;
}

function renderItemsPerPageSelect(selectedValue) {
  const options = ITEMS_PER_PAGE_OPTIONS.map((value) =>
    buildOption({ value: String(value), label: `${value} items` }, String(selectedValue)),
  );
  return options.join("");
}

function renderFilterSelect(selectedValue) {
  return FILTER_OPTIONS.map((option) => buildOption(option, selectedValue)).join("");
}

function renderFileCards(files, folderKey, actionLabel) {
  if (!files.length) {
    return `
      <div class="col-span-full text-center text-gray-500">
        No HTML files match the current selection.
      </div>
    `;
  }

  return files
    .map(
      (file) => `
        <div class="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-300">
          <h3 class="font-semibold mb-2">${file}</h3>
          <div class="flex space-x-2">
            <button class="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-3 rounded text-sm" onclick="loadFile('${folderKey}', '${file}')">
              ${actionLabel}
            </button>
            <a href="/${folderKey}/${file}" target="_blank" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 rounded text-sm">
              Open
            </a>
          </div>
        </div>
      `,
    )
    .join("");
}

function renderPagination(totalPages, currentPage, itemsPerPage, filter) {
  if (!totalPages || totalPages <= 1) {
    return "";
  }

  const links = Array.from({ length: totalPages }, (_, index) => {
    const page = index + 1;
    const isActive = page === currentPage;
    const classes = isActive
      ? "bg-blue-500 text-white"
      : "bg-white text-blue-500";
    return `
      <a
        href="/?items=${itemsPerPage}&page=${page}&filter=${filter}"
        class="px-3 py-2 m-1 ${classes} rounded-md"
      >
        ${page}
      </a>
    `;
  });

  return `
    <div id="pagination" class="mt-8 flex justify-center flex-wrap">
      ${links.join("")}
    </div>
  `;
}

function renderHomePage({
  itemsPerPage,
  currentPage,
  filter,
  games,
  tools,
  totalPages,
}) {
  const gamesSection = filter === "all" || filter === "games"
    ? `
      <h2 class="text-2xl font-bold mb-4">Games</h2>
      <div id="game-list" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        ${renderFileCards(games.files, "game", "Play")}
      </div>
    `
    : "";

  const toolsSection = filter === "all" || filter === "tools"
    ? `
      <h2 class="text-2xl font-bold mb-4">Tools</h2>
      <div id="tools-list" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        ${renderFileCards(tools.files, "tools", "Use")}
      </div>
    `
    : "";

  const content = `
    <div id="main-container" class="container mx-auto px-4 py-8">
      <h1 class="text-4xl font-bold text-center mb-8">Game and Tool Files</h1>

      <div class="mb-6 flex flex-wrap justify-between items-center">
        <div>
          <select id="itemsPerPage" class="bg-white border border-gray-300 rounded-md px-4 py-2 mb-2 sm:mb-0 mr-2" onchange="changeItemsPerPage()">
            ${renderItemsPerPageSelect(itemsPerPage)}
          </select>
          <select id="filterSelect" class="bg-white border border-gray-300 rounded-md px-4 py-2 mb-2 sm:mb-0" onchange="changeFilter()">
            ${renderFilterSelect(filter)}
          </select>
        </div>
        <div>
          <button id="toggleViewBtn" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mr-2" onclick="toggleView()">
            Toggle View
          </button>
          <button id="fullscreenBtn" class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded mr-2" onclick="toggleFullscreen()">
            Fullscreen
          </button>
          <button id="themeToggleBtn" class="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded" onclick="toggleTheme()">
            Hacker Theme
          </button>
        </div>
      </div>

      <div id="folders-container">
        ${gamesSection}
        ${toolsSection}
      </div>

      ${renderPagination(totalPages, currentPage, itemsPerPage, filter)}

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
    title: "GameListAI",
    bodyClass: "bg-gray-100 min-h-screen",
    bodyId: "body",
    styles: hackerThemeStyles,
    content,
    scripts: '<script src="/scripts/app.js"></script>',
  });
}

module.exports = renderHomePage;

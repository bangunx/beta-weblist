const layout = require("./layout");
const { renderEntryCards } = require("./components");
const { escapeHtml } = require("./utils");
const { ITEMS_PER_PAGE_OPTIONS } = require("../config");

const { darkThemeStyles, enhancedStyles } = require("./styles");

const FILTER_OPTIONS = [
  { value: "all", label: "Semua" },
  { value: "games", label: "Games" },
  { value: "tools", label: "Tools" },
  { value: "mind", label: "Mind" },
  { value: "random", label: "Random" },
];

const SORT_OPTIONS = [
  { value: "asc", label: "A → Z" },
  { value: "desc", label: "Z → A" },
];

function buildOption({ value, label }, selectedValue) {
  const selected = value === selectedValue ? "selected" : "";
  return `<option value="${value}" ${selected}>${escapeHtml(label)}</option>`;
}

function renderItemsPerPageSelect(selectedValue) {
  const options = ITEMS_PER_PAGE_OPTIONS.map((value) =>
    buildOption({ value: String(value), label: `${value} item` }, String(selectedValue)),
  );
  return options.join("");
}

function renderFilterSelect(selectedValue) {
  return FILTER_OPTIONS.map((option) => buildOption(option, selectedValue)).join("");
}

function renderSortSelect(selectedValue) {
  return SORT_OPTIONS.map((option) => buildOption(option, selectedValue)).join("");
}

function renderPagination(totalPages, currentPage, itemsPerPage, filter, sortOrder, searchTerm) {
  if (!totalPages || totalPages <= 1) {
    return "";
  }

  const links = Array.from({ length: totalPages }, (_, index) => {
    const page = index + 1;
    const isActive = page === currentPage;
    const classes = isActive ? "bg-blue-500 text-white" : "bg-white text-blue-500";
    const params = new URLSearchParams({
      items: String(itemsPerPage),
      page: String(page),
      filter,
      sort: sortOrder,
    });

    if (searchTerm) {
      params.set("search", searchTerm);
    }

    return `
      <a href="/?${params.toString()}" class="px-3 py-2 m-1 ${classes} rounded-md">
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

function formatNumber(value) {
  const safeValue = Number.isFinite(value) ? value : 0;
  return safeValue.toLocaleString("id-ID");
}

function renderMetricChip({ label, value, caption }) {
  return `
    <div class="metric-chip">
      <span class="metric-chip__value">${value}</span>
      <div class="metric-chip__meta">
        <span class="metric-chip__label">${escapeHtml(label)}</span>
        <p class="metric-chip__caption">${escapeHtml(caption)}</p>
      </div>
    </div>
  `;
}

function renderMetricsRow(stats) {
  if (!stats.length) {
    return "";
  }

  return `
    <div class="hero__metrics-grid">
      ${stats.map(renderMetricChip).join("")}
    </div>
  `;
}

function renderQuickFilters(selectedFilter) {
  return FILTER_OPTIONS.map((option) => {
    const label = escapeHtml(option.label);
    const value = escapeHtml(option.value);
    const isActive = option.value === selectedFilter;
    const classes = isActive ? "quick-chip quick-chip--active" : "quick-chip";
    return `
      <button type="button" class="${classes}" data-filter="${value}" onclick="setFilter('${value}')">
        ${label}
      </button>
    `;
  }).join("");
}

function renderCategorySection({ title, id, entries, folderKey, actionLabel }) {
  const safeTitle = escapeHtml(title);
  const emptyMessage = `Belum ada ${title} yang cocok dengan filter ini.`;

  return `
    <section class="catalog-section" id="section-${escapeHtml(id)}">
      <div class="flex items-center justify-between mb-4">
        <h2>${safeTitle}</h2>
        <a class="link-button" href="/${escapeHtml(folderKey)}" title="Lihat semua ${safeTitle}">Lihat halaman penuh →</a>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        ${renderEntryCards(entries, folderKey, actionLabel, emptyMessage)}
      </div>
    </section>
  `;
}

function renderHomePage({
  itemsPerPage,
  currentPage,
  filter,
  sortOrder,
  games,
  tools,
  mind,
  random,
  totalPages,
  searchTerm = "",
}) {
  const searchValue = escapeHtml(searchTerm);
  const selectedFilter = filter || "all";
  const selectedSort = sortOrder || "asc";

  const gamesEntries = games?.entries ?? [];
  const toolsEntries = tools?.entries ?? [];
  const mindEntries = mind?.entries ?? [];
  const randomEntries = random?.entries ?? [];

  const gamesTotal = games?.totalItems ?? 0;
  const toolsTotal = tools?.totalItems ?? 0;
  const mindTotal = mind?.totalItems ?? 0;
  const randomTotal = random?.totalItems ?? 0;
  const totalItems = gamesTotal + toolsTotal + mindTotal + randomTotal;

  const statsData = [
    {
      label: "Total Koleksi",
      value: formatNumber(totalItems),
      caption: "Seluruh game, tools & eksperimen",
    },
    {
      label: "Games",
      value: formatNumber(gamesTotal),
      caption: "Siap dimainkan langsung",
    },
    {
      label: "Tools",
      value: formatNumber(toolsTotal),
      caption: "Utility harian & AI tools",
    },
    {
      label: "Mind",
      value: formatNumber(mindTotal),
      caption: "Eksperimen ide & produktivitas",
    },
    {
      label: "Random",
      value: formatNumber(randomTotal),
      caption: "Proyek unik & hiburan",
    },
  ];

  const heroSection = `
    <section class="hero">
      <div class="hero__content">
        <span class="hero__tag">GameListAI · Kurasi Web Tools & Games</span>
        <h1 class="hero__title">Temukan koleksi favoritmu dalam sekali klik</h1>
        <p class="hero__description">
          Lebih dari ${formatNumber(totalItems)} game & tools siap pakai dengan akses kilat. Gunakan pencarian instan, simpan favorit, dan lanjutkan aktivitas terakhir tanpa harus mencari ulang.
        </p>
        <div class="hero__actions">
          <button type="button" class="entry-button entry-button--primary" onclick="focusSearchInput()">
            Cari Cepat (⌘/Ctrl + K)
          </button>
          <button type="button" class="entry-button entry-button--ghost" onclick="scrollToSection('favorites-section')">
            Buka Favorit
          </button>
        </div>
      </div>
      <div class="hero__metrics" aria-label="Statistik koleksi">
        ${renderMetricsRow(statsData)}
      </div>
    </section>
  `;

  const controlPanel = `
    <section class="control-panel">
      <div class="control-panel__row">
        <div class="selector-group">
          <select id="itemsPerPage" onchange="changeItemsPerPage()">
            ${renderItemsPerPageSelect(itemsPerPage)}
          </select>
          <select id="sortSelect" onchange="changeSort()">
            ${renderSortSelect(selectedSort)}
          </select>
          <select id="filterSelect" onchange="changeFilter()">
            ${renderFilterSelect(selectedFilter)}
          </select>
        </div>
        <form class="search-form" onsubmit="submitSearch(event)">
          <input
            id="searchInput"
            type="search"
            placeholder="Cari game, tools, atau folder"
            value="${searchValue}"
            autocomplete="off"
            spellcheck="false"
          />
          <button type="submit" class="entry-button entry-button--primary">Cari</button>
          ${searchTerm
            ? '<button type="button" class="entry-button entry-button--ghost" onclick="clearSearch()">Bersihkan</button>'
            : ""}
        </form>
      </div>
      <div class="control-panel__row control-panel__row--meta">
        <div class="quick-filters">
          ${renderQuickFilters(selectedFilter)}
        </div>
        <div class="control-panel__toggles">
          <button type="button" id="themeToggleBtn" class="setting-button" onclick="toggleTheme()" aria-pressed="false">
            Mode Gelap
          </button>
          <button type="button" id="densityToggleBtn" class="setting-button" onclick="toggleDensity()" aria-pressed="false">
            Mode Kompak
          </button>
          <button type="button" class="link-button" onclick="resetControls()">Reset pengaturan</button>
        </div>
      </div>
    </section>
  `;

  const quickAccess = `
    <section class="quick-access" aria-label="Akses cepat">
      <div class="quick-panel" id="favorites-section">
        <div class="quick-panel__header">
          <h2 class="text-lg font-semibold text-gray-900">Favorit</h2>
          <button type="button" class="link-button" onclick="clearFavorites()">Bersihkan favorit</button>
        </div>
        <p class="quick-panel__empty" id="favorites-empty">Belum ada favorit. Klik ikon ☆ pada kartu untuk menyimpan koleksi pilihanmu.</p>
        <div id="favorites-list" class="quick-chip-list" role="list"></div>
      </div>
      <div class="quick-panel" id="recent-section">
        <div class="quick-panel__header">
          <h2 class="text-lg font-semibold text-gray-900">Terakhir Dibuka</h2>
          <button type="button" class="link-button" onclick="clearRecents()">Hapus riwayat</button>
        </div>
        <p class="quick-panel__empty" id="recents-empty">Belum ada riwayat. Buka salah satu koleksi untuk menambah daftar ini.</p>
        <div id="recents-list" class="quick-chip-list" role="list"></div>
      </div>
    </section>
  `;

  const showGames = selectedFilter === "all" || selectedFilter === "games";
  const showTools = selectedFilter === "all" || selectedFilter === "tools";
  const showMind = selectedFilter === "all" || selectedFilter === "mind";
  const showRandom = selectedFilter === "all" || selectedFilter === "random";

  const sections = [
    showGames
      ? renderCategorySection({
          title: "Games",
          id: "games",
          entries: gamesEntries,
          folderKey: "game",
          actionLabel: "Mainkan",
        })
      : "",
    showTools
      ? renderCategorySection({
          title: "Tools",
          id: "tools",
          entries: toolsEntries,
          folderKey: "tools",
          actionLabel: "Gunakan",
        })
      : "",
    showMind
      ? renderCategorySection({
          title: "Mind",
          id: "mind",
          entries: mindEntries,
          folderKey: "mind",
          actionLabel: "Buka",
        })
      : "",
    showRandom
      ? renderCategorySection({
          title: "Random",
          id: "random",
          entries: randomEntries,
          folderKey: "random",
          actionLabel: "Telusuri",
        })
      : "",
  ].join("");

  const content = `
    <div id="main-container" class="mx-auto px-4 py-12 space-y-12">
      ${heroSection}
      <div class="control-stack">
        ${controlPanel}
        ${quickAccess}
      </div>
      <div id="folders-container">
        ${sections}
      </div>
      ${renderPagination(totalPages, currentPage, itemsPerPage, selectedFilter, selectedSort, searchTerm)}
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
    bodyClass: "min-h-screen",
    bodyId: "body",
    styles: `${darkThemeStyles}\n${enhancedStyles}`,
    content,
    scripts: '<script src="/scripts/app.js"></script>',
  });
}

module.exports = renderHomePage;

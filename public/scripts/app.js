(() => {
  const STORAGE_KEYS = {
    favorites: "weblist:favorites",
    recents: "weblist:recents",
  };
  const PREFERENCE_KEYS = {
    theme: "weblist:pref:theme",
    density: "weblist:pref:density",
  };
  const MAX_RECENTS = 12;
  const SCROLL_TOP_THRESHOLD = 360;
  const entryRegistry = new Map();
  let backToTopButton;

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => {
      switch (char) {
        case "&":
          return "&amp;";
        case "<":
          return "&lt;";
        case ">":
          return "&gt;";
        case '"':
          return "&quot;";
        case "'":
          return "&#39;";
        default:
          return char;
      }
    });
  }

  function getElement(id) {
    return document.getElementById(id);
  }

  function showElement(element) {
    if (element) {
      element.style.display = "block";
    }
  }

  function hideElement(element) {
    if (element) {
      element.style.display = "none";
    }
  }

  function encodePath(pathValue) {
    return pathValue
      .split("/")
      .filter((segment) => segment.length > 0)
      .map((segment) => encodeURIComponent(segment))
      .join("/");
  }

  function buildFileUrl(folder, file) {
    const base = (folder || "").trim();
    const encodedFile = encodePath(file);

    if (!base) {
      return encodedFile ? `/${encodedFile}` : "/";
    }

    const withLeadingSlash = base.startsWith("/") ? base : `/${base}`;
    const sanitizedBase = withLeadingSlash.replace(/\/+$/, "");
    return encodedFile ? `${sanitizedBase}/${encodedFile}` : sanitizedBase;
  }

  function isFullscreenActive() {
    return (
      document.fullscreenElement ||
      document.webkitIsFullScreen ||
      document.mozFullScreen ||
      document.msFullscreenElement
    );
  }

  function buildEntryKey(folder, path) {
    return `${folder}:${path}`;
  }

  function getEntryFromElement(element) {
    if (!element) {
      return null;
    }

    const dataset = element.dataset || {};
    const folder = dataset.entryFolder || dataset.folder || "";
    const path = dataset.entryPath || dataset.path || "";
    const label = dataset.entryLabel || dataset.label || path;
    const href = dataset.entryHref || dataset.entryLink || buildFileUrl(folder, path);
    const type = dataset.entryType || dataset.type || "file";
    const key = dataset.entryKey || dataset.key || buildEntryKey(folder, path);

    if (!path) {
      return null;
    }

    return { key, folder, path, label, href, type };
  }

  function registerEntryCards() {
    entryRegistry.clear();
    const cards = document.querySelectorAll(".entry-card");

    cards.forEach((card) => {
      const entry = getEntryFromElement(card);
      if (entry && entry.key) {
        entryRegistry.set(entry.key, entry);
      }
    });
  }

  function loadStoredList(storageKey) {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) {
        return [];
      }

      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed.filter((item) => item && typeof item.key === "string");
    } catch (error) {
      console.warn("Failed to parse storage list", error);
      return [];
    }
  }

  function saveStoredList(storageKey, list) {
    try {
      localStorage.setItem(storageKey, JSON.stringify(list));
    } catch (error) {
      console.warn("Unable to persist data", error);
    }
  }

  function syncFavoriteButtons() {
    const favoriteKeys = new Set(
      loadStoredList(STORAGE_KEYS.favorites).map((item) => item.key),
    );
    const buttons = document.querySelectorAll(".favorite-toggle");

    buttons.forEach((button) => {
      const key = button.dataset.entryKey;
      const isFavorite = favoriteKeys.has(key);
      const icon = button.querySelector(".favorite-icon");
      button.classList.toggle("is-favorite", isFavorite);
      button.setAttribute("aria-pressed", isFavorite ? "true" : "false");
      button.title = isFavorite ? "Hapus dari Favorit" : "Tambah ke Favorit";
      if (icon) {
        icon.textContent = isFavorite ? "★" : "☆";
      }
    });
  }

  function buildQuickChip(entry, icon) {
    const iconMarkup = icon
      ? `<span class="quick-chip-button__icon" aria-hidden="true">${escapeHtml(icon)}</span>`
      : "";

    return `
      <button
        type="button"
        class="quick-chip-button"
        data-entry-key="${escapeHtml(entry.key)}"
        data-folder="${escapeHtml(entry.folder)}"
        data-path="${escapeHtml(entry.path)}"
        data-label="${escapeHtml(entry.label)}"
      >
        ${iconMarkup}<span>${escapeHtml(entry.label)}</span>
      </button>
    `;
  }

  function renderFavoritesPanel() {
    const container = getElement("favorites-list");
    const emptyState = getElement("favorites-empty");

    if (!container || !emptyState) {
      return;
    }

    const favorites = loadStoredList(STORAGE_KEYS.favorites);

    if (!favorites.length) {
      container.innerHTML = "";
      emptyState.style.display = "block";
      return;
    }

    emptyState.style.display = "none";
    container.innerHTML = favorites
      .map((entry) => buildQuickChip(entry, "★"))
      .join("");
  }

  function renderRecentsPanel() {
    const container = getElement("recents-list");
    const emptyState = getElement("recents-empty");

    if (!container || !emptyState) {
      return;
    }

    const recents = loadStoredList(STORAGE_KEYS.recents);

    if (!recents.length) {
      container.innerHTML = "";
      emptyState.style.display = "block";
      return;
    }

    emptyState.style.display = "none";
    container.innerHTML = recents
      .map((entry) => buildQuickChip(entry, "⏱"))
      .join("");
  }

  function hydrateQuickPanels() {
    renderFavoritesPanel();
    renderRecentsPanel();
    syncFavoriteButtons();
  }

  function toggleFavorite(entry) {
    if (!entry || !entry.key) {
      return;
    }

    const favorites = loadStoredList(STORAGE_KEYS.favorites);
    const existingIndex = favorites.findIndex((item) => item.key === entry.key);

    if (existingIndex >= 0) {
      favorites.splice(existingIndex, 1);
    } else {
      favorites.unshift(entry);
    }

    saveStoredList(STORAGE_KEYS.favorites, favorites.slice(0, 100));
    hydrateQuickPanels();
  }

  function addRecent(entry) {
    if (!entry || !entry.key) {
      return;
    }

    const recents = loadStoredList(STORAGE_KEYS.recents);
    const filtered = recents.filter((item) => item.key !== entry.key);
    filtered.unshift(entry);
    saveStoredList(STORAGE_KEYS.recents, filtered.slice(0, MAX_RECENTS));
    renderRecentsPanel();
  }

  async function copyToClipboard(text) {
    if (!text) {
      return;
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return;
      } catch (error) {
        console.warn("Clipboard API failed", error);
      }
    }

    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "true");
    textarea.style.position = "absolute";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
  }

  function showCopyFeedback(button) {
    if (!button) {
      return;
    }
    const original = button.dataset.defaultLabel || button.textContent.trim();
    if (!button.dataset.defaultLabel) {
      button.dataset.defaultLabel = original;
    }
    button.textContent = "Disalin!";
    button.disabled = true;
    setTimeout(() => {
      button.textContent = button.dataset.defaultLabel || original;
      button.disabled = false;
    }, 1600);
  }

  function handleFavoriteToggle(target) {
    const button = target.closest(".favorite-toggle");
    if (!button) {
      return false;
    }

    const card = button.closest(".entry-card");
    const entry = getEntryFromElement(card);
    toggleFavorite(entry);
    return true;
  }

  function handleQuickCopy(target) {
    const button = target.closest(".quick-copy");
    if (!button) {
      return false;
    }

    const href = button.getAttribute("data-entry-href");
    const url = href ? new URL(href, window.location.origin).toString() : "";
    copyToClipboard(url).then(() => {
      showCopyFeedback(button);
    });

    return true;
  }

  function handleQuickChipActivate(target) {
    const chip = target.closest(".quick-chip-button");
    if (!chip) {
      return false;
    }

    const entry = getEntryFromElement(chip);
    const storedEntry = entryRegistry.get(entry?.key || "");
    const mergedEntry = storedEntry || entry;

    if (mergedEntry) {
      window.loadFile(mergedEntry.folder, mergedEntry.path, mergedEntry.label, mergedEntry);
    }

    return true;
  }

  function handleDocumentClick(event) {
    if (handleFavoriteToggle(event.target)) {
      event.preventDefault();
      return;
    }

    if (handleQuickCopy(event.target)) {
      event.preventDefault();
      return;
    }

    if (handleQuickChipActivate(event.target)) {
      event.preventDefault();
    }
  }

  function buildBaseParams() {
    const params = new URLSearchParams();
    const itemsSelect = getElement("itemsPerPage");
    const filterSelect = getElement("filterSelect");
    const sortSelect = getElement("sortSelect");

    if (itemsSelect) {
      params.set("items", itemsSelect.value);
    }

    if (filterSelect) {
      params.set("filter", filterSelect.value);
    }

    if (sortSelect) {
      params.set("sort", sortSelect.value);
    }

    return params;
  }

  function appendSearchParam(params) {
    const searchInput = getElement("searchInput");

    if (!searchInput) {
      params.delete("search");
      return;
    }

    const term = searchInput.value.trim();

    if (term) {
      params.set("search", term);
    } else {
      params.delete("search");
    }
  }

  function navigateWithParams(params) {
    const query = params.toString();
    window.location.href = query ? `/?${query}` : "/";
  }

  function registerKeyboardShortcuts() {
    document.addEventListener("keydown", (event) => {
      const isMetaK = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
      if (isMetaK) {
        event.preventDefault();
        focusSearchInput();
      }
    });
  }

  function focusSearchInput() {
    const searchInput = getElement("searchInput");
    if (searchInput) {
      searchInput.focus();
      searchInput.select();
    }
  }

  function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function resetControls() {
    window.location.href = "/";
  }

  function changeItemsPerPage() {
    const params = buildBaseParams();
    appendSearchParam(params);
    navigateWithParams(params);
  }

  function changeFilter() {
    const params = buildBaseParams();
    appendSearchParam(params);
    navigateWithParams(params);
  }

  function changeSort() {
    const params = buildBaseParams();
    appendSearchParam(params);
    navigateWithParams(params);
  }

  function setFilter(value) {
    const params = buildBaseParams();
    params.set("filter", value);
    const filterSelect = getElement("filterSelect");
    if (filterSelect) {
      filterSelect.value = value;
    }
    appendSearchParam(params);
    navigateWithParams(params);
  }

  function submitSearch(event) {
    if (event && typeof event.preventDefault === "function") {
      event.preventDefault();
    }

    const params = buildBaseParams();
    appendSearchParam(params);
    navigateWithParams(params);
  }

  function clearSearch() {
    const searchInput = getElement("searchInput");
    if (searchInput) {
      searchInput.value = "";
    }

    const params = buildBaseParams();
    navigateWithParams(params);
  }

  function clearFavorites() {
    localStorage.removeItem(STORAGE_KEYS.favorites);
    hydrateQuickPanels();
  }

  function clearRecents() {
    localStorage.removeItem(STORAGE_KEYS.recents);
    renderRecentsPanel();
  }

  function toggleView() {
    const foldersContainer = getElement("folders-container");
    const fileContainer = getElement("file-container");
    const pagination = getElement("pagination");

    if (!foldersContainer || !fileContainer) {
      return;
    }

    const showingFolders = foldersContainer.style.display !== "none";

    if (showingFolders) {
      hideElement(foldersContainer);
      hideElement(pagination);
      showElement(fileContainer);
    } else {
      showElement(foldersContainer);
      if (pagination) {
        pagination.style.display = "flex";
      }
      hideElement(fileContainer);
    }
  }

  function loadFile(folder, file, displayName, providedEntry) {
    const fileTitle = getElement("file-title");
    const fileFrame = getElement("file-frame");
    const fileContainer = getElement("file-container");
    const foldersContainer = getElement("folders-container");
    const pagination = getElement("pagination");

    if (fileTitle) {
      fileTitle.textContent = displayName || file;
    }

    if (fileFrame) {
      fileFrame.src = buildFileUrl(folder, file);
    }

    showElement(fileContainer);
    hideElement(foldersContainer);
    hideElement(pagination);

    const entryKey = buildEntryKey(folder, file);
    const fallbackEntry = {
      key: entryKey,
      folder,
      path: file,
      label: displayName || file,
      href: buildFileUrl(folder, file),
      type: providedEntry?.type || "file",
    };
    const entry = providedEntry || entryRegistry.get(entryKey) || fallbackEntry;
    addRecent(entry);
  }

  function loadFromDataset(element) {
    if (!element) {
      return;
    }

    const entryFromButton = getEntryFromElement(element);
    const entry = entryRegistry.get(entryFromButton?.key || "") || entryFromButton;

    if (!entry) {
      return;
    }

    loadFile(entry.folder, entry.path, entry.label, entry);
  }

  function closeFile() {
    const fileContainer = getElement("file-container");
    const foldersContainer = getElement("folders-container");
    const pagination = getElement("pagination");

    hideElement(fileContainer);

    if (foldersContainer) {
      foldersContainer.style.display = "block";
    }

    if (pagination) {
      pagination.style.display = "flex";
    }
  }

  function minimizeFile() {
    const frameContainer = getElement("frame-container");
    if (!frameContainer) {
      return;
    }
    frameContainer.style.height =
      frameContainer.style.height === "40vh" ? "80vh" : "40vh";
  }

  function toggleFullscreen() {
    const fileContainer = getElement("file-container");
    const mainContainer = getElement("main-container");
    const frameContainer = getElement("frame-container");
    const fullscreenBtn = getElement("fullscreenBtn");

    if (!fileContainer || !frameContainer) {
      return;
    }

    const requestFullscreen =
      fileContainer.requestFullscreen ||
      fileContainer.mozRequestFullScreen ||
      fileContainer.webkitRequestFullscreen ||
      fileContainer.msRequestFullscreen;

    const exitFullscreen =
      document.exitFullscreen ||
      document.mozCancelFullScreen ||
      document.webkitExitFullscreen ||
      document.msExitFullscreen;

    if (!isFullscreenActive() && requestFullscreen) {
      requestFullscreen.call(fileContainer);
      frameContainer.style.height = "100vh";
      if (mainContainer) {
        mainContainer.classList.add("fullscreen");
      }
      if (fullscreenBtn) {
        fullscreenBtn.textContent = "Exit Fullscreen";
      }
    } else if (isFullscreenActive() && exitFullscreen) {
      exitFullscreen.call(document);
      frameContainer.style.height = "80vh";
      if (mainContainer) {
        mainContainer.classList.remove("fullscreen");
      }
      if (fullscreenBtn) {
        fullscreenBtn.textContent = "Fullscreen";
      }
    }
  }

  function detectSystemTheme() {
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
    return "light";
  }

  function getStoredTheme() {
    try {
      const stored = localStorage.getItem(PREFERENCE_KEYS.theme);
      return stored === "dark" || stored === "light" ? stored : null;
    } catch (error) {
      console.warn("Unable to read theme preference", error);
      return null;
    }
  }

  function setStoredTheme(theme) {
    try {
      localStorage.setItem(PREFERENCE_KEYS.theme, theme);
    } catch (error) {
      console.warn("Unable to persist theme preference", error);
    }
  }

  function updateThemeToggleButton(theme) {
    const themeToggleBtn = getElement("themeToggleBtn");
    if (!themeToggleBtn) {
      return;
    }
    const isDark = theme === "dark";
    themeToggleBtn.textContent = isDark ? "Mode Terang" : "Mode Gelap";
    themeToggleBtn.setAttribute("aria-pressed", isDark ? "true" : "false");
    themeToggleBtn.classList.toggle("setting-button--active", isDark);
  }

  function applyTheme(theme) {
    const normalized = theme === "dark" ? "dark" : "light";
    const body = document.body;
    if (body) {
      body.classList.toggle("theme-dark", normalized === "dark");
    }
    document.documentElement.style.colorScheme = normalized;
    updateThemeToggleButton(normalized);
    return normalized;
  }

  function initializeTheme() {
    const storedTheme = getStoredTheme();
    const themeToApply = storedTheme || detectSystemTheme();
    applyTheme(themeToApply);

    if (storedTheme) {
      return;
    }

    const mediaQuery = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
    if (!mediaQuery) {
      return;
    }

    const handleChange = (event) => {
      if (getStoredTheme()) {
        return;
      }
      applyTheme(event.matches ? "dark" : "light");
    };

    try {
      mediaQuery.addEventListener("change", handleChange);
    } catch (error) {
      if (typeof mediaQuery.addListener === "function") {
        mediaQuery.addListener(handleChange);
      }
    }
  }

  function toggleTheme() {
    const isDark = document.body.classList.contains("theme-dark");
    const nextTheme = isDark ? "light" : "dark";
    setStoredTheme(nextTheme);
    applyTheme(nextTheme);
  }

  function getStoredDensity() {
    try {
      const stored = localStorage.getItem(PREFERENCE_KEYS.density);
      return stored === "compact" ? "compact" : "comfortable";
    } catch (error) {
      console.warn("Unable to read density preference", error);
      return "comfortable";
    }
  }

  function setStoredDensity(mode) {
    try {
      localStorage.setItem(PREFERENCE_KEYS.density, mode);
    } catch (error) {
      console.warn("Unable to persist density preference", error);
    }
  }

  function updateDensityToggleButton(mode) {
    const densityToggleBtn = getElement("densityToggleBtn");
    if (!densityToggleBtn) {
      return;
    }
    const isCompact = mode === "compact";
    densityToggleBtn.textContent = isCompact ? "Mode Normal" : "Mode Kompak";
    densityToggleBtn.setAttribute("aria-pressed", isCompact ? "true" : "false");
    densityToggleBtn.classList.toggle("setting-button--active", isCompact);
  }

  function applyDensity(mode) {
    const normalized = mode === "compact" ? "compact" : "comfortable";
    const body = document.body;
    if (body) {
      body.classList.toggle("layout-compact", normalized === "compact");
    }
    updateDensityToggleButton(normalized);
  }

  function toggleDensity() {
    const isCompact = document.body.classList.contains("layout-compact");
    const nextMode = isCompact ? "comfortable" : "compact";
    applyDensity(nextMode);
    setStoredDensity(nextMode);
  }

  function initializePreferences() {
    initializeTheme();
    applyDensity(getStoredDensity());
  }

  function updateBackToTopVisibility() {
    if (!backToTopButton) {
      return;
    }
    const shouldShow = window.scrollY > SCROLL_TOP_THRESHOLD;
    backToTopButton.classList.toggle("is-visible", shouldShow);
  }

  function scrollToTop(event) {
    if (event && typeof event.preventDefault === "function") {
      event.preventDefault();
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function initializeBackToTop() {
    backToTopButton = getElement("backToTopButton");
    if (!backToTopButton) {
      return;
    }

    backToTopButton.addEventListener("click", scrollToTop);
    updateBackToTopVisibility();
  }

  function handleFullscreenChange() {
    const frameContainer = getElement("frame-container");
    const mainContainer = getElement("main-container");
    const fullscreenBtn = getElement("fullscreenBtn");

    if (!frameContainer) {
      return;
    }

    if (!isFullscreenActive()) {
      frameContainer.style.height = "80vh";
      if (mainContainer) {
        mainContainer.classList.remove("fullscreen");
      }
      if (fullscreenBtn) {
        fullscreenBtn.textContent = "Fullscreen";
      }
    } else {
      frameContainer.style.height = "100vh";
      if (mainContainer) {
        mainContainer.classList.add("fullscreen");
      }
      if (fullscreenBtn) {
        fullscreenBtn.textContent = "Exit Fullscreen";
      }
    }
  }

  window.changeItemsPerPage = changeItemsPerPage;
  window.changeFilter = changeFilter;
  window.changeSort = changeSort;
  window.setFilter = setFilter;
  window.submitSearch = submitSearch;
  window.clearSearch = clearSearch;
  window.resetControls = resetControls;
  window.clearFavorites = clearFavorites;
  window.clearRecents = clearRecents;
  window.toggleView = toggleView;
  window.loadFile = loadFile;
  window.loadFromDataset = loadFromDataset;
  window.closeFile = closeFile;
  window.minimizeFile = minimizeFile;
  window.toggleFullscreen = toggleFullscreen;
  window.toggleTheme = toggleTheme;
  window.toggleDensity = toggleDensity;
  window.focusSearchInput = focusSearchInput;
  window.scrollToSection = scrollToSection;
  window.scrollToTop = scrollToTop;

  window.addEventListener("resize", () => {
    const fileContainer = getElement("file-container");
    const frameContainer = getElement("frame-container");

    if (!fileContainer || !frameContainer) {
      return;
    }

    if (fileContainer.style.display !== "none") {
      frameContainer.style.height = window.innerWidth < 768 ? "50vh" : "80vh";
    }
  });

  document.addEventListener("fullscreenchange", handleFullscreenChange);
  document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
  document.addEventListener("mozfullscreenchange", handleFullscreenChange);
  document.addEventListener("MSFullscreenChange", handleFullscreenChange);

  document.addEventListener("click", handleDocumentClick);
  registerKeyboardShortcuts();
  initializePreferences();
  initializeBackToTop();
  registerEntryCards();
  hydrateQuickPanels();

  window.addEventListener("scroll", updateBackToTopVisibility, { passive: true });
})();

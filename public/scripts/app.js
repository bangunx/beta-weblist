(() => {
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

  function buildBaseParams() {
    const params = new URLSearchParams();
    const itemsSelect = getElement("itemsPerPage");
    const filterSelect = getElement("filterSelect");

    if (itemsSelect) {
      params.set("items", itemsSelect.value);
    }

    if (filterSelect) {
      params.set("filter", filterSelect.value);
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

  window.changeItemsPerPage = function changeItemsPerPage() {
    const params = buildBaseParams();
    appendSearchParam(params);
    navigateWithParams(params);
  };

  window.changeFilter = function changeFilter() {
    const params = buildBaseParams();
    appendSearchParam(params);
    navigateWithParams(params);
  };

  window.submitSearch = function submitSearch(event) {
    if (event && typeof event.preventDefault === "function") {
      event.preventDefault();
    }

    const params = buildBaseParams();
    appendSearchParam(params);
    navigateWithParams(params);
  };

  window.clearSearch = function clearSearch() {
    const searchInput = getElement("searchInput");
    if (searchInput) {
      searchInput.value = "";
    }

    const params = buildBaseParams();
    navigateWithParams(params);
  };

  window.toggleView = function toggleView() {
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
  };

  window.loadFile = function loadFile(folder, file, displayName) {
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
  };

  window.loadFromDataset = function loadFromDataset(element) {
    if (!element) {
      return;
    }

    const folder = element.getAttribute("data-folder") || "";
    const file = element.getAttribute("data-path") || "";
    const label = element.getAttribute("data-label") || file;

    window.loadFile(folder, file, label);
  };

  window.closeFile = function closeFile() {
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
  };

  window.minimizeFile = function minimizeFile() {
    const frameContainer = getElement("frame-container");
    if (!frameContainer) {
      return;
    }
    frameContainer.style.height =
      frameContainer.style.height === "40vh" ? "80vh" : "40vh";
  };

  window.toggleFullscreen = function toggleFullscreen() {
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
  };

  window.toggleTheme = function toggleTheme() {
    const body = document.getElementById("body");
    const themeToggleBtn = getElement("themeToggleBtn");

    if (!body) {
      return;
    }

    const useHackerTheme = body.classList.toggle("hacker-theme");
    if (themeToggleBtn) {
      themeToggleBtn.textContent = useHackerTheme
        ? "Normal Theme"
        : "Hacker Theme";
    }
  };

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
})();

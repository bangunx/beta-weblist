const express = require("express");
const {
  DIRECTORIES,
  DEFAULT_ITEMS_PER_PAGE,
  MAX_ITEMS_PER_PAGE,
} = require("./config");
const {
  getPaginatedHtmlFiles,
  readHtmlFiles,
} = require("./services/fileService");
const renderHomePage = require("./templates/homePage");
const renderFolderPage = require("./templates/folderPage");

const router = express.Router();

const ALLOWED_FILTERS = new Set(["all", "games", "tools"]);

const emptyListing = {
  files: [],
  totalItems: 0,
  totalPages: 0,
  currentPage: 1,
};

function parsePositiveInt(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function normalizeItemsPerPage(value) {
  const normalized = parsePositiveInt(value, DEFAULT_ITEMS_PER_PAGE);
  return Math.min(normalized, MAX_ITEMS_PER_PAGE);
}

router.get("/", async (req, res, next) => {
  const itemsPerPage = normalizeItemsPerPage(req.query.items);
  const currentPage = parsePositiveInt(req.query.page, 1);
  const filter = ALLOWED_FILTERS.has(req.query.filter)
    ? req.query.filter
    : "all";

  const includeGames = filter === "all" || filter === "games";
  const includeTools = filter === "all" || filter === "tools";

  try {
    const [gamesListing, toolsListing] = await Promise.all([
      includeGames
        ? getPaginatedHtmlFiles(DIRECTORIES.games, currentPage, itemsPerPage)
        : Promise.resolve(emptyListing),
      includeTools
        ? getPaginatedHtmlFiles(DIRECTORIES.tools, currentPage, itemsPerPage)
        : Promise.resolve(emptyListing),
    ]);

    const totalPages = Math.max(
      gamesListing.totalPages || 0,
      toolsListing.totalPages || 0,
    );

    const normalizedPage = totalPages ? Math.min(currentPage, totalPages) : 1;

    const html = renderHomePage({
      itemsPerPage,
      currentPage: normalizedPage,
      filter,
      games: gamesListing,
      tools: toolsListing,
      totalPages,
    });

    res.send(html);
  } catch (error) {
    next(error);
  }
});

async function handleFolderRequest({
  directory,
  title,
  folderUrl,
  actionLabel,
}, req, res, next) {
  try {
    const files = await readHtmlFiles(directory);
    const html = renderFolderPage({
      title,
      folderUrl,
      files,
      actionLabel,
    });
    res.send(html);
  } catch (error) {
    next(error);
  }
}

router.get("/game", (req, res, next) =>
  handleFolderRequest(
    {
      directory: DIRECTORIES.games,
      title: "Game Files",
      folderUrl: "/game",
      actionLabel: "Play",
    },
    req,
    res,
    next,
  ));

router.get("/tools", (req, res, next) =>
  handleFolderRequest(
    {
      directory: DIRECTORIES.tools,
      title: "Tool Files",
      folderUrl: "/tools",
      actionLabel: "Use",
    },
    req,
    res,
    next,
  ));

router.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

module.exports = router;

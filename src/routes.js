const express = require("express");
const {
  DIRECTORIES,
  DEFAULT_ITEMS_PER_PAGE,
  MAX_ITEMS_PER_PAGE,
} = require("./config");
const {
  getPaginatedEntries,
  readDirectoryEntries,
} = require("./services/fileService");
const renderHomePage = require("./templates/homePage");
const renderFolderPage = require("./templates/folderPage");

const router = express.Router();

const ALLOWED_FILTERS = new Set(["all", "games", "tools", "mind"]);

const emptyListing = {
  entries: [],
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
  const searchTerm = typeof req.query.search === "string"
    ? req.query.search.trim()
    : "";

  const includeGames = filter === "all" || filter === "games";
  const includeTools = filter === "all" || filter === "tools";
  const includeMind = filter === "all" || filter === "mind";

  try {
    const [gamesListing, toolsListing, mindListing] = await Promise.all([
      includeGames
        ? getPaginatedEntries(
            DIRECTORIES.games,
            currentPage,
            itemsPerPage,
            searchTerm,
          )
        : Promise.resolve(emptyListing),
      includeTools
        ? getPaginatedEntries(
            DIRECTORIES.tools,
            currentPage,
            itemsPerPage,
            searchTerm,
          )
        : Promise.resolve(emptyListing),
      includeMind
        ? getPaginatedEntries(
            DIRECTORIES.mind,
            currentPage,
            itemsPerPage,
            searchTerm,
          )
        : Promise.resolve(emptyListing),
    ]);

    const totalPages = Math.max(
      gamesListing.totalPages || 0,
      toolsListing.totalPages || 0,
      mindListing.totalPages || 0,
    );

    const normalizedPage = Math.max(
      gamesListing.currentPage || 1,
      toolsListing.currentPage || 1,
      mindListing.currentPage || 1,
    );

    const html = renderHomePage({
      itemsPerPage,
      currentPage: normalizedPage,
      filter,
      games: gamesListing,
      tools: toolsListing,
      mind: mindListing,
      totalPages,
      searchTerm,
    });

    res.send(html);
  } catch (error) {
    next(error);
  }
});

async function handleFolderRequest({
  directory,
  title,
  folderKey,
  actionLabel,
}, req, res, next) {
  try {
    const entries = await readDirectoryEntries(directory);
    const html = renderFolderPage({
      title,
      folderKey,
      entries,
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
      folderKey: "game",
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
      folderKey: "tools",
      actionLabel: "Use",
    },
    req,
    res,
    next,
  ));

router.get("/mind", (req, res, next) =>
  handleFolderRequest(
    {
      directory: DIRECTORIES.mind,
      title: "Mind Projects",
      folderKey: "mind",
      actionLabel: "Open",
    },
    req,
    res,
    next,
  ));

router.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

module.exports = router;

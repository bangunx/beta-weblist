const path = require("path");

const rootDir = path.join(__dirname, "..");

const DIRECTORIES = {
  games: path.join(rootDir, "game"),
  tools: path.join(rootDir, "tools"),
};

module.exports = {
  PORT: process.env.PORT || 3000,
  DEFAULT_ITEMS_PER_PAGE: 50,
  ITEMS_PER_PAGE_OPTIONS: [50, 100, 1000],
  MAX_ITEMS_PER_PAGE: 1000,
  DIRECTORIES,
  PUBLIC_DIR: path.join(rootDir, "public"),
};

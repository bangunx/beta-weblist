const fs = require("fs/promises");
const path = require("path");

function isHtmlFile(entry) {
  return (
    entry.isFile() && path.extname(entry.name).toLowerCase() === ".html"
  );
}

async function readHtmlFiles(directory) {
  try {
    const entries = await fs.readdir(directory, { withFileTypes: true });
    return entries
      .filter(isHtmlFile)
      .map((entry) => entry.name)
      .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  } catch (error) {
    if (error && error.code === "ENOENT") {
      const err = new Error(`Directory not found: ${directory}`);
      err.code = "DIRECTORY_NOT_FOUND";
      throw err;
    }
    throw error;
  }
}

function paginate(files, currentPage, itemsPerPage) {
  const totalItems = files.length;
  const totalPages = totalItems ? Math.ceil(totalItems / itemsPerPage) : 0;
  const safePage = totalPages
    ? Math.min(Math.max(1, currentPage), totalPages)
    : 1;
  const startIndex = (safePage - 1) * itemsPerPage;
  const paginatedFiles = totalPages
    ? files.slice(startIndex, startIndex + itemsPerPage)
    : [];

  return {
    files: paginatedFiles,
    totalItems,
    totalPages,
    currentPage: totalPages ? safePage : 1,
  };
}

async function getPaginatedHtmlFiles(directory, currentPage, itemsPerPage) {
  const files = await readHtmlFiles(directory);
  return paginate(files, currentPage, itemsPerPage);
}

module.exports = {
  getPaginatedHtmlFiles,
  readHtmlFiles,
};

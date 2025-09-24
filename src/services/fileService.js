const fs = require("fs/promises");
const path = require("path");

const HTML_EXTENSION = ".html";
const SORT_OPTIONS = { sensitivity: "base" };

function isHtmlFile(entry) {
  return entry.isFile() && path.extname(entry.name).toLowerCase() === HTML_EXTENSION;
}

function createFileEntry(name) {
  return {
    name,
    label: name,
    url: name,
    type: "file",
  };
}

async function findFirstHtmlFile(directoryPath) {
  try {
    const entries = await fs.readdir(directoryPath, { withFileTypes: true });
    const htmlFiles = entries
      .filter(isHtmlFile)
      .map((entry) => entry.name)
      .sort((a, b) => a.localeCompare(b, undefined, SORT_OPTIONS));

    if (!htmlFiles.length) {
      return null;
    }

    const indexHtml = htmlFiles.find((file) => file.toLowerCase() === "index.html");
    return indexHtml || htmlFiles[0];
  } catch (error) {
    if (error && (error.code === "ENOENT" || error.code === "ENOTDIR")) {
      return null;
    }
    throw error;
  }
}

async function buildProjectEntry(directory, dirName) {
  const projectRoot = path.join(directory, dirName);
  const entryFile = await findFirstHtmlFile(projectRoot);

  if (!entryFile) {
    return null;
  }

  const relativePath = path.posix.join(dirName, entryFile);
  return {
    name: dirName,
    label: dirName,
    url: relativePath,
    type: "project",
  };
}

async function readDirectoryEntries(directory) {
  try {
    const entries = await fs.readdir(directory, { withFileTypes: true });

    const fileEntries = entries.filter(isHtmlFile).map((entry) => createFileEntry(entry.name));

    const potentialProjects = entries.filter((entry) => entry.isDirectory());

    const projectEntries = await Promise.all(
      potentialProjects.map((entry) => buildProjectEntry(directory, entry.name)),
    );

    const combinedEntries = [...fileEntries, ...projectEntries.filter(Boolean)];

    return combinedEntries.sort((a, b) => a.label.localeCompare(b.label, undefined, SORT_OPTIONS));
  } catch (error) {
    if (error && error.code === "ENOENT") {
      const err = new Error(`Directory not found: ${directory}`);
      err.code = "DIRECTORY_NOT_FOUND";
      throw err;
    }
    throw error;
  }
}

function filterEntries(entries, searchTerm) {
  if (!searchTerm) {
    return entries;
  }

  const normalizedTerm = searchTerm.trim().toLowerCase();

  if (!normalizedTerm) {
    return entries;
  }

  return entries.filter((entry) => {
    const haystack = `${entry.label} ${entry.url}`.toLowerCase();
    return normalizedTerm.split(/\s+/).every((segment) => haystack.includes(segment));
  });
}

function sortEntries(entries, sortOrder = "asc") {
  if (!Array.isArray(entries) || entries.length <= 1) {
    return entries;
  }

  const sorted = [...entries].sort((a, b) =>
    a.label.localeCompare(b.label, undefined, SORT_OPTIONS),
  );

  return sortOrder === "desc" ? sorted.reverse() : sorted;
}

function paginateEntries(entries, currentPage, itemsPerPage) {
  const totalItems = entries.length;
  const totalPages = totalItems ? Math.ceil(totalItems / itemsPerPage) : 0;
  const safePage = totalPages ? Math.min(Math.max(1, currentPage), totalPages) : 1;
  const startIndex = (safePage - 1) * itemsPerPage;
  const paginatedEntries = totalPages ? entries.slice(startIndex, startIndex + itemsPerPage) : [];

  return {
    entries: paginatedEntries,
    totalItems,
    totalPages,
    currentPage: totalPages ? safePage : 1,
  };
}

async function getPaginatedEntries(
  directory,
  { currentPage, itemsPerPage, searchTerm = "", sortOrder = "asc" },
) {
  const entries = await readDirectoryEntries(directory);
  const filtered = filterEntries(entries, searchTerm);
  const sorted = sortEntries(filtered, sortOrder);
  return paginateEntries(sorted, currentPage, itemsPerPage);
}

module.exports = {
  getPaginatedEntries,
  readDirectoryEntries,
};

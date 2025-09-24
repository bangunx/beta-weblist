const { escapeHtml, buildHref } = require("./utils");

function renderEntryCards(entries, folderKey, actionLabel, emptyMessage = "No HTML files match the current selection.") {
  if (!Array.isArray(entries) || !entries.length) {
    return `
      <div class="col-span-full text-center text-gray-500">
        ${escapeHtml(emptyMessage)}
      </div>
    `;
  }

  return entries
    .map((entry) => {
      const displayName = escapeHtml(entry.label);
      const actionText = escapeHtml(actionLabel);
      const entryHref = buildHref(folderKey, entry.url);
      const folderAttr = escapeHtml(folderKey);
      const pathAttr = escapeHtml(entry.url);
      const labelAttr = escapeHtml(entry.label);
      const badge =
        entry.type === "project"
          ? '<span class="ml-2 inline-flex items-center rounded bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">Project</span>'
          : "";

      return `
        <div class="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-300">
          <div class="flex items-start justify-between mb-2">
            <h3 class="font-semibold">${displayName}</h3>
            ${badge}
          </div>
          <div class="flex space-x-2">
            <button class="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-3 rounded text-sm" data-folder="${folderAttr}" data-path="${pathAttr}" data-label="${labelAttr}" onclick="loadFromDataset(this)">
              ${actionText}
            </button>
            <a href="${entryHref}" target="_blank" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 rounded text-sm">
              Open
            </a>
          </div>
        </div>
      `;
    })
    .join("");
}

module.exports = {
  renderEntryCards,
};

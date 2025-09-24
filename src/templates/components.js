const { escapeHtml, buildHref } = require("./utils");

function buildEntryKey(folderKey, entry) {
  return `${folderKey}:${entry.url}`;
}

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
      const hrefAttr = escapeHtml(entryHref);
      const entryKey = escapeHtml(buildEntryKey(folderKey, entry));
      const badge =
        entry.type === "project"
          ? '<span class="entry-badge">Project</span>'
          : '<span class="entry-badge entry-badge--file">Single File</span>';

      const filePath = escapeHtml(entry.url);

      return `
        <article
          class="entry-card"
          data-entry-key="${entryKey}"
          data-entry-folder="${folderAttr}"
          data-entry-path="${pathAttr}"
          data-entry-label="${labelAttr}"
          data-entry-href="${hrefAttr}"
          data-entry-type="${escapeHtml(entry.type || "file")}" >
          <div class="entry-card__header">
            <div>
              <h3 class="entry-card__title">${displayName}</h3>
              <p class="entry-card__path">${filePath}</p>
            </div>
            <div class="entry-card__meta">
              ${badge}
              <button
                type="button"
                class="favorite-toggle"
                title="Tambah ke Favorit"
                aria-label="Toggle favorite for ${displayName}"
                data-entry-key="${entryKey}"
              >
                <span class="favorite-icon" aria-hidden="true">☆</span>
              </button>
            </div>
          </div>
          <div class="entry-card__actions">
            <button
              class="entry-button entry-button--primary"
              data-folder="${folderAttr}"
              data-path="${pathAttr}"
              data-label="${labelAttr}"
              data-key="${entryKey}"
              onclick="loadFromDataset(this)"
            >
              ${actionText}
            </button>
            <a
              href="${entryHref}"
              target="_blank"
              rel="noopener noreferrer"
              class="entry-button entry-button--ghost"
            >
              Buka Tab
            </a>
            <button
              class="entry-button entry-button--ghost quick-copy"
              data-entry-href="${hrefAttr}"
              data-entry-key="${entryKey}"
              title="Salin tautan"
              type="button"
            >
              Salin Link
            </button>
          </div>
        </article>
      `;
    })
    .join("");
}

module.exports = {
  renderEntryCards,
};

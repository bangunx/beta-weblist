function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, (char) => {
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

function encodePath(value = "") {
  return value
    .split("/")
    .filter((segment) => segment.length > 0)
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

function buildHref(basePath = "", relativePath = "") {
  const encodedRelative = encodePath(relativePath);
  const trimmedBase = (basePath || "").replace(/\/+$/, "");

  if (!trimmedBase) {
    return encodedRelative ? `/${encodedRelative}` : "/";
  }

  const normalizedBase = trimmedBase.startsWith("/")
    ? trimmedBase
    : `/${trimmedBase}`;

  return encodedRelative ? `${normalizedBase}/${encodedRelative}` : normalizedBase;
}

module.exports = {
  escapeHtml,
  encodePath,
  buildHref,
};

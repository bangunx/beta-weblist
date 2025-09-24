const defaultStyles = `
  .game-frame {
    width: 100%;
    height: 100%;
    border: none;
  }
  .fullscreen {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 9999;
  }
  .control-buttons {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
  }
  .control-button {
    background-color: #ddd;
    border: none;
    padding: 0.5rem;
    cursor: pointer;
  }
  .control-button:hover {
    background-color: #ccc;
  }
  .back-to-top {
    position: fixed;
    bottom: 1.5rem;
    right: 1.5rem;
    width: 3rem;
    height: 3rem;
    border-radius: 999px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    background-color: #2563eb;
    color: #f8fafc;
    border: none;
    cursor: pointer;
    box-shadow: 0 18px 30px -20px rgba(37, 99, 235, 0.55);
    opacity: 0;
    pointer-events: none;
    transform: translateY(10px);
    transition: opacity 0.2s ease, transform 0.2s ease;
    z-index: 1100;
  }
  .back-to-top.is-visible {
    opacity: 1;
    pointer-events: auto;
    transform: translateY(0);
  }
  .back-to-top:focus-visible {
    outline: 2px solid #f8fafc;
    outline-offset: 2px;
  }
`;

function layout({
  title,
  bodyClass = "",
  bodyId = "",
  headContent = "",
  styles = "",
  content = "",
  scripts = "",
}) {
  const idAttribute = bodyId ? ` id="${bodyId}"` : "";
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${title}</title>
      <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet" />
      ${headContent}
      <style>
        ${defaultStyles}
        ${styles}
      </style>
    </head>
    <body${idAttribute} class="${bodyClass}">
      ${content}
      <button
        id="backToTopButton"
        type="button"
        class="back-to-top"
        aria-label="Kembali ke atas"
      >
        ↑
      </button>
      ${scripts}
    </body>
    </html>
  `;
}

module.exports = layout;

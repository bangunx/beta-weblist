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
      ${scripts}
    </body>
    </html>
  `;
}

module.exports = layout;

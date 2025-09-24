const express = require("express");

const routes = require("./src/routes");
const { PORT, PUBLIC_DIR, DIRECTORIES } = require("./src/config");

function createApp() {
  const app = express();

  app.use(express.static(PUBLIC_DIR));
  app.use("/game", express.static(DIRECTORIES.games));
  app.use("/tools", express.static(DIRECTORIES.tools));
  app.use("/mind", express.static(DIRECTORIES.mind));
  app.use("/random", express.static(DIRECTORIES.random));

  app.use(routes);

  app.use((req, res) => {
    res.status(404).send("Resource not found");
  });

  app.use((err, req, res, next) => {
    console.error(err);
    if (res.headersSent) {
      return next(err);
    }
    res.status(500).send("Internal server error");
  });

  return app;
}

// Vercel serverless function handler
module.exports = (req, res) => {
  const app = createApp();
  return app(req, res);
};

// For local development
if (require.main === module) {
  const app = createApp();
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

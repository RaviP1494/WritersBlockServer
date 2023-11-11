"use strict";

const app = require("./app");

const PORT = 5000;

app.listen(PORT, function () {
  console.log(`Started on http://localhost:${PORT}`);
});

"use strict";

const { Client } = require("pg");
const dbUri = "postgresql://postgres:drowssap@localhost:5432/ravip1494";

let db;

db = new Client({
    connectionString: dbUri
});

db.connect();

module.exports = db;

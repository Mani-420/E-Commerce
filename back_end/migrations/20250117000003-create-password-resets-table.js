const fs = require("fs");
const path = require("path");

exports.up = function (db, callback) {
  const upSql = fs.readFileSync(
    path.join(__dirname, "sql", "20250117000003-create-password-resets-table-up.sql"),
    "utf8"
  );
  db.runSql(upSql, callback);
};

exports.down = function (db, callback) {
  const downSql = fs.readFileSync(
    path.join(__dirname, "sql", "20250117000003-create-password-resets-table-down.sql"),
    "utf8"
  );
  db.runSql(downSql, callback);
};

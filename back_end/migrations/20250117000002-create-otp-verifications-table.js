const fs = require("fs");
const path = require("path");

exports.up = function (db, callback) {
  const upSql = fs.readFileSync(
    path.join(__dirname, "sql", "20250117000002-create-otp-verifications-table-up.sql"),
    "utf8"
  );
  db.runSql(upSql, callback);
};

exports.down = function (db, callback) {
  const downSql = fs.readFileSync(
    path.join(__dirname, "sql", "20250117000002-create-otp-verifications-table-down.sql"),
    "utf8"
  );
  db.runSql(downSql, callback);
};

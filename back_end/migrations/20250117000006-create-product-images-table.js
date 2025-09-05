const fs = require("fs");
const path = require("path");

exports.up = function (db, callback) {
  const upSql = fs.readFileSync(
    path.join(__dirname, "sql", "20250117000006-create-product-images-table-up.sql"),
    "utf8"
  );
  db.runSql(upSql, callback);
};

exports.down = function (db, callback) {
  const downSql = fs.readFileSync(
    path.join(__dirname, "sql", "20250117000006-create-product-images-table-down.sql"),
    "utf8"
  );
  db.runSql(downSql, callback);
};

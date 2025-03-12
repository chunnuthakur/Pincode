const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bodyParser = require("body-parser");
const moment = require("moment-timezone");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// MySQL Database Connection
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true,
  dateStrings: true,
};

let db;
function handleDatabaseConnection() {
  db = mysql.createConnection(dbConfig);
  db.connect((err) => {
    if (err) {
      console.error("Database connection failed:", err);
      setTimeout(handleDatabaseConnection, 2000);
    } else {
      console.log("Connected to MySQL Database");
    }
  });

  db.on("error", (err) => {
    console.error("Database error:", err);
    if (err.code === "PROTOCOL_CONNECTION_LOST" || err.code === "ECONNRESET") {
      console.log("Reconnecting to MySQL...");
      handleDatabaseConnection();
    } else {
      throw err;
    }
  });
}
handleDatabaseConnection();

app.post("/submit", (req, res) => {
  const { mobile, pincode } = req.body;
  if (!mobile || !pincode) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const timestampIST = moment().tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss");
  const sql = "INSERT INTO user_data (mobile, pincode, timestamp) VALUES (?, ?, ?)";
  db.query(sql, [mobile, pincode, timestampIST], (err, result) => {
    if (err) {
      console.error("Error inserting data:", err);
      return res.status(500).json({ error: "Failed to save data" });
    }
    res.json({ message: "Data saved successfully", timestamp: timestampIST });
  });
});

module.exports = app;

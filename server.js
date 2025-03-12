require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");// this version of mysql is uesd to store the data and to connect to the database
const cors = require("cors");
const bodyParser = require("body-parser");
const moment = require("moment-timezone"); // Import moment-timezone for setting up the time in indian time zone (IST)


const app = express();
const port = 5000; //Backend Testing and running on port number 5000;

app.use(cors());
app.use(bodyParser.json());

// MySQL Database Connection
const dbConfig = {
  host: process.env.DB_HOST, // Use environment variables
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true,
  dateStrings: true,// Ensures date/time are returned as strings and will be converted and stored in indian time zone
};

let db;
function handleDatabaseConnection() {
  db = mysql.createConnection(dbConfig);

  db.connect((err) => {
    if (err) {
      console.error("Database connection failed:", err);
      setTimeout(handleDatabaseConnection, 2000); // Retry after 2s if database connection fails
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

// API Route to handle form submissionSSSSS
app.post("/submit", (req, res) => {
  const { mobile, pincode } = req.body;

  if (!mobile || !pincode) {
    return res.status(400).json({ error: "Missing required fields" }); // checks for the required feilds mobile number and pincode
  }

  // Get current time in IST (Indian Standard Time)
  const timestampIST = moment().tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss");

  // data insertion into the user_db table in mysql
  const sql = "INSERT INTO user_data (mobile, pincode, timestamp) VALUES (?, ?, ?)";
  db.query(sql, [mobile, pincode, timestampIST], (err, result) => {
    if (err) {
      console.error("Error inserting data:", err);
      return res.status(500).json({ error: "Failed to save data" });
    }
    res.json({ message: "Data saved successfully", timestamp: timestampIST });
  });
});

// Start Server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

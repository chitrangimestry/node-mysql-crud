

const mysql = require("mysql2");

// Create a MySQL connection
const db = mysql.createConnection({
  host: "localhost", 
  user: "your_db_username",     
  password: "your_db_password",      
  database: "your_db_name",
});


db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
    return;
  }
  console.log("Connected to MySQL database!");
});

module.exports = db;
const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const db = require("../db/dbConnect.js"); // Import db directly
const userRoutes = require("../routes/userRoutes.js");
const port = 3000;

app.use(express.json());
app.use(cookieParser());

app.use("/api", userRoutes);
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(
    `App listening on port: ${port}! App connected to MySQL Database successfully!!`
  );
});
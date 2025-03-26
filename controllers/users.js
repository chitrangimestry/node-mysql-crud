const bcrypt = require("bcrypt");
const db = require("../db/dbConnect.js");
const jwt = require("jsonwebtoken");

/*Creating new user */
exports.createNewUser = (req, res) => {
  const { username, password, email } = req.body;

  if (!username || !password || !email) {
    if (!res.headersSent)
      return res.status(400).json({ error: "Please enter all fields!" });
  }

  try {
    db.query(
      `SELECT email FROM users WHERE email = ?`,
      [email],
      (err, data) => {
        if (!res.headersSent) {
          return res.status(500).json({ error: "Database query error" });
        }

        if (data.length > 0) {
          if (!res.headersSent)
            return res.status(409).json({ message: "User already exists!" });
        }

        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);

        const newUserQuery = `INSERT INTO users( username, password, email) VALUES (?, ?, ?)`;
        const values = [username, hash, email];

        db.query(newUserQuery, values, (err, data) => {
          if (err) {
            if (!res.headersSent)
              return res.status(500).json({ error: "Something went wrong" });
          }
          return res
            .status(201)
            .json({ message: "User created successfully!" });
        });
      }
    );
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error,
    });
  }
};

/* Logging in the user */

exports.login = (req, res) => {
  const { password, email } = req.body;

  if (!password || !email) {
    if (!res.headersSent)
      return res.status(400).json({ error: "Please enter all fields!" });
  }

  try {
    const user = "SELECT * FROM users WHERE email = ?";

    db.query(user, email, (err, data) => {
      if (err) {
        if (!res.headersSent)
          return res.status(401).json({ "Error in finding user": err });
      }

      const passwordMatch = bcrypt
        .compare(password, user.password)
        .then(() => {
          if (!passwordMatch) {
            if (!res.headersSent) {
              // console.log("passwords dont match");
              return res
                .status(400)
                .json({ error: "Error in matching password" });
            }
          }
        })
        .catch((err) => {
          if (!res.headersSent) {
            return res
              .status(400)
              .json({ error: "Error in matching password" });
          }
        });

      const token = jwt.sign({ id: data[0].id }, "jwtaccesstokenkey", {
        expiresIn: "1h",
      });

      jwt.verify(token, "jwtaccesstokenkey", (err) => {
        console.log("Access token: ", token);
      });
      if (!res.headersSent) {
        res
          .cookie("access_token", token, {
            httpOnly: false,
            secure: false,
            sameSite: "None",
          })
          .status(200)
          .json("User logged in successfully!");
      }
      if (!res.headersSent) return res.status(200).json("Login Successful");
    });
  } catch (error) {
    if (!res.headersSent) {
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
};
/* Logging out the user */
exports.logout = (req, res) => {
  const userId = req.params.id;
  console.log(userId);
  if (!userId) {
    if (!res.headersSent) return res.status(400).json("Invalid user id");
  }
  try {
    const user = `SELECT * FROM users WHERE id = ?`;
    db.query(user, [userId], (err, data) => {
      if (err) {
        if (!res.headersSent)
          return res.status(400).json({ "Error while fetching data: ": err });
      }
      if (data.length === 0) {
        if (!res.headersSent) return res.status(400).json("User not found");
      }

      res.clearCookie("access_token");
      // console.log("cookies: ", req.cookies);

      console.log("User Logged out successfully!!");
      if (!res.headersSent)
        return res.status(200).json("User logged out successfully");
    });
  } catch (error) {
    if (!res.headersSent)
      return res.status(500).json({ "Internal Server error: ": error });
  }
};

/* Updating the user */

exports.updateUser = async (req, res) => {
  let { username, password, email } = req.body;
  console.log(username, password, email);
  const userId = req.params.id;
  console.log("User Id : ", userId);
  let newHashPassword = null;
  if (password) {
    newHashPassword = await bcrypt.hash(password, 10);
    console.log("hash pswd: ", newHashPassword);
  }

  const query = `UPDATE users SET username = ?, password = ?, email= ? WHERE id = ?`;
  const values = [username, newHashPassword, email, userId];

  try {
    db.query(query, values, (err, data) => {
      if (err) {
        return res.status(400).json({ "Error in updating the user info": err });
      }

      if (data.affectedRows === 0) {
        return res.status(403).json("User did not get updated");
      } else {
        return res.status(200).json({ "User updated successfully!!": data });
      }
    });
  } catch (error) {
    return res.status(500).json({ "Internal Server Error : ": error });
  }
};

/* Deleting a user */

/* Fetching all users */
exports.getAllUsers = (req, res) => {
  const users = "SELECT * FROM users";

  try {
    db.query(users, (err, data) => {
      if (err) {
        console.log("error in fetching all users");
        if (!res.headersSent)
          return res
            .status(500)
            .json({ error: "error in fetching all users!" });
      }

      if (!res.headersSent) return res.status(200).json(data);
    });
  } catch (error) {
    if (!res.headersSent)
      return res.status(500).json({ error: "Internal server error!!" });
  }
};

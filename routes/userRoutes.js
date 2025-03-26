const express = require("express");
const route = express.Router();
const userController = require("../controllers/users.js");

route.post("/register", userController.createNewUser);
route.post("/login", userController.login);
route.post("/logout/:id", userController.logout);
route.patch("/update/:id", userController.updateUser);
route.get("/getAllUsers", userController.getAllUsers);

module.exports = route;

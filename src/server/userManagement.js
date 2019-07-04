const express = require("express");
const router = express.Router();
const auth = require("./auth");
const chatManagement = require("./chat");

const userManagement = express.Router();

userManagement.get("/", auth.userAuthentication, (req, res) => {
  const userName = auth.getUserInfo(req.session.id).name;
  res.json({ id: req.session.id, name: userName });
});

userManagement.get("/allUsers", auth.userAuthentication, (req, res) => {
  res.json(auth.getUserList());
});

userManagement.post("/addUser", auth.addUserToAuthList, (req, res) => {
  res.sendStatus(200);
});

userManagement.get("/logout", [
  (req, res, next) => {
    const userInfo = auth.getUserInfo(req.session.id);
    chatManagement.appendUserLogoutMessage(userInfo);
    next();
  },
  auth.removeUserFromAuthList,
  (req, res) => {
    res.sendStatus(200);
  }
]);

module.exports = userManagement;

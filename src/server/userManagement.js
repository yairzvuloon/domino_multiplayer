const express = require("express");
const router = express.Router();
const auth = require("./auth");
const chatManagement = require("./chat");
const games= require("./games")

const userManagement = express.Router();

userManagement.get("/", auth.userAuthentication, (req, res) => {
  const user = auth.getUserInfo(req.session.id);
  //res.json({ id: req.session.id, name: user.name, roomId:user.roomId  });
  res.json(user)
});

userManagement.get("/allUsers", auth.userAuthentication, (req, res) => {
  res.json(auth.getUserList());
});

userManagement.post("/addUser", auth.addUserToAuthList, (req, res) => {
  res.sendStatus(200);
});

userManagement.post("/addRoom", (req, res, next) => {
  auth.addRoomToUser(req, res, next);
  res.sendStatus(200);
});

userManagement.get("/logout", [
  (req, res, next) => {
    const userInfo = auth.getUserInfo(req.session.id);
    chatManagement.appendUserLogoutMessage(userInfo);
    next();
  },
  auth.removeUserFromAuthList,
  games.removeGameFromGamesList,
  (req, res) => {
    res.sendStatus(200);
  }
]);

module.exports = userManagement;

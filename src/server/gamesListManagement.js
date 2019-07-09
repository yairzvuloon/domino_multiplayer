const express = require("express");
const games = require("./games");
const auth =require("./auth")
const gamesListManagement = express.Router();


gamesListManagement.get("/", games.gameAuthentication, (req, res) => {
  const game = games.getGameInfo(req.session.id);
  res.json(game);
});

gamesListManagement.post("/addGame", games.addGameToGamesList, (req, res) => {
  res.sendStatus(200);
});

gamesListManagement.post("/addUser",games.addUserToGame, (req, res) => {
  res.sendStatus(200);
});

gamesListManagement.get("/allGames",auth.userAuthentication, (req, res) => {
  let list = games.getGamesList();
  res.status(200).json(list);
});

gamesListManagement.get("/myRoomId",auth.userAuthentication, (req, res) => {
  let roomId = games.getMyRoomId(req);
  res.status(200).json(roomId);
});


module.exports = gamesListManagement;

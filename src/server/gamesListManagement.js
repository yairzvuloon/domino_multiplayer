const express = require("express");
const games = require("./games");
const auth = require("./auth");
const gamesListManagement = express.Router();

gamesListManagement.get("/", games.gameAuthentication, (req, res) => {
  const game = games.getGameInfo(req.session.id);
  res.json(game);
});

gamesListManagement.post("/addGame", games.addGameToGamesList, (req, res) => {
  res.sendStatus(200);
});

gamesListManagement.post("/addUser", games.addUserToGame, (req, res) => {
  res.sendStatus(200);
});

gamesListManagement.post("/updateValidLocations", games.updateValidLocationsAndBoard, (req, res) => {
  res.sendStatus(200);
});


gamesListManagement.get("/allGames", auth.userAuthentication, (req, res) => {
  let list = games.getGamesList();
  res.status(200).json(list);
});

gamesListManagement.get("/myRoomId", auth.userAuthentication, (req, res) => {
  let roomId = games.getMyRoomId(req);
  res.status(200).json(roomId);
});

gamesListManagement.get(
  "/getCart",
  auth.userAuthentication,
  games.isUserInRoom,
  (req, res) => {
    const cart = games.getNewCart(req);
    res.status(200).json(cart);
  }
);

gamesListManagement.get(
  "/getCard",
  auth.userAuthentication,
  games.isUserInRoom,
  (req, res) => {
    const card = games.getCard(req);
    res.status(200).json(card);
  }
);





gamesListManagement.get(
  "/getValidLocations",
  auth.userAuthentication,
  games.isUserInRoom,
  (req, res) => {
    let list = games.getValidLocations(req);
    res.status(200).json(list);
  }
);

module.exports = gamesListManagement;

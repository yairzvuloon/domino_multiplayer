const gamesList = {};

function gameAuthentication(req, res, next) {
  if (gamesList[req.session.id] === undefined) {
    res.sendStatus(401);
  } else {
    next();
  }
}

function addGameToGamesList(req, res, next) {
  if (gamesList[req.session.id] !== undefined) {
    res.status(403).send("unable to create 2 room, for one host.");
  } else {
    for (sessionId in gamesList) {
      const gameData = gamesList[sessionId];
      if (JSON.parse(gameData).gameName === JSON.parse(req.body).gameName) {
        res.status(403).send("game name already exist!");
        return;
      }
    }
    const obj = JSON.parse(req.body);
    obj.id = req.session.id;
    obj.subscribesIdStrings[0] = req.session.id;
    gamesList[req.session.id] = JSON.stringify(obj);
    next();
  }
}
function getGamesList() {
  return gamesList;
}

function removeGameFromGamesList(req, res, next) {
  if (gamesList[req.session.id] === undefined) {
    res.status(403).send("game does not exist");
  } else {
    delete gamesList[req.session.id];
    next();
  }
}

function removeUserFromGame(req, res, next) {
  const roomIdObj = JSON.parse(getMyRoomId(req));
  const roomId = roomIdObj.id;
  const index = roomIdObj.subscribesIdStringsIndex;
  if (roomId === "") {
    next();
  } else {
    const gameData = JSON.parse(gamesList[roomId]);
    if (gameData.numberOfSubscribes <= 0) {
      res.sendStatus(401);
    } else {
      gameData.subscribesIdStrings.splice(index, 1);
      gameData.numberOfSubscribes--;
      gamesList[roomId] = JSON.stringify(gameData);
      next();
    }
  }
}

function getMyRoomId(req) {
  if (gamesList[req.session.id] !== undefined) {
    return JSON.stringify({ id: req.session.id, subscribesIdStringsIndex: 0 });
  } else if (gamesList[req.session.id] === undefined) {
    for (sessionId in gamesList) {
      const gameData = JSON.parse(gamesList[sessionId]);

      for (var i = 0; i < gameData.numberOfSubscribes; i++) {
        if (gameData.subscribesIdStrings[i] === req.session.id) {
          return JSON.stringify({
            id: gameData.id,
            subscribesIdStringsIndex: i
          });
        }
      }
    }
  }
  return JSON.stringify({ id: "", subscribesIdStringsIndex: "" });
}

function isUserHost(userId) {
  return gamesList[userId] !== undefined;
}

function addUserToGame(req, res, next) {
  const roomID = req.body;
  const gameData = JSON.parse(gamesList[roomID]);
  if (gameData.numberOfSubscribes >= gameData.numPlayerToStart) {
    res.sendStatus(401);
  } else {
    gameData.subscribesIdStrings[gameData.numberOfSubscribes] = req.session.id;
    gameData.numberOfSubscribes++;
    gamesList[roomID] = JSON.stringify(gameData);
    next();
  }
}

module.exports = {
  gameAuthentication,
  addGameToGamesList,
  getGamesList,
  removeGameFromGamesList,
  removeUserFromGame,
  getMyRoomId,
  addUserToGame
};

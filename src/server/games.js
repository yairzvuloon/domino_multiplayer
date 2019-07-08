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

function getMyRoomId(req) {
  if (gamesList[req.session.id] !== undefined) {
    return req.session.id;
  } else if (gamesList[req.session.id] === undefined) {
    for (sessionId in gamesList) {
      const gameData = JSON.parse(gamesList[sessionId]);

      for (let i = 0; i < gameData.numberOfSubscribes; i++) {
        if (numberOfSubscribes[i] === req.session.id) {
          return gameData.id;
        }
      }
    }
  } else {
    return null;
  }
}

function addUserToGame(req, res, next) {
  const roomID = req.body;
  const gameData = JSON.parse(gamesList[roomID]);
  if (gameData.numberOfSubscribes >= gameData.numPlayerToStart) {
    res.sendStatus(401);
  } else {
    gameData.subscribesIdStrings[gameData.numberOfSubscribes] = req.session.id;
    gameData.numberOfSubscribes++;
    gamesList[roomID] = gameData;
    next();
  }
}

module.exports = {
  gameAuthentication,
  addGameToGamesList,
  getGamesList,
  removeGameFromGamesList,
  getMyRoomId,
  addUserToGame
};

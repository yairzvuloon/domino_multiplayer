const Manager = require("../utilities/Manager");
const auth = require("./auth");

const gamesList = {};
const userRoomId = {};

function gameAuthentication(req, res, next) {
  if (gamesList[req.session.id] === undefined) {
    res.sendStatus(401).send("you are not register to looby");
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
      if (gameData.gameName === JSON.parse(req.body).gameName) {
        res.status(403).send("game name already exist!");
        return;
      }
    }

    const obj = JSON.parse(req.body);
    obj.id = req.session.id;
    obj.subscribesIdStrings[0] = req.session.id;
    userRoomId[req.session.id] = {
      id: req.session.id,
      subscribesIdStringsIndex: 0
    };
    obj.DominoStackLogic = new Manager.DominoStack();
    obj.validLocationsArray = createEmptyValidLocations();
    obj.boardMap = Manager.setInitialBoard(57);
    obj.currentPlayerIndex = 0;
    gamesList[req.session.id] = obj;
    next();
  }
}

function getGamesList() {
  return JSON.stringify(gamesList);
}

function getValidLocations(req, res, next) {
  const roomId = JSON.parse(getMyRoomId(req)).id;
  const gameData = gamesList[roomId];

  return JSON.stringify({
    boardMap: gameData.boardMap,
    validLocationsArray: gameData.validLocationsArray
  });

  // for (let i = 0; i < gameData.validLocationsArray[side1].length; i++) {

  // }

  // for (let j = 0; j < gameData.validLocationsArray[side2].length; j++) {
  //   this.toggleCellValid(
  //     board,
  //     this.validLocationsArray[side2][col].i,
  //     this.validLocationsArray[side2][col].j,
  //     booleanVal
  //   );
  // }
}

function removeGameFromGamesList(req, res, next) {
  if (gamesList[req.session.id] !== undefined) {
    delete gamesList[req.session.id];
  }
  next();
}

function removeUserFromGame(req, res, next) {
  const roomIdObj = JSON.parse(getMyRoomId(req));
  const roomId = roomIdObj.id;
  const index = roomIdObj.subscribesIdStringsIndex;
  if (roomId !== "") {
    const gameData = gamesList[roomId];
    if (gameData.numberOfSubscribes <= 0) {
      res.sendStatus(401);
    } else {
      gamesList[roomId].subscribesIdStrings.splice(index, 1);
      gamesList[roomId].numberOfSubscribes--;
      userRoomId[req.session.id] = undefined;
      //gameData.subscribesIdStrings.splice(index, 1);
      // gameData.numberOfSubscribes--;
      // gamesList[roomId] = JSON.stringify(gameData);
    }
  }
  next();
}

function getMyRoomId(req) {
  // if (gamesList[req.session.id] !== undefined) {
  //   return JSON.stringify({ id: req.session.id, subscribesIdStringsIndex: 0 });
  // } else if (gamesList[req.session.id] === undefined) {
  //   for (sessionId in gamesList) {
  //     const gameData = gamesList[sessionId];

  //     for (var i = 0; i < gameData.numberOfSubscribes; i++) {
  //       if (gameData.subscribesIdStrings[i] === req.session.id) {
  //         return JSON.stringify({
  //           id: gameData.id,
  //           subscribesIdStringsIndex: i
  //         });
  //       }
  //     }
  //   }
  // }
  if (userRoomId[req.session.id] !== undefined) {
    return JSON.stringify(userRoomId[req.session.id]);
  }
  return JSON.stringify({ id: "", subscribesIdStringsIndex: "" });
}

function isUserHost(userId) {
  return gamesList[userId] !== undefined;
}

function isUserInRoom(req, res, next) {
  if (JSON.parse(getMyRoomId(req).id === "")) {
    res.sendStatus(401);
  }
  next();
}

function addUserToGame(req, res, next) {
  const roomID = req.body;
  const gameData = gamesList[roomID];
  if (gameData.numberOfSubscribes >= gameData.numPlayerToStart) {
    res.sendStatus(401);
  } else {
    gamesList[roomID].subscribesIdStrings[gameData.numberOfSubscribes] =
      req.session.id;
    userRoomId[req.session.id] = {
      id: roomID,
      subscribesIdStringsIndex: gamesList[roomID].numberOfSubscribes
    };
    gamesList[roomID].numberOfSubscribes++;

    // gameData.subscribesIdStrings[gameData.numberOfSubscribes] = req.session.id;
    // gameData.numberOfSubscribes++;
    // gamesList[roomID] = JSON.stringify(gameData);
    next();
  }
}

function getNewCart(req, res, next) {
  const roomId = JSON.parse(getMyRoomId(req)).id;
  const gameData = gamesList[roomId];
  return gameData.DominoStackLogic.setInitialCart();
}

function createEmptyValidLocations() {
  let matrix = new Array(7);
  for (let i = 0; i < 7; i++) {
    matrix[i] = new Array(0);
  }
  return matrix;
}

function updateValidLocationsAndBoard(req, res, next) {
  const roomId = JSON.parse(getMyRoomId(req)).id;
  const gameData = gamesList[roomId];
  const reqBodyObj = JSON.parse(req.body);
  const card = reqBodyObj.card;
  const row = reqBodyObj.row;
  const col = reqBodyObj.col;
  const side1Array = reqBodyObj.side1Array;
  const side2Array = reqBodyObj.side2Array;
  const isUpdateValidLocationNeeded = reqBodyObj.isUpdateValidLocation;
  gameData.boardMap = reqBodyObj.boardMap;

  if (isUpdateValidLocationNeeded) {
    removeValidLocation(roomId, row, col, card);
    moveToNextTurn(req, res, next);

    for (let i = 0; i < side1Array.length; i++) {
      gameData.validLocationsArray[card.side1].push(side1Array[i]);
    }

    for (let i = 0; i < side2Array.length; i++) {
      gameData.validLocationsArray[card.side2].push(side2Array[i]);
    }
  }
  next();
}

function removeValidLocation(roomId, row, col, card) {
  const gameData = gamesList[roomId];

  let length1 = gameData.validLocationsArray[card.side1].length;
  let length2 = gameData.validLocationsArray[card.side2].length;
  let arr1 = new Array(0);
  let arr2 = new Array(0);

  arr1 = Manager.createCopyRow(gameData.validLocationsArray, card.side1);
  arr2 = Manager.createCopyRow(gameData.validLocationsArray, card.side2);
  let output1 = Manager.removeRowColElementFromArray(arr1, row, col);
  let output2 = Manager.removeRowColElementFromArray(arr2, row, col);

  if (output1) {
    length1--;
    gameData.validLocationsArray[card.side1] = new Array(length1);
    for (let i = 0; i < length1; i++) {
      gameData.validLocationsArray[card.side1][i] = arr1[i];
    }
  }

  if (output2) {
    length2--;
    gameData.validLocationsArray[card.side2] = new Array(length2);
    for (let i = 0; i < length2; i++) {
      gameData.validLocationsArray[card.side2][i] = arr2[i];
    }
  }
}

function getCard(req) {
  const roomId = JSON.parse(getMyRoomId(req)).id;
  const gameData = gamesList[roomId];
  moveToNextTurn(req);
  return JSON.stringify({ card: gameData.DominoStackLogic.getCard() });
}

function isAllPlayersIn(req) {
  const roomId = JSON.parse(getMyRoomId(req)).id;
  const gameData = gamesList[roomId];
  return JSON.stringify(
    gameData.numberOfSubscribes === JSON.parse(gameData.numPlayerToStart)
  );
}

function moveToNextTurn(req, res, next) {
  const roomId = JSON.parse(getMyRoomId(req)).id;
  const gameData = gamesList[roomId];
  const indexPlayer = gameData.currentPlayerIndex;
  if (req.session.id === gameData.subscribesIdStrings[indexPlayer]) {
    if (indexPlayer + 1 === JSON.parse(gameData.numPlayerToStart)) {
      gameData.currentPlayerIndex = 0;
    } else {
      gameData.currentPlayerIndex++;
    }
  }
}

function isMyTurn(req) {
  const roomId = JSON.parse(getMyRoomId(req)).id;
  const gameData = gamesList[roomId];
  const indexPlayer = gameData.currentPlayerIndex;
  return req.session.id === gameData.subscribesIdStrings[indexPlayer];
}

function getCurrentPlayer(req) {
  const roomId = JSON.parse(getMyRoomId(req)).id;
  const gameData = gamesList[roomId];
  const indexPlayer = gameData.currentPlayerIndex;
  const currentPlayerId = gameData.subscribesIdStrings[indexPlayer];
  return JSON.stringify(JSON.parse(auth.getUserInfo(currentPlayerId)).name);
}

module.exports = {
  gameAuthentication,
  addGameToGamesList,
  getGamesList,
  removeGameFromGamesList,
  removeUserFromGame,
  getMyRoomId,
  addUserToGame,
  isUserInRoom,
  getNewCart,
  getValidLocations,
  updateValidLocationsAndBoard,
  getCard,
  isAllPlayersIn,
  isMyTurn,
  moveToNextTurn,
  getCurrentPlayer
};

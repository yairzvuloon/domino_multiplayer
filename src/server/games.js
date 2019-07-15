const Manager = require("../utilities/Manager");
const auth = require("./auth");
const chat = require("./chat");

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
    // obj.subscribesIdStrings[0] = req.session.id;
    // userRoomId[req.session.id] = {
    //   id: req.session.id,
    //   subscribesIdStringsIndex: 0
    // };
    obj.DominoStackLogic = new Manager.DominoStack();
    obj.validLocationsArray = createEmptyValidLocations();
    obj.boardMap = Manager.setInitialBoard(57);
    obj.numPlayerToStart = JSON.parse(obj.numPlayerToStart);
    obj.currentPlayerIndex = 0;
    obj.numberOfSubscribes = 0;
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
  if (gameData !== undefined)
    return JSON.stringify({
      boardMap: gameData.boardMap,
      validLocationsArray: gameData.validLocationsArray
    });
  else {
    return JSON.stringify({
      boardMap: [],
      validLocationsArray: []
    });
  }

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
  const roomIdObj = JSON.parse(getMyRoomId(req));
  const roomId = roomIdObj.id;
  // const index = roomIdObj.subscribesIdStringsIndex;
  const gameData = gamesList[roomId];
  removeUserFromGame(req, res, next);

  if (gameData !== undefined) {
    for (var i = 0; i < gameData.numberOfSubscribes; i++) {
      userRoomId[gameData.subscribesIdStrings[i]] = undefined;
    }
    chat.removeChatRoom(roomId);
    delete gamesList[roomId];
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
  if (userRoomId[req.session.id] !== undefined) {
    return JSON.stringify(userRoomId[req.session.id]);
  }
  return JSON.stringify({ id: "", subscribesIdStringsIndex: "" });
}

function getMyRoomData(req) {
  const roomIdObj = JSON.parse(getMyRoomId(req));
  const roomId = roomIdObj.id;
  // const index = roomIdObj.subscribesIdStringsIndex;
  const gameData = gamesList[roomId];
  return JSON.stringify(gameData);
}

function isHost(req) {
  return JSON.stringify(gamesList[req.session.id] !== undefined);
}

function isUserInRoom(req, res, next) {
  if (JSON.parse(getMyRoomId(req).id === "")) {
    res.sendStatus(401);
  }
  next();
}

function addUserToGame(req, res, next) {
  const roomID = JSON.parse(req.body).roomId;
  const name = JSON.parse(req.body).name;

  const gameData = gamesList[roomID];

  if (gameData.numberOfSubscribes >= gameData.numPlayerToStart) {
    res.sendStatus(401);
  } else {
    gamesList[roomID].subscribesIdStrings[gameData.numberOfSubscribes] = {
      id: req.session.id,
      name: name
    };
    userRoomId[req.session.id] = {
      id: roomID,
      subscribesIdStringsIndex: gamesList[roomID].numberOfSubscribes
    };
    //gameData.subscribesIdStrings[gameData.numberOfSubscribes] = req.session.id;
    gameData.numberOfSubscribes++;
    gamesList[roomID] = gameData;
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

function getUsersRoomData(req) {
  const roomId = JSON.parse(getMyRoomId(req)).id;
  const gameData = gamesList[roomId];
  if (gameData !== undefined) {
    return {
      isAllPlayersIn:
        gameData.numberOfSubscribes === gameData.numPlayerToStart
      ,
      names: gameData.subscribesIdStrings,
      numberOfSubscribes: gameData.numberOfSubscribes
    };
  } else {
    return "false";
  }
}

function moveToNextTurn(req, res, next) {
  const roomId = JSON.parse(getMyRoomId(req)).id;
  const gameData = gamesList[roomId];
  const indexPlayer = gameData.currentPlayerIndex;
  if (req.session.id === gameData.subscribesIdStrings[indexPlayer].id) {
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
  if (gameData !== undefined) {
    const indexPlayer = gameData.currentPlayerIndex;

    return req.session.id === gameData.subscribesIdStrings[indexPlayer].id;
  } else return false;
}

function getCurrentPlayer(req) {
  const roomId = JSON.parse(getMyRoomId(req)).id;
  const gameData = gamesList[roomId];
  if (gameData !== undefined) {
    const indexPlayer = gameData.currentPlayerIndex;
    const currentPlayerId = gameData.subscribesIdStrings[indexPlayer].id;

    return JSON.stringify(JSON.parse(auth.getUserInfo(currentPlayerId)).name);
  } else return JSON.stringify("");
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
  getUsersRoomData,
  isMyTurn,
  moveToNextTurn,
  getCurrentPlayer,
  isHost,
  myRoomData: getMyRoomData
};

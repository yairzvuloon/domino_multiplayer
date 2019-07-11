const Manager = require("../utilities/Manager");
// class DominoStack {
//   constructor() {
//     this.piecesAmount = 28;
//     this.indexesCardsBox = this.createShuffledArray(this.piecesAmount);
//     this.indexesCardsBoxIndex = this.piecesAmount - 1;
//     this.cardsArray = this.createCardsArray();
//     //because of the initial state of stack
//     this.numberOfDrawnFromStack = -7;
//     this.getNumOfWithdrawals = this.getNumOfWithdrawals.bind(this);
//     this.getNumOfPieces = this.getNumOfPieces.bind(this);
//     this.reset = this.reset.bind(this);
//   }

//   getNumOfWithdrawals() {
//     return this.numberOfDrawnFromStack;
//   }

//   getNumOfPieces() {
//     return this.piecesAmount;
//   }

//   getCard() {
//     let ret = null;
//     if (this.piecesAmount > 0) {
//       this.numberOfDrawnFromStack++;
//       this.piecesAmount--;
//       let cardIndex = this.indexesCardsBox.pop();
//       ret = this.cardsArray[cardIndex];
//       this.indexesCardsBoxIndex--;
//       console.log("in getCard()");
//       console.log("card: " + ret.side1 + ", " + ret.side2);
//     }
//     return ret;
//   }

//   createShuffledArray(size) {
//     let a = new Array(size);
//     for (let i = 0; i < size; i++) {
//       a[i] = i;
//     }
//     for (let i = a.length - 1; i > 0; i--) {
//       const j = Math.floor(Math.random() * (i + 1));
//       [a[i], a[j]] = [a[j], a[i]];
//     }
//     return a;
//   }

//   createCardsArray() {
//     let arr = new Array(28);
//     let arrIndex = 0;
//     for (let i = 0; i < 7; i++) {
//       for (let j = i; j < 7; j++) {
//         arr[arrIndex] = { valid: undefined, side1: i, side2: j };
//         console.log(arr[arrIndex]);
//         arrIndex++;
//       }
//     }
//     return arr;
//   }

//   setInitialCart() {
//     let cart = new Array(7);
//     for (let i = 0; i < 7; i++) {
//       cart[i] = this.getCard();
//     }
//     return JSON.stringify({ cart: cart });
//   }

//   reset() {
//     this.piecesAmount = 28;
//     this.indexesCardsBox = this.createShuffledArray(this.piecesAmount);
//     this.indexesCardsBoxIndex = this.piecesAmount - 1;
//     this.cardsArray = this.createCardsArray();
//     //because of the initial state of stack
//     this.numberOfDrawnFromStack = -7;
//   }
// }

const gamesList = {};

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
    obj.DominoStackLogic = new Manager.DominoStack();
    obj.validLocationsArray = createEmptyValidLocations();
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

  return JSON.stringify({ validLocationsArray: gameData.validLocationsArray });

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
      //gameData.subscribesIdStrings.splice(index, 1);
      // gameData.numberOfSubscribes--;
      // gamesList[roomId] = JSON.stringify(gameData);
    }
  }
  next();
}

function getMyRoomId(req) {
  if (gamesList[req.session.id] !== undefined) {
    return JSON.stringify({ id: req.session.id, subscribesIdStringsIndex: 0 });
  } else if (gamesList[req.session.id] === undefined) {
    for (sessionId in gamesList) {
      const gameData = gamesList[sessionId];

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

function updateValidLocations(req, res, next) {
  const roomId = JSON.parse(getMyRoomId(req)).id;
  const gameData = gamesList[roomId];
  const reqBodyObj = JSON.parse(req.body);
  const card = reqBodyObj.card;
  const row = reqBodyObj.row;
  const col = reqBodyObj.col;
  const side1Array = reqBodyObj.side1Array;
  const side2Array = reqBodyObj.side2Array;
  removeValidLocation(roomId, row, col, card);

  for (let i = 0; i < side1Array.length; i++) {
    gameData.validLocationsArray[card.side1].push(side1Array[i]);
  }

  for (let i = 0; i < side2Array.length; i++) {
  gameData.validLocationsArray[card.side2].push(side2Array[i]);
  }
  next();
}

function removeValidLocation(roomId, row, col, card) {
  const gameData = gamesList[roomId];

  let length1 = gameData.validLocationsArray[card.side1].length;
  let length2 = gameData.validLocationsArray[card.side2].length;
  let arr1 = Manager.createCopyRow(gameData.validLocationsArray, card.side1);
  let arr2 = Manager.createCopyRow(gameData.validLocationsArray, card.side2);
  let output1 = Manager.removeRowColElementFromArray(arr1, row, col);
  let output2 = Manager.removeRowColElementFromArray(arr2, row, col);

  if (output1) {
    length1--;
    gameData.validLocationsArray[card.side1] = new Array(length1);
    for (let i = 0; i < length1; i++) {
      gameData.validLocationsArray[card.side1] = arr1[i];
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
  updateValidLocations
};

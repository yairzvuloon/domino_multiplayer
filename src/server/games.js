class DominoStack {
  constructor() {
    this.piecesAmount = 28;
    this.indexesCardsBox = this.createShuffledArray(this.piecesAmount);
    this.indexesCardsBoxIndex = this.piecesAmount - 1;
    this.cardsArray = this.createCardsArray();
    //because of the initial state of stack
    this.numberOfDrawnFromStack = -7;
    this.getNumOfWithdrawals = this.getNumOfWithdrawals.bind(this);
    this.getNumOfPieces = this.getNumOfPieces.bind(this);
    this.reset = this.reset.bind(this);
  }

  getNumOfWithdrawals() {
    return this.numberOfDrawnFromStack;
  }

  getNumOfPieces() {
    return this.piecesAmount;
  }

  getCard() {
    let ret = null;
    if (this.piecesAmount > 0) {
      this.numberOfDrawnFromStack++;
      this.piecesAmount--;
      let cardIndex = this.indexesCardsBox.pop();
      ret = this.cardsArray[cardIndex];
      this.indexesCardsBoxIndex--;
      console.log("in getCard()");
      console.log("card: " + ret.side1 + ", " + ret.side2);
    }
    return ret;
  }

  createShuffledArray(size) {
    let a = new Array(size);
    for (let i = 0; i < size; i++) {
      a[i] = i;
    }
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  createCardsArray() {
    let arr = new Array(28);
    let arrIndex = 0;
    for (let i = 0; i < 7; i++) {
      for (let j = i; j < 7; j++) {
        arr[arrIndex] = { valid: undefined, side1: i, side2: j };
        console.log(arr[arrIndex]);
        arrIndex++;
      }
    }
    return arr;
  }

  setInitialCart() {
    let cart = new Array(7);
    for (let i = 0; i < 7; i++) {
      cart[i] = this.getCard();
    }
    return JSON.stringify({ cart: cart });
  }

  reset() {
    this.piecesAmount = 28;
    this.indexesCardsBox = this.createShuffledArray(this.piecesAmount);
    this.indexesCardsBoxIndex = this.piecesAmount - 1;
    this.cardsArray = this.createCardsArray();
    //because of the initial state of stack
    this.numberOfDrawnFromStack = -7;
  }
}

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
    obj.DominoStackLogic = new DominoStack();
    gamesList[req.session.id] = obj;
    next();
  }
}
function getGamesList() {
 
  return JSON.stringify(gamesList);
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

function isUserInRoom(req,res, next) {
  if (JSON.parse(getMyRoomId(req).id === "")) {
    res.sendStatus(401);
  }
  next();
}

function addUserToGame(req, res, next) {
  const roomID = req.body;
  const gameData =gamesList[roomID];
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
  const roomId=JSON.parse(getMyRoomId(req)).id;
  const gameData =gamesList[roomId];
  return gameData.DominoStackLogic.setInitialCart();
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
  getNewCart
};

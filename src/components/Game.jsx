import React from "react";
import ReactDOM from "react-dom";
import Board from "../components/Board.jsx";
import Cart from "../components/Cart.jsx";
import Timer from "../components/Timer.jsx";
import Stats from "../components/Stats.jsx";
const Manager = require("../utilities/Manager");
import "../style/GameStyle.css";

const getInitialState = () => {
  const initialBoard = Manager.setInitialBoard(57);
  const initialValidLocation = Manager.createEmptyValidLocations();
  const initialState = {
    boardMap: initialBoard,
    validLocationsArray: initialValidLocation,
    cartMap: [],
    selectedCard: null,
    currentScore: 0,
    turn: 0,
    withdrawals: 0,
    average: { minutes: 0, seconds: 0 },
    timeToDisplay: null
  };

  return initialState;
};

//
//const fetchCart = () => {
//return fetch("/games/getCart", {
//  method: "GET",
//  credentials: "include"
// }).then(response => {
//   if (!response.ok) {
//     throw response;
//   }
//   return response.json();
// });
//};

export default class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = getInitialState();
    this.fetchBoardData = this.fetchBoardData.bind(this);
    this.fetchBoardDataWrapper = this.fetchBoardDataWrapper.bind(this);

    //this.restartGame = this.restartGame.bind(this);

    //this.convertTimeToSecs = this.convertTimeToSecs.bind(this);
    //this.getTurnDuration = this.getTurnDuration.bind(this);
    //this.removeAllValidNeighbors = this.removeAllValidNeighbors.bind(this);
    //this.cleanAllFlags = this.cleanAllFlags.bind(this);
    //this.getNextAverageTurn = this.getNextAverageTurn.bind(this);
    //this.getAverageDiffInSecs = this.getAverageDiffInSecs.bind(this);
    //this.isValidCell = this.isValidCell.bind(this);
    //this.isNotEmpty = this.isNotEmpty.bind(this);
    //this.resetBoard = this.resetBoard.bind(this);
    //this.isTheFirstPiece = this.isTheFirstPiece.bind(this);
    // this.isJoker = this.isJoker.bind(this);

    this.isGameRunning = true;
    this.isWin = false;
    this.cartEmptyFlag = false;
    //this.validLocationsArray = this.createEmptyValidLocations();
    this.currentTime = { minutes: 0, seconds: 0 };
    this.lastPieceTime = { minutes: 0, seconds: 0 };
    this.isTimerResetNeeded = false;
    this._isMounted = false;

    ////////////////////////////////////////
    //this.movesHistory = new Array(0);
    //this.redoMoves = new Array(0);
  }
  render() {
    //let prevButton = <button onClick={this.handlePrevButton}> Prev</button>;
    //let newGameButton,
    //nextButton = null;
    let gameDoneSentence = null;
    if (!this.isGameRunning) {
      //newGameButton = <button onClick={this.restartGame}>newGame</button>;
      //nextButton = <button onClick={this.handleNextButton}> Next</button>;

      if (this.isWin) {
        gameDoneSentence = <p>YOU WINNER!!!</p>;
      } else {
        gameDoneSentence = <p>YOU LOSER...</p>;
      }
    }
    return (
      <div id="homeContainer">
        {/*<div id="statsFrame">      
        <Timer
          id="timer"
          sendCurrentTime={(m, s) => this.saveCurrentTime(m, s)}
          isResetNeeded={this.isTimerResetNeeded}
          isGameRunning={this.isGameRunning}
          timeToDisplay={this.state.timeToDisplay}
        />
        <Stats
          id="statistics"
          currentScore={this.state.currentScore}
          turn={this.state.turn}
          withdrawals={this.state.withdrawals}
          average={this.state.average}
        />
      </div>*/}
        <div id="boardFrame">
          <Board
            cells={this.state.boardMap}
            onClick={(i, j) => this.handleBoardClick(i, j)}
          />
        </div>
        <div id="cartFrame">
          <Cart
            id="cartStyle"
            cart={this.state.cartMap}
            onClick={(i, value) => this.handleCartClick(i, value)}
          />
        </div>
        {/* {newGameButton}
      {prevButton}
      {nextButton} */}
        {gameDoneSentence}
      </div>
    );
  }
  componentWillUnmount() {
    this._isMounted = false;
    if (this.timeoutId) {
      (() => {
        clearTimeout(this.timeoutId);
      })();
    }
  }

  componentDidMount() {
    this._isMounted = true;
    //if (this.props.isUserConnected&&this._isMounted === true) this.getGamesList();
    if (this._isMounted === true) this.fetchBoardData();

    return fetch("/games/getCart", {
      method: "GET",
      credentials: "include"
    })
      .then(response => {
        if (!response.ok) {
          throw response;
        }
        return response.json();
      })
      .then(cart => {
        this.setState({ cartMap: JSON.parse(cart).cart });
      });
  }

  fetchBoardDataWrapper() {
    this.fetchBoardData();
  }

  fetchBoardData() {
    const interval = 200; //TODO: change to 200
    return fetch("/games/getValidLocations", {
      method: "GET",
      credentials: "include"
    })
      .then(response => {
        if (!response.ok) {
          throw response;
        }
        this.timeoutId = setTimeout(this.fetchBoardDataWrapper, interval);

        return response.json();
      })
      .then(serverOutput => {
        const validLocationsArray = JSON.parse(serverOutput)
          .validLocationsArray;
        const newBoardMap = JSON.parse(serverOutput).boardMap;
        this.setState(() => ({
          boardMap: newBoardMap,
          validLocationsArray: validLocationsArray
        }));
      });
  }

  /////////////////////////////////////////////////
  handleCartClick(indexCart, card) {
    if (this.isGameRunning) {
      console.log("clicked" + indexCart);
      this.isTimerResetNeeded = false;
      //////////////////////////////////////////////////
      const boardMap = this.getBoardWithSignsCells(
        [...this.state.boardMap],
        card
      );

      const objToPost = {
        isUpdateValidLocation: false,
        boardMap: boardMap,
        card: card
      };

      fetch("/games/updateValidLocations", {
        method: "POST",
        body: JSON.stringify(objToPost),
        credentials: "include"
      })
        .then(response => {
          if (!response.ok) {
            throw response;
          }
        })
        .then(() => {
          this.setState(prevState => {
            const boardMap = this.getBoardWithSignsCells(
              [...prevState.boardMap],
              card
            );
            const obj = this.getUpdatedCart([...prevState.cartMap], indexCart);
            const cartMap = obj.cartMap;
            const turn = obj.turn;
            /////////////////////////////////////////////////
            //I need to get the withdrawals from server!! //
            ///////////////////////////////////////////////
            const withdrawals = 0;
            // const withdrawals = DominoStackLogic.getNumOfWithdrawals();
            // if (DominoStackLogic.getNumOfPieces() === 0) {
            //   this.isGameRunning = false;
            //   this.isWin = false;
            // }
            return {
              boardMap: boardMap,
              cartMap: cartMap,
              selectedCard: { value: card, index: indexCart },
              turn: turn,
              withdrawals: withdrawals
            };
          });
        });
    }
  }

  getUpdatedCart(cartMap, indexCart) {
    for (let i = 0; i < cartMap.length; i++) {
      if (cartMap[i].valid) cartMap[i].valid = undefined;
    }
    cartMap[indexCart].valid = true;
    let numOfTurnsToAdd = 0;
    /////////////////////////////////////////////////////////////////////////////
    //automatic draw cards, I must to decide if to create button for get card.//
    ///////////////////////////////////////////////////////////////////////////

    // while (
    //   !this.isTheFirstTurn() &&
    //   !this.isExistPieceForValidSquares(cartMap) &&
    //   DominoStackLogic.getNumOfPieces() > 0
    // ) {
    //   let domino = DominoStackLogic.getCard();

    //   if (domino) {
    //     cartMap.push(domino);
    //     numOfTurnsToAdd++;
    //   }
    // }
    return {
      cartMap: cartMap,
      turn: this.state.turn + numOfTurnsToAdd
    };
  }
  /////////////////////////////////////
  getBoardWithSignsCells(board, card) {
    if (this.state.selectedCard !== null) {
      let prevSelectedCard = this.state.selectedCard["value"];
      this.updateValidCellsInBoard(board, prevSelectedCard, false);
    }
    this.updateValidCellsInBoard(board, card, true);
    return board;
  }

  toggleCellValid(board, row, col, booleanVal) {
    board[row][col].valid = booleanVal;
  }

  updateValidCellsInBoard(board, card, booleanVal) {
    const { side1, side2 } = card;

    for (
      let col = 0;
      col < this.state.validLocationsArray[side1].length;
      col++
    ) {
      this.toggleCellValid(
        board,
        this.state.validLocationsArray[side1][col].i,
        this.state.validLocationsArray[side1][col].j,
        booleanVal
      );
    }

    for (
      let col = 0;
      col < this.state.validLocationsArray[side2].length;
      col++
    ) {
      this.toggleCellValid(
        board,
        this.state.validLocationsArray[side2][col].i,
        this.state.validLocationsArray[side2][col].j,
        booleanVal
      );
    }
  }

  toggleCellValid(board, row, col, booleanVal) {
    board[row][col].valid = booleanVal;
  }

  handleBoardClick(row, col) {
    this.runMove(row, col);
  }

  runMove(row, col) {
    const { boardMap } = this.state;

    if (this.state.selectedCard) {
      const { side1, side2 } = this.state.selectedCard["value"];
      //need to fix it for stats//
      ///////////////////////////
      //let averageTurnInSecsToAdd = this.getAverageDiffInSecs();

      let neighborsObj = this.getNeighborsObj(row, col);
      let card = new Manager.Card(false, side1, side2, true);

      const neighborName = Object.keys(neighborsObj).filter(function(row) {
        return neighborsObj[row] !== null;
      });
      const neighborLocation = neighborsObj[neighborName];

      if (neighborLocation) {
        let piece = boardMap[neighborLocation.row][neighborLocation.col];
        card = this.createPiece(neighborName[0], piece, side1, side2);
      }

      this.locatePieceOnBoard(row, col, card);
    }
  }

  getNeighborsObj(row, col) {
    let neighborsObj = new Manager.NeighborsObj(
      this.checkNeighborPiece(row - 1, col),
      this.checkNeighborPiece(row + 1, col),
      this.checkNeighborPiece(row, col - 1),
      this.checkNeighborPiece(row, col + 1)
    );
    return neighborsObj;
  }

  checkNeighborPiece(row, col) {
    const { boardMap } = this.state;
    let obj = null;
    if (this.state.selectedCard) {
      const { side1, side2 } = this.state.selectedCard["value"];

      if (
        boardMap[row][col].side1 === side1 ||
        boardMap[row][col].side2 === side2 ||
        boardMap[row][col].side1 === side2 ||
        boardMap[row][col].side2 === side1
      ) {
        obj = { row: row, col: col };
      }
    }
    return obj;
  }

  createPiece(neighborName, neighborPiece, side1, side2) {
    let position = this.selectPosition(neighborName, neighborPiece);

    let card = new Manager.Card(false, side1, side2, position);

    if (this.checkPiecePosition(neighborName, neighborPiece, side1, side2)) {
      card = new Manager.Card(false, side2, side1, position);
    }

    return card;
  }

  selectPosition(neighborName, piece) {
    let position = piece.isLaying;
    if (
      (!position && neighborName === "left") ||
      (!position && neighborName === "right") ||
      (position && neighborName === "up") ||
      (position && neighborName === "down")
    ) {
      position = !position;
    }
    return position;
  }

  checkPiecePosition(neighborName, neighborPiece, side1, side2) {
    return (
      (side1 === neighborPiece.side1 &&
        (neighborName === "down" || neighborName === "right")) ||
      (side2 === neighborPiece.side2 &&
        (neighborName === "up" || neighborName === "left"))
    );
  }

  locatePieceOnBoard(row, col, card) {
    if (card.side1 === card.side2) {
      card.isLaying = !card.isLaying;
    }
    this.updateValidLocationInServer(row, col, card);

    this.removePieceFromCart();

    let scoreAddition = card.side1 + card.side2;
    this.isTimerResetNeeded = false;
    // const average = this.calculateAverageOfTurn();
    this.setState(prevState => {
      const newBoardMap = this.getUpdatedBoard(
        [...prevState.boardMap],
        card,
        row,
        col
      );
      ////////////////////////////
      //complete that!!!!!///////
      //////////////////////////
      // const newScore = this.getUpdatedScore(
      //   prevState.currentScore,
      //   scoreAddition
      // );
      const newTurn = prevState.turn + 1;
      return {
        boardMap: newBoardMap,
        //currentScore: newScore,
        turn: newTurn
        //average: average
      };
    });
  }

  removePieceFromCart() {
    const { index } = this.state.selectedCard;
    this.setState(prevState => {
      const newCartMap = this.getCartMapAfterRemoveCard(
        index,
        prevState.cartMap
      );
      if (this.isCartEmpty()) {
        this.isGameRunning = false;
        this.isWin = true;
      }
      return {
        cartMap: newCartMap
      };
    });
  }

  getCartMapAfterRemoveCard(index, cartMap) {
    cartMap[index] = new Manager.Card(false);
    return cartMap;
  }

  isCartEmpty() {
    const { cartMap } = this.state;
    const { index } = this.state.selectedCard;
    let isEmpty = true;
    for (let i = 0; i < cartMap.length; i++) {
      if (i !== index && cartMap[i].side1 !== undefined) {
        isEmpty = false;
      }
    }
    return isEmpty;
  }

  getCartAfterAddPiece(cart, card, indexCart) {
    card.valid = undefined;
    cart[indexCart] = card;
    return cart;
  }

  getUpdatedBoard(board, card, row, col) {
    board[row][col] = card;
    this.updateValidCellsInBoard(board, card, false);
    return board;
  }

  updateValidLocationInServer(row, col, card) {
    const objToPost = this.updateValidLocationsAndBoard(row, col, card);

    fetch("/games/updateValidLocations", {
      method: "POST",
      body: JSON.stringify(objToPost),
      credentials: "include"
    }).then(response => {
      if (!response.ok) {
        throw response;
      }
    });
  }

  updateValidLocationsAndBoard(row, col, card) {
    const { isLaying } = card;
    const isJoker = card.side1 === card.side2;
    let side1Array = new Array(0);
    let side2Array = new Array(0);

    if (isJoker || isLaying) {
      if (this.isEmptyAndNotValid(row, col - 1)) {
        side1Array.push({
          i: row,
          j: col - 1
        });
      }
      if (this.isEmptyAndNotValid(row, col + 1)) {
        side2Array.push({
          i: row,
          j: col + 1
        });
      }
    }
    if (isJoker || isLaying === false) {
      if (this.isEmptyAndNotValid(row - 1, col)) {
        side1Array.push({
          i: row - 1,
          j: col
          // laying: isLaying
        });
      }
      if (this.isEmptyAndNotValid(row + 1, col)) {
        side2Array.push({
          i: row + 1,
          j: col
        });
      }
    }

    const newBoard = this.getUpdatedBoard(
      [...this.state.boardMap],
      card,
      row,
      col
    );
    return {
      isUpdateValidLocation: true,
      boardMap: newBoard,
      card: card,
      row: row,
      col: col,
      side1Array: side1Array,
      side2Array: side2Array
    };
  }

  isEmptyAndNotValid(row, col) {
    const { boardMap } = this.state;
    return (
      boardMap[row][col].valid !== true &&
      boardMap[row][col].isLaying === undefined
    );
  }
}

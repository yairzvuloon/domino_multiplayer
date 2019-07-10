import React from "react";
import ReactDOM from "react-dom";
import Board from "../components/Board.jsx";
import Cart from "../components/Cart.jsx";
import Timer from "../components/Timer.jsx";
import Stats from "../components/Stats.jsx";
import {
  Card,
  NeighborsObj,
  StatsObj,
  setInitialBoard,
  //setInitialCart,
  DominoStackLogic,
  secondsToTime,
  removeRowColElementFromArray,
  createCopyRow
} from "../utilities/Manager";

import "../style/GameStyle.css";

const getInitialState = () => {
  const initialBoard = setInitialBoard(57);

  const initialState = {
    boardMap: initialBoard,
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

    this.isGameRunning = true;
    this.isWin = false;
    this.cartEmptyFlag = false;
    //this.validLocationsArray = this.createEmptyValidLocations();
    this.currentTime = { minutes: 0, seconds: 0 };
    this.lastPieceTime = { minutes: 0, seconds: 0 };
    this.isTimerResetNeeded = false;

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
            //onClick={(i, j) => this.handleBoardClick(i, j)}
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

  componentDidMount() {
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

  handleCartClick(indexCart, card) {
    if (this.isGameRunning) {
      console.log("clicked" + indexCart);
      this.isTimerResetNeeded = false;
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
       const withdrawals=0;
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

    return fetch("/games/getValidLocations", { method: "GET", credentials: "include" })
    .then(response => {
      if (!response.ok) {
        throw response;
      }
      return response.json();
    })
    .then(validLocationsArrayText => {
     const validLocationsArray=JSON.parse(validLocationsArrayText).validLocationsArray;
      
      for (let col = 0; col < validLocationsArray[side1].length; col++) {
        this.toggleCellValid(
          board,
          validLocationsArray[side1][col].i,
          validLocationsArray[side1][col].j,
          booleanVal
        );
      }
  
      for (let col = 0; col < validLocationsArray[side2].length; col++) {
        this.toggleCellValid(
          board,
         validLocationsArray[side2][col].i,
         validLocationsArray[side2][col].j,
          booleanVal
        );
      }

    });
   

    
  }

  toggleCellValid(board, row, col, booleanVal) {
    board[row][col].valid = booleanVal;
  }

}

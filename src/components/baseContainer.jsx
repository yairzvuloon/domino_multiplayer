import React from "react";
import ReactDOM from "react-dom";
import LoginModal from "./LoginModal.jsx";
//import ChatContainer from "./ChatContainer.jsx";
import UsersList from "./UsersList.jsx";
import GamesList from "./GamesList.jsx";
import NewGameModal from "./NewGameModal.jsx";
import Game from "./Game.jsx";
import GamesSummary from "./GameSummary.jsx";
import "../style/GameStyle.css";

export default class BaseContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showLogin: true,
      showLobby: false,
      showGame: false,
      showGameSummary: true,
      usersRoomData: null,
      currentTime: { minutes: 0, seconds: 0 },
      winName:null,
      lostName:null,
      currentUser: {
        //name: ''
      },
      currentRoomName: null
    };

    this.handleSucceededLogin = this.handleSucceededLogin.bind(this);
    this.handleLoginError = this.handleLoginError.bind(this);
    this.handleSucceedCreateNewRoom = this.handleSucceedCreateNewRoom.bind(
      this
    );
    this.handleCreateRoomError = this.handleCreateRoomError.bind(this);
    this.fetchUserInfo = this.fetchUserInfo.bind(this);
    this.logoutHandler = this.logoutHandler.bind(this);
    //  this.isCurrUserInRoom = this.isCurrUserInRoom.bind(this);
    //  this.isCurrUserInRoomWrapper = this.isCurrUserInRoomWrapper.bind(this);
    this.renderGame = this.renderGame.bind(this);
    this.removeAndExitToLobbyHandler = this.removeAndExitToLobbyHandler.bind(
      this
    );
    this.handleIsCurrUserInRoom = this.handleIsCurrUserInRoom.bind(this);
    this.handleSucceedJoinToRoom = this.handleSucceedJoinToRoom.bind(this);
    this.exitToLobbyHandler = this.exitToLobbyHandler.bind(this);
    this.handleGameDone = this.handleGameDone.bind(this);
    this._isMounted = false;
  }

  render() {
    if (this.state.showLogin) {
      return (
        <LoginModal
          key="login-modal-loginPage"
          loginSuccessHandler={this.handleSucceededLogin}
          loginErrorHandler={this.handleLoginError}
        />
      );
    } else if (this.state.showLobby) {
      return this.renderLobby();
    } else if (this.state.showGame && !this.state.showGameSummary) {
      //render Game
      return this.renderGame();
    } else if (!this.state.showGame && this.state.showGameSummary)
      return this.renderGameSummary();
    else return null;
  }

  handleSucceededLogin() {
    this.setState(
      () => ({ showLobby: true, showLogin: false }),
      this.getUserName
    );
    //this.getUserName();
  }

  handleLoginError() {
    console.error("login failed");
    this.setState(() => ({ showLogin: true }));
  }

  renderGame() {
    return (
      <Game
        removeAndExitHandler={this.removeAndExitToLobbyHandler}
        exitToLobbyHandler={this.exitToLobbyHandler}
        name={this.state.currentUser.name}
        handleIsCurrUserInRoom={this.handleIsCurrUserInRoom}
        currentRoomName={this.state.currentRoomName}
        sendUsersRoomDataToHome={this.handleGameDone}
      />
    );
  }

  renderLobby() {
    return (
      <div key="home-base-container-lobby" className="home-base-container">
        <div key="user-info-area-lobby" className="user-info-area">
          Hello {this.state.currentUser.name}
          <button
            key="logout-btn-lobby"
            className="logout btn"
            onClick={this.logoutHandler}
          >
            Logout
          </button>
          <h1 key="Domino multiplayer-lobby">Domino multiplayer</h1>
        </div>
        <div
          key="games-rooms-container-lobby"
          className="games-rooms-container"
        >
          <div key="new-game-area-lobby" className="new-game-area">
            <NewGameModal
              key="NewGameModal-lobby"
              currentUser={this.state.currentUser}
              createNewGameSuccessHandler={this.handleSucceedCreateNewRoom}
              createNewGameErrorHandler={this.handleCreateRoomError}
              addRoomToUser={this.handleAddRoomToUser}
              updateMyRoomId={this.updateMyRoomId}
            />
          </div>

          <div key="games-list-area-lobby" className="games-list-area">
            <GamesList
              key="GamesList-lobby"
              handleJoinToGame={this.handleSucceedJoinToRoom}
              name={this.state.currentUser.name}
            />
          </div>

          <div key="users-list-area-lobby" className="users-list-area">
            <UsersList key="UsersList-lobby" />
          </div>
        </div>
      </div>
    );
  }

  renderGameSummary() {
    return <GamesSummary usersRoomData={this.state.usersRoomData} currentTime={this.state.currentTime} winName={this.state.winName} lostName={this.state.lostName}/>;
  }

  getUserName() {
    this.fetchUserInfo()
      .then(userInfo => {
        //console.log("getUserName" + userInfo);
        this.setState(() => ({
          currentUser: JSON.parse(userInfo),
          showLobby: true,
          showLogin: false
        }));
      })
      .catch(err => {
        if (err.status === 401) {
          // incase we're getting 'unauthorized' as response
          this.setState(() => ({ showLogin: true }));
        } else {
          throw err; // in case we're getting an error
        }
      });
  }

  fetchUserInfo() {
    return fetch("/users", { method: "GET", credentials: "include" }).then(
      response => {
        if (!response.ok) {
          throw response;
        }
        return response.json();
      }
    );
  }

  removeAndExitToLobbyHandler() {
    fetch("/users/removeGame", { method: "GET", credentials: "include" }).then(
      response => {
        if (!response.ok) {
          console.log(
            `failed to logout user ${this.state.currentUser.name} `,
            response
          );
        }
        this.setState(() => ({
          showGame: false,
          showLobby: true,
          showLogin: false
        }));
      }
    );
  }

  exitToLobbyHandler() {
    fetch("/users/exit", { method: "GET", credentials: "include" }).then(
      response => {
        if (!response.ok) {
          console.log(
            `failed to logout user ${this.state.currentUser.name} `,
            response
          );
        }
        this.setState(() => ({
          showGame: false,
          showLobby: true,
          showLogin: false,
          showGameSummary: false
        }));
      }
    );
  }

  logoutHandler() {
    fetch("/users/logout", { method: "GET", credentials: "include" }).then(
      response => {
        if (!response.ok) {
          console.log(
            `failed to logout user ${this.state.currentUser.name} `,
            response
          );
        }
        this.setState(() => ({
          currentUser: { name: "" },
          showLogin: true,
          showGameSummary: false
        }));
      }
    );
  }

  componentDidMount() {
    //this._isMounted = true;
    //  if (
    // this.state.currentUser.name !== undefined &&
    //this.state.currentUser.name !== "" &&
    //this._isMounted === true
    //)
    //   //this.isCurrUserInRoom();
  }

  handleGameDone(currTime, usersRoomData, win, lost) {
    this.setState(() => ({
      currentRoomName: this.state.currentRoomName,
      showLobby: false,
      showGame: false,
      showGameSummary: true,
      usersRoomData: usersRoomData,
      usersStats: usersRoomData.names,
      currentTime: currTime,
      winName: win,
      lostName: lost
    }));
  }

  handleSucceedCreateNewRoom(currentRoomName) {
    this.setState(() => ({
      currentRoomName: currentRoomName,
      showLobby: true,
      showGameSummary: false
    }));
    //this.isCurrUserInRoom();
  }

  handleSucceedJoinToRoom(currentRoomName) {
    this.setState(() => ({
      currentRoomName: currentRoomName,
      showLobby: false,
      showGame: true,
      showGameSummary: false
    }));
    //this.isCurrUserInRoom();
  }

  // isCurrUserInRoomWrapper() {
  //   this.isCurrUserInRoom();
  // }

  // isCurrUserInRoom() {
  //   const interval = 1000; //TODO: change to 200
  //   if (
  //     this.state.currentUser !== undefined &&
  //     this.state.currentUser.name !== ""
  //   ) {
  //     return fetch("/games/myRoomId", { method: "GET", credentials: "include" })
  //       .then(response => {
  //         if (!response.ok) {
  //           throw response;
  //         }
  //         this.timeoutId = setTimeout(this.isCurrUserInRoomWrapper, interval);
  //         return response.json();
  //       })
  //       .then(currRoomId => {
  //         if (
  //           this._isMounted &&
  //           this.state.showLobby === false &&
  //           JSON.parse(currRoomId).id === ""
  //         )
  //           this.setState(prevState => ({ showGame:false, showLobby: true }));
  //         else return false;
  //       })
  //       .catch(err => {
  //         throw err;
  //       });
  //   }
  // }

  handleIsCurrUserInRoom() {
    this.setState(() => ({ showGame: false, showLobby: true }));
  }

  handleCreateRoomError() {
    console.error("create new room failed");
    this.setState(() => ({ showLobby: true }));
  }
}

import React from "react";
import ReactDOM from "react-dom";
import LoginModal from "./login-modal.jsx";
import ChatContainer from "./chatContainer.jsx";
import UsersList from "./usersList.jsx";
import GamesList from "./gamesList.jsx";
import NewGameModal from "./newGame-modal.jsx";

export default class BaseContainer extends React.Component {
  constructor(args) {
    super(...args);
    this.state = {
      showLogin: true,
      showLobby: false,
      showGame: false,
      currentUser: {
        //name: ''
      }
    };

    this.handleSucceededLogin = this.handleSucceededLogin.bind(this);
    this.handleLoginError = this.handleLoginError.bind(this);
    this.handleSucceedCreateNewRoom = this.handleSucceedCreateNewRoom.bind(
      this
    );
    this.handleCreateRoomError = this.handleCreateRoomError.bind(this);
    this.fetchUserInfo = this.fetchUserInfo.bind(this);
    this.logoutHandler = this.logoutHandler.bind(this);

    //this.getUserName();
  }

  render() {
    if (this.state.showLogin) {
      return (
        <LoginModal
          loginSuccessHandler={this.handleSucceededLogin}
          loginErrorHandler={this.handleLoginError}
        />
      );
    } else if (this.state.showLobby) {
      return this.renderLobby();
    } 
    else {
      //rander Game
      return <h1>game!!!!!</h1>;
    }
  }

  handleSucceededLogin() {
    this.setState(() => ({ showLobby:true,showLogin: false }), this.getUserName);
  }

  handleLoginError() {
    console.error("login failed");
    this.setState(() => ({ showLogin: true }));
  }

  renderLobby() {
    return (
      <div className="home-base-container">
        <div className="user-info-area">
          Hello {this.state.currentUser.name}
          <button className="logout btn" onClick={this.logoutHandler}>
            Logout
          </button>
          <h1>Domino multiplayer</h1>
        </div>
        <div className="games-rooms-container">
          <div className="new-game-area">
            <NewGameModal
              currentUser={this.state.currentUser}
              createNewGameSuccessHandler={this.handleSucceedCreateNewRoom}
              createNewGameErrorHandler={this.handleCreateRoomError}
            />
          </div>

          <div className="games-list-area">
            <GamesList />
          </div>

          <div className="users-list-area">
            <UsersList />
          </div>
        </div>
        <ChatContainer />
      </div>
    );
  }

  getUserName() {
    this.fetchUserInfo()
      .then(userInfo => {
        this.setState(() => ({ currentUser: userInfo,showLobby:true, showLogin: false }));
      })
      .catch(err => {
        if (err.status === 401) {
          // incase we're getting 'unautorithed' as response
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

  logoutHandler() {
    fetch("/users/logout", { method: "GET", credentials: "include" }).then(
      response => {
        if (!response.ok) {
          console.log(
            `failed to logout user ${this.state.currentUser.name} `,
            response
          );
        }
        this.setState(() => ({ currentUser: { name: "" }, showLogin: true }));
      }
    );
  }

  handleSucceedCreateNewRoom() {
    this.setState(() => ({ showLobby: false }), this.getGameRoom);
  }

  handleCreateRoomError() {
    console.error("create new room failed");
    this.setState(() => ({ showLobby: true }));
  }
}

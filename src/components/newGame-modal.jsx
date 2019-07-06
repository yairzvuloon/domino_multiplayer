import React from "react";
import ReactDOM from "react-dom";
import { hostname } from "os";

class GameData {
  constructor(i_HostId, i_GameName, i_NumPlayerToStart) {
    this.id = i_HostId;
    this.gameName = i_GameName;
    this.numPlayerToStart = i_NumPlayerToStart;
    this.numberOfSubscribes = 1;
    this.isGameStart = false;
    this.subscribesIdStrings = new Array(i_NumPlayerToStart);
    this.subscribesIdStrings[0] = i_HostId;
  }
}

export default class NewGameModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      errMessage: "",
      hostName: props.currentUser,
    };

    this.handleGameRoomCreator = this.handleGameRoomCreator.bind(this);
  }

  render() {
    return (
      <div className="new-game-div">
        <form
          className="new-game-wrapper"
          onSubmit={this.handleGameRoomCreator}
        >
          <label className="newGame-input-label" htmlFor="userName">
            room name:{" "}
          </label>
          <input className="newGame-input" name="gameName" />
          <label className="newGame-input-label" htmlFor="userName">
            num of players:{" "}
          </label>
          <input className="newGame-input" name="numOfPlayers" />
          <input className="submit-btn btn" type="submit" value="confirm" />
        </form>
        {this.renderErrorMessage()}
      </div>
    );
  }

  renderErrorMessage() {
    if (this.state.errMessage) {
      return <div className="login-error-message">{this.state.errMessage}</div>;
    }
    return null;
  }

  handleGameRoomCreator(e) {
    e.preventDefault();
    const gameName = e.target.elements.gameName.value;
    const numOfPlayers = e.target.elements.numOfPlayers.value;
    let gameObj = new GameData(
      this.props.currentUser.id,
      gameName,
      numOfPlayers
    );

    fetch("/games/addGame", {
      method: "POST",
      body: JSON.stringify(gameObj),
      credentials: "include"
    }).then(response => {
      if (response.ok) {
        this.setState(() => ({ errMessage: "" }));
        this.props.createNewGameSuccessHandler();
      } else {
        if (response.status === 403) {
          this.setState(() => ({
            errMessage: " Game name already exist, or you host of other room"
          }));
        }
        this.props.createNewGameErrorHandler();
      }
    });
    return false;
  }

  getGameRoom() {
    alert("new room opened");
  }

  // handleSucceedCreateNewRoom() {
  //   this.setState(() => ({ showLobby: false }), this.getGameRoom);
  // }

  // createRoomErrorHandler() {
  //   console.error("create new room failed");
  //   this.setState(() => ({ showLobby: true }));
  // }
}

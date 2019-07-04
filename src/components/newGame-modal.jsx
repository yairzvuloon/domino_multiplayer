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
    this.subscribesIdStrings = new Array(this.numPlayerToStart);
    this.subscribesIdStrings[0] = i_HostId;
  }
}

export default class NewGameModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      errMessage: "",
      hostName: props.currentUser
    };

    this.handleGameRoomCreator = this.handleGameRoomCreator.bind(this);
  }

  render() {
    return (
      <div className="login-page-wrapper">
        <h1>Domino multiplayer</h1>
        <h1>Lobby</h1>
        <form onSubmit={this.handleGameRoomCreator}>
          <label className="username-label" htmlFor="userName">
            {" "}
            room name:{" "}
          </label>
          <input className="username-input" name="gameName" />
          <input className="username-input" name="numOfPlayers" />
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
    let gameObj = new GameData(this.state.id, gameName, numOfPlayers);

    fetch('/games/addGame', {method:'POST', body: JSON.stringify(gameObj), credentials: 'include'})
    .then(response=> {
        if (response.ok){
            this.setState(()=> ({errMessage: ""}));
            //this.props.loginSuccessHandler();
        } else {
            if (response.status === 403) {
                this.setState(()=> ({errMessage: "Game name already exist, please try another one"}));
            }
            //this.props.loginErrorHandler();
        }
    });
    return false;
  }
}
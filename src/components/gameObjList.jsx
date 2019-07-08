import React from "react";
import ReactDOM from "react-dom";

export default class GameObjList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
     roomName: props.data.gameName,
     roomId: props.data.id,
     isGameStart: false
    };
    this.handleRoomClick=this.handleRoomClick.bind(this);
  }
  render() {
   return (<h4 onClick={this.handleRoomClick}>{this.state.roomName}</h4>);
  }

  handleRoomClick(e)
  {
    e.preventDefault();
    this.addCurrUserToThisRoom();
    this.props.handleJoinToGame(this.state.roomName);
  }

  addCurrUserToThisRoom()
  {
    fetch("/games/addUser", {
        method: "POST",
        body: this.state.roomId,
        credentials: "include"
      })
        .then(response => {
          if (!response.ok) {
            if (response.status === 403) {
              this.setState(() => ({
                errMessage: "Unable to add the user, to the room."
              }));
            }
        //     this.props.createNewGameErrorHandler();
          }
        });
  }
}

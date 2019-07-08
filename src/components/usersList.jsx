import React from "react";
import ReactDOM from "react-dom";

export default class UsersList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      //usersList: {  2: "Jack", 3: "yair" }
      usersList: {}
    };
    this.getUserList = this.getUserList.bind(this);
  }

  componentDidMount() {
    this.getUserList();
  }

  componentWillUnmount() {
    if (this.timeoutId) {
      (() => {
        clearTimeout(this.timeoutId);
      })();
    }
  }

  getUserList() {
    const interval = 200; //TODO: change to 200
    return fetch("/users/allUsers", { method: "GET", credentials: "include" })
      .then(response => {
        if (!response.ok) {
          throw response;
        }

        this.timeoutId = setTimeout(this.getUserList, interval);
        return response.json();
      })
      .then(usersList => {
        this.setState(() => ({ usersList }));
      })
      .catch(err => {
        throw err;
      });
  }

  render() {
    return (
      <div key="usersList-Wrapper">
        <h2 key="usersList-title">users List:</h2>
        <ul key="usersList-ul">
          {Object.keys(this.state.usersList).map((id, index) => (
            <li key={JSON.parse(this.state.usersList[id]).name + index}>
              {JSON.parse(this.state.usersList[id]).name}
            </li>
          ))}
        </ul>
      </div>
    );
  }
}

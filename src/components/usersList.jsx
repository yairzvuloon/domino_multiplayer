import React from "react";
import ReactDOM from "react-dom";

export default class UsersList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      //usersList: {  2: "Jack", 3: "yair" }
      usersList: { }
    };
    this.getUserList = this.getUserList.bind(this);
  }

  componentDidMount() {
    this.getUserList();
}

componentWillUnmount() {
    if (this.timeoutId) {
        clearTimeout(this.timeoutId);
    }
}

  getUserList() {
    return fetch('/users/allUsers', {method: 'GET', credentials: 'include'})
    .then((response) => {
        if (!response.ok){
            throw response;
        }
        this.timeoutId = setTimeout(this.getUserList, 200);
        return response.json();            
    })
    .then(usersList => {
        this.setState(()=>({usersList}));
    })
    .catch(err => {throw err});
}

  render() {
    return (
      <div>
        <h2>/user List11:</h2>
        <ul>
          {Object.keys(this.state.usersList).map(id => (
            <li key={id}>{this.state.usersList[id]}</li>
          ))}
        </ul>
      </div>
    );
  }
}

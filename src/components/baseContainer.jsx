import React from 'react';
import ReactDOM from 'react-dom';
import LoginModal from './login-modal.jsx';
import ChatContainer from './chatContainer.jsx';
import UsersList from './usersList.jsx';
import GamesList from './gamesList.jsx';
import NewGameModal from './newGame-modal.jsx';


export default class BaseContainer extends React.Component {
    constructor(args) {
        super(...args);
        this.state = {
            showLogin: true,
            currentUser: {
                //name: ''
            }
        };
        
        this.handleSuccessedLogin = this.handleSuccessedLogin.bind(this);
        this.handleLoginError = this.handleLoginError.bind(this);
        this.fetchUserInfo = this.fetchUserInfo.bind(this);
        this.logoutHandler= this.logoutHandler.bind(this);

        //this.getUserName();
    }
    
    render() {        
        if (this.state.showLogin) {
            return (<LoginModal loginSuccessHandler={this.handleSuccessedLogin} loginErrorHandler={this.handleLoginError}/>)
        }
        return this.renderChatRoom();
    }


    handleSuccessedLogin() {
        this.setState(()=>({showLogin:false}), this.getUserName);        
    }

    handleLoginError() {
        console.error('login failed');
        this.setState(()=>({showLogin:true}));
    }

    renderChatRoom() {
        return(
            <div className="home-base-container">
               
                <div className="user-info-area">
                    Hello {this.state.currentUser.name}
                    <button className="logout btn" onClick={this.logoutHandler}>Logout</button>
                    <h1>Domino multiplayer</h1>
                </div>
                 <div className="games-rooms-container">
                <div className="new-game-area">
                <NewGameModal currentUser={this.state.currentUser}/> 
                </div>

                <div className="games-list-area">
                <GamesList/>
                </div>
                
                <div className="users-list-area">
                <UsersList/>
                </div>
                </div>      
                <ChatContainer />
            </div>
        )
    }

    getUserName() {
        this.fetchUserInfo()
        .then(userInfo => {
            this.setState(()=>({currentUser:userInfo, showLogin: false}));
        })
        .catch(err=>{            
            if (err.status === 401) { // incase we're getting 'unautorithed' as response
                this.setState(()=>({showLogin: true}));
            } else {
                throw err; // in case we're getting an error
            }
        });
    }

    fetchUserInfo() {        
        return fetch('/users',{method: 'GET', credentials: 'include'})
        .then(response => {            
            if (!response.ok){
                throw response;
            }
            return response.json();
        });
    }

    logoutHandler() {
        fetch('/users/logout', {method: 'GET', credentials: 'include'})
        .then(response => {
            if (!response.ok) {
                console.log(`failed to logout user ${this.state.currentUser.name} `, response);                
            }
            this.setState(()=>({currentUser: {name:''}, showLogin: true}));
        })
    }
}
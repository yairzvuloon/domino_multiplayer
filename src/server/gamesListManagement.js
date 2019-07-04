const express = require('express');
const router = express.Router();
const auth = require('./auth');

const gamesListManagement = express.Router();

// gamesListManagement.get('/', auth.userAuthentication, (req, res) => {
// 	const userName = auth.getUserInfo(req.session.id).name;
// 	res.json({name:userName});
// });

// gamesListManagement.get('/allUsers', auth.userAuthentication, (req, res) => {	
// 	res.json(auth.getUserList());
// });

// gamesListManagement.post('/addUser', auth.addUserToAuthList, (req, res) => {		
// 	res.sendStatus(200);	
// });
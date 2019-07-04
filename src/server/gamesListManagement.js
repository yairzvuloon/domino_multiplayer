const express = require('express');
const games = require('./games');
const gamesListManagement = express.Router();

gamesListManagement.get("/", games.gameAuthentication, (req, res) => {
	const game = games.getGameInfo(req.session.id);
	res.json(game);
});


gamesListManagement.post("/addGame", games.addGameToGamesList, (req, res) => {		
	res.sendStatus(200);	
});

gamesListManagement.get("/allGames", (req, res) => {	
	let list=games.getGamesList();	
	res.json(list);
});
module.exports = gamesListManagement;

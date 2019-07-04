const express = require('express');
const games = require('./gamesAuth');
const gamesListManagement = express.Router();

gamesListManagement.get('/', games.gameAuthentication, (req, res) => {
	const game = games.getGameInfo(req.session.id);
	res.json(game);
});


gamesListManagement.post('/addGame', games.addGameToGamesList, (req, res) => {		
	res.sendStatus(200);	
});


gamesListManagement.get('/allGames', games.gameAuthentication, (req, res) => {	
	res.json(games.getGamesList());
});
module.exports = gamesListManagement;

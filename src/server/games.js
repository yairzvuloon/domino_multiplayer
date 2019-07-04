const gamesList = {};

function gameAuthentication(req, res, next) {		
	if (gamesList[req.session.id] === undefined) {				
		res.sendStatus(401);		
	} else {		
		next();
	}
}

function addGameToGamesList(req, res, next) {	
	if (gamesList[req.session.id] !== undefined) {
		res.status(403).send("unable to create 2 room, for one host.");
	} else {		
		for (sessionId in gamesList) {
			const gameData = gamesList[sessionId];
			if (JSON.parse(gameData).gameName === JSON.parse(req.body).gameName) {
				res.status(403).send('game name already exist!');
				return;
			}
		}		
		gamesList[req.session.id] = req.body;
		next();		
	}
}
function getGamesList() {	
    return gamesList;
}

function removeGameFromGamesList(req, res, next) {	
	if (gamesList[req.session.id] === undefined) {
		res.status(403).send('game does not exist');
	} else {						
		delete gamesList[req.session.id];
		next();
	}
}

// function getUserInfo(id) {	
//     return {name: userList[id]};
// }

module.exports = {gameAuthentication, addGameToGamesList, getGamesList, removeGameFromGamesList}


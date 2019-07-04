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
		res.status(403).send('game already exist');
	} else {		
		for (sessionId in gamesList) {
			const name = gamesList[sessionId];
			if (name === req.body) {
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

module.exports = {gameAuthentication, addGameToGamesList, getGamesList}

// function removeUserFromAuthList(req, res, next) {	
// 	if (userList[req.session.id] === undefined) {
// 		res.status(403).send('user does not exist');
// 	} else {						
// 		delete userList[req.session.id];
// 		next();
// 	}
// }

// function getUserInfo(id) {	
//     return {name: userList[id]};
// }

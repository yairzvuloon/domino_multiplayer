const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const auth = require("./auth");
const games = require("./games");
const chat = require("./chat");

//const chatContentList = {};

const chatManagement = express.Router();

chatManagement.use(bodyParser.text());

// chatManagement.route('/')
// 	.get(auth.userAuthentication, (req, res) => {
// 		res.json(chatContent);
// 	})
// 	.post(auth.userAuthentication, (req, res) => {
//         const body = req.body;
//         const userInfo =  JSON.parse(auth.getUserInfo(req.session.id)).name;
//         chatContent.push({user: userInfo, text: body});
//         res.sendStatus(200);
// 	});

chatManagement.get(
  "/",
  auth.userAuthentication,
  games.isUserInRoom,
  (req, res) => {
    const myRoomId = JSON.parse(games.getMyRoomId(req)).id;
    const content=chat.getChatRoomContent(myRoomId);
    res.status(200).json(content);
  }
);

chatManagement.post(
  "/",
  auth.userAuthentication,
  games.isUserInRoom,
  (req, res) => {
    const body = req.body;
    const myRoomId = JSON.parse(games.getMyRoomId(req)).id;
    chat.initialChatRoom(myRoomId);
    const userInfo = JSON.parse(auth.getUserInfo(req.session.id)).name;
	chat.pushContentToRoom({ user: userInfo, text: body },myRoomId);
   res.sendStatus(200);
  }
);

// chatManagement.appendUserLogoutMessage = function(userInfo) {
//   chatContentList[myRoomId].push({ user: userInfo, text: `user had logout` });
// };

module.exports = chatManagement;

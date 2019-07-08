const userList = {};

function userAuthentication(req, res, next) {
  if (userList[req.session.id] === undefined) {
    res.sendStatus(401);
  } else {
    next();
  }
}

function addUserToAuthList(req, res, next) {
  if (userList[req.session.id] !== undefined) {
    res.status(403).send("user already exist");
  } else {
    for (sessionId in userList) {
      const user = userList[sessionId];
      if (user === req.body) {
        res.status(403).send("user name already exist");

        return;
      }
    }
    userList[req.session.id] = req.body;
    next();
  }
}

function deleteUser(req, res) {
  const val = userList[req.session.id] !== undefined;
  if (userList[req.session.id] === undefined) {
    res.status(403).send("user does not exist");
  } else {
    delete userList[req.session.id];
  }
  return val;
}

// function addRoomToUser(req, res, next) {
//   // if (deleteUser(req, res)) {
//   //   if (userList[req.session.id] !== undefined) {
//   //     res.status(403).send("user already exist");
//   //   } else {
//   //     for (sessionId in userList) {
//   //       const user = userList[sessionId];
//   //       if (user === req.body) {
//   //         res.status(403).send("user name already exist");
//   //         return;
//   //       }
//   //     }
//   //     userList[req.session.id] = req.body;
//   //     res.sendStatus(200);
//   //   }
//   // }
//   if (userList[req.session.id] !== undefined) {
//     JSON.parse(userList[req.session.id]).roomId = JSON.parse(req.body).roomId;
//     res.sendStatus(200);
//   } else {
//     res.sendStatus(403);
//   }
// }

function removeUserFromAuthList(req, res, next) {
  if (userList[req.session.id] === undefined) {
    res.status(403).send("user does not exist");
  } else {
    delete userList[req.session.id];
    next();
  }
}

function getUserInfo(id) {
  return userList[id];
}

function getUserList() {
  return userList;
}

module.exports = {
  userAuthentication,
  addUserToAuthList,
  removeUserFromAuthList,
  getUserInfo,
  getUserList
};

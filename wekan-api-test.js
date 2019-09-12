"use strict";
const fs = require('fs');
const fetch = require('node-fetch');

var creds = JSON.parse(fs.readFileSync('creds.json'));
var test_message = JSON.parse(fs.readFileSync('test-message.json'));
var debug = console.log;
var url = creds.url;
var messagesender = test_message.message.from.value[0].address;
var messagerecip = test_message.message.to.value[0].address;
var messagesubject = test_message.message.subject;
var messagetext = test_message.message.text;

debug([messagesender, messagerecip, messagesubject, messagetext]);
//debug (test_message);
var headers = {
    "Content-Type": "application/json",
};

var boards = [];
var boardCache = {};
var boardId;
var swimlaneId;
var userid;

login().then((rLogin) => {
  return Promise.all([fetchUsers()
                      .then((rUsers)=>{ return findUserByEmail(rUsers, messagesender) })
//                      .then(JSON.stringify)
                      .then(debug),
                      fetchBoards(rLogin.id)])
}).then(results => {
  return fetchBoard(results[1] /*rBoards*/, creds.board);
}).then(rBoard => {
  //debug(rBoard);
  boardId = rBoard._id;
  let defaultswimlane = rBoard.swimlanes.find(e=> { return e.title == 'Default' })
  if (defaultswimlane.length) { swimlaneId = defaultswimlane[0]._id } 
  else { swimlaneId = rBoard.swimlanes[0]._id; }
  return rBoard.lists
    .find(e => { return e.title == creds.list;  })._id;
})
  .then(lId => { return postCard(lId); })
  .then(debug);

function login() {
  delete headers.Authorization;
  debug('attempting login with username/password');
  return fetch(url + "users/login", {
    method: 'POST',
    headers: headers, 
    body: JSON.stringify({username: creds.username, password: creds.password })
  }).then((response) => { return response.json(); })
    .then((rLogin) => {
      debug(rLogin);
      let token=rLogin.token;
      if (token) { debug('logged in with username/password', token); }
      else { debug('username/password login failed'); }
      headers.Authorization = "bearer "+rLogin.token;
      userid=rLogin.id;
      debug(JSON.stringify(rLogin));
      return rLogin;
    })
};


function fetchBoards(id) {
  debug ('fetching list of boards');
  return fetch(url+"api/users/"+id+"/boards", {
    method: 'GET',
    headers: headers
  })
    .then((response) => {
      return response.json(); })
    .then((rBoards) => {
      debug(rBoards);
      // document.rBoards = rBoards;
      if (rBoards.length) {
        debug("found list of "+rBoards.length+" boards available");
        boards = rBoards;
        return rBoards;
      } else {
        debug("board list not loaded.  Login?");
        return false;
      }
    })
}

function fetchBoard(rBoards, board) {
  var bId = rBoards.find((e) => { return e.title == board; })._id; 
  debug (`fetching lists for board ${board} with id ${bId}`);
  
  return fetch(url+"api/boards/"+bId+"/export", {
    method: 'GET',
    headers: headers
  }).then((response) => {
    // not using .json() to debug Weken returning zero length results
    return response.text(); })
    .then((rBoard) => {
      //debug(rBoard.length);
      boardCache[bId] = JSON.parse(rBoard);
      debug(Object.keys(boardCache[bId]));
      debug(boardCache[bId].users);
      return JSON.parse(rBoard);
    });
}

function fetchUsers() {
  return fetch(url+"api/users", {
    method: 'GET',
    headers: headers
  }).then((response) => {
    return response.json();
  }).then(rUsers => {
    debug('USERS: ', rUsers);
    return Promise.all(
      rUsers.map((e,i,a) => {
        return fetch(url+"api/users/"+e._id, {
          method: 'GET',
          headers: headers
        }).then(resp => { return resp.json(); })
          .then((rUser) => {
            return rUser;
          })
      }))
  })
};
   
function findUserByEmail(rUsers, addr) {
  let user = rUsers.find((e1,i,a)=>{
    return e1.emails.find(e2=>{
      // FIXME: consider optional test for verified flag
      return e2.address.toLowerCase() == addr.toLowerCase()
    })
  });
  if (user) { userid = user._id; }
  return user;
}

function postCard(lId) {
  return fetch(url+"api/boards/"+boardId+'/lists/'+lId+'/cards', {
    method: 'POST',
    headers: headers,
    body: JSON.stringify({ "title": messagesubject,
                           "description": messagetext,
                           "authorId": userid,
                           "swimlaneId": swimlaneId
                         })
  }).then((response) => {
    return response.text();
  })
}

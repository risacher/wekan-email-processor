"use strict";
const fs = require('fs');
const fetch = require('node-fetch');

var creds = JSON.parse(fs.readFileSync('creds.json'));
var test_message = JSON.parse(fs.readFileSync('test-message.json'));

var url = creds.url;
var sender = test_message.message.from.value[0].address;
console.log(test_message);

var headers = {
    "Content-Type": "application/json",
};
var status = console.log;
var boards = [];
var boardCache = {};

login().then((rLogin) => {
  return Promise.all([fetchUsers(),
                      fetchBoards(rLogin.id)])
}).then((results) => {
  return fetchBoard(results[1] /*rBoards*/, creds.board);
}).then((rBoard) => {
  return rBoard.lists.find((e) => { return e.title == creds.list;  })
  ._id;
}).then(lId => { console.log (`THE LIST ID ${lId}`); })

function login() {
  delete headers.Authorization;
  status('attempting login with username/password');
  return fetch(url + "users/login", {
    method: 'POST',
    headers: headers, 
    body: JSON.stringify({username: creds.username, password: creds.password })
  }).then((response) => { return response.json(); })
    .then((rLogin) => {
      console.log(rLogin);
      let token=rLogin.token;
      if (token) { status('logged in with username password'); }
      else { status('username/password login failed'); }
      
//      sessionStorage.setItem("wekantoken",token);
      headers.Authorization = "bearer "+rLogin.token;
      let id=rLogin.id;
//      sessionStorage.setItem("wekanid",id);
      console.log(JSON.stringify(rLogin));
      // document.getElementById('log').innerHTML = JSON.stringify(rLogin);
      return rLogin;
    })
};


function fetchBoards(id) {
  status ('fetching list of boards');
  return fetch(url+"api/users/"+id+"/boards", {
    method: 'GET',
    headers: headers
  })
    .then((response) => {
      return response.json(); })
    .then((rBoards) => {
      console.log(rBoards);
      // document.rBoards = rBoards;
      if (rBoards.length) {
        status("found list of "+rBoards.length+" boards available");
        // var s = document.getElementById('board-select');
        // s.innerHTML = "";
        // rBoards.forEach((e,i,a) => {
        //   let o = document.createElement('option');
        //   o.setAttribute('value', e._id);
        //   o.appendChild(document.createTextNode(e.title));
        //   s.appendChild(o);
        // });
        boards = rBoards;
        return rBoards;
      } else {
        status("board list not loaded.  Login?");
        return false;
      }
    })
}

function fetchBoard(rBoards, board) {
  var bId = rBoards.find((e) => { return e.title == board; })._id; 
  status (`fetching lists for board ${board} with id ${bId}`);
  
  return fetch(url+"api/boards/"+bId+"/export", {
    method: 'GET',
    headers: headers
  }).then((response) => {
    // not using .json() to debug Weken returning zero length results
    return response.text(); })
    .then((rBoard) => {
      //console.log(rBoard.length);
      boardCache[bId] = JSON.parse(rBoard);
      console.log(Object.keys(boardCache[bId]));
      console.log(boardCache[bId].users);
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
    console.log('USERS: ', rUsers);
    Promise.all(
      rUsers.map((e,i,a) => {
        return fetch(url+"api/users/"+e._id, {
          method: 'GET',
          headers: headers
        }).then(resp => { return resp.json(); })
          .then((rUser) => {
            console.log('user', rUser);
            return rUser;
          })
      }))
  })
};
  

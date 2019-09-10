const fs = require('fs');
const fetch = require('node-fetch');

var creds = JSON.parse(fs.readFileSync('creds.json'));

var url = creds.url
//console.log(JSON.parse(creds));

var headers = {
    "Content-Type": "application/json",
};
var status = console.log;

login();

function login() {
  delete headers.Authorization;
  status('attempting login with username/password');
  fetch(url + "users/login", {
    method: 'POST',
    headers: headers, 
    body: JSON.stringify({username: creds.username, password: creds.password })
  }).then((response) => { return response.json(); })
    .then((rLogin) => {
      console.log(rLogin);
      token=rLogin.token;
      if (token) { status('logged in with username password'); }
      else { status('username/password login failed'); }
      
//      sessionStorage.setItem("wekantoken",token);
      headers.Authorization = "bearer "+rLogin.token;
      id=rLogin.id;
//      sessionStorage.setItem("wekanid",id);
      console.log(JSON.stringify(rLogin));
      // document.getElementById('log').innerHTML = JSON.stringify(rLogin);
      return rLogin;
    }).then((rLogin) => {
      fetchBoards(rLogin.id, rLogin.token);
    })
  return false;
};


function fetchBoards(id, token) {
  headers.Authorization = "bearer "+token;
  status ('fetching list of boards');
  fetch(url+"api/users/"+id+"/boards", {
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
      } else {
        status("board list not loaded.  Login?");
      }
    })
}

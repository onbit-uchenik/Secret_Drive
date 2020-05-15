const addon = require('./build/Release/addon.node');
const child = require('./child.js');
console.log(addon);
/*
  this function performs 3 tasks :-
  1. creates unique username and password
  2. spilit username and passoword into n shares using shamir secret share scheme.
  3. creates a new user in the server with ftp folder to store data.
*/
function main() {
  const credentials = addon.createUniqueCredentials();
  console.log(credentials);
  const status_ok = addon.getShares(credentials,6,4);
  (status_ok) ? createUser(credentials) : console.log("error while creating shares");
}


/*
  creates a new user in the server with ftp folder to store data.
*/
async function createUser(credentials) {
    try{
      let {stdout,stderr} = await child.run("./createUser.sh",credentials.split(' '));
      console.log("stdout =>");
      console.log(stdout);
      console.log("stderr =>");
      console.log(stderr);
    }
    catch(err) {
      console.log(err);
    }
}


function testing() {
  addon.addTeam("codegeeks",4,3);
  addon.addTeam("magicians",4,3);
  addon.addTeam("coders",2,1);
  addon.addMember("codegeeks","a");
  addon.addMember("codegeeks","b");
  addon.addMember("codegeeks","c");
  addon.addMember("codegeeks","d");
  addon.addMember("coders","d");
  addon.addMember("coders","d");
  addon.addMember("coders","e");
}
//testing();
//main();

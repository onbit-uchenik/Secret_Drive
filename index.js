const addon = require('./build/Release/addon.node');
const child = require('./child.js');
/*
  this function performs 3 tasks :-
  1. creates unique username and password
  2. spilit username and passoword into n shares using shamir secret share scheme.
  3. creates a new user in the server with ftp folder to store data.
*/
function main() {
  const credentials = addon.createUniqueCredentials();
  console.log(credentials);
  const shares = addon.getShares(credentials,3,2);
  console.log(shares);
  let typedarr = new Uint8Array(8);
  typedarr[0] = 34;
  const secret  = addon.getSecret(shares);
  console.log(secret);
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
  console.log(addon.addMember("codegeeks","anubhav"));
  console.log(addon.addMember("codegeeks","anubhav"));
  console.log(addon.addMember("codegeeks","anubhav"));
  console.log(addon.addMember("codegeeks","anubhav"));
  console.log(addon.addMember("codegeeks","anubhav"));
  console.log(addon.addMember("codegeeks","anubhav"));
  console.log(addon.addMember("codegeeks","bhairav"));
  console.log(addon.addMember("codegeeks","bhairav"));
  console.log(addon.addMember("codegeeks","bhairav"));
  console.log(addon.addMember("codegeeks","rajat"));
  console.log(addon.addMember("codegeeks","damru"));
  console.log(addon.addMember("coders","damru"));
  console.log(addon.addMember("coders","rajat"));
  console.log(addon.addMember("coders","eihk"));
}
//testing();
main();

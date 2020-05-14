const addon = require('./build/Release/addon.node');
const child = require('./child.js');


const buffer = addon.getShares();
console.log(buffer);
const shares = new Uint8Array(buffer);
console.log(shares);
const credentials = addon.createUniqueCredentials();
console.log(credentials);

async function createUser(){
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
//createUser();

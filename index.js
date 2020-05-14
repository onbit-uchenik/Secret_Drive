const addon = require('./build/Release/addon.node');
const child = require('./child.js');


const data = addon.getShares();
console.log(data);
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

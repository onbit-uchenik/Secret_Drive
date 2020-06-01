const addon = require('../build/Release/addon.node');
const child=  require('../child');
function main() {
    const credentials = addon.createUniqueCredentials();
    console.log(credentials);
    const n = Math.floor((Math.random() * 99 )) + 2;
    const k = Math.floor((Math.random() * (n-1)))+ 2;
    console.log(n,k);
    const shares = addon.getShares(credentials,n,k);
    let x = credentials.length * 2 * k;
    arr = []
    for(let i =0;i<x;i++) {
        arr.push(shares[i]);
    }
    const kshares = new Uint8Array(arr);
    const secret  = addon.getSecret(kshares,k);
    console.log(secret);
}
//main();


/*
  creates a new user in the server with ftp folder to store data.
*/
async function createUser(credentials) {
    try{
      let {stdout,stderr} = await child.run("../createUser.sh",credentials.split(' '));
      console.log("stdout =>");
      console.log(stdout);
      console.log("stderr =>");
      console.log(stderr);
    }
    catch(err) {
      console.log(err);
    }
}

createUser("bean 1234");

function test() {
  let arr = [1,  73, 1, 138, 1, 220, 1, 224, 1, 196, 1,  35,
    1, 217, 1, 200, 1,  61, 1, 215, 1, 126, 1, 209,
    1,  93, 1,  34, 1,  28, 1, 235, 1, 190, 1,  36,
    1, 138, 1, 131, 2, 115, 2,  92, 2, 252, 2, 144,
    2, 195, 2,  13, 2, 252, 2, 210, 2,  35, 2, 239,
    2, 165, 2, 217, 2,   8, 2,  23, 2, 236, 2, 182,
    2, 251, 2, 156, 2, 231, 2, 105
  ]
    const kshares = new Uint8Array(arr);
    console.log(kshares);
    const secret  = addon.getSecret(kshares,2);
    console.log(secret);
}

//test();
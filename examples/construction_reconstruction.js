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
main();


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

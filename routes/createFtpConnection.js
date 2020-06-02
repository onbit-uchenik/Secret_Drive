const express = require('express');
const routes = express.Router();
const promise = require('bluebird');
const db = promise.promisifyAll(require('../db'));
const addon = require('../build/Release/addon.node');
//const driveHandler = promise.promisifyAll(require('../driveHandler'));

let openedTeam = {};


routes.get('/createFtpConnection',(req,res)=>{
    console.log("opening team drive account");
    let {teamName,members,threshold} = req.query;
    console.log(teamName);
    console.log(members);
    console.log(threshold);

    if(openedTeam[teamName] !== undefined) {
        console.log("team is already opened use the same pipe to send data to the new user");
    }
    else {
        members = members.split(' ');
        let queryString = formQuery(members,teamName);
        console.log(queryString);
        db.queryAsync(queryString)
        .then(function(result){
            let arr = [];
            for(let i=0;i<threshold;i++) {
                result.rows[i].share.forEach((val)=>{
                    arr.push(val);
                })
            }
            const kshares = new Uint8Array(arr);
            console.log(kshares);
            const secret  = addon.getSecret(kshares,parseInt(threshold,10));
            console.log(secret);
            //no need of ftp now.....
            //Idea comes after discussion of aryan and anubhav....
            // driveHandler.returnTreeStructureAsync(secret).then(function(structure){
            //     console.log(structure);
            // })
            // .catch(function(err){
            //     console.log(err);
            // })
            res.statusCode = 200;
            res.end(); 
            
        })
        .catch(function(err){
            console.log(err);
            res.statusCode = 500;
            res.end();
        })
    }
})

function formQuery(members,teamName){
    let queryString = "SELECT share.share FROM link INNER JOIN share on link.shareid=share.id WHERE link.membername IN(";
    for(let i=0;i<members.length-1;i++) {
        temp =  "'"+ `${members[i]}` + "',";
        console.log(temp);
        queryString += temp;
    }
    queryString = queryString.slice(0,queryString.length-1);
    queryString += `) and teamname='${teamName}'`;

    return queryString;
}



module.exports = routes;
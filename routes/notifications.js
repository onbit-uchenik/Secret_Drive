const express = require('express');
const routes = express.Router();
const promise = require('bluebird');
const db = promise.promisifyAll(require('../db'));
const addon = require('../build/Release/addon.node');
const url = require('url');
const fs = require('fs');
const command = require('./command');

var notifications = {};
var teamDriveToOpen = {}
var cnt = 1;

routes.get('/notifications', (req, res) => {
    let user = req.session.passport.user;
    res.setHeader('Content-Type', 'application/json');
    if (notifications[user] === undefined) {
        res.send([]);
        res.end();
    }
    else {
        let result = notifications[user];
        res.send(result);
        delete notifications[user];
        res.end();
    }
    console.log(notifications);
})

function inviteMembers(members, teamName, from) {
    members.forEach((member) => {
        if (notifications[member] === undefined) {
            notifications[member] = [{
                from: from,
                teamName: teamName,
                type: 'joinTeam'
            }]
        }
        else {
            notifications[member].push({
                from: from,
                teamName: teamName,
                type: 'joinTeam'
            })
        }
    });
    delete notifications[' '];
    console.log(notifications);
}


function allMembersJoined(members, teamName) {
    members.forEach((member) => {
        if (notifications[member] === undefined) {
            notifications[member] = [{
                teamName: teamName,
                type: 'allMembersJoined'
            }]
        }
        else {
            notifications[member].push({
                teamName: teamName,
                type: 'allMembersJoined'
            })

        }
    });
    delete notifications[' '];
    console.log(notifications);
}

function openTeam(member, teamName, details) {

    if (notifications[member] === undefined) {
        notifications[member] = [{
            teamName: teamName,
            type: 'openTeam'
        }]
    }
    else {
        notifications[member].push({
            teamName: teamName,
            type: 'openTeam'
        })
    }
    teamDriveToOpen[member] = {
        details: details,
        timestamp: Date.now()
    }
    console.log(notifications);
    console.log(teamDriveToOpen);
}

function askMembers(members, teamName, by) {
    members.forEach((member) => {
        if (notifications[member.membername] === undefined) {
            notifications[member.membername] = [{
                by: by,
                teamName: teamName,
                type: 'allowMember'
            }]
        }
        else {
            notifications[member.membername].push({
                by: by,
                teamName: teamName,
                type: 'allowMember'
            })
        }
    });
    delete notifications[' '];
    console.log(notifications);
}

routes.post('/joinTeam', async (req, res) => {
    let { teamName} = req.body;
    let user = req.session.passport.user;

    let output = addon.addMember(teamName, user, false);

    if (output.error == '') {
        if (output.message === "member added successfully") {
            if (output.allMemberJoined) {
                let members = output.members.split(' ');

                const secret = addon.createUniqueSecret();
                console.log(secret);
                const shares = addon.getShares(secret, output.memberCnt, output.threshold);
                console.log(shares);
                db.queryAsync("INSERT INTO team(name,membercnt,threshold) VALUES($1,$2,$3)", [output.teamName, output.memberCnt, output.threshold])
                    .then(function () {
                        console.log("team added in database");
                    })
                    .catch(function (err) {
                        console.log(err);
                    })

                let x = secret.length * 2;
                let temp = [];
                let j = 0, cnt = 0;

                for (let i = 0; i < output.memberCnt; i++) {
                    temp = [];
                    cnt = 0;
                    while (cnt < x) {
                        temp.push(shares[j]);
                        j++;
                        cnt++;
                    }
                    console.log(`shares of ${members[i]}=>`, temp);
                    db.queryAsync("INSERT INTO share(share) VALUES($1) RETURNING id", [temp])
                        .then(function (result) {
                            let id = result.rows[0].id;
                            console.log("shares added to the database");
                            console.log(id);
                            db.queryAsync("INSERT INTO link(teamname,membername,shareid) VALUES($1,$2,$3)", [output.teamName, members[i], id])
                                .then(function () {
                                    console.log("link table inserted");
                                })
                                .catch(function (err) {
                                    console.log(err);
                                    res.statusCode = 500;
                                    res.end();
                                })
                        })
                        .catch(function (err) {
                            res.statusCode = 500;
                            res.end();
                            console.log(err);
                        });
                }
                //sending notifications to all the members that team is now formed..
                allMembersJoined(members, output.teamName);
                //creating folder...
                fs.mkdir(`/home/onbit-syn/data/${secret}`, { recursive: true }, (err) => {
                    if (err) throw err;
                    console.log("secret location to store data is formed");
                });

                res.statusCode = 200;
                res.end();
            }
            else {
                res.statusCode = 200;
                res.end();
            }
        }
    }
    else {
        res.statusCode = 500;
        res.end();
    }
})




/*
* asks permission from all members to open team drive...
*/
routes.post('/askMembers', (req, res) => {
    let { teamName } = req.body;
    console.log(teamName);
    let by = req.session.passport.user;

    //getting all the members of team from database

    db.queryAsync("SELECT membername FROM link WHERE teamname=$1", [teamName])
        .then(function (result) {
            let members = result.rows;

            //getting complete details of team from database

            db.queryAsync("SELECT membercnt,threshold FROM team WHERE name=$1", [teamName])
                .then(function (result) {
                    let data = result.rows[0];
                    if (addon.addTeam(teamName, data.membercnt, data.threshold, true)) {
                        askMembers(members, teamName, by);
                        res.statusCode = 200;
                        res.end();
                    }
                    else {

                        res.statusCode = 400;
                        res.end();
                    }
                })
                .catch(function (err) {
                    console.log(err);
                    res.statusCode = 500;
                    res.end();
                })
        })
        .catch(function (err) {
            console.log(err);
            res.statusCode = 500;
            res.end();
        })
})

/*
*   allow the specific member for the specific team to open team Drive....
*/
routes.post('/allowMember', (req, res) => {
    let { teamName, by } = req.body;
    let user = req.session.passport.user;
    let output = addon.addMember(teamName, user, true);
    if (output.error == '') {
        if (output.message === "member added successfully") {
            if (output.allMemberJoined) {
                console.log("all member joined successfully for reconstruction");
                openTeam(by, teamName, { teamName: output.teamName, threshold: output.threshold, members: output.members });

                res.statusCode = 200;
                res.end();
            }
            else {
                res.statusCode = 200;
                res.end();
            }
        }
    }
    else {
        res.statusCode = 400;
        res.end();
    }
})

routes.post('/openTeamDrive',(req,res)=>{
    let user = req.session.passport.user;
    if(teamDriveToOpen[user] !== undefined){
        let timestamp = teamDriveToOpen[user].timestamp;
        if(Date.now() - timestamp < 3600000) {
            
            let members = teamDriveToOpen[user].details.members;
            let teamName = teamDriveToOpen[user].details.teamName;
            let threshold = teamDriveToOpen[user].details.threshold;
            
            if(!command.isTeamDriveOpen(teamName)) {
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
                    command.addDriveTodrivesOpen({'teamName' : teamName,'secret':secret.secret,'member':user});
                    delete teamDriveToOpen[user];
                    res.json({result:`${user}@${teamName}:`});
                    res.end();

                })
                .catch(function(err){
                    delete teamDriveToOpen[user];
                    res.statusCode = 500;
                    res.end();
                })
            }
            else {
                console.log("idharrrr......");
                command.addMemberToDriveOpenend({'teamName':teamName,'member':user});
                res.json({result:`${user}@${teamName}:`});
            }
        }
        else{
            res.statusCode = 400;
            res.end();
        }
    }
    else{
        res.statusCode = 400;
        res.end();
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

module.exports = {
    routes: routes,
    inviteMembers: inviteMembers
}


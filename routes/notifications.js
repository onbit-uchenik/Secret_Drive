const express = require('express');
const routes = express.Router();
const promise = require('bluebird');
const db = promise.promisifyAll(require('../db'));
const {hotp,authenticator} = require('otplib');
const secret = authenticator.generateSecret(128);
const addon = require('../build/Release/addon.node');
const url = require('url');

var notifications = {};
var cnt  = 1;

routes.get('/notifications',(req,res)=> {
    let user = req.session.passport.user;
    res.setHeader('Content-Type', 'application/json');
    if(notifications[user] === undefined) {
        res.send([]);
        res.end();
    }
    else{
        let result = notifications[user];
        res.send(result);
        delete notifications[user];
        res.end();
    }
    console.log(notifications);
})

function inviteMembers(members,teamName,from){
    members.forEach((member) => {
        if(notifications[member] === undefined){
            notifications[member] = [{
                token : hotp.generate(secret,cnt) + "-" + cnt.toString(),
                from : from,
                teamName : teamName,
                type: 'joinTeam'
            }]
            cnt++;
        }
        else{
            notifications[member].push({
                token : hotp.generate(secret,cnt) + "-" + cnt.toString(),
                from : from,
                teamName : teamName,
                type: 'joinTeam'    
            })
            cnt++;
        }
    });
    console.log(notifications);
}


function teamCreated(members,teamName) {
    members.forEach((member) => {
        if(notifications[member] === undefined){
            notifications[member] = [{
                token : hotp.generate(secret,cnt) + "-" + cnt.toString(),
                teamName : teamName,
                type: 'teamCreated'
            }]
            cnt++;
        }
        else{
            notifications[member].push({
                token : hotp.generate(secret,cnt) + "-" + cnt.toString(),
                teamName : teamName,
                type: 'teamCreated'    
            })
            cnt++;
        }
    });
    console.log(notifications);
}

function openTeam(member,teamName,details) {
    console.log(details);
    if(notifications[member] === undefined){
        notifications[member] = [{
            token : hotp.generate(secret,cnt) + "-" + cnt.toString(),
            teamName : teamName,
            details:details,
            timestamp : Date.now(),
            type: 'openTeam'
        }]
        cnt++;
    }
    else{
        notifications[member].push({
            token : hotp.generate(secret,cnt) + "-" + cnt.toString(),
            teamName : teamName,
            details:details,
            timestamp : Date(),
            type: 'openTeam'   
        })
        cnt++;
    }
}

function askMembers(members,teamName,by) {
    members.forEach((member) => {
        if(notifications[member.membername] === undefined){
            notifications[member.membername] = [{
                token : hotp.generate(secret,cnt) + "-" + cnt.toString(),
                by : by,
                teamName : teamName,
                type: 'allowMember'
            }]
            cnt++;
        }
        else{
            notifications[member.membername].push({
                token : hotp.generate(secret,cnt) + "-" + cnt.toString(),
                by : by,
                teamName : teamName,
                type: 'allowMember'    
            })
            cnt++;
        }
    });
    console.log(notifications);
}

routes.post('/joinTeam',async (req,res)=>{
    let {teamName,tkn} = req.body;
    let user = req.session.passport.user;
    
    let token  = tkn.split('-')[0];
    let counter = parseInt(tkn.split('-')[1],10);
    console.log(token);
    console.log(cnt);

    let validity = hotp.verify({ token,secret,counter });
    console.log(validity);
    
    if(validity) {
        let output = addon.addMember(teamName,user,false);
        console.log(output);
        if(output.error == ''){
            if(output.message === "member added successfully") {
                if(output.allMemberJoined){
                    let members = output.members.split(' ');
                    
                    const credentials = addon.createUniqueCredentials();
                    console.log(credentials);
                    const shares = addon.getShares(credentials,output.memberCnt,output.threshold);
                    console.log(shares);
                    db.queryAsync("INSERT INTO team(name,membercnt,threshold) VALUES($1,$2,$3)",[output.teamName,output.memberCnt,output.threshold])
                    .then(function(){
                        console.log("team added in database");
                    })
                    .catch(function(err) {
                        console.log(err);
                    })
                    let x = credentials.length * 2;
                    let temp =[];
                    let j=0,cnt=0;
                    
                    for(let i= 0;i<output.memberCnt;i++) {
                        temp=[];
                        cnt=0;
                        while(cnt < x){
                            temp.push(shares[j]);
                            j++;
                            cnt++;
                        }
                        console.log(`shares of ${members[i]}=>`,temp);
                        db.queryAsync("INSERT INTO share(share) VALUES($1) RETURNING id",[temp])
                        .then(function(result){
                            let id  = result.rows[0].id;
                            console.log("shares added to the database");
                            console.log(id);
                            db.queryAsync("INSERT INTO link(teamname,membername,shareid) VALUES($1,$2,$3)",[output.teamName,members[i],id])
                            .then(function(){
                                console.log("link table inserted");
                            })  
                            .catch(function(err){
                                console.log(err);
                            })  
                        })
                        .catch(function(err){
                            console.log(err);
                        });    
                    }
                    teamCreated(members,output.teamName);

                    res.statusCode = 200;
                    res.end();
                }
                else{
                    res.statusCode = 200;
                    res.end();
                }
            }
        }
        else{
            res.statusCode = 500;
            res.end();
        }
    }
    else{
        res.statusCode = 401;
        res.end();
    }

})
/*
* sends notification permission to all the members of the team...
*/
routes.post('/askMembers',(req,res)=>{
    let {teamName} = req.body;
    console.log(teamName);
    let by = req.session.passport.user;
    db.queryAsync("SELECT membername FROM link WHERE teamname=$1",[teamName])
    .then(function(result){
        let members = result.rows;
        //insert the team in the engine..
        db.queryAsync("SELECT membercnt,threshold FROM team WHERE name=$1",[teamName])
        .then(function(result) {
            let data = result.rows[0];
            if(addon.addTeam(teamName,data.membercnt,data.threshold,true)){
                askMembers(members,teamName,by);
                res.statusCode = 200;
                res.end();
            }
            else{
                res.statusCode = 500;
                res.end();   
            }
        })
        .catch(function(err) {
            console.log(err);
            res.statusCode = 500;
            res.end();
        })
        
    })
    .catch(function(err){
        console.log(err);
        res.statusCode = 500;
        res.end();
    })
})


routes.post('/allowMember', (req,res)=>{
    let {teamName,tkn,by} = req.body;
    let user = req.session.passport.user;
    
    let token  = tkn.split('-')[0];
    let counter = parseInt(tkn.split('-')[1],10);
    console.log(token);
    console.log(cnt);

    let validity = hotp.verify({ token,secret,counter });
    console.log(validity);
    
    if(validity) {
        let output = addon.addMember(teamName,user,true);
        console.log(output);
        if(output.error == ''){
            if(output.message === "member added successfully") {
                if(output.allMemberJoined){
                    console.log("all member joined successfully for recinstruction");
                    openTeam(by,teamName,{teamName:output.teamName,threshold:output.threshold,members:output.members});
                    
                    res.statusCode = 200;
                    res.end();
                }
                else{
                    res.statusCode = 200;
                    res.end();
                }
            }
        }
        else{
            res.statusCode = 500;
            res.end();
        }
    }
    else{
        res.statusCode = 401;
        res.end();
    }

})

routes.post('/openMyTeamDrive', (req,res)=>{
    const {tkn,timestamp,teamName,details} = req.body;    
    let token  = tkn.split('-')[0];
    let counter = parseInt(tkn.split('-')[1],10);
    console.log(token);
    console.log(cnt);
    console.log(timestamp);
    let validity = hotp.verify({ token,secret,counter });
    console.log(validity);
    if(validity){
        let diff = Date.now() - timestamp;
        console.log(diff);
        if(diff < 3600000){
            res.redirect(url.format({
                protocol : 'http',
                hostname : 'localhost',
                pathname : '/createFtpConnection',
                port:3456,
                query:{
                    teamName : teamName,
                    members : details.members,
                    threshold : details.threshold,
                    format : 'json'
                }
            }));
        }
        else{
            res.statusCode = 401;
            res.end();
        }
    }
    else {
        res.statusCode = 401;
        res.end();
    }
})

module.exports = {
    routes:routes,
    inviteMembers:inviteMembers 
}


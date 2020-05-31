const express = require('express');
const routes = express.Router();
const promise = require('bluebird');
const {hotp,authenticator} = require('otplib');
const secret = authenticator.generateSecret(128);
const addon = require('../build/Release/addon.node');
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

routes.post('/joinTeam',(req,res)=>{
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
                    members.forEach((member)=>{
                        console.log(member);
                    })
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

module.exports = {
    routes:routes,
    inviteMembers:inviteMembers 
}


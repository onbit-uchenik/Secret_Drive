const express = require('express');
const routes = express.Router();
const promise = require('bluebird');
const db = promise.promisifyAll(require('../db'));
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

module.exports = {
    routes:routes,
    inviteMembers:inviteMembers 
}


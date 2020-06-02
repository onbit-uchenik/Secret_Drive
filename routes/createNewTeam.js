const express = require('express');
const routes = express.Router();
const promise = require('bluebird');
const db  = promise.promisifyAll(require('../db'));
const addon = require('../build/Release/addon.node');
const notifications = require('./notifications');

routes.get('/createNewTeam',(req,res)=>{
    res.render('createTeam')
})

routes.post('/createNewTeam',(req,res)=>{
    let {teamName,memberCnt,threshold,members} = req.body;
    memberCnt = parseInt(memberCnt,10);
    threshold = parseInt(threshold,10);
    let err = null;
    if(err === null && threshold > memberCnt) {
        err = 'threshold members count should always be less than equal to total members';
        res.render('createTeam',{'err':err});
    }
    if(err === null && memberCnt !== members.length){
        err = 'please write names of all the members';
        res.render('createTeam',{'err':err});
    }
    if(err === null) {
        db.queryAsync("SELECT name FROM team WHERE name=$1",[teamName])
        .then(function(result){
            let data = result.rows;
            if(data.length===0){
                let x = "";
                for(let i=1;i<memberCnt;i++) {
                    x += `name=$${i} OR `;
                }
                x += `name=$${memberCnt}`
                db.queryAsync("SELECT name FROM atithi WHERE " + x, members)
                .then(function(result) {
                    let data = result.rows;
                    if(data.length === memberCnt){
                        console.log("Successful :=> All the members exist in database");
                        //send join invitaion links to all the members..
                        //add team for construction of shares.
                        if(addon.addTeam(teamName,memberCnt,threshold,false)){
                            notifications.inviteMembers(members,teamName,req.session.passport.user);
                            req.flash('success_message','team created successfully');
                            res.redirect('/home');                            
                        }   
                        else{
                            err = "team already exist with this team name, kindly choose new Team Name";
                            res.render('createTeam',{'err':err});
                        }                        
                    }   
                    else{
                        let j=0;
                        err = "";
                        console.log(data);
                        console.log(members);
                        for(let i=0;i<data.length;i++) {
                            while(j < members.length && data[i].name !== members[j]) {
                                err += (members[j]) + " ";
                                j++;
                            }
                            j++;
                        }
                        while(j<members.length){
                            err += (members[j]) + " ";
                            j++;
                        }
                        err += "members not yet registered, kindly invite them first";
                        console.log(err);
                        res.render('createTeam',{'err':err});
                    }

                })
                .catch(function(err){
                    console.log(err);
                    res.render('createTeam',{'err':'Internal Server  Error'});
                })
            }
            else{
                err = "team already exist with this team name, kindly choose new Team Name";
                res.render('createTeam',{'err':err});
            }
        })
        .catch(function(err){
            console.log(err);
            err = "internal server error";
            res.render('createTeam',{'err':err});
        })
    }
})


module.exports= routes;
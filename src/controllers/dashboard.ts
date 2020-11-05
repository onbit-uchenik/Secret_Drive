import {Request, Response, NextFunction} from "express";
import {query} from "../db";
import { QueryResult } from "pg";
import addon = require("../../build/Release/addon.node");
import * as notification from  "../config/notifications";
import fs = require("fs");
import logger from "../util/logger";

/**
 * 
 * @param req Request
 * @param res Response
 * GET /account
 */
export const getAccount = (req: Request, res:Response) => {
  const username = req.session.passport.user;
  query("SELECT teamname FROM link WHERE membername=$1",[username])
  .then(function(result:QueryResult){
    const data = result.rows;
    console.log(data);
    res.render("dashboard",{teams:data,user:username});
  })
  .catch(function(err) {
    //logger.debug("error while getting the teamname for user " + username + " " + err);
    res.statusCode = 500;
    res.end();
  });
};

/**
 * 
 * @param req Request
 * @param res Response
 * GET /createnewteam
 */
export const getCreateNewTeam = (req: Request, res: Response) => {
  res.render("create_team");
};
 /**
  * 
  * @param req Request
  * @param res Response
  * POST /createnewteam
  */

export const postCreateNewTeam = (req:Request, res:Response) => {
  const thresholdmembercnt = parseInt(req.body.thresholdmembercnt,10);
  const membercnt = parseInt(req.body.membercnt,10);
  const members = req.body.members;
  const teamname = req.body.teamname;
  
  if(thresholdmembercnt > membercnt ) {
    const err = "threshold members count should always be less than equal to total members";
    res.render("create_team", { err: err });
    return;
  }  

  if(membercnt !== members.length) {
    const err = "please write names of all the members";
    res.render("create_team", { err: err });
    return;
  }

  query("SELECT teamname FROM teams WHERE teamname=$1",[teamname])
    .then(function(result: QueryResult){
      const data = result.rows;
      if (data.length !== 0) {
        const err = "team already exist with this team name, kindly choose new Team Name";
        res.render("create_team", { err: err });
        return;
      }
      let x = "";
      for (let i = 1; i < membercnt; i++) {
          x += `name=$${i} OR `;
      }
      x += `name=$${membercnt}`;
      query("SELECT name FROM atithi WHERE " + x,members)
        .then(function(result:QueryResult){
          const membersIndb = result.rows;
          console.log(membersIndb);
          if(membersIndb.length === membercnt){
            console.log("all members exists");
            if(!addon.addTeam(teamname, membercnt, thresholdmembercnt, "construction")){
              const err = "team already exist with this team name, kindly choose new Team Name";
              res.render("create_team", { err: err });
              return;
            }
            notification.inviteMembersNotification(members,teamname,req.session.passport.user);
            req.flash("success_message", "team created successfully");
            res.redirect("/dashboard");
          } else {
            let j =0;
            let err = "";
            for(let i=0;i<membercnt;i++) {
              while(j < members.length && membersIndb[i].name !== members[j]) {
                err += (members[j]) + " ";
                j++;
              }
              j++;
            }
            while (j < members.length) {
              err += (members[j]) + " ";
              j++;
            }
            err += "members not yet registered, kindly invite them first";
            res.render("create_team",{err:err});
          }
          
        });
      
    });


};


/**
 * 
 * @param req Request
 * @param res Response
 * GET /notifications
 */
export const getNotifications = (req:Request, res: Response) => {
  const username = req.session.passport.user;
  res.statusCode = 200;
  res.json(notification.getNotificationsOfUser(username));
  res.end();
};



/**
 * 
 * @param req Request 
 * @param res Response
 * POST /joinTeam
 */
export const joinTeam = (req: Request, res:Response) => {
  const {teamname}  = req.body;
  const username = req.session.passport.user;
  const output = addon.addMember(teamname,username,"construction");

  console.log(output);

  if(output.error !== "") {
    res.statusCode = 400;
    req.flash("error", "You are not added to team as a member");
    res.redirect("/dashboard");
    return;
  }

  if(output.message !== "member added successfully") {
    res.statusCode = 400;
    req.flash("error",output.message);
    res.redirect("/dashboard");
    return;
  }

  if(!output.allMembersJoined) {
    res.statusCode = 200;
    res.end();
    return;
  }
  // calculating secret.
  const secret = addon.createUniqueSecret();
  console.log(secret);
  
  // calculating shares.
  const shares = addon.getShares(secret,output.membercnt,output.thresholdmembercnt);
  console.log(shares);

  // adding team in the database.
  query("INSERT INTO teams(teamname,thresholdmembercnt,membercnt) VALUES($1,$2,$3)",[output.teamname,output.thresholdmembercnt,output.membercnt])
    .then(function(){
      console.log("team added in database");
      let j = 0;
      const x =  secret.length * 2;
      const sharesEachMember  = [];
      for(let i=0; i<output.membercnt; i++) {
        let temp = [];
        let cnt = 0;
        
        while (cnt < x) {
          temp.push(shares[j]);
          j++;
          cnt++;
        }
        
        console.log(`shares of ${output.members[i]}=>`, temp);
        sharesEachMember.push(temp);
      }
      let iteminserted = 0;
      // addding shares of every member in the database.
      sharesEachMember.forEach((e,index) => {
        query("INSERT INTO shares(share) VALUES($1) RETURNING id",[e])
          .then(function(result: QueryResult){
            const id = result.rows[0].id;
            // adding the shares in link table...
            query("INSERT INTO link(teamname, membername, shareid) VALUES($1,$2,$3)",[output.teamname, output.members[index],id])
              .then(function() {
                iteminserted++;
                console.log("shares inserted in the link table for member",output.members[index]);
                if(iteminserted === output.membercnt) {
                  //send notification and make a new table....
                  notification.teamCreatedNotification(output.members,output.teamname);
                  fs.mkdir(`/home/onbit-syn/data/${secret}`, { recursive: true }, (err) => {
                    if (err) throw err;
                    console.log("secret location to store data is formed");
                    req.flash("success_message", "You are added. All members are joined.  Shamir Team Drive Created successfully");
                    res.redirect("/dashboard");

                  });
                }
              })
              .catch(function(err) {
                iteminserted++;
                console.log("error while inserting in the link table", err);
                req.flash("error", "error generated while creatring team drive");
                res.redirect("/dashboard");
              });
            
          })
          .catch(function(err){
            console.log("error encountered while inserting shares in the database",err);
            req.flash("error", "error occured while creating the drive");
            res.redirect("/dashboard");
          });
      });
      
        
    })
    .catch(function(err){
      console.log(err);
      res.statusCode = 500;
      req.flash("error","error occured while creating the drive");
      res.redirect("/dashboard");
    });
};


/**
 * 
 * @param req Request
 * @param res Response
 * GET /myTeams
 */

export const getMyTeams = (req: Request, res:Response) => {
  const username = req.session.passport.user;
  query("SELECT teamname FROM link WHERE membername=$1",[username])
  .then(function(result:QueryResult){
    const data = result.rows;
    res.statusCode = 200;
    res.json(data);
    res.end();
  })
  .catch(function(err) {
   // logger.debug("error while getting the teamname for user " + username + " " + err);
    res.statusCode = 500;
    res.end();
  });

};
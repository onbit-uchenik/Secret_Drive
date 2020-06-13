import {Request, Response, NextFunction} from "express";
import {query} from "../db";
import { QueryResult } from "pg";
import addon = require("../../build/Release/addon.node");
import * as notification from  "../config/notifications";
import * as drive from "../config/driveGateway";


// import fs = require("fs");
import logger from "../util/logger";

/**
 * 
 * @param req Request
 * @param res Response
 * POST /askfrommembers
 */
export const postAskFromMembers = (req:Request, res:Response) => {
  const teamname = req.body.teamname;
  const initiator = req.session.passport.user;
  query("SELECT membername FROM link WHERE teamname=$1",[teamname])
    .then(function(result:QueryResult){
      const data = result.rows;
      const members  = [];
      data.forEach(e=>{
        members.push(e.membername);
      });
      query("SELECT * FROM teams WHERE teamname=$1",[teamname])
        .then(function(result:QueryResult){
          const data = result.rows[0];
          console.log(data);
          if(!addon.addTeam(data.teamname,data.membercnt,data.thresholdmembercnt,"reconstruction")){
            res.statusCode = 400;
            res.end();
            return;
          }
          notification.askFromMembersNotification(members,teamname,initiator);
          res.statusCode = 200;
          res.end();
        })
        .catch(function(err){
          logger.error(err);
          res.statusCode = 500;
          res.end();
        });
    })
    .catch(function(err){
      logger.error("error while getting members name from database",err);
      res.statusCode = 500;
      res.end();
    });
};


export const postAllowMember = (req:Request, res:Response) => {
  const {drivename, initiator} = req.body;
  const user = req.session.passport.user;
  const output = addon.addMember(drivename,user,"reconstruction");
  if(output.error !== "") {
    res.statusCode = 400;
    res.end();
    return;
  }
  if(output.message !== "member added successfully") {
    res.statusCode = 400;
    res.end();
    return;
  }
  if(!output.allMembersJoined) {
    res.statusCode = 200;
    res.end();
    return;
  }

  console.log("all member joined successfully for reconstruction");
  const currentDrive = new drive.Drive(drivename,output.members,output.thresholdmembercnt,output.membercnt);
  if (!drive.addDriveToDriveToOpen(initiator,currentDrive) ) {
    res.statusCode = 400;
    res.end();
    return;
  } 
  notification.sendDriveOpenNotification(initiator,drivename);
  res.statusCode = 200;
  res.end();
};


export const postOpenDrive = (req:Request, res:Response) => {
  const user = req.session.passport.user;
  const drivename = req.body;

  const driveDetails = drive.canDriveOpen(user);
  
  if(driveDetails === undefined) {
    res.statusCode = 400;
    res.end();
    return;
  }

  if(drive.isDriveAlreadyOpened(drivename,user)) {
    res.statusCode = 200;
    res.json({result:`${user}@${drivename}: `});
    res.end();
    return;
  }

  const queryString = formQuery(driveDetails.members, driveDetails.drivename);
  query(queryString)
    .then(function (result: QueryResult) {
      const arr = [];
      
      for (let i = 0; i < driveDetails.thresholdmembercnt; i++) {
        result.rows[i].share.forEach((val) => {
          arr.push(val);
        });
      }
      const kshares = new Uint8Array(arr);
      console.log(kshares);
      const secret = addon.getSecret(kshares,driveDetails.thresholdmembercnt);
      console.log(secret);
      drive.addOpenDrive(drivename,user);
      res.json({result: `${user}@${drivename}:`});
      res.end();
    })
    .catch(function (err) {
      console.log(err);
      res.statusCode = 500;
      res.end();
    });



};

function formQuery (members:Array<string>, teamname:string) {
  let queryString = "SELECT share.share FROM link INNER JOIN share on link.shareid=share.id WHERE link.membername IN(";
  for (let i = 0; i < members.length; i++) {
    const temp = "'" + `${members[i]}` + "',";
    queryString += temp;
  }
  queryString = queryString.slice(0, queryString.length - 1);
  queryString += `) and teamname='${teamname}'`;

  return queryString;
}

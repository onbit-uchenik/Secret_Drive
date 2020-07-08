import {Request, Response, NextFunction} from "express";
import {query} from "../db";
import { QueryResult } from "pg";
import addon = require("../../build/Release/addon.node");
import * as notification from  "../config/notifications";
import * as drive from "../config/driveGateway";

import * as command from "../controllers/command";

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

/**
 * 
 * @param req Request
 * @param res Response
 * POST /openDrive
 */
export const postOpenDrive = (req:Request, res:Response) => {
  const user = req.session.passport.user;
  const drivename = req.body.drivename;
  console.log(drivename);
  const driveDetails = drive.canDriveOpen(user);
  
  if(driveDetails === undefined) {
    res.statusCode = 400;
    res.end();
    return;
  }

  if(drive.isDriveAlreadyOpened(drivename,user)) {
    console.log("hwfwefwe");
    res.statusCode = 200;
    res.redirect(`/drive/${drivename}/null`);
    return;
  }

  query("SELECT shares.share FROM link INNER JOIN shares ON link.shareid=shares.id WHERE teamname=$1",[driveDetails.drivename])
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
      drive.addOpenDrive(drivename,user,secret.secret);
      res.redirect(`/drive/${drivename}/null`);
    })
    .catch(function (err) {
      console.log(err);
      res.statusCode = 500;
      res.end();
    });
};

export const getOpenDrive = (req, res) => {
  res.render("opendrive",{user:req.session.passport.user});
}; 

export const closeDrive = (req:Request, res: Response) => {
  const user = req.session.passport.user; 
  const drivename = req.body.drivename;
  // the function if opened, closes the drive and return true else return false; 
  if(!drive.closeDrive(drivename,user)) {
    res.statusCode = 400;
    res.end();
    return;
  }
  res.statusCode = 200;
  res.redirect("/thankyou");
};


export const getDrive = (req: Request, res:Response) => {
  const directory = req.params.directory;
  const drivename = req.params.drivename;
  const username = req.session.passport.user;
  console.log(directory);
  console.log(drivename);
  const secret = drive.getSecret(drivename,username);
  if(secret === undefined) {
    res.statusCode =400;
    res.end();
    return;
  }

  command.commandBox["ls"](secret, directory)
   .then(function(result) {
      console.log("directory content",result);
      res.render("drive",{folders:result});  
    })
   .catch(function(err) {
     console.log(err);
     res.statusCode = 500;
     res.end();
   });
};
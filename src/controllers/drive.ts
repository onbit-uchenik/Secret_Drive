import {Request, Response, NextFunction} from "express";
import {query} from "../db";
import { QueryResult } from "pg";
import addon = require("../../build/Release/addon.node");
import * as notification from  "../config/notifications";
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
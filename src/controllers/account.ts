import {Request, Response, NextFunction} from "express";
import {query} from "../db";
import { QueryResult } from "pg";
import addon = require("../../build/Release/addon.node");


/**
 * 
 * @param req Request
 * @param res Response
 * GET /account
 */
export const getAccount = (req: Request, res:Response) => {
  res.render("account",{user:req.user});
};

/**
 * 
 * @param req Request
 * @param res Response
 * GET /createnewteam
 */
export const getCreateNewTeam = (req: Request, res: Response) => {
  res.render("createTeam");
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
    res.render("createTeam", { err: err });
    return;
  }  

  if(membercnt !== members.length) {
    const err = "please write names of all the members";
    res.render("createTeam", { err: err });
    return;
  }

  query("SELECT teamname FROM teams WHERE teamname=$1",[teamname])
    .then(function(result: QueryResult){
      const data = result.rows;
      if (data.length !== 0) {
        const err = "team already exist with this team name, kindly choose new Team Name";
        res.render("createTeam", { err: err });
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
          if(membersIndb.length === membercnt){
            
            if(!addon.addTeam(teamname, membercnt, thresholdmembercnt, "construction")){
              const err = "team already exist with this team name, kindly choose new Team Name";
              res.render("createTeam", { err: err });
              return;
            }

            
          }
          
        });
      
    });


};


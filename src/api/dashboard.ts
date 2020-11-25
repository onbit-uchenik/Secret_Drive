import { Request, Response, NextFunction } from "express";
import { query } from "../db";
import { QueryResult } from "pg";
import addon = require("../../build/Release/addon.node");
import * as notification from "../services/notifications";
import fs = require("fs");
import express = require("express");
import { getTeamsOfMember, Member, Teams, Team, getTeambyTeamName, getMembers } from "../models/memberModel"
import { cat } from "shelljs";
export const router = express.Router();


router
  .get("/", async (req: Request, res: Response) => {
    try {
      const member: Member = req.session.passport.user;
      const teams: Teams = await getTeamsOfMember(member.memberId);
      res.render("dashboard", { teams: teams, user: member.memberName })
    } catch (err) {
      console.log(err);
      res.statusCode = 500;
      res.send("<h1> Internal Server Error </h1>");
    }
  })

  .get("/createnewteam", (req: Request, res: Response) => {
    res.render("create_team");
  })

  .post("/createnewteam", async (req: Request, res: Response) => {
    try {
      const reqMember: Member = req.session.passport.user;
      const teamThreshold = parseInt(req.body.thresholdmembercnt, 10);
      const teamMemberCount = parseInt(req.body.membercnt, 10);
      const members = req.body.members;
      const teamName = req.body.teamname;

      if (teamThreshold > teamMemberCount) {
        res.render("create_team",
          {
            err: "Threshold Member Count should always be less than total members"
          });
        return;
      }

      if (teamMemberCount !== members.length) {
        res.render("create_team", {
          err: "Oops you forget to tell name of all members"
        });
        return;
      }

      const team: Team = await getTeambyTeamName(teamName);
      if (team) {
        res.render("create_team", {
          err: "Team with this team name already exist, please choose another name"
        });
        return;
      }
      const membersIndb = await getMembers(members)
      if (membersIndb.length !== teamMemberCount) {
        res.render("create_team", {
          err: "Unsucessful, Kindly ask all your team members to register at secret drive"
        });
        return;
      }
      if (!addon.addTeam(teamName, teamMemberCount, teamThreshold, "construction")) {
        res.render("create_team", {
          err: "Team with this team name already exist, please choose another name"
        });
        return;
      }
      notification.inviteMembersNotification(members, teamName, reqMember.memberName);
      req.flash("success_message", "team created successfully");
      res.redirect("/dashboard");
    } catch (err) {
      console.log(err);
      res.statusCode = 500;
      res.send("<h1> Internal Server Error </h1>");
    }

  })
  .get("/notifications", (req: Request, res: Response) => {
    const { memberName } = req.session.passport.user;
    res.statusCode = 200;
    res.json(notification.getNotificationsOfUser(memberName));
    res.end();
  })
  .post("/jointeam", (req: Request, res: Response) => {
    const { teamname } = req.body;
    const { memberName } = req.session.passport.user;
    const output = addon.addMember(teamname, memberName, "construction");
    console.log(output);
    if (output.error !== "") {
      res.statusCode = 400;
      req.flash("error", "You are not added to team as a member");
      res.redirect("/dashboard");
      return;
    }

    if (output.message !== "member added successfully") {
      res.statusCode = 400;
      req.flash("error", output.message);
      res.redirect("/dashboard");
      return;
    }

    if(!output.allMembersJoined) {
      res.statusCode = 200;
      res.end();
      return;
    }
    // calculating secret 
    const secret = addon.createUniqueSecret();
    console.log(secret);
    // generating shares
    const shares = addon.getShares(secret, output.membercnt, output.thresholdmembercnt);
    console.log(shares);

    
  })





// /**
//  * 
//  * @param req Request 
//  * @param res Response
//  * POST /joinTeam
//  */
// export const joinTeam = (req: Request, res: Response) => {
//   const { teamname } = req.body;
//   const username = req.session.passport.user;
//   const output = addon.addMember(teamname, username, "construction");

//   console.log(output);

//   if (output.error !== "") {
//     res.statusCode = 400;
//     req.flash("error", "You are not added to team as a member");
//     res.redirect("/dashboard");
//     return;
//   }

//   if (output.message !== "member added successfully") {
//     res.statusCode = 400;
//     req.flash("error", output.message);
//     res.redirect("/dashboard");
//     return;
//   }

//   if (!output.allMembersJoined) {
//     res.statusCode = 200;
//     res.end();
//     return;
//   }
//   // calculating secret.
//   const secret = addon.createUniqueSecret();
//   console.log(secret);

//   // calculating shares.
//   const shares = addon.getShares(secret, output.membercnt, output.thresholdmembercnt);
//   console.log(shares);

//   // adding team in the database.
//   query("INSERT INTO teams(teamname,thresholdmembercnt,membercnt) VALUES($1,$2,$3)", [output.teamname, output.thresholdmembercnt, output.membercnt])
//     .then(function () {
//       console.log("team added in database");
//       let j = 0;
//       const x = secret.length * 2;
//       const sharesEachMember = [];
//       for (let i = 0; i < output.membercnt; i++) {
//         const temp = [];
//         let cnt = 0;

//         while (cnt < x) {
//           temp.push(shares[j]);
//           j++;
//           cnt++;
//         }

//         console.log(`shares of ${output.members[i]}=>`, temp);
//         sharesEachMember.push(temp);
//       }
//       let iteminserted = 0;
//       // addding shares of every member in the database.
//       sharesEachMember.forEach((e, index) => {
//         query("INSERT INTO shares(share) VALUES($1) RETURNING id", [e])
//           .then(function (result: QueryResult) {
//             const id = result.rows[0].id;
//             // adding the shares in link table...
//             query("INSERT INTO link(teamname, membername, shareid) VALUES($1,$2,$3)", [output.teamname, output.members[index], id])
//               .then(function () {
//                 iteminserted++;
//                 console.log("shares inserted in the link table for member", output.members[index]);
//                 if (iteminserted === output.membercnt) {
//                   //send notification and make a new table....
//                   notification.teamCreatedNotification(output.members, output.teamname);
//                   fs.mkdir(`/home/onbit-syn/data/${secret}`, { recursive: true }, (err) => {
//                     if (err) throw err;
//                     console.log("secret location to store data is formed");
//                     req.flash("success_message", "You are added. All members are joined.  Shamir Team Drive Created successfully");
//                     res.redirect("/dashboard");

//                   });
//                 }
//               })
//               .catch(function (err) {
//                 iteminserted++;
//                 console.log("error while inserting in the link table", err);
//                 req.flash("error", "error generated while creatring team drive");
//                 res.redirect("/dashboard");
//               });

//           })
//           .catch(function (err) {
//             console.log("error encountered while inserting shares in the database", err);
//             req.flash("error", "error occured while creating the drive");
//             res.redirect("/dashboard");
//           });
//       });


//     })
//     .catch(function (err) {
//       console.log(err);
//       res.statusCode = 500;
//       req.flash("error", "error occured while creating the drive");
//       res.redirect("/dashboard");
//     });
// };


// /**
//  * 
//  * @param req Request
//  * @param res Response
//  * GET /myTeams
//  */

// export const getMyTeams = (req: Request, res: Response) => {
//   const username = req.session.passport.user;
//   query("SELECT teamname FROM link WHERE membername=$1", [username])
//     .then(function (result: QueryResult) {
//       const data = result.rows;
//       res.statusCode = 200;
//       res.json(data);
//       res.end();
//     })
//     .catch(function (err) {
//       // logger.debug("error while getting the teamname for user " + username + " " + err);
//       res.statusCode = 500;
//       res.end();
//     });

// };
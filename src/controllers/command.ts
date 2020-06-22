import {Request, Response, NextFunction} from "express";
import * as drive from "../config/driveGateway";
import f = require("fs");
const fs = f.promises;

const commandBox = {
  rm: function (command, secret) {
    return new Promise(function (resolve, reject) {
      const flag = command.split(" ")[1];
      let directoryName = null;
      let options = {};
      if (flag[0] === "-") {
        if (flag === "-r") {
          directoryName = command.split(" ")[2];
          options = { recursive: true };
        } else {
          reject(new Error("invalid flags, please try again"));
        }
      } else directoryName = command.split(" ")[1];
      fs.rmdir(`/home/onbit-syn/data/${secret}/${directoryName}`, options)
        .then(function () {
          resolve("sucessfull: directory deleted.");
        })
        .catch(function (err) {
          if (err.code === "EINVAL") reject(new Error("invalid arguments"));
          if (err.code === "ENOENT") reject(new Error("no such file or directory"));
          if (err.code === "EACESS") reject(new Error("permission deniad"));
          if (err.code === "ENOTEMPTY") reject(new Error("directory not empty"));
        });
    });
  },

  mkdir: function (command, secret) {
    return new Promise(function (resolve, reject) {
      const directoryName = command.split(" ")[1];
      fs.mkdir(`/home/onbit-syn/data/${secret}/${directoryName}`)
        .then(function () {
          resolve("sucessfull: directory Creation.");
        })
        .catch(function (err) {
          if (err.code === "EINVAL") reject(new Error("invalid arguments"));
          // if (err.code === 'ENOENT') reject(new Error('no such file or directory'))
          if (err.code === "EACESS") reject(new Error("permission deniad"));
          // if (err.code === 'ENOTEMPTY') reject(new Error('directory not empty'))
        });
    });
  },
  move: function (command, secret) { // can also be used to rename files.
    return new Promise(function (resolve, reject) {
      const sourceDirectory = command.split(" ")[1];
      const destinationDirectory = command.split(" ")[2];
      const fullSource = `/home/onbit-syn/data/${secret}/${sourceDirectory}`;
      const fullDest = `/home/onbit-syn/data/${secret}/${destinationDirectory}`;
      fs.rename(fullSource, fullDest)
        .then(function () {
          resolve("sucessfull: directory move.");
        })
        .catch(function (err) {
          if (err.code === "EINVAL") reject(new Error("invalid arguments"));
          if (err.code === "ENOENT") reject(new Error("no such file or directory"));
          if (err.code === "EACESS") reject(new Error("permission deniad"));
          // if (err.code === 'ENOTEMPTY') reject(new Error('directory not empty'))
        });
    });
  },
  copy: function (command, secret) {
    return new Promise(function (resolve, reject) {
      const sourceFile = command.split(" ")[1];
      const destinationFile = command.split(" ")[2];
      const fullSource = `/home/onbit-syn/data/${secret}/${sourceFile}`;
      const fullDest = `/home/onbit-syn/data/${secret}/${destinationFile}`;
      fs.copyFile(fullSource, fullDest)
        .then(function () {
          resolve("sucessfull: directory copy.");
        })
        .catch(function (err) {
          if (err.code === "EINVAL") reject(new Error("invalid arguments"));
          // if (err.code === 'ENOENT') reject(new Error('no such file or directory'))
          if (err.code === "EACESS") reject(new Error("permission deniad"));
          // if (err.code === 'ENOTEMPTY') reject(new Error('directory not empty'))
        });
    });
  },
  ls: function (command, secret) {
    return new Promise(function (resolve, reject) {
      fs.readdir(`/home/onbit-syn/data/${secret}`)
        .then(function(result) {
          console.log(result);
          resolve(result.toString());
        })
        .catch(function(err){
          console.log(err);
          reject(new Error("invalid argument"));
        });
    });
  }
};


export const command = (req:Request, res:Response) => {
  const user = req.session.passport.user;
  const drivename = req.body.drivename;
  const cmnd = req.body.command;
  const secret = drive.getSecret(drivename,user);
  if(secret === undefined) {
    res.statusCode =400;
    res.end();
    return;
  }
  commandBox[cmnd.split(" ")[0]](cmnd,secret)
    .then(function(result){
      res.statusCode = 200;
      console.log(result);
      res.json({result:result});
      res.end();
    })
    .catch(function(err){
      console.log(err);
      res.statusCode = 500;
      res.end();
    });
};
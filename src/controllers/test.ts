import * as command from "./command";
import f = require("fs");
const fs = f.promises;
import {Request, Response, NextFunction} from "express";

function test(){
  command.commandBox["ls"]("test","null")
    .then(function(result){
      console.log(result);
    })
    .catch(function(err){
      console.log(err);
    });

}
test2();

function test2() {
 fs.writeFile("/home/onbit-syn/data/test/hello.txt","a new file is made")
  .catch(function(err) {
    console.log(err);
  }); 
}

export const upload = (req:Request, res:Response) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send("No files were uploaded.");
  }
  
  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  const file = req.files.sampleFile;
  console.log(file);
  // Use the mv() method to place the file somewhere on your server
  file.mv(`/home/onbit-syn/data/test/${file.name}`, function(err) {
    if (err)
      return res.status(500).send(err);

    res.send("File uploaded!");
  });
};
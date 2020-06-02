const express = require('express');
const routes = express.Router();
const promise = require('bluebird');
const db = promise.promisifyAll(require('../db'));
const addon = require('../build/Release/addon.node');
const url = require('url');
const fs = require('fs');


let drivesOpen={};

function addDriveTodrivesOpen(data){
    let {teamName,secret} = data;
    if(!teamName || !secret) {
        return false;
    }
    else{
        drivesOpen[teamName] = secret;
        console.log(drivesOpen);
    }
}



module.exports= {
    routes : routes,
    addDriveTodrivesOpen : addDriveTodrivesOpen
};
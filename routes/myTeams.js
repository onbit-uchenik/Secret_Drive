const express = require('express');
const routes = express.Router();
const promise = require('bluebird');
const db  = promise.promisifyAll(require('../db'));

routes.get('/myTeams',(req,res)=>{
    db.queryAsync("SELECT teamname FROM link WHERE membername=$1",[req.session.passport.user])
    .then(function(result){
        res.send(result.rows);
        res.end();
    })
    .catch(function(err){
        console.log(err);
        res.statusCode = 500;
        res.end();
    })
});

module.exports = routes;
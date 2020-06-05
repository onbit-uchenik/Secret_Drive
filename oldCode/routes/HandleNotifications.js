const express = require('express')
const routes = express.Router()
const promise = require('bluebird')
const db = promise.promisifyAll(require('../db'))
const addon = require('../build/Release/addon.node')
const fs = require('fs')
const command = require('./command')




routes.get('/notifications', (req, res) => {
  const user = req.session.passport.user
  res.setHeader('Content-Type', 'application/json')
  if (notifications[user] === undefined) {
    res.send([])
    res.end()
  } else {
    const result = notifications[user]
    res.send(result)
    delete notifications[user]
    res.end()
  }
  console.log(notifications)
})

/*
*   allow the specific member for the specific team to open team Drive....
*/


module.exports = routes

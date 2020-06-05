const express = require('express')
const routes = express.Router()
const addon = require('../build/Release/addon.node')
const notifications = require('../lib/notifications')
const drive = require('../lib/drive')

routes.post('/allowMember', (req, res) => {
  const { driveName, initiator } = req.body
  const user = req.session.passport.user
  const output = addon.addMember(driveName, user, true)
  if (output.error === '') {
    if (output.message === 'member added successfully') {
      if (output.allMemberJoined) {
        console.log('all member joined successfully for reconstruction')
        const currentDrive = new drive.Drive(output.teamName, output.members, output.threshold, output.memberCnt)
        drive.addDriveToDriveToOpen(initiator, currentDrive)
        notifications.sendDriveOpenNotification(initiator, currentDrive.driveName)
        res.statusCode = 200
        res.end()
      } else {
        res.statusCode = 200
        res.end()
      }
    }
  } else {
    res.statusCode = 400
    res.end()
  }
})

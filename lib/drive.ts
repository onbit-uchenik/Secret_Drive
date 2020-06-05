const DriveToOpen = {}
const openDrivesList = {}
const HOUR = 60 * 60 * 1000

class Drive {
  driveName: string
  members: Array<string>
  threshold: number
  memberCnt: number
  timestamp: number
  constructor (name: string , members: Array<string>, threshold: number, memberCnt: number) {
    this.driveName = name
    this.members = members
    this.threshold = threshold
    this.memberCnt = memberCnt
    this.timestamp = Date.now()
  }
}

class OpenDrive {
  constructor (driveName, secret, openedByMember) {
    this.driveName = driveName
    this.secret = secret
    this.openedByMembers = [openedByMember]
  }

  addMember (openedByMember) {
    this.openedByMembers.push(openedByMember)
  }
}

function canDriveOpen (requestor, driveName) {
  if (DriveToOpen[requestor] !== undefined) {
    for (let i = 0; i < DriveToOpen[requestor]; i++) {
      if (DriveToOpen[requestor][i].driveName === driveName) {
        if (Date.now() - DriveToOpen[requestor][i].timestamp < HOUR) {
          return DriveToOpen[requestor][i]
        } else {
          delete DriveToOpen[requestor][i]
          return null
        }
      }
    }
    return null
  } else {
    return null
  }
}

function isDriveAlreadyOpened (driveName) {
  if (openDrivesList[driveName] !== undefined) {
    return true
  } else {
    return false
  }
}

function getDriveAlreadyOpened (driveName) {
  return openDrivesList[driveName]
}

function addDriveToDriveToOpen (initiator, currentDrive) {
  if (DriveToOpen[initiator] !== undefined) {
    DriveToOpen[initiator].push(currentDrive)
  } else {
    DriveToOpen[initiator] = [currentDrive]
  }
}

function addOpenedDriveToOpenDriveList (currentOpenedDrive) {
  openDrivesList[currentOpenedDrive.driveName] = currentOpenedDrive
}

function removeDriveFromDriveToOpen(requestor, driveName) {
  for (let i = 0; i < DriveToOpen[requestor]; i++) {
    if (DriveToOpen[requestor][i].driveName === driveName) {
      delete DriveToOpen[requestor][i]
      return
    }
}

module.exports = {
  addDriveToDriveToOpen: addDriveToDriveToOpen,
  canDriveOpen: canDriveOpen,
  Drive: Drive,
  OpenDrive: OpenDrive,
  addOpenedDriveToOpenDriveList: addOpenedDriveToOpenDriveList,
  isDriveAlreadyOpened: isDriveAlreadyOpened,
  removeDriveFromDriveToOpen: removeDriveFromDriveToOpen,
  getDriveAlreadyOpened: getDriveAlreadyOpened
}
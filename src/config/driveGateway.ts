const DriveToOpen = {};
const openDrives = {};
const HOUR = 60 * 60 * 1000;

export class Drive {
  drivename: string
  members: Array<string>
  thresholdmembercnt: number
  membercnt: number
  timestamp: number
  constructor (name: string , members: Array<string>, thresholdmembercnt: number, membercnt: number) {
    this.drivename = name;
    this.members = members;
    this.thresholdmembercnt = thresholdmembercnt;
    this.membercnt = membercnt;
    this.timestamp = Date.now();
  }
}

/**
 * 
 * @param requestor string, the member who requests to open team drive.
 * @param drivename 
 * @return Drive
 * check whether drive can be opened or not.
 */
export const canDriveOpen = function (requestor: string): Drive {
  if (DriveToOpen[requestor] === undefined) {
    return undefined;
  }
  if(Date.now() - DriveToOpen[requestor].timestamp < HOUR) {
   const result = DriveToOpen[requestor];
   delete DriveToOpen[requestor];
   return result;
  }
  else {
    delete DriveToOpen[requestor];
    return undefined;
  }
};

/**
 * 
 * @param initiator string
 * @param currentDrive Drive
 * @return true, if the requestor has not openend any other team drive 
 *    else false, if the requestor has requested for any other team drive.
 */
export const addDriveToDriveToOpen = function (initiator: string, currentDrive:Drive):boolean {
  if (DriveToOpen[initiator] !== undefined) {
    return false;
  } else {
    DriveToOpen[initiator] = currentDrive;
    return true;
  }
};


/**
 * 
 * @param drivename string
 * @param membername string
 * @return boolean if already openend return true else false;
 */
export const isDriveAlreadyOpened =  function (drivename: string , membername: string):boolean {
  if(openDrives[drivename] === undefined) {
    return false;
  }  
  openDrives[drivename].push(membername);
  return true;
};
/**
 * 
 * @param drivename string
 * @param membername string 
 * @return boolean
 */
export const addOpenDrive = function (drivename: string, membername: string): boolean {
  if(openDrives[drivename] !== undefined) {
    return false;
  }
  openDrives[drivename] = [membername];
  return true;
};




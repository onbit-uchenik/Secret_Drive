export interface addMemberResult {
  error:string,
  message?:string,
  allMembersJoined?:string,
  teamname?:string,
  membercnt?:number,
  thresholdmembercnt?:number,
  members?:Array<string>
}

export interface getSecretResult {
  error:string,
  secret?:string
}

export function getShares(secret: string, n: number, k: number):Uint8Array;

export function createUniqueSecret(): string;

export function addMember(teamname:string, membername: string, type: string):addMemberResult;

export function addTeam(teamname: string, membercnt: number, thresholdmembercnt: number, type:string):boolean;

export function getSecret(shares:Uint8Array, thresholdmembercnt:number):getSecretResult;

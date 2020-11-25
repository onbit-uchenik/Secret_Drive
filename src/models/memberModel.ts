import { query } from "../db";

export interface Member {
  memberName: string;
  memberPassword?: string;
  memberEmail: string;
  memberId?: Number;
}

export interface Team {
  teamName: string;
  teamThreshold: Number;
  teamMemberCount: Number;
}

export interface Teams extends Team {
  teams: Array<Team>
}

export const getMemberByEmail = async (memberEmail: String): Promise<Member> => {
  const result = await query(`SELECT member_name as "memberName", member_password as "memberPassword", 
  member_email as "memberEmail", member_id as "memberId" FROM member WHERE member_email=$1`, [memberEmail]);

  const data: any = result.rows.shift();
  if (data) {
    return {
      memberName: data.memberName,
      memberPassword: data.memberPassword,
      memberEmail: data.memberEmail,
      memberId: parseInt(data.memberId, 10)
    };
  } else {
    return null;
  }

};

export const getMemberById = async (memberId: Number): Promise<Member> => {
  
  const result = await query(`SELECT member_name as "memberName", member_email as "memberEmail", 
                              member_id as "memberId" FROM member WHERE member_id = $1`, [memberId]);
  ;
  const data: any = result.rows.shift();
  if (data) {
    return {
      memberName: data.memberName,
      memberEmail: data.memberEmail,
      memberId: data.memberId
    }
  } else {
    return null;
  }
}


export const getTeamsOfMember = async (memberId: Number): Promise<Teams> => {
  const result = await query(`SELECT team.team_name as "teamName", team.team_members_count as "teamMemberCount",
                              team.team_threshold_member_count as "teamThreshold" FROM team INNER JOIN linkTeamMemberShare 
                              ON linkTeamMemberShare.link_team_id = team.team_id WHERE linkTeamMemberShare.link_member_id=$1`, [memberId]);
  if (result.rowCount !== 0) {
    let data: Teams;
    result.rows.forEach((row: any) => {
      data.teams.push({
        teamName: row.teamName,
        teamMemberCount: row.teamMemberCount,
        teamThreshold: row.teamThreshold
      });
    });
    return data;
  } else {
    return null;
  }
};

export const getTeambyTeamName = async (teamName: string): Promise<Team> => {
  const result = await query(`SELECT team_name as "teamName", team_members_count as "teamMemberCount", 
                              team_threshold_member_count as "teamThreshold" FROM team WHERE team_name=$1`, [teamName]);
  const data: any = result.rows.shift();
  if (data) {
    return {
      teamName: data.teamName,
      teamMemberCount: data.teamMemberCount,
      teamThreshold: data.teamThreshold
    }
  } else {
    return null;
  }
}

export const getMembers = async (membersName: Array<string>): Promise<Array<Member>> => {
  membersName = membersName.map((name) => {
    return "'" + name + "'";
  });

  const result = await query(`SELECT member_name as "memberName", member_email as "memberEmail" 
                              FROM member WHERE member_name IN (` + membersName.join(",") + ')');
  if (result.rowCount !== 0) {
    let data :Array<Member> = [];
    result.rows.forEach((row: any) => {
      data.push({
        memberEmail: row.memberEmail,
        memberName: row.memberName 
      });
    });
    return data;
  } else {
    return [];
  }
}


export const insertMember = async (data: Member) => {
  const result = await query("INSERT INTO member(member_name, member_password, member_email) VALUES($1, $2, $3) RETURNING member_id", [data.memberName, data.memberPassword, data.memberEmail]);
  console.log(result.rows);
}

export const addTeam = async (team:Team, members:Array<Member>) => {

}
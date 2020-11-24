import { query } from "../db";

interface member {
  memberName: string;
  memberPassword?: string;
  memberEmail: string;
  memberId?: Number;
}

export const getMemberByEmail = async (memberEmail: String): Promise<member> => {
  const result = await query(`SELECT member_name as "memberName", member_password as "memberPassword", 
  member_email as "memberEmail", member_id as "memberId" FROM member WHERE member_email = $1`, [memberEmail]);

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

export const getMemberById = async (memberId: Number): Promise<member> => {
  const result  = await query(`SELECT member_name as "memberName", member_email as "memberEmail"
                              FROM member WHERE member_id = $1`, [memberId]);
  const data: any = result.rows.shift();
  if(data) {
    return {
      memberName: data.memberName,
      memberEmail: data.memberEmail
    }
  } else {
    return null;
  }
}


export const getMemberOfTeam = async (teamId: Number) => {
};

export const insertMember = async (data: member) => {
  const result = await query("INSERT INTO member(member_name, member_password, member_email) VALUES($1, $2, $3) RETURNING member_id", [data.memberName, data.memberPassword, data.memberEmail]);
  console.log(result.rows);
}
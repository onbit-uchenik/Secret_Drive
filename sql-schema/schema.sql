create table member(
  member_id bigserial primary key,
  member_name varchar(255) not null,
  member_password varchar(255) not null,
  member_email varchar(255) unique not null 
);

create table team(
  team_id bigserial primary key,
  team_name varchar(255) not null,
  team_members_count int not null,
  team_threshold_member_count int not null
);

create table share(
  share_id bigserial primary key,
  share_array integer[] not null
);

create table linkTeamMemberShare(
  link_id bigserial primary key,
  link_member_id bigserial references member(member_id) not null,
  link_team_id bigserial references team(team_id) not null,
  link_share_id bigserial references share(share_id) not null
);
create table user(
  user_id bigserial primary key,
  user_name varchar(255) not null,
  user_password varchar(255) not null,
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

create table link(
  link_id bigserial primary key,
  link_user_id bigserial references user(user_id) not null,
  link_team_id bigserial references team(team_id) not null,
  link_share_id bigserial references share(share_array) not null
);
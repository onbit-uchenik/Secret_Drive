#include <set>
#include <iostream>
#include <map>
#include "./engine.h"

using namespace std;
using namespace engine;

std::map<std::string,team*> mapisjoined;


engine::team::team(std::string* team_name_ptr,int* membercnt_ptr,int* threshold_ptr,bool type) {
   (*this).team_name = team_name_ptr;
   (*this).membercnt = membercnt_ptr;
   (*this).threshold = threshold_ptr;
   (*this).type = type;
   (*this).memberjoined = 0;
}
/*
  Adds member to the engine data structue...
  return true on success and false on failure.
*/


bool engine::addTeam(std::string* team_name_ptr,int* membercnt_ptr,int* threshold_ptr,bool type) {
    if(mapisjoined.find(*team_name_ptr) == mapisjoined.end()) {
        team* temp = new team(team_name_ptr,membercnt_ptr,threshold_ptr,type);
        mapisjoined[*(team_name_ptr)] = temp;
        temp = NULL;
        return true;
    }
    else return false;
}

/*
  Adds member to the engine data structue...
  return pointer to the class team if all the members or threshold members are joined.
*/

engine::value* engine::addMember(std::string* team_name_ptr,std::string* member_name_ptr,bool type) {
  value* x = new value;
  x->message = NULL;
  x->ptr = NULL;
  if(mapisjoined.find(*team_name_ptr) == mapisjoined.end()){
    x->message = new string("team doesnot exist");
    return x;
  } 
  team* ptr = mapisjoined[*team_name_ptr];
  if(ptr->type != type){
    x->message = new string("team not exist as for the desired type");
    return x;
  }
  if( (ptr->members).count(*member_name_ptr) ){
    x->message = new string("member already exist");
    return x;
  } 
  (ptr->members).insert(*member_name_ptr);
  ptr->memberjoined++;
  if(type == 0){
    if(ptr->memberjoined == *(ptr->membercnt)) {
      mapisjoined.erase(*team_name_ptr);
      x->message = new string("member added successfully");
      x->ptr = ptr;
      return x;
    }
  }
  else {
    if(ptr->memberjoined == *(ptr->threshold)) {
      mapisjoined.erase(*team_name_ptr);
      x->message = new string("member added successfully");
      x->ptr = ptr;
      return x;
    }
  }
  x->message = new string("member added successfully");
  return x;
}

/*
  Wrapper to add new team in the engine data structure
  return true on success and false on failure.
*/

Napi::Boolean engine::addTeamWrapper(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    if(info.Length() != 4) {
        return Napi::Boolean::New(env,false);
    }

    string* team_name_ptr = new string(info[0].As<Napi::String>().Utf8Value());
    int* membercnt_ptr = new int(info[1].As<Napi::Number>().Int32Value());
    int* threshold_ptr = new int(info[2].As<Napi::Number>().Int32Value());
    bool type = info[3].As<Napi::Boolean>() ? true : false;
    return Napi::Boolean::New(env,engine::addTeam(team_name_ptr,membercnt_ptr,threshold_ptr,type));
}


/*
  Wrapper to add team member in the engine data structure.
  returns : {
    error: string, describe error message.
    allMemberJoined : boolean, false if not joined true if all joined
    teamName : string
    memberCnt : int
    threshold : int
    members : string 
  }
*/

Napi::Object engine::addMemberWrapper(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  if(info.Length() != 3) {
    Napi::Object x = Napi::Object::New(env);
    x.Set("error","less number of arguments");
    return x;
  }
  string* team_name_ptr = new string(info[0].As<Napi::String>().Utf8Value());
  string* member_name_ptr =  new string(info[1].As<Napi::String>().Utf8Value());
  bool type = info[2].As<Napi::Boolean>()? true : false;
  engine::value* cptr = engine::addMember(team_name_ptr,member_name_ptr,type);
   

  if(cptr->ptr != NULL) {
    team* ptr = cptr->ptr;
    Napi::Object x = Napi::Object::New(env);
    x.Set("error","");
    x.Set("message",*(cptr->message));
    x.Set("allMemberJoined",true);
    x.Set("teamName",*(ptr->team_name));
    x.Set("memberCnt",*(ptr->membercnt));
    x.Set("threshold",*(ptr->threshold));
    string str = "";
    for(string val:ptr->members){
      str += val + ' ';
    }
    Napi::String members = Napi::String::New(env,str);
    x.Set("members",members);
    delete cptr;
    return x;
  }

  Napi::Object x = Napi::Object::New(env);
  x.Set("error","");
  x.Set("message",*(cptr->message));
  x.Set("allMemberJoined",false);
  return x;
}

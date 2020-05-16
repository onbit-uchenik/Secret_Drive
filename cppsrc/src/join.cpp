#include <set>
#include <iostream>
#include <map>
#include "./join.h"

using namespace std;
using namespace join;

std::map<std::string,team*> mapisjoined;

join::team::team(std::string* team_name_ptr,int* membercnt_ptr,int* threshold_ptr) {
   (*this).team_name = team_name_ptr;
   (*this).membercnt = membercnt_ptr;
   (*this).threshold = threshold_ptr;
   (*this).memberjoined = 0;
}


bool join::addTeam(std::string* team_name_ptr,int* membercnt_ptr,int* threshold_ptr) {
   if(mapisjoined.find(*team_name_ptr) == mapisjoined.end()) {
     team* temp = new team(team_name_ptr,membercnt_ptr,threshold_ptr);
     mapisjoined[*(team_name_ptr)] = temp;
     temp = NULL;
     for(auto val:mapisjoined) {
       cout << *(val.second -> team_name) << " ";
     }
     cout << endl;
     return true;
   }
   else return false;
}

team* join::addMember(std::string* team_name_ptr,std::string* member_name_ptr) {
   if(mapisjoined.find(*team_name_ptr) == mapisjoined.end())  return NULL;
   team* ptr = mapisjoined[*team_name_ptr];
   if( (ptr->members).count(*member_name_ptr)) return NULL;
   (ptr->members).insert(*member_name_ptr);
   ptr->memberjoined++;
   if(ptr->memberjoined == *(ptr->membercnt)) {
      mapisjoined.erase(*team_name_ptr);
      return ptr;
   }
   return NULL;
}

Napi::Boolean join::addTeamWrapper(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    if(info.Length() != 3) {
        return Napi::Boolean::New(env,false);
    }

    string* team_name_ptr = new string(info[0].As<Napi::String>().Utf8Value());
    int* membercnt_ptr = new int(info[1].As<Napi::Number>().Int32Value());
    int* threshold_ptr = new int(info[2].As<Napi::Number>().Int32Value());
    return Napi::Boolean::New(env,join::addTeam(team_name_ptr,membercnt_ptr,threshold_ptr));
}

Napi::Object join::addMemberWrapper(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  if(info.Length() != 2) {
    Napi::Object x = Napi::Object::New(env);
    x.Set("error","less number of arguments");
    return x;
  }
  string* team_name_ptr = new string(info[0].As<Napi::String>().Utf8Value());
  string* member_name_ptr =  new string(info[1].As<Napi::String>().Utf8Value());

  team* ptr = join::addMember(team_name_ptr,member_name_ptr);


  if(ptr != NULL) {
    //cout << "added member team is completed" << endl << sizeof(*ptr) << endl;
    Napi::Object x = Napi::Object::New(env);
    x.Set("error","");
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
    delete ptr;
    return x;
  }
// else cout << "added member" << endl;
// for(auto val:mapisjoined) {
//   cout << *(val.second -> team_name) << " ";
// }
// cout << endl;
  Napi::Object x = Napi::Object::New(env);
  x.Set("error","");
  x.Set("allMemberJoined",false);
  return x;
}

#ifndef JOIN
#define JOIN

#include <napi.h>
#include <set>

namespace join {
    class team {
    public:
      int* threshold;
      int* membercnt;
      int  memberjoined;
      std::set<std::string> members;
      std::string* team_name;
      team(std::string* team_name_ptr,int* membercnt_ptr,int* threshold_ptr);
    };
    bool addTeam(std::string* team_name_ptr,int* membercnt_ptr,int* threshold_ptr);
    team* addMember(std::string* team_name,std::string* member_name);
    Napi::Boolean addTeamWrapper(const Napi::CallbackInfo& info);
    Napi::Boolean addMemberWrapper(const Napi::CallbackInfo& info);
}

#endif

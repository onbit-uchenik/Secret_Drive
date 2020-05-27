#ifndef ENGINE
#define ENGINE

#include <napi.h>
#include <set>

namespace engine {
    class team {
    public:
      int* threshold;
      int* membercnt;
      int  memberjoined;
      std::set<std::string> members;
      std::string* team_name;
      team(std::string* team_name_ptr, int* membercnt_ptr, int* threshold_ptr, bool type);
      bool type;
    };
    typedef struct value{
      std::string* message;
      engine::team* ptr;
    }value;

    bool addTeam(std::string* team_name_ptr, int* membercnt_ptr, int* threshold_ptr, bool type);
    engine::value* addMember(std::string* team_name, std::string* member_name, bool type);
    Napi::Boolean addTeamWrapper(const Napi::CallbackInfo& info);
    Napi::Object addMemberWrapper(const Napi::CallbackInfo& info);
}

#endif

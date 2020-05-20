/* cppsrc/main.cpp*/
#include <napi.h>
#include "./src/GF256.h"
#include "./src/shamir.h"
#include "./src/construct.h"
#include "./src/credentials.h"
#include "./src/join.h"
#include "./src/reconstruct.h"

Napi::Object InitAll(Napi::Env env, Napi::Object exports) {
  exports.Set("getShares",Napi::Function::New(env,construct::getSharesWrapped));
  exports.Set("createUniqueCredentials",Napi::Function::New(env,credentials::createUniqueCredentialsWrapper));
  exports.Set("addTeam",Napi::Function::New(env,join::addTeamWrapper));
  exports.Set("addMember",Napi::Function::New(env,join::addMemberWrapper));
  exports.Set("getSecret",Napi::Function::New(env,reconstruct::getSecretWrapped));
  return exports;
}

//macro to define module name and registerfunction as paramater
NODE_API_MODULE(addon, InitAll)

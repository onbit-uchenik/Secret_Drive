/* cppsrc/main.cpp*/
#include <napi.h>
#include "./src/GF256.h"
#include "./src/shamir.h"
#include "./src/construct.h"
#include "./src/credentials.h"
#include "./src/engine.h"
#include "./src/reconstruct.h"

Napi::Object InitAll(Napi::Env env, Napi::Object exports) {
  gen_multipletable();
  exports.Set("getShares",Napi::Function::New(env,construct::getSharesWrapped));
  exports.Set("createUniqueSecret",Napi::Function::New(env,credentials::createUniqueSecretWrapper));
  exports.Set("addTeam",Napi::Function::New(env,engine::addTeamWrapper));
  exports.Set("addMember",Napi::Function::New(env,engine::addMemberWrapper));
  exports.Set("getSecret",Napi::Function::New(env,reconstruct::getSecretWrapped));
  return exports;
}

//macro to define module name and registerfunction as paramater
NODE_API_MODULE(addon, InitAll)

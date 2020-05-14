/* cppsrc/construct.cpp
   creates a new unique password and username and break it into k secrets using the shamir secret share.
*/
#include <napi.h>
#include <iostream>
#include <ctime>
#include <sstream>
#include <random>
#include <vector>
#include "./src/GF256.h"
#include "./src/shamir.h"
using namespace Napi;
using namespace std;
using namespace GF256;
using namespace shamir;




string createUniqueCredentials() {
  long long int t = static_cast<long long int>(std::time(0));
  stringstream s;
  s << t;
  string username = "";
  s >> username;
  username = '_' + username;
  string password="";
  random_device device;
  default_random_engine generator(device());
  uniform_int_distribution<int> distribution(35,125);
  for(int i=0;i<8;i++) {
    password += (char)distribution(generator);
  }
  return username + " " + password;
}


Napi::String createUniqueCredentialsWrapper(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  Napi::String returnValue = Napi::String::New(env, createUniqueCredentials());
  return returnValue;
}



shares* getShares(string secret,int n, int k) {
    gen_multipletable();
    shares* scheme_shares = createShares(secret,n,k);
    for(int i=0;i<n;i++) {
      cout << "shares of pariticipant " << (i+1) << " => " << endl;
      for(auto val:(*scheme_shares)[i]) {
          cout << val.x << " " << val.y << endl;
      }
      cout <<  "_____________________________________________________" << endl;
    }
    return scheme_shares;
}

static Napi::ArrayBuffer getSharesWrapped(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    shares* scheme_shares = getShares("hello",6,4);
    static Napi::ArrayBuffer returnValue =  Napi::ArrayBuffer::New(env, scheme_shares, 60);
    return returnValue;
}



Napi::Object InitAll(Napi::Env env, Napi::Object exports) {
  exports.Set("getShares",Napi::Function::New(env,getSharesWrapped));
  exports.Set("createUniqueCredentials",Napi::Function::New(env,createUniqueCredentialsWrapper));
  return exports;
}

//macro to define module name and registerfunction as paramater
NODE_API_MODULE(addon, InitAll)

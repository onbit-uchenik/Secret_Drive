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
  cout << username << endl;
  string password="";
  random_device device;
  default_random_engine generator;
  uniform_int_distribution<int> distribution(35,125);
  for(int i=0;i<8;i++) {
    password += (char)distribution(generator);
  }
  cout << password << endl;
  return username + " " + password;
}





void connect(int n, int k) {
    cout << "construct connected with javascript" << endl;
    gen_multipletable();
    string secret = createUniqueCredentials();
    shares* scheme_shares = createShares(secret,n,k);
    cout << scheme_shares << endl;
    for(int i=0;i<n;i++) {
      cout << "shares of pariticipant " << (i+1) << " => " << endl;
      for(auto val:(*scheme_shares)[i]) {
          cout << val.x << " " << val.y << endl;
      }
      cout <<  "_____________________________________________________" << endl;

  }

}

Number connectWrapped(const Napi::CallbackInfo& info) {
    Env env = info.Env();
    connect(6,4);
    return Number::New(env,67);
}

Object InitAll(Napi::Env env, Napi::Object exports) {
  exports.Set("connect",Napi::Function::New(env,connectWrapped));
  return exports;
}

//macro to define module name and registerfunction as paramater
NODE_API_MODULE(addon, InitAll)

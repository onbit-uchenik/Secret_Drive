/*cppsrc/src/credentials.cpp
  creates a unique username and password which is used as secret.
*/
#include <napi.h>
#include <iostream>
#include <ctime>
#include <sstream>
#include <random>
#include "./credentials.h"
using namespace std;
using namespace Napi;

/*
  creates a unique random username and password.
*/

string credentials::createUniqueCredentials() {
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
    char ch  = (char)distribution(generator);
    ch == 58 ? ch++ : ch;
    password += ch;
  }
  return username + " " + password;
}


Napi::String credentials::createUniqueCredentialsWrapper(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  Napi::String returnValue = Napi::String::New(env, createUniqueCredentials());
  return returnValue;
}

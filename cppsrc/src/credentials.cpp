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
  string foldername="";
  random_device device;
  default_random_engine generator(device());
  uniform_int_distribution<int> distribution(48,91);
  for(int i=0;i<16;i++) {
    char ch  = (char)distribution(generator);
    ch == 58 ? ch++ : ch;
    foldername += ch;
  }
  return foldername;
}


Napi::String credentials::createUniqueCredentialsWrapper(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  Napi::String returnValue = Napi::String::New(env, createUniqueCredentials());
  return returnValue;
}

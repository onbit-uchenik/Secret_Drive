/* cppsrc/src/construct.cpp
   creates shares for any secret break it into k secrets using the shamir secret share.
*/

#include <napi.h>
#include <iostream>
#include <ctime>
#include <sstream>
#include <vector>
#include "./GF256.h"
#include "./shamir.h"
#include "./reconstruct.h"
using namespace Napi;
using namespace std;
using namespace GF256;
using namespace shamir;


string reconstruct::getSecret(shares* Kshares,int k) {
    string secret = shamir::getSecret(Kshares,k);
    return secret;
}
/*
  wrapper to generate secret...
  returns javascript object => {
    error:
    secret:
  }
*/

Napi::Object reconstruct::getSecretWrapped(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    if(info.Length() != 2) {
      Napi::Object x = Napi::Object::New(env);
      x.Set("error","Expected 2 arguments");
      return x;
    }

    Napi::TypedArray array = info[0].As<Napi::TypedArray>();
    int k = info[1].As<Napi::Number>().Int32Value();

    if(array.TypedArrayType() == napi_uint8_array) {
      Napi::Uint8Array arr = array.As<Napi::Uint8Array>();
      int n = array.ElementLength();
      int m = n/k;
      shares* kshares = new shares(k);
      int x = 0,i=0,cnt=0;
      point temp; 
      while(x < n) {
        if(cnt<m){
          temp.x = arr[x];
          x++;
          temp.y = arr[x];
          x++;          
          (*kshares)[i].push_back(temp);
          cnt += 2; 
        }
        else {
          i++;
          cnt=0;
        }
      }
      Napi::Object ans = Napi::Object::New(env);
      ans.Set("error","");
      ans.Set("secret",reconstruct::getSecret(kshares,k));
      return ans;
    }
    Napi::Object x = Napi::Object::New(env);
    x.Set("error","shares must be in Uint8array()");
    return x;
}

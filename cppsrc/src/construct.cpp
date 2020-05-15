/* cppsrc/src/construct.cpp
   creates shares for any secret break it into k secrets using the shamir secret share.
*/
#include <napi.h>
#include <iostream>
#include <ctime>
#include <sstream>
#include <random>
#include <vector>
#include "./GF256.h"
#include "./shamir.h"
#include "./construct.h"
using namespace Napi;
using namespace std;
using namespace GF256;
using namespace shamir;

/*
  Generates the n shares using shamir algorithm.
*/
shamir::shares* construct::getShares(string secret,int n, int k) {
    gen_multipletable();
    shamir::shares* scheme_shares = createShares(secret,n,k);
    for(int i=0;i<n;i++) {
      cout << "shares of pariticipant " << (i+1) << " => " << endl;
      for(auto val:(*scheme_shares)[i]) {
          cout << val.x << " " << val.y << endl;
      }
      cout <<  "_____________________________________________________" << endl;
    }
    return scheme_shares;
}

/*
  Wrapper around the get shares function.
*/

Napi::Boolean construct::getSharesWrapped(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    if(info.Length() != 3) {
      return Napi::Boolean::New(env,false);
    }
    string secret = info[0].As<Napi::String>().Utf8Value();
    int n = info[1].As<Napi::Number>().Int32Value();
    int k = info[2].As<Napi::Number>().Int32Value();
    cout << secret << " " << n << " " << k << endl;
    shares* newShares = construct::getShares(secret,n,k);
    //pass this to the database abstraction file to store the data in database
    return Napi::Boolean::New(env,true);
}

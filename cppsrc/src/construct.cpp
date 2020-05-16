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
typedef Napi::TypedArrayOf<uint8_t> Uint8Array;
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

Uint8Array construct::getSharesWrapped(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    if(info.Length() != 3) {
      return Uint8Array::New(env,0);
    }
    string secret = info[0].As<Napi::String>().Utf8Value();
    int n = info[1].As<Napi::Number>().Int32Value();
    int k = info[2].As<Napi::Number>().Int32Value();
    cout << secret << " " << n << " " << k << endl;
    shares* newShares = construct::getShares(secret,n,k);
    Uint8Array share =  Uint8Array::New(env,secret.size()*n*2);
    int j=0;
    for(int i=0;i<n;i++) {
      for(auto val:(*newShares)[i]) {
          share[j]  = (val.x).num;
          j++;
          share[j] = (val.y).num;
          j++;
      }
    }
    return share;
}

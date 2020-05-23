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
    gen_multipletable();
    string secret = shamir::getSecret(Kshares,k);
    return secret;
}


Napi::String reconstruct::getSecretWrapped(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    if(info.Length() != 1) {
      Napi::Error::New(info.Env(), "Expected exactly one argument")
      .ThrowAsJavaScriptException();
      Napi::String::New(env,"");

    }
    Napi::TypedArray array = info[0].As<Napi::TypedArray>();
    int k = info[1].As<Napi::Number>().Int32Value();

    if(array.TypedArrayType() == napi_uint8_array) {
      Napi::Uint8Array arr = array.As<Napi::Uint8Array>();
      int m = array.ElementLength();
      cout << m << endl;
    }

    return Napi::String::New(env,"completed");
}

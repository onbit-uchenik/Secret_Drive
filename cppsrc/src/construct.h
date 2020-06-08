#ifndef CONS
#define CONS
#include <napi.h>


namespace construct {
  shamir::shares* getShares(std::string secret,int n, int k);
  Napi::TypedArrayOf<uint8_t> getSharesWrapped(const Napi::CallbackInfo& info);
}

#endif

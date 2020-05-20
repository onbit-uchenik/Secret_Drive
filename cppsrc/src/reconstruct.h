#ifndef RECONS
#define RECONS

namespace reconstruct {
    std::string getSecret(shamir::shares* Kshares,int k);
    Napi::String getSecretWrapped(const Napi::CallbackInfo& info);
}

#endif

#ifndef RECONS
#define RECONS

namespace reconstruct {
    std::string getSecret(shamir::shares* Kshares,int k);
    Napi::Object getSecretWrapped(const Napi::CallbackInfo& info);
}

#endif

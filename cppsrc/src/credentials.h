#ifndef CRE
#define CRE
#include <napi.h>

namespace credentials{
  std::string createUniqueCredentials();
  Napi::String createUniqueCredentialsWrapper(const Napi::CallbackInfo& info);
}

#endif

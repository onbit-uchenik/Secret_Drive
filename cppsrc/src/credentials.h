#ifndef CRE
#define CRE
#include <napi.h>

namespace credentials{
  std::string createUniqueSecret();
  Napi::String createUniqueSecretWrapper(const Napi::CallbackInfo& info);
}

#endif

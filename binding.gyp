{
    "targets": [{
        "target_name": "addon",
        "cflags!": [ "-fno-exceptions" ],
        "cflags_cc!": [ "-fno-exceptions" ],
        "sources": [
             "cppsrc/src/GF256.cpp",
             "cppsrc/src/shamir.cpp",
             "cppsrc/src/construct.cpp",
             "cppsrc/src/credentials.cpp",
             "cppsrc/src/join.cpp",
             "cppsrc/src/reconstruct.cpp",
             "cppsrc/main.cpp"
        ],
        'include_dirs': [
            "<!@(node -p \"require('node-addon-api').include\")"
        ],
        'libraries': [],
        'dependencies': [
            "<!(node -p \"require('node-addon-api').gyp\")"
        ],
        'defines': [ 'NAPI_DISABLE_CPP_EXCEPTIONS' ]
    }]
}

{
  "targets": [{
    "target_name": "addon",
    "sources": ["addon.cc" ],
        'include_dirs': [
          '.',
        ],
    "conditions": [
        ['OS=="linux"', {
          "libraries": [
            "<(module_root_dir)/../native/target/release/libembed.so"
          ]
        }],
        ['OS=="mac"', {
          "libraries": [
            "<(module_root_dir)/../native/target/release/libembed.dylib",
          ],
          'xcode_settings': {
            'GCC_ENABLE_CPP_EXCEPTIONS': 'YES',
            'INSTALL_PATH': '@rpath',
            'LD_DYLIB_INSTALL_NAME': '',
            'OTHER_LDFLAGS': [
              '-Wl,-search_paths_first',
              '-Wl,-rpath,<(module_root_dir)/../native/target/release',
              '-L<(module_root_dir)/../native/target/release'
            ]
          }
        }],
        ['OS=="win"', {
          "libraries": [
            "<(module_root_dir)../native/target/release/embed.dll.lib"
          ]
        }]
    ]
  }]
}
# dlang support for coc

## Install

`:CocInstall coc-dlang`

## CocCommands

| Command                             | Note                                                                                            |
|-------------------------------------|-------------------------------------------------------------------------------------------------|
| `code-d.setupLanguageServer`        | Download serve-d. Will download the executable even if it is overridden in `coc-settings.json`. |
| `code-d.downloadServeD`             | Download latest serve-d release.                                                                |
| `code-d.buildServeDFromRepository`  | Build serve-d from repository.                                                                  |
| `code-d.implementMethods`           | Run serve-d `implementMethods`.                                                                 |
| `code-d.addImport`                  | Run serve-d `addImport`.                                                                        |
| `code-d.ignoreDscannerKey`          | Reserved for future use.                                                                        |
| `code-d.listArchTypes`              | List serve-d archtypes.                                                                         |
| `code-d.listConfigurations`         | List serve-d configurations.                                                                    |
| `code-d.getConfig`                  | Get current serve-d configuration.                                                              |
| `code-d.getBuildType`               | Get current serve-d build type.                                                                 |
| `code-d.getCompiler`                | Get current compiler.                                                                           |
| `code-d.updateImports`              | Run serve-d `updateImports`.                                                                    |
| `code-d.switchCompiler`             | Use a different compiler.                                                                       |
| `code-d.listDependencies`           | List current dependencies.                                                                      |

## License

MIT

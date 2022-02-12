# dlang support for coc

## Install

`:CocInstall coc-dlang`


## CocCommands
```
//setup LanguageServer 
:CocCommand code-d.setupLanguageServer 

//Download pre-release of serve-d 
:CocCommand code-d.downloadPreServeD 

//Download latest stable of serve-d 
:CocCommand code-d.downloadLatestServeD 

//Download latest stable of dcd 
:CocCommand code-d.downloadDCD 

```

## Problem running
```
UnhandledRejection: Launching server "coc-dlang" using command ... served-d failed.

Typically this happens, when you have saved your coc-settings.json and using it on another machine.
The path to served-d will then be incorrect.

To solve:

:CocConfig  
remove d.servedPath
restart nvim

//It will re-create the correct path on startup.



```
## License

MIT

---

> This extension is built with [create-coc-extension](https://github.com/fannheyward/create-coc-extension)

# dlang support for coc

## Install

`:CocInstall coc-dlang`

## Vim bindings 

implement interface or methods
```
nmap <silent> <leader>di :call CocActionAsync('runCommand', 'code-d.implementMethods')<CR>
```
CocCommands
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

## License

MIT

---

> This extension is built with [create-coc-extension](https://github.com/fannheyward/create-coc-extension)

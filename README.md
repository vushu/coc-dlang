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
//Download pre-release of serve-d 
:CocCommand dlang.downloadPreServeD 

//Download latest stable of serve-d 
:CocCommand dlang.downloadLatestServeD 

//Download latest stable of dcd 
:CocCommand dlang.downloadDCD 

```

## License

MIT

---

> This extension is built with [create-coc-extension](https://github.com/fannheyward/create-coc-extension)

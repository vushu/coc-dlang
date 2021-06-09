## Prerequisites

extract all, to example: ~/dlang-ls

add this to your .bashrc

PATH=$PATH:~/dlang-ls/

source .bashrc

# dlang support for coc

## Install

`:CocInstall coc-dlang`

## Command 

implement interface or methods
```
nmap <silent> <leader>di :call CocActionAsync('runCommand', 'code-d.implementMethods')<CR>
```
CocCommands
```
implement interface or methods
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

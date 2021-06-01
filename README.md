## Prerequisites

get serve-d from:  
https://github.com/Pure-D/serve-d/releases  

copy both, to example: ~/dlang-ls

add this to your .bashrc

PATH=$PATH:~/dlang-ls/

source .bashrc

# dlang support for coc

## Install

`:CocInstall coc-dlang`

## Command 

implement interface or methods
```
nmap <silent> <leader>di :call CocActionAsync('runCommand', 'dlang.implementMethods')<CR>
```


## License

MIT

---

> This extension is built with [create-coc-extension](https://github.com/fannheyward/create-coc-extension)

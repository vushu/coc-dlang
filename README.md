# coc-dlang

# Prerequisites

Get
https://github.com/dlang-community/DCD/releases  
dcd-server  
https://github.com/Pure-D/serve-d/releases  
serve-d  

copy both, to example: ~/dlang-ls

add this to your .bashrc

PATH=$PATH:~/dlang-ls/

source .bashrc


dlang support for coc

## Install

`:CocInstall coc-dlang`

## Keymaps

`nmap <silent> <C-l> <Plug>(coc-coc-dlang-keymap)`

## License

MIT

---

> This extension is built with [create-coc-extension](https://github.com/fannheyward/create-coc-extension)

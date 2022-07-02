import {window} from "coc.nvim";
import {exec, ExecException} from 'child_process';

export function chooseInstallation(extensionsFolder: string)
{
  downloadingLatestServeD(extensionsFolder);
}


export function downloadingLatestServeD(toPath: string) {
  let file = 'linux-x86_64';
  //let outputPath = '~/.local/share/code-d/bin/';
  let outputPath = toPath;
  let extract = `tar -xf serve-d*.tar.xz`;
  let cleanup = `rm serve-d*.tar.*`;
  switch (process.platform) {
    case 'win32':
      file = 'windows'
      extract = `unzip serve-d*.zip`;
      break;
    case 'darwin':
      file = 'osx-x86_64'
      break;
    default:
      //Is linux
      break;

  }

  const commando = `curl -s https://api.github.com/repos/Pure-D/serve-d/releases/latest | grep browser_download_url | grep ${file} | cut -d '"' -f 4 | wget -qi - -P ${outputPath} && cd ${outputPath} && ${extract} && ${cleanup}`
  //window.showPrompt('downloading serve-d');
  exec(commando, (err: ExecException | null, stdout: string, stderr: string) => {
    if (stderr)
      window.showErrorMessage(stderr);
    if (stdout)
      window.showInformationMessage(stdout);
    if (err)
      window.showErrorMessage(err.message);
    window.showNotification({content: 'done downloading serve-d, latest stable', timeout: 5000});
  });
}

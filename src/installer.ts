import {window} from "coc.nvim";
import {exec, ExecException} from 'child_process';
import util from "util";
import path from "path";

export async function chooseInstallation(extensionsFolder: string): Promise<string | undefined> {
  return downloadingLatestServeD(extensionsFolder);
}


export async function downloadingLatestServeD(toPath: string): Promise<string | undefined> {
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

  window.showNotification({content: 'serve-d download started', title: "coc-dlang", timeout: 5000});
  const execPromise = util.promisify(exec);
  return execPromise(commando)
    .then(
      ({stderr, stdout}) => {
        if (stderr)
          window.showErrorMessage(stderr);
        if (stdout)
          window.showInformationMessage(stdout);
        window.showNotification({content: 'serve-d download finished', title: "coc-dlang", timeout: 5000});
        return path.join(outputPath, "serve-d");
      }
    ).catch(err =>
      window.showErrorMessage(err.message)
    );
}

import { window } from "coc.nvim";
import { exec, ExecException } from 'child_process';
import util from "util";
import path from "path";

const latestDCDUrl = "https://api.github.com/repos/dlang-community/DCD/releases/latest";
const latestServedUrl = "https://api.github.com/repos/Pure-D/serve-d/releases/latest";

function createDownloadConfig(toPath: string, remoteFilename: string) {
  let file = 'linux-x86_64';
  let outputPath = toPath;
  let extractCommand = `tar -xf ${remoteFilename}*.tar.*`;
  let cleanupCommand = `rm ${remoteFilename}*.tar.*`;

  switch (process.platform) {
    case 'win32':
      file = 'windows-x86_64'
      extractCommand = `unzip ${remoteFilename}*.zip`;
      break;
    case 'darwin':
      file = 'osx-x86_64'
      break;
    default:
      //Is linux
      break;

  }
  return { file, outputPath, extractCommand, cleanupCommand };
}

export async function installLanguageServer(extensionsFolder: string): Promise<string | undefined> {
  await downloadFromGithub("served", latestServedUrl, extensionsFolder);
  // serve-d doesn't download to extensionFolder so we do this manually
  return downloadFromGithub("dcd", latestDCDUrl, extensionsFolder);
}


export async function downloadFromGithub(remoteFileName: string, url: string, toPath: string): Promise<string | undefined> {

  const downloadConfig = createDownloadConfig(toPath, remoteFileName);

  const commando = `curl -s ${url} | grep browser_download_url | grep ${downloadConfig.file} | cut -d '"' -f 4 | wget -qi - -P ${downloadConfig.outputPath} && cd ${downloadConfig.outputPath} && ${downloadConfig.extractCommand} && ${downloadConfig.cleanupCommand}`
  window.showNotification({ content: `${remoteFileName} download started`, title: "coc-dlang", timeout: 5000 });
  const execPromise = util.promisify(exec);
  return execPromise(commando)
    .then(
      ({ stderr, stdout }) => {
        if (stderr)
          window.showErrorMessage(stderr);
        if (stdout)
          window.showInformationMessage(stdout);
        window.showNotification({ content: `${remoteFileName} download finished`, title: "coc-dlang", timeout: 5000 });
        return path.join(downloadConfig.outputPath, remoteFileName);
      }
    ).catch(err =>
      window.showErrorMessage(err.message)
    );
}

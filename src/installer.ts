import { window } from "coc.nvim";
import { exec } from 'child_process';
import util from "util";
import path, { resolve } from "path";

const homedir = require('os').homedir();
const extensionsFolder = path.join(homedir, '.config', 'coc', 'extensions', 'coc-dlang-data');
const latestDCDUrl = "https://api.github.com/repos/dlang-community/DCD/releases/latest";
const latestServedUrl = "https://api.github.com/repos/Pure-D/serve-d/releases/latest";
const serveDSourceCodeUrl = "https://github.com/Pure-D/serve-d/archive/refs/heads/master.zip"
const filename = 'serve-d-master'
const pathToServedBuildFolder = path.join(extensionsFolder, filename);
const pathToServedBuildExecutable = path.join(extensionsFolder, filename, 'serve-d');
// for coc-dlang
const servedDestination = path.join(extensionsFolder, 'serve-d');

function createDownloadConfig(remoteFilename: string) {
  let file = 'linux-x86_64';
  let outputPath = extensionsFolder;
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

export async function installLanguageServer(extensionsFolder: string): Promise<void | undefined> {
  window.showQuickpick(['use latest release', 'build directly from repository'], 'Select serve-d version').then(chosen => {
    if (chosen === 0) {
      downloadDCD();
      downloadServed();

    }
    else {
      // serve-d doesn't download to extensionFolder so we do this manually
      downloadDCD();
      window.withProgress({ cancellable: false, title: 'Building serve-d from repository' }, buildFromRepository);
    }
  });
}


export async function downloadDCD(): Promise<string | undefined> {
  return downloadFromGithub("dcd", latestDCDUrl);
}

export async function downloadServed(): Promise<string | undefined> {
  return downloadFromGithub("serve-d", latestServedUrl);
}

async function downloadFromGithub(remoteFileName: string, url: string): Promise<string | undefined> {

  const downloadConfig = createDownloadConfig(remoteFileName);

  const commando = `curl -s ${url} | grep browser_download_url | grep ${downloadConfig.file} | cut -d '"' -f 4 | wget -qi - -P ${downloadConfig.outputPath} && cd ${downloadConfig.outputPath} && ${downloadConfig.extractCommand} && ${downloadConfig.cleanupCommand}`
  window.showNotification({ content: `${remoteFileName} download started`, title: "coc-dlang", timeout: 1000 });
  const execPromise = util.promisify(exec);
  return execPromise(commando)
    .then(
      ({ stderr, stdout }) => {
        if (stderr)
          window.showErrorMessage(stderr);
        if (stdout)
          window.showInformationMessage(stdout);
        window.showNotification({ content: `${remoteFileName} download finished`, title: "coc-dlang", timeout: 1000 });
        return path.join(downloadConfig.outputPath, remoteFileName);
      }
    ).catch(err =>
      window.showErrorMessage(err.message)
    );
}

export async function buildFromRepository(data): Promise<boolean | undefined> {

  let deleteOldFileIfExists = `rm -f ${pathToServedBuildFolder}.zip`;
  let deleteOldDirectoryIfExists = `rm -rf ${pathToServedBuildFolder}`;
  let cleanupCommand = `rm ${filename}.zip`;
  let extractCommand = `unzip -qq ${filename}.zip`;
  const commando = `${deleteOldFileIfExists} && ${deleteOldDirectoryIfExists} && wget --content-disposition --quiet ${serveDSourceCodeUrl} -P ${extensionsFolder} && cd ${extensionsFolder} && ${extractCommand} && ${cleanupCommand}`;
  // window.showNotification({ content: `Serve-d source code download started`, title: "coc-dlang", timeout: 1000 });
  const execPromise = util.promisify(exec);
  let success = false;

  await execPromise(commando)
    .then(
      () => {
        data.report("Served-d source code download finished");
        success = true;
        return true;
      }
    ).catch(err => {
      window.showErrorMessage(err.message)
    }
    );
  if (success) {
    return buildServed();
  }

  return false;
}

async function buildServed(): Promise<boolean | undefined> {
  const commando = `dub build --root=${pathToServedBuildFolder} --build=release`
  const execPromise = util.promisify(exec);

  window.showNotification({ content: 'This will take a while...', title: "Please wait", timeout: 7000 })
  let success = false;;
  await execPromise(commando)
    .then(
      () => {
        window.showNotification({ content: `Serve-d finished compiling`, title: "", timeout: 1000 });
        success = true;
      }
    );
  if (success) {
    return moveServed();
  }
  return false;
}

async function moveServed(): Promise<boolean | undefined> {

  const commando = `mv ${pathToServedBuildExecutable} ${servedDestination} && rm -rf ${pathToServedBuildFolder}`;
  const execPromise = util.promisify(exec);
  return execPromise(commando).then(() => {
    window.showNotification({ content: 'Sucessfully using serve-d from repository, please restart vim', title: "Completed", timeout: 3000 })
    return true;
  });
  return false;

}

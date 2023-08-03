import { window } from "coc.nvim";
import { exec } from 'child_process';
import util from "util";
import path from "path";

const homedir = require('os').homedir();
const extensionsFolder = path.join(homedir, '.config', 'coc', 'extensions', 'coc-dlang-data');
const latestStableUrl = "https://api.github.com/repos/Pure-D/serve-d/releases/latest";
const latestPrereleaseUrl = "https://api.github.com/repos/Pure-D/serve-d/releases";
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
  window.showQuickpick(['use latest stable release', 'use latest pre-release', 'build directly from repository'], 'Select serve-d version').then(chosen => {
    if (chosen === 0) {
      downloadLatestStable();
    }
    else if (chosen === 1) {
      downloadLatestPrerelease();
    }
    else {
      // serve-d doesn't download to extensionFolder so we do this manually
      window.withProgress({ cancellable: false, title: 'Building serve-d from repository' }, buildFromRepository);
    }
  });
}

export async function downloadLatestPrerelease(): Promise<string | undefined> {
  const downloadConfig = createDownloadConfig("serve-d");
  const commando = `cd ${downloadConfig.outputPath} && curl -s ${latestPrereleaseUrl} | grep browser_download_url | grep ${downloadConfig.file} | cut -d '"' -f 4 |  head -n 1 | xargs curl -sLO && ${downloadConfig.extractCommand} && ${downloadConfig.cleanupCommand}`
  return downloadFromGithub(downloadConfig, commando);
}

export async function downloadLatestStable(): Promise<string | undefined> {

  const downloadConfig = createDownloadConfig("serve-d");
  const commando = `cd ${downloadConfig.outputPath} && curl -s ${latestStableUrl} | grep browser_download_url | grep ${downloadConfig.file} | cut -d '"' -f 4 |  head -n 1 | xargs curl -sLO && ${downloadConfig.extractCommand} && ${downloadConfig.cleanupCommand}`
  return downloadFromGithub(downloadConfig, commando);
}

async function downloadFromGithub(downloadConfig : any, commando : string): Promise<string | undefined> {

  window.showNotification({ content: `serve-d download started`, title: "coc-dlang" });
  const execPromise = util.promisify(exec);
  return execPromise(commando)
  .then(
    ({ stderr, stdout }) => {
      if (stderr)
        window.showErrorMessage(stderr);
      if (stdout)
        window.showInformationMessage(stdout);
      window.showNotification({ content: `serve-d download finished`, title: "coc-dlang" });
      return path.join(downloadConfig.outputPath, "serve-d");
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
  const commando = `${deleteOldFileIfExists} && ${deleteOldDirectoryIfExists} && cd ${extensionsFolder} && curl -sLO ${serveDSourceCodeUrl} && ${extractCommand} && ${cleanupCommand}`;
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

  window.showNotification({ content: 'This will take a while...', title: "Please wait" })
  let success = false;
  await execPromise(commando)
  .then(
    () => {
      window.showNotification({ content: `Serve-d finished compiling`, title: "" });
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
    window.showNotification({ content: 'Successfully using serve-d from repository, please restart vim', title: "Completed" })
    return true;
  });
}

export async function cleanupExtensionFolder(): Promise<boolean | undefined> {
  window.showQuickpick(['No', 'Yes'], 'Delete all in coc-dlang-data?').then(chosen => {
    if (chosen === 0) {
      return;
    }
  });

  const commando = `rm -rf ${extensionsFolder}/*`;
  const execPromise = util.promisify(exec);
  return execPromise(commando).then(() => {
    window.showNotification({ content: 'Successfully deleted all files in coc-dlang-data!', title: "" })
    return true;
  });
}

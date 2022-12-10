import { DialogConfig, WorkspaceConfiguration, TextEdit, window, workspace, ExtensionContext, services, LanguageClient, commands, TextDocument, Position, Thenable, TextDocumentIdentifier, NotificationType, Progress, CancellationToken, Range, ConfigurationChangeEvent, Memento } from 'coc.nvim';
import * as fs from 'fs';
import * as path from 'path';
import * as installer from './installer';
import { registerCommands } from './commands';
import { registerNotifications } from './notifications';


function getPath(config: WorkspaceConfiguration, key: string, defaultPath: string): string | undefined {
  const userPath = config.get<string>(key);
  if (!userPath)
    return defaultPath;

  if (fs.existsSync(userPath)) {
    const stat = fs.statSync(userPath);
    if (stat.isFile() && (stat.mode & 0o010))
      return userPath; // If path exists and is a file and is executable
  }

  window.showErrorMessage(`found user provided ${key}, but no executable was found`);
  return undefined;
}

export async function activate(context: ExtensionContext): Promise<void> {
  const config = workspace.getConfiguration('d');
  const isEnable = config.get<boolean>('enable', true);
  if (!isEnable) {
    return;
  }
  const homedir = require('os').homedir();

  const extensionsFolder = path.join(homedir, '.config', 'coc', 'extensions', 'coc-dlang-data');
  const defaultServedPath = path.join(extensionsFolder, 'serve-d');


  let servedPath = getPath(config, 'servedPath', defaultServedPath);

  // If path was provided by the user, but did not exist, exit
  if (!servedPath)
    return;


  // If path was not provided by the user and does not exist, download executable
  if (!fs.existsSync(servedPath)) {
    await installer.installLanguageServer(extensionsFolder);
  }

  //let args = ["--require", "D", "--lang", 'en', "--provide", "http", "--provide", "context-snippets"];
  //let args = ['--require', 'D'];


  const serverOptions = {
    // servedPath is only undefined if an error occured when downloading
    // If this happened, this error would have been reported to the user already
    command: servedPath!, // run serve-d
    //args: args

    //arguments: [
    //'--require', 'd']
    //'--lang', 'en',
    //'--provide', 'http']
    //'--provide', 'context-snippets']
  };
  const clientOptions = {
    documentSelector: ['d', 'dub.json', 'dub.sdl'], // run serve-d on d files
  };
  const client = new LanguageClient(
    'coc-dlang', // the id
    'serve-d', // the name of the language server
    serverOptions,
    clientOptions,
  );

  client.onReady().then(() => {

    registerNotifications(client);
    //window.showMessage('served-d ready');

  });

  registerCommands(context, client, extensionsFolder)
  context.subscriptions.push(services.registerLanguageClient(client));
}

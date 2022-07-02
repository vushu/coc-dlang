import { DialogConfig, WorkspaceConfiguration, TextEdit, window, workspace, ExtensionContext, services, LanguageClient, commands, TextDocument, Position, Thenable,TextDocumentIdentifier, NotificationType, Progress, CancellationToken, Range, ConfigurationChangeEvent, Memento } from 'coc.nvim';
import * as fs from 'fs';
import * as path from 'path';
import * as installer from './installer';
import { registerCommands } from './commands';
import { registerNotifications } from './notifications';

function getStorageValue(storage: Memento,key:string, defaultValue: string): string {
  let storageValue = storage.get<string>(key, '');
  if (storageValue === '') {
    storage.update(key, defaultValue);
    storageValue = defaultValue;
  }
  return storageValue;

}

export async function activate(context: ExtensionContext): Promise<void> {
  const storage = context.globalState;
  const config = workspace.getConfiguration('d');
  const isEnable = config.get<boolean>('enable', true);
  if (!isEnable) {
    return;
  }
  const homedir = require('os').homedir();

  const extensionsFolder = path.join(homedir, '.config','coc', 'extensions', 'coc-dlang-data');
  const defaultServedPath = path.join(extensionsFolder, 'serve-d');


  let servedPath = getStorageValue(storage, 'servedPath', defaultServedPath);

  if (!fs.existsSync(defaultServedPath)) {
    installer.chooseInstallation(extensionsFolder);
  }

  //let args = ["--require", "D", "--lang", 'en', "--provide", "http", "--provide", "context-snippets"];
  //let args = ['--require', 'D'];


  const serverOptions = {
    command: servedPath, // run serve-d
    //args: args

    //arguments: [
      //'--require', 'd']
      //'--lang', 'en',
      //'--provide', 'http']
      //'--provide', 'context-snippets']
  };
  const clientOptions = {
    documentSelector: ['d','dub.json', 'dub.sdl'], // run serve-d on d files
  };
  const client = new LanguageClient(
    'coc-dlang', // the id
    'serve-d', // the name of the language server
    serverOptions,
    clientOptions,
  );

  client.onReady().then(()=> {

    registerNotifications(client, storage);
    //window.showMessage('served-d ready');

  });

  let onDidChangeConfigurationListener = workspace.onDidChangeConfiguration((e: ConfigurationChangeEvent) => {
    const dcdServerPath = getStorageValue(storage, 'dcdServerPath', path.join(extensionsFolder, 'dcd-server'));
    const dcdClientPath = getStorageValue(storage, 'dcdClientPath', path.join(extensionsFolder, 'dcd-client'));

    const serverPath = path.join(extensionsFolder, 'serve-d');
    client.sendNotification('workspace/didChangeConfiguration', {
      settings: {
        d:{
          servedPath: serverPath,
          dcdClientPath: dcdClientPath,
          dcdServerPath: dcdServerPath
          //hasDubProject: true
        }
      }
    })
  });

  registerCommands(context, client, extensionsFolder)

  context.subscriptions.push(onDidChangeConfigurationListener, services.registLanguageClient(client));

}

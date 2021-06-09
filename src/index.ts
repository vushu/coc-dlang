import { DialogConfig, WorkspaceConfiguration, TextEdit, window, workspace, ExtensionContext, services, LanguageClient, commands, TextDocument, Position, Thenable,TextDocumentIdentifier, NotificationType, Progress, CancellationToken } from 'coc.nvim';
import * as fs from 'fs';
import * as ins from './installer';


interface CodeReplacement
{
  /**
   * Range what to replace. If both indices are the same its inserting.
   *
   * This value is specified as bytes offset from the UTF-8 source.
   */
  range: number;

  /** Content to replace it with. Empty means remove. */
  content: string;
}

interface ImportModification
{
  /** Set if there was already an import which was renamed. (for example import io = std.stdio; would be "io") */
  rename: string;

  /** Array of replacements to add the import to the code */
  replacements: CodeReplacement[];
}

//export function config(resource: string | null): WorkspaceConfiguration {
//return workspace.getConfiguration("d", resource);
//}



function checkFileExistsSync(filepath){
  let flag = true;
  try{
    fs.accessSync(filepath, fs.constants.F_OK);
  }catch(e){
    flag = false;
  }
  return flag;
}

export async function activate(context: ExtensionContext): Promise<void> {
  const config = workspace.getConfiguration('d');
  const isEnable = config.get<boolean>('enable', true);
  if (!isEnable) {
    return;
  }
  const homedir = require('os').homedir();
  const defaultPath = `${homedir}/.local/share/code-d/bin/serve-d`;
  const clientPath = `${homedir}/.local/share/code-d/bin/dcd-client`;
  const serverPath = `${homedir}/.local/share/code-d/bin/dcd-server`;

  if (!fs.existsSync(defaultPath)) {
    //window.showPrompt('serve-d doesn\'t exists please run :CocCommand dlang.downloadingLatestServeD or :CocCommand dlang.downloadPreServeD');
    //window.showInformationMessage('select serve-d version:' );
    window.showQuickpick(['latest', 'pre-release'], 'Select serve-d version').then(chosen => {
      if (chosen === 0) {
        ins.downloadingLatestDCD();
      }
      else {
        ins.downloadingLatestPrereleaseServeD();
      }
    });
    //ins.downloadingLatestPrereleaseServeD();
  }

  //if (!fs.existsSync(serverPath)) {
  //window.showPrompt('dcd doesn\'t exists');
  //ins.downloadingLatestDCD();
  //}


  //config.update('dcdClientPath', clientPath, true);
  //config.update('dcdServerPath', serverPath, true);
  //config.update('updateSetting', '~/.config/coc/coc-dlang-data', true);

  let servedPath = config.get<string>('servedPath', '');
  if (servedPath === '') {
    config.update('servedPath', defaultPath, true);
    servedPath = defaultPath;
  }
  //const dcdServerPath = config.get<string>('dcdServerPath', 'nothing');
  //const dcdClientPath = config.get<string>('dcdClientPath', 'nothing');

  //window.showPrompt(dcdClientPath);
  //window.showPrompt(dcdServerPath);
  //window.showPrompt(servedPath);

  const serverOptions = {
    command: servedPath, // run serve-d
    //args: [
    //'--require', 'D']
    //'--lang', 'en',
    //'--provide', 'http']
    //'--provide', 'implement-snippets',
    //'--provide', 'context-snippets'],
  };
  const clientOptions = {
    documentSelector: ['d'], // run serve-d on d files
  };
  const client = new LanguageClient(
    'coc-dlang', // the id
    'serve-d', // the name of the language server
    serverOptions,
    clientOptions
  );


  workspace.registerKeymap(['n', 'i'], 'dlang-dostuff', async () => {
    await commands.executeCommand('dlang.dostuff');
  });

  const commandIgnoreDscannerKey = commands.registerCommand('code-d.ignoreDscannerKey', async () => {
    window.showPrompt("hello");
  });


  const commandlistArchTypes = commands.registerCommand("code-d.listArchTypes", async () => {
    client.sendRequest<string[]>('served/listArchTypes').then((result) => {
      window.showInformationMessage("serve-d archtypes: " + result.join(","));
    });
  });

  const commandListConfiguration = commands.registerCommand("code-d.listConfigurations", async () => {
    client.sendRequest<string[]>('served/listConfigurations').then((result) => {
      window.showInformationMessage("listConfiguration: " + result.join(","));
    });
  });
  client.onReady().then(()=> {

    //client.initializeResult()
    var workspaceConfiguration = new NotificationType<{ settings: any }, void>("workspace/didChange");
    client.onNotification(workspaceConfiguration, (arg: { settings: any }) => {
      window.showPrompt('hello');
    });

    var updateSetting = new NotificationType<{ section: string, value: any, global: boolean }, void>("coded/updateSetting");
    client.onNotification(updateSetting, (arg: { section: string, value: any, global: boolean }) => {

      window.showPrompt('section: '+ arg.section + ' path: ' + arg.value);
      config.update(arg.section, arg.value, arg.global);
    });


    let notificationLogInstall = new NotificationType<string, void>('coded/logInstall');
    client.onNotification(notificationLogInstall, (message: string ) => {

      window.showNotification({content: message, timeout: 10000});
      //window.showInformationMessage(message);
    });

    window.showMessage('served-d ready');

  });

  const commandDownloadDCD = commands.registerCommand("dlang.downloadDCD", async () => {
    ins.downloadingLatestDCD();
  });

  const commandDownloadServeD = commands.registerCommand("dlang.downloadLatestServeD", async () => {
    ins.downloadingLatestServeD();
  });

  const commandDownloadPrerelease = commands.registerCommand("dlang.downloadPreServeD", async () => {
    ins.downloadingLatestPrereleaseServeD();
  });




  const commandImplementMethods = commands.registerCommand("code-d.implementMethods", async () => {
    const document = await workspace.document;
    const position = await window.getCursorPosition();
    const range = document.getWordRangeAtPosition(position);
    const cursorPos = await window.getCursorScreenPosition();
    const location = document.textDocument.offsetAt(position)
    //const location2 = document.getPosition(cursorPos.row, cursorPos.col);
    //let currentWord = document.textDocument.getText(range);
    let uri = document.uri;


    //window.showPrompt(`Pos char:  ${position.character}, Pos: line ${position.line}, location: ${location} currentWord: ${currentWord}, location2: ${location2.character}, uri: ${uri}`);
    const params = {
      textDocument: {
        uri: uri
      },
      location: location
    };

    client.sendRequest<any>('served/implementMethods', params).then((change: TextEdit[]) => {
      if (!change.length){
        //window.showPrompt('Nothing in the request');
        window.showInformationMessage('Couldn\'t implement methods, clientReady: ' + client.started);
      }
      else{
        document.applyEdits(change);
      }
    });

  });


  const commandAddImport = commands.registerCommand("dlang.addImport", async () => {

    const document = await workspace.document
    const position = await window.getCursorPosition();
    const range = document.getWordRangeAtPosition(position);
    const cursorPos = await window.getCursorScreenPosition();
    const location = document.getOffset(cursorPos.row, cursorPos.col);
    //let currentWord = document.textDocument.getText(range);
    window.showPrompt(`currentCursorPos: ${position.line}, currentLocation: ${location}`);

    if (range && range.start.character < position.character) {
      const word = document.textDocument.getText(range);
      //currentWord = word;
    }

    const params = {
      textDocument: {
        uri: document.uri
      },
      name: 'loadSDL',
      location: position.line
    };

    try {
      client.sendRequest<ImportModification>('served/addImport', params).then((result: ImportModification) => {
        if (result)
        {
          window.showMenuPicker(result.replacements.map(i=> i.content), 'add dependency').then(num => {
            result.replacements[num].range;
            window.moveTo({ line:  0, character:  0});
          });
        }
        else
          window.showPrompt('failed to request');

      });

    } catch (e) {
      window.showPrompt('failed to request');
      /* handle error */
    }
  });


  context.subscriptions.push(commandlistArchTypes,
    commandAddImport,
    commandDownloadServeD,
    commandDownloadDCD,
    commandDownloadPrerelease,
    commandImplementMethods,
    commandIgnoreDscannerKey,
    commandListConfiguration,
    services.registLanguageClient(client));

  //await commands.executeCommand('dlang.dostuff');
}

import { DialogConfig, WorkspaceConfiguration, TextEdit, window, workspace, ExtensionContext, services, LanguageClient, commands, TextDocument, Position, Thenable,TextDocumentIdentifier, NotificationType } from 'coc.nvim';
//import { Range, window, workspace, ExtensionContext, services, LanguageClient, commands, TextDocument, Position, Thenable } from 'vs-code-language-server-protocol';
interface ImplementMethodsParams
{
  /** Text document to look in */
  textDocument: TextDocumentIdentifier;

  /** Location of cursor as standard offset */
  location: number;
}

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

export async function activate(context: ExtensionContext): Promise<void> {
  const config = workspace.getConfiguration('coc-dlang');
  const isEnable = config.get<boolean>('enable', true);
  if (!isEnable) {
    return;
  }
  //config.update('dcdServerPath', '~/.config/coc/extensions/coc-dlang-data/dcd-server', true);
  //config.update('dcdClientPath', '~/.config/coc/extensions/coc-dlang-data/dcd-client', true);

  const serverOptions = {
    command: 'serve-d', // run serve-d
    //args: [
      //'--require', 'D',
      //'--lang', 'en',
      //'--provide', 'http']
    //'--provide', 'implement-snippets',
    //'--provide', 'context-snippets'],
  };
  const clientOptions = {
    documentSelector: ['d'], // run serve-d on d files
  };
  const client = new LanguageClient(
    'dlang', // the id
    //'coc-dlang', // the name of the language server
    'coc-dlang', // the name of the language server
    serverOptions,
    clientOptions
  );

  //let notificationLogInstall = new NotificationType<string, void>('coded/logInstall');
  //client.onNotification(notificationLogInstall, (message: string) => {
  //window.showPrompt(message);
  //});
  //


  workspace.registerKeymap(['n', 'i'], 'dlang-dostuff', async () => {
    await commands.executeCommand('dlang.dostuff');
  });

  const commandIgnoreDscannerKey = commands.registerCommand('code-d.ignoreDscannerKey', async () => {
    window.showPrompt("hello");
  });


  const commandlistArchTypes = commands.registerCommand("dlang.listArchTypes", async () => {
    client.sendRequest<string[]>('served/listArchTypes').then((result) => {
      window.showInformationMessage("serve-d archtypes: " + result.join(","));
    });
  });

  const commandListConfiguration = commands.registerCommand("dlang.listConfigurations", async () => {
    client.sendRequest<string[]>('served/listConfigurations').then((result) => {
      window.showInformationMessage("listConfiguration: " + result.join(","));
    });
  });
  client.onReady().then(()=> {

    //client.initializeResult()
    var workspaceConfiguration = new NotificationType<{ settings: any }, void>("workspace/didChangeConfiguration");
    client.onNotification(workspaceConfiguration, (arg: { settings: any }) => {
      window.showPrompt('hello');
    });

    var updateSetting = new NotificationType<{ section: string, value: any, global: boolean }, void>("coded/updateSetting");
    client.onNotification(updateSetting, (arg: { section: string, value: any, global: boolean }) => {
      //config(null).update(arg.section, arg.value, arg.global);
      /*

      switch(arg.section){
        case 'dcdServerPath':
      //arg.section = 'coc-dlang'
          arg.value = '~/.local/share/code-d/bin/dcd-server'
          arg.global = true;
          break;
        case 'dcdClientPath':
      //arg.section = 'coc-dlang'
          arg.value = '~/.local/share/code-d/bin/dcd-client'
          arg.global = true;
          break;
      }

       */
      //config.update(arg.section, arg.value, arg.global);
      //window.showInformationMessage('section: '+ arg.section + ' path: ' + arg.value);
    });

    /*
    let notificationLogInstall = new NotificationType<string, void>('coded/logInstall');
    client.onNotification(notificationLogInstall, (message: string) => {

      window.showNotification({content: message, timeout: 10000, borderhighlight: 'CocFlating'});
      //window.showInformationMessage(message);
    });
    */

    window.showMessage('served-d ready');

  });

  const commandTest2 = commands.registerCommand("dlang.test2", async () => {
    const document = await workspace.document;
    const configParams = {
      items: [
        {scopeUri: document.uri, section: 'dcdServerPath'}
      ]
    };

    client.sendRequest<any>('workspace/configuration', configParams).then((result: any[]) => {
      window.showMenuPicker(result.map(String.toString));
    });


  });

  const commandTest = commands.registerCommand("dlang.test", async () => {
    const document = await workspace.document;
    const configParams = {
      items: [
        {scopeUri: document.uri, section: 'dcdServerPath'}
      ]
    };

    client.sendRequest<any>('workspace/configuration', configParams).then((result: any[]) => {
      window.showMenuPicker(result.map(String.toString));
    });


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
    commandImplementMethods,
    commandIgnoreDscannerKey,
    commandListConfiguration,
    commandTest,
    services.registLanguageClient(client));

  //await commands.executeCommand('dlang.dostuff');
}

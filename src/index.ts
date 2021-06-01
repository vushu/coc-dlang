import { TextEdit, window, workspace, ExtensionContext, services, LanguageClient, commands, TextDocument, Position, Thenable,TextDocumentIdentifier } from 'coc.nvim';
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

export async function activate(context: ExtensionContext): Promise<void> {
  const config = workspace.getConfiguration('coc-dlang');
  const isEnable = config.get<boolean>('enable', true);
  if (!isEnable) {
    return;
  }

  const serverOptions = {
    command: 'serve-d', // run serve-d
    args: [
      '--require', 'D',
      '--lang', 'en']
      //'--provide', 'http',
      //'--provide', 'implement-snippets',
      //'--provide', 'context-snippets'],
  };
  const clientOptions = {
    documentSelector: ['d'], // run serve-d on d files
  };
  const client = new LanguageClient(
    'dlang', // the id
    'coc-dlang', // the name of the language server
    serverOptions,
    clientOptions
  );

 const commandDownloadDCD = commands.registerCommand('coded/logInstall', async () => {
    window.showPrompt("hello");
  });


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

  const commandImplementMethods = commands.registerCommand("dlang.implementMethods", async () => {
    const document = await workspace.document
    const position = await window.getCursorPosition();
    const range = document.getWordRangeAtPosition(position);
    const cursorPos = await window.getCursorScreenPosition();
    const location = document.textDocument.offsetAt(position)
    const location2 = document.getPosition(cursorPos.row, cursorPos.col);
    let currentWord = document.textDocument.getText(range);
    let uri = document.uri;


    //window.showPrompt(`Pos char:  ${position.character}, Pos: line ${position.line}, location: ${location} currentWord: ${currentWord}, location2: ${location2.character}, uri: ${uri}`);
    const params = {
      textDocument: {
        uri: uri
      },
      location: location
    };

    let clientReady = false;
    client.onReady().then(()=> {
      clientReady = true;
    });

    client.sendRequest<any>('served/implementMethods', params).then((change: TextEdit[]) => {
      if (!change.length){
        //window.showPrompt('Nothing in the request');
        window.showInformationMessage('Couldn\'t implement methods, clientReady: ' + clientReady);
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
    let currentWord = document.textDocument.getText(range);
    window.showPrompt(`currentCursorPos: ${position.line}, currentLocation: ${location}`);

    if (range && range.start.character < position.character) {
      const word = document.textDocument.getText(range);
      currentWord = word;
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
    commandDownloadDCD,
    services.registLanguageClient(client));

  //await commands.executeCommand('dlang.dostuff');
}

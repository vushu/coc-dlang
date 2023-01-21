
import { TextEdit, window, workspace, ExtensionContext, LanguageClient, commands, Range } from 'coc.nvim';
import * as installer from './installer';
import { version } from '../package.json';


const prefix = 'code-d.';

function printImports(change): void {
  for (let i = change.replacements.length - 1; i >= 0; i--) {
    let r = change.replacements[i];
    window.showNotification({ content: 'added: ' + r.content });
  }
}

function notifyText(text): void {
  window.showNotification({ content: text });
}

export function registerCommands(context: ExtensionContext, client: LanguageClient, extensionsFolder: string) {

  const commandSetupLanguageServer = commands.registerCommand(`${prefix}setupLanguageServer`, async () => {
    installer.installLanguageServer(extensionsFolder);
  });

  const commandBuildServedFromSource = commands.registerCommand(`${prefix}buildServeDFromRepository`, async () => {
    window.withProgress({ cancellable: false, title: 'Building serve-d from repository' }, installer.buildFromRepository);
  });

  const commandDownloadStableServeD = commands.registerCommand(`${prefix}downloadStableServeD`, async () => {
    installer.downloadLastestStable();
  });

  const commandDownloadPrereleaseServeD = commands.registerCommand(`${prefix}downloadPrereleaseServeD`, async () => {
    installer.downloadPrereleaseServed();
  });




  const commandImplementMethods = commands.registerCommand(`${prefix}implementMethods`, async (location) => {
    const document = await workspace.document;
    let uri = document.uri;

    const params = {
      textDocument: {
        uri: uri
      },
      location: location
    };

    client.sendRequest<any>('served/implementMethods', params).then((change: TextEdit[]) => {
      if (!change.length) {
        window.showInformationMessage('Couldn\'t implement methods, clientReady: ' + client.started);
      }
      else {
        document.applyEdits(change);
      }
    });

  });

  const commandAddImport = commands.registerCommand(`${prefix}addImport`, async (name, location) => {

    const document = await workspace.document

    if (!name) {
      window.showInformationMessage('Nothing to import');
      return;
    }

    const params = {
      textDocument: {
        uri: document.uri
      },
      name: name,
      location: 0
    };

    try {
      client.sendRequest<any>('served/addImport', params).then((change: any) => {

        //printImports(change);
        if (change.rename)
          return;
        let editations: TextEdit[] = [];

        for (let i = change.replacements.length - 1; i >= 0; i--) {
          let r = change.replacements[i];

          if (r.range[0] === r.range[1]) {
            editations.push(TextEdit.insert(r.range[0], r.content));
          }
          else if (r.content === "") {
            const fromTo: Range = {
              start: r.range[0],
              end: r.range[1]
            }
            editations.push(TextEdit.del(fromTo));
          }
          else {
            const fromTo: Range = {
              start: r.range[0],
              end: r.range[1]
            }
            editations.push(TextEdit.replace(fromTo, r.content));
          }

        }

        if (editations.length > 0)
          document.applyEdits(editations);

      });

    } catch (e) {
      window.showErrorMessage('Failed to request served/addImport');
    }
  });



  const commandIgnoreDscannerKey = commands.registerCommand(`${prefix}ignoreDscannerKey`, async () => {
    notifyText('Not implemented');
  });


  const commandlistArchTypes = commands.registerCommand(`${prefix}listArchTypes`, async () => {
    client.sendRequest<string[]>('served/listArchTypes').then((result) => {
      window.showInformationMessage("serve-d archtypes: " + result.join(","));
    });
  });

  const commandListConfiguration = commands.registerCommand(`${prefix}listConfigurations`, async () => {
    client.sendRequest<string[]>('served/listConfigurations').then((result) => {
      window.showInformationMessage("listConfiguration: " + result.join(","));
    });
  });

  const commandGetConfig = commands.registerCommand(`${prefix}getConfig`, async () => {
    client.sendRequest<string[]>('served/getConfig').then((result) => {
      window.showInformationMessage("getConfig: " + result);
    });
  });

  const commandGetBuildType = commands.registerCommand(`${prefix}getBuildType`, async () => {
    client.sendRequest<string[]>('served/getBuildType').then((result) => {
      window.showInformationMessage("getBuildType: " + result);
    });
  });

  const commandGetCompiler = commands.registerCommand(`${prefix}getCompiler`, async () => {
    client.sendRequest<string[]>('served/getCompiler').then((result) => {
      window.showInformationMessage("getCompiler: " + result);
    });
  });


  const commandUpdateImports = commands.registerCommand(`${prefix}updateImports`, async () => {
    client.sendRequest<boolean>('served/updateImports').then((success: boolean) => {
      window.showInformationMessage(success ? "Successfully updated imports" : 'Failed to update imports');
    });
  });


  const commandSwitchCompiler = commands.registerCommand(`${prefix}switchCompiler`, async () => {
    client.sendRequest<string[]>('served/switchCompiler').then((result) => {
      window.showInformationMessage("switchCompiler: " + result);
    });
  });

  const commandListDependencies = commands.registerCommand(`${prefix}listDependencies`, async () => {
    client.sendRequest<any[]>('served/listDependencies').then((deps: any[]) => {

      deps.forEach((dep: any) => {
        window.showNotification({ content: dep.name + ' path: ' + dep.path })
      })
    });
  });

  const commandShowVersion = commands.registerCommand(`${prefix}showVersion`, async () => {
    window.showInformationMessage("coc-dlang: " + version);
  });


  //Register to extensions context
  context.subscriptions.push(commandIgnoreDscannerKey,
    commandListDependencies,
    commandUpdateImports,
    commandSwitchCompiler,
    commandGetCompiler,
    commandlistArchTypes,
    commandGetBuildType,
    commandGetConfig,
    commandListConfiguration,
    commandAddImport,
    commandImplementMethods,
    commandBuildServedFromSource,
    commandDownloadStableServeD,
    commandDownloadPrereleaseServeD,
    commandSetupLanguageServer,
    commandShowVersion
  );
}

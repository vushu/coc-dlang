import { DialogConfig, WorkspaceConfiguration, TextEdit, window, workspace, ExtensionContext, services, LanguageClient, commands, TextDocument, Position, Thenable, TextDocumentIdentifier, NotificationType, Progress, CancellationToken, Range, ConfigurationChangeEvent, Memento } from 'coc.nvim';
import * as fs from 'fs';
import * as path from 'path';
import * as installer from './installer';
import { registerCommands } from './commands';
import { registerNotifications } from './notifications';

function defaultConfig() {
  return {
    d: {
      stdlibPath: "auto", // can be an array
      dubPath: "dub",
      dmdPath: "dmd",
      enableLinting: true,
      enableSDLLinting: true,
      enableStaticLinting: true,
      enableDubLinting: true,
      enableAutoComplete: true,
      enableFormatting: true,
      enableDMDImportTiming: false,
      enableCoverageDecoration: false, // upstream true, Nova can't
      enableGCProfilerDecorations: false, // upstream true, Nova can't
      neverUseDub: false,
      projectImportPaths: [], // string array
      dubConfiguration: "",
      dubArchType: "",
      dubBuildType: "",
      dubCompiler: "",
      overrideDfmtEditorconfig: true, // we might want to revisit this!
      aggressiveUpdate: false, // differs from default code-d settings on purpose!
      argumentSnippets: false,
      scanAllFolders: true,
      disabledRootGlobs: [], // string array
      extraRoots: [], // string array
      manyProjectsAction: "ask", // see  = ManyProjectsAction.ask;
      manyProjectsThreshold: 6,
      lintOnFileOpen: "project",
      dietContextCompletion: false,
      generateModuleNames: true,
    },
    dfmt: {
      alignSwitchStatements: true,
      braceStyle: "allman",
      outdentAttributes: true,
      spaceAfterCast: true,
      splitOperatorAtLineEnd: false,
      selectiveImportSpace: true,
      compactLabeledStatements: true,
      templateConstraintStyle: "conditional_newline_indent",
      spaceBeforeFunctionParameters: false,
      singleTemplateConstraintIndent: false,
      spaceBeforeAAColon: false,
      keepLineBreaks: true,
      singleIndent: true,
    },
    dscanner: {
      ignoredKeys: [], // string array
    },
    editor: {
      rulers: [], // array of integers
      tabSize: 4, // for now
    },
    git: {
      git: "git", // path
    },
  };
}


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
  let defaultArgs = ["--provide", "context-snippets", "--provide", "default-snippets"];
  let debugArgs = ["--loglevel", "trace", "--logfile", "/tmp/served_log"];



  const serverOptions = {
    // servedPath is only undefined if an error occured when downloading
    // If this happened, this error would have been reported to the user already
    command: servedPath!, // run serve-d
    args: defaultArgs.concat(debugArgs),

  };
  const clientOptions = {

    documentSelector: ['d', 'dub.json', 'dub.sdl'], // run serve-d on d files
    initializationOptions: {
      nonStandardConfiguration: true,
      startupConfiguration: defaultConfig(),
    },


  };

  const client = new LanguageClient(
    'coc-dlang', // the id
    'serve-d', // the name of the language server
    serverOptions,
    clientOptions,
  );

  client.onReady().then(() => {
    registerNotifications(client);
    registerCommands(context, client, extensionsFolder)

    // client.sendNotification("served/didChangeConfiguration", { settings: defaultConfig() });

    // client.sendRequest("served/getInfo").then((status: any) => {
    //   window.showNotification({ content: 'Serve-d version: ' + status?.serverInfo?.version });
    // })
  });

  context.subscriptions.push(services.registerLanguageClient(client));
}

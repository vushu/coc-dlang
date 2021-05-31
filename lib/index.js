var __create = Object.create;
var __defProp = Object.defineProperty;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __markAsModule = (target) => __defProp(target, "__esModule", {value: true});
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, {get: all[name], enumerable: true});
};
var __exportStar = (target, module2, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && key !== "default")
        __defProp(target, key, {get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable});
  }
  return target;
};
var __toModule = (module2) => {
  return __exportStar(__markAsModule(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", module2 && module2.__esModule && "default" in module2 ? {get: () => module2.default, enumerable: true} : {value: module2, enumerable: true})), module2);
};

// src/index.ts
__markAsModule(exports);
__export(exports, {
  activate: () => activate
});
var import_coc = __toModule(require("coc.nvim"));
async function activate(context) {
  const config = import_coc.workspace.getConfiguration("coc-dlang");
  const isEnable = config.get("enable", true);
  if (!isEnable) {
    return;
  }
  const serverOptions = {
    command: "serve-d",
    args: [
      "--require",
      "D",
      "--lang",
      "en",
      "--provide",
      "http",
      "--provide",
      "implement-snippets",
      "--provide",
      "context-snippets"
    ]
  };
  const clientOptions = {
    documentSelector: ["d"]
  };
  const client = new import_coc.LanguageClient("dlang", "coc-dlang", serverOptions, clientOptions);
  import_coc.workspace.registerKeymap(["n", "i"], "dlang-dostuff", async () => {
    await import_coc.commands.executeCommand("dlang.dostuff");
  });
  const commandIgnoreDscannerKey = import_coc.commands.registerCommand("code-d.ignoreDscannerKey", async () => {
    import_coc.window.showPrompt("hello");
  });
  const commandlistArchTypes = import_coc.commands.registerCommand("dlang.listArchTypes", async () => {
    client.sendRequest("served/listArchTypes").then((result) => {
      import_coc.window.showInformationMessage("serve-d archtypes: " + result.join(","));
    });
  });
  const commandListConfiguration = import_coc.commands.registerCommand("dlang.listConfigurations", async () => {
    client.sendRequest("served/listConfigurations").then((result) => {
      import_coc.window.showInformationMessage("listConfiguration: " + result.join(","));
    });
  });
  const commandImplementMethods = import_coc.commands.registerCommand("dlang.implementMethods", async () => {
    const document = await import_coc.workspace.document;
    const position = await import_coc.window.getCursorPosition();
    const range = document.getWordRangeAtPosition(position);
    const cursorPos = await import_coc.window.getCursorScreenPosition();
    const location = document.textDocument.offsetAt(position);
    const location2 = document.getPosition(cursorPos.row, cursorPos.col);
    let currentWord = document.textDocument.getText(range);
    let uri = document.uri;
    const params = {
      textDocument: {
        uri
      },
      location
    };
    client.sendRequest("served/implementMethods", params).then((change) => {
      if (!change.length) {
        import_coc.window.showInformationMessage("failed to request client started: " + client.started);
      } else {
        let startPos = change[0].range.start;
        let start = document.getPosition(startPos.line, startPos.character);
        change.forEach((c) => {
          c.newText = c.newText.replace(/(?:\${\d})/g, `throw new Exception("Not yet implemented")`);
        });
        document.applyEdits(change);
      }
    });
  });
  const commandAddImport = import_coc.commands.registerCommand("dlang.addImport", async () => {
    const document = await import_coc.workspace.document;
    const position = await import_coc.window.getCursorPosition();
    const range = document.getWordRangeAtPosition(position);
    const cursorPos = await import_coc.window.getCursorScreenPosition();
    const location = document.getOffset(cursorPos.row, cursorPos.col);
    let currentWord = document.textDocument.getText(range);
    import_coc.window.showPrompt(`currentCursorPos: ${position.line}, currentLocation: ${location}`);
    if (range && range.start.character < position.character) {
      const word = document.textDocument.getText(range);
      currentWord = word;
    }
    const params = {
      textDocument: {
        uri: document.uri
      },
      name: "loadSDL",
      location: position.line
    };
    try {
      client.sendRequest("served/addImport", params).then((result) => {
        if (result) {
          import_coc.window.showMenuPicker(result.replacements.map((i) => i.content), "add dependency").then((num) => {
            result.replacements[num].range;
            import_coc.window.moveTo({line: 0, character: 0});
          });
        } else
          import_coc.window.showPrompt("failed to request");
      });
    } catch (e) {
      import_coc.window.showPrompt("failed to request");
    }
  });
  context.subscriptions.push(commandlistArchTypes, commandAddImport, commandImplementMethods, commandIgnoreDscannerKey, commandListConfiguration, import_coc.services.registLanguageClient(client));
}

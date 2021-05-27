import { workspace, ExtensionContext, services, LanguageClient } from 'coc.nvim';

export async function activate(context: ExtensionContext): Promise<void> {
  const config = workspace.getConfiguration('coc-dlang');
  const isEnable = config.get<boolean>('enable', true);
  if (!isEnable) {
    return;
  }
  const serverOptions = {
    command: 'serve-d', // run serve-d
  };
  const clientOptions = {
    documentSelector: ['d'], // run serve-d on d files
    rootPatterns: ['dub.json', 'dub.sdl'],
  };
  const client = new LanguageClient(
    'coc-dlang', // the id
    'coc-dlang', // the name of the language server
    serverOptions,
    clientOptions
  );
  context.subscriptions.push(services.registLanguageClient(client));
}

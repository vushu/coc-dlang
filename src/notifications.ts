import { Memento, LanguageClient, NotificationType, window, workspace, commands } from 'coc.nvim';
export function registerNotifications(client: LanguageClient) {

  var workspaceConfiguration = new NotificationType<{ settings: any }>("workspace/didChange");
  client.onNotification(workspaceConfiguration, (arg: { settings: any }) => {
    window.showPrompt('didChange says hello');
  });

  let notificationLogInstall = new NotificationType<string>('coded/logInstall');
  client.onNotification(notificationLogInstall, (message: string) => {

    window.showNotification({ content: message });
  });

  let notificationUpdateImports = new NotificationType<any>('coded/updateDubTree');
  client.onNotification(notificationUpdateImports, (success: any) => {
    window.showNotification({ content: 'Dub Tree updated' });
  });


  let notificationInitDubTree = new NotificationType<any>('coded/initDubTree');
  client.onNotification(notificationInitDubTree, () => {
    window.showInformationMessage('serve-d is ready');
  });


}

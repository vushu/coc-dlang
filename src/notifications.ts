import { WorkspaceConfiguration, LanguageClient, NotificationType, window, workspace, commands } from 'coc.nvim';
export function registerNotifications(client: LanguageClient, config: WorkspaceConfiguration) {

  var workspaceConfiguration = new NotificationType<{ settings: any }, void>("workspace/didChange");
  client.onNotification(workspaceConfiguration, (arg: { settings: any }) => {
    window.showPrompt('didChange says hello');
  });

  var updateSetting = new NotificationType<{ section: string, value: any, global: boolean }, void>("coded/updateSetting");
  client.onNotification(updateSetting, (arg: { section: string, value: any, global: boolean }) => {

    //window.showPrompt('section: '+ arg.section + ' path: ' + arg.value);
    config.update(arg.section, arg.value, arg.global);
  });


  let notificationLogInstall = new NotificationType<string, void>('coded/logInstall');
  client.onNotification(notificationLogInstall, (message: string ) => {

    window.showNotification({content: message, timeout: 5000});
  });

  let notificationUpdateImports = new NotificationType<any, void>('coded/updateDubTree');
  client.onNotification(notificationUpdateImports, (success: any ) => {
    window.showNotification({content: 'Dub Tree updated', timeout: 5000});
  });




  let notificationInitDubTree = new NotificationType<any, void>('coded/initDubTree');
  client.onNotification(notificationInitDubTree, () => {
    window.showInformationMessage('serve-d is ready');
    /*
    window.showNotification({content: 'hasDubProject: true', timeout: 5000});
    commands.executeCommand('setContext', 'd.hasDubProject', true).then(() => {
      window.showNotification({content: 'HAD DUB IS SET', timeout: 5000});
    });
    */
  });


}

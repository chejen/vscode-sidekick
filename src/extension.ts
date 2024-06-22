import * as vscode from 'vscode';

import CommandsTreeDataProvider from './CommandsTreeDataProvider';
import AppSTreeDataProvider from './AppSTreeDataProvider';

export function activate(context: vscode.ExtensionContext) {
  const launchPythonServer = vscode.commands.registerCommand(
    'vscode-sidekick.launchPythonServer',
    () => {
      const terminal = vscode.window.createTerminal('Python Server Terminal');
      terminal.show();
      terminal.sendText('python -m SimpleHTTPServer', true);
    }
  );
  const launchPython3Server = vscode.commands.registerCommand(
    'vscode-sidekick.launchPython3Server',
    () => {
      const terminal = vscode.window.createTerminal('Python3 Server Terminal');
      terminal.show();
      terminal.sendText('python3 -m http.server', true);
    }
  );
  const runDockerInAppS = vscode.commands.registerCommand(
    'vscode-sidekick.appS.runContainer',
    async () => {
      const configs = vscode.workspace.getConfiguration('sidekick.app-s');
      const appSFolder = configs.get('folder');

      if (!appSFolder) {
        vscode.window.showErrorMessage('The "sidekick.app-s.folder" setting is not well set.');
        return;
      }

      const workspaceFolders = vscode.workspace.workspaceFolders || [];
      const targetFolder = workspaceFolders.filter(folder => folder.name === appSFolder)?.[0];

      if (!targetFolder) {
        vscode.window.showErrorMessage(`Can't find ${appSFolder} under this workspace.`);
        return;
      }
      
      try {
        const fileUri = vscode.Uri.file(`${targetFolder.uri.fsPath}/Dockerfile`);
        const document = await vscode.workspace.openTextDocument(fileUri);
        const originalContent = document.getText();
        const versionRegex = /creator_version=\d+\.\d+\.\d+/g;

        if (document.isDirty) {
          vscode.window.showErrorMessage('Target file is being edited.');
          return;
        }

        const newContent = originalContent
          .replace(versionRegex, 'creator_version=1.49.3')
          .replace('yarn workspaces focus --production', 'yarn');
        const edit = new vscode.WorkspaceEdit();
        const fullRange = new vscode.Range(
          document.positionAt(0),
          document.positionAt(document.getText().length)
        );
        edit.replace(fileUri, fullRange, newContent);

        const success = await vscode.workspace.applyEdit(edit);
        if (success) {
          await document.save();
          vscode.window.showInformationMessage('Target file has updated and saved.');

          // TODO
          // new terminal
          // nvm use
          // run
        } else {
          vscode.window.showErrorMessage(`Failed to apply edit to the target file.`);
        }
      } catch (error: any) {
        vscode.window.showErrorMessage(error.message);
      }
    }
  );
  context.subscriptions.push(launchPythonServer);
  context.subscriptions.push(launchPython3Server);
  context.subscriptions.push(runDockerInAppS);

  const commandsTreeDataProvider = new CommandsTreeDataProvider();
  vscode.window.createTreeView(
    'sidekick-commands',
    {
      treeDataProvider: commandsTreeDataProvider
    }
  );

  const appSTreeDataProvider = new AppSTreeDataProvider();
  vscode.window.createTreeView(
    'sidekick-app-s',
    {
      treeDataProvider: appSTreeDataProvider
    }
  );
}

export function deactivate() {}

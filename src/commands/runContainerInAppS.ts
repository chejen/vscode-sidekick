import { commands, window, workspace, Uri, WorkspaceEdit, Range } from 'vscode';

const runContainerInAppS = commands.registerCommand(
  'vscode-sidekick.appS.runContainer',
  async () => {
    const configs = workspace.getConfiguration('sidekick.appS');
    const appSFolder = configs.get('folder');

    if (!appSFolder) {
      window.showErrorMessage('The "sidekick.appS.folder" setting is not set.');
      return;
    }

    const workspaceFolders = workspace.workspaceFolders || [];
    const targetFolder = workspaceFolders.filter(folder => folder.name === appSFolder)?.[0];

    if (!targetFolder) {
      window.showErrorMessage(`Can't find ${appSFolder} under this workspace.`);
      return;
    }
    
    try {
      const fileUri = Uri.file(`${targetFolder.uri.fsPath}/Dockerfile`);
      const document = await workspace.openTextDocument(fileUri);
      const originalContent = document.getText();
      const versionRegex = /creator_version=\d+\.\d+\.\d+/g;

      if (document.isDirty) {
        window.showErrorMessage('Target file is being edited.');
        return;
      }

      const newContent = originalContent
        .replace(versionRegex, 'creator_version=1.49.3')
        .replace('yarn workspaces focus --production', 'yarn');
      const edit = new WorkspaceEdit();
      const fullRange = new Range(
        document.positionAt(0),
        document.positionAt(document.getText().length)
      );
      edit.replace(fileUri, fullRange, newContent);

      const success = await workspace.applyEdit(edit);
      if (success) {
        await document.save();
        window.showInformationMessage('Target file has updated and saved.');

        const terminal = window.createTerminal('Docker Container Terminal');
        terminal.show();
        terminal.sendText('date', true);
        terminal.sendText('nvm use 20', true);
        terminal.sendText('yarn start', true);
      } else {
        window.showErrorMessage(`Failed to apply edit to the target file.`);
      }
    } catch (error: any) {
      window.showErrorMessage(error.message);
    }
  }
);

export default runContainerInAppS;

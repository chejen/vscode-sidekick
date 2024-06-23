import * as vscode from 'vscode';

import launchPython3Server from './commands/launchPython3Server';
import launchPythonServer from './commands/launchPythonServer';
import runContainerInAppS from './commands/runContainerInAppS';

import CommandsTreeDataProvider from './dataProviders/CommandsTreeDataProvider';
import AppSTreeDataProvider from './dataProviders/AppSTreeDataProvider';

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(launchPythonServer);
  context.subscriptions.push(launchPython3Server);
  context.subscriptions.push(runContainerInAppS);

  vscode.window.createTreeView(
    'sidekick-general-commands',
    {
      treeDataProvider: new CommandsTreeDataProvider(),
    }
  );
  vscode.window.createTreeView(
    'sidekick-appS-commands',
    {
      treeDataProvider: new AppSTreeDataProvider(),
    }
  );
}

export function deactivate() {}

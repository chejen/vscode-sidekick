import { ExtensionContext, window, workspace } from 'vscode';

import launchPython3Server from './commands/launchPython3Server';
import launchPythonServer from './commands/launchPythonServer';
import runContainerInAppS from './commands/runContainerInAppS';

import AppSTreeDataProvider from './dataProviders/AppSTreeDataProvider';
import CommandsTreeDataProvider from './dataProviders/CommandsTreeDataProvider';
import MyCommitsTreeDataProvider
from './dataProviders/MyCommitsTreeDataProvider';

export function activate(context: ExtensionContext) {
  context.subscriptions.push(launchPythonServer);
  context.subscriptions.push(launchPython3Server);
  context.subscriptions.push(runContainerInAppS);

  window.registerTreeDataProvider(
    'sidekick-general-commands',
    new CommandsTreeDataProvider()
  );
  window.registerTreeDataProvider(
    'sidekick-appS-commands',
    new AppSTreeDataProvider()
  );
  window.registerTreeDataProvider(
    'sidekick-my-commits',
    new MyCommitsTreeDataProvider(context)
  );
}

export function deactivate() {}

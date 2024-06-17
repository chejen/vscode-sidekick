import * as vscode from 'vscode';

import CommandsTreeDataProvider from './CommandsTreeDataProvider';

export function activate(context: vscode.ExtensionContext) {
	const launchPython3Server = vscode.commands.registerCommand(
		'vscode-sidekick.launchPython3Server',
		() => {
			const terminal = vscode.window.createTerminal('Python3 Server Terminal');
			terminal.show();
			terminal.sendText('python3 -m http.server', true);
		}
	);

	context.subscriptions.push(launchPython3Server);

	const commandsTreeDataProvider = new CommandsTreeDataProvider();
	vscode.window.createTreeView('sidekick-commands', { treeDataProvider: commandsTreeDataProvider });
}

export function deactivate() {}

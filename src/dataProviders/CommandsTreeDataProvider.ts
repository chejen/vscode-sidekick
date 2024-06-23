import * as vscode from 'vscode';
import * as path from 'path';

class TreeItem extends vscode.TreeItem {
  constructor(
    label: string,
    command: string,
    description: string,
    tooltip: string,
    icon: string
  ) {
    super(label);
    this.command = {
      command,
      title: 'Execute Custom Command',
      arguments: [this] // Pass this tree item as an argument
    };
    this.description = description;
    this.tooltip = tooltip;
    const iconPath = vscode.Uri.file(path.join(__dirname, 'resources', icon));
    this.iconPath = {
      light: iconPath,
      dark: iconPath,
    };
  }
}

export default class CommandsTreeDataProvider implements vscode.TreeDataProvider<TreeItem> {
  getTreeItem(element: TreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: TreeItem): Thenable<TreeItem[]> {
    return Promise.resolve([
      new TreeItem(
        'Python Server',
        'vscode-sidekick.launchPythonServer',
        'Launch Python Simple Server',
        'python -m SimpleHTTPServer',
        'python-48.png'
      ),
      new TreeItem(
        'Python3 Server',
        'vscode-sidekick.launchPython3Server',
        'Launch Python3 Simple Server',
        'python3 -m http.server',
        'python-48.png'
      ),
    ]);
  }
}

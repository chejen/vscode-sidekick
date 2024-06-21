import * as vscode from 'vscode';
import * as path from 'path';

interface AppSTreeItem {
  label: string,
  command: string,
  description: string,
  tooltip: string,
  icon?: string,
  fileType?: string,
}

class TreeItem extends vscode.TreeItem {
  constructor({
    label,
    command,
    description,
    tooltip,
    icon,
    fileType,
  }: AppSTreeItem) {
    super(label);
    this.command = {
      command,
      title: 'Execute Custom Command',
      arguments: [this]
    };
    this.description = description;
    this.tooltip = tooltip;
    if (icon) {
      this.iconPath = vscode.Uri.file(path.join(__dirname, 'resources', icon));
    } else if (fileType) {
      this.iconPath = vscode.ThemeIcon.File;
      this.resourceUri = vscode.Uri.parse(fileType);
    }
  }
}

export default class AppSTreeDataProvider implements vscode.TreeDataProvider<TreeItem> {
  getTreeItem(element: TreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: TreeItem): Thenable<TreeItem[]> {
    return Promise.resolve([
      new TreeItem({
        label: 'Docker container',
        command: 'vscode-sidekick.appS.runContainer',
        description: 'Run Docker Container',
        tooltip: 'yarn start',
        fileType: 'Dockerfile',
      }),
    ]);
  }
}

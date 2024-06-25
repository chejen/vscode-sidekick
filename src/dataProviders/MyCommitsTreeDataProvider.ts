import {
  ExtensionContext,
  TreeDataProvider,
  EventEmitter,
  Event,
  TreeItem,
  TreeItemCollapsibleState,
  ThemeIcon,
  commands,
  window,
  workspace,
} from 'vscode';
import * as child_process from 'child_process';

export interface Item {
  isFolder: boolean;
  folderName?: string;
  folderPath?: string;
  shortSha?: string;
  message?: string;
  date?: string;
}

const splitter = '__SPLITTER__';

export default class MyCommitsTreeDataProvider implements TreeDataProvider<Item> {
  private _onDidChangeTreeData: EventEmitter<Item | undefined | null | void> = new EventEmitter<Item | undefined | null | void>();
  readonly onDidChangeTreeData: Event<Item | undefined | null | void> = this._onDidChangeTreeData.event;

  constructor(extensionContext: ExtensionContext) {
    const reloadAllMyCommits = commands.registerCommand(
      'vscode-sidekick.reloadAllMyCommits',
      () => this.refresh()
    );
    const reloadMyCommitsByFolder = commands.registerCommand(
      'vscode-sidekick.reloadMyCommitsByFolder',
      (item: Item) => this.refresh(item)
    );

    // subscript disposable commands
    extensionContext.subscriptions.push(reloadAllMyCommits);
    extensionContext.subscriptions.push(reloadMyCommitsByFolder);
  }

  refresh(element: Item | void): void {
    this._onDidChangeTreeData.fire(element);
  }

  getTreeItem(element: Item): TreeItem {
    if (element.isFolder) {
      return {
        label: element.folderName,
        tooltip: element.folderPath,
        collapsibleState: TreeItemCollapsibleState.Collapsed,
        contextValue: 'folder',
      };  
    }
    return {
      label: element.shortSha,
      description: element.message,
      tooltip: element.date,
      collapsibleState: TreeItemCollapsibleState.None,
      iconPath: new ThemeIcon('git-commit'),
    };
  }

  getChildren(element?: Item): Thenable<Item[]> {
    if (element) {
      const configAuthors: string[] =
        workspace.getConfiguration('sidekick.git').get('authors') || [];
      const authors: string[] =
        configAuthors.map((author: String) => `--author=${author}`);
      if (!authors.length) {
        window.showErrorMessage('The "sidekick.git.authors" is not set.');
        return Promise.resolve([]);
      }
      
      return new Promise(resolve => {
        child_process.exec(
          `git log ${authors.join(' ')} --pretty='format:%h${splitter}%s${splitter}%ad'`,
          { cwd: element.folderPath },
          (err, stdout) => {
            if (err) {
              resolve([]);
              return;
            }

            const commits = stdout.trim().split('\n').map(line => {
              const [shortSha, message, date] = line.split(splitter);
              return { shortSha, message, date } as Item;
            });
            
            resolve(commits);
          }
        );
      });
    } else {
      const folders = workspace.workspaceFolders?.map(folder => {
        return {
          isFolder: true,
          folderName: folder.name,
          folderPath: folder.uri.fsPath,
        } as Item;
      });
      return Promise.resolve(folders || []);
    }
  }
}

import {
  ExtensionContext,
  TreeDataProvider,
  EventEmitter,
  Event,
  TreeItem,
  TreeItemCollapsibleState,
  ThemeIcon,
  commands,
  env,
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
      'vscode-sidekick.my-commits.reloadAll',
      () => this.refresh()
    );
    const reloadMyCommitsByFolder = commands.registerCommand(
      'vscode-sidekick.my-commits.reloadByFolder',
      (item: Item) => this.refresh(item)
    );
    const copySha = commands.registerCommand(
      'vscode-sidekick.my-commits.copySha',
      ({ shortSha }) => {
        if (shortSha) {
          env.clipboard.writeText(shortSha);
          window.showInformationMessage(`Copied: ${shortSha}`);
        } else {
          window.showErrorMessage('No SHA to copy');
        }
      }
    );

    // subscript disposable commands
    extensionContext.subscriptions.push(reloadAllMyCommits);
    extensionContext.subscriptions.push(reloadMyCommitsByFolder);
    extensionContext.subscriptions.push(copySha);
  }

  refresh(element: Item | void): void {
    this._onDidChangeTreeData.fire(element);
    window.showInformationMessage(`${element?.folderName || 'All'} reloaded`);
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
      label: element.message,
      description: element.shortSha,
      tooltip: element.date,
      collapsibleState: TreeItemCollapsibleState.None,
      contextValue: 'commit',
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
    }

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

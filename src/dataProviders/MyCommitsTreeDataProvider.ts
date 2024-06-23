import {
  TreeDataProvider,
  EventEmitter,
  Event,
  TreeItem,
  TreeItemCollapsibleState,
  ThemeIcon,
  window,
  workspace,
} from 'vscode';
import * as child_process from 'child_process';

interface Item {
  isFolder: boolean;
  folderName?: string;
  folderPath?: string;
  shortSha?: string;
  message?: string;
  date?: string;
}

const splitter = '__SPLITTER__';

export default class MyCommitsTreeDataProvider implements TreeDataProvider<Item> {
  // private _onDidChangeTreeData: EventEmitter<Item | undefined | null | void> = new EventEmitter<Item | undefined | null | void>();
  // readonly onDidChangeTreeData: Event<Item | undefined | null | void> = this._onDidChangeTreeData.event;

  constructor() {}

  // refresh(): void {
  //   this._onDidChangeTreeData.fire();
  // }

  getTreeItem(element: Item): TreeItem {
    if (element.isFolder) {
      return {
        label: element.folderName,
        tooltip: element.folderPath,
        collapsibleState: TreeItemCollapsibleState.Collapsed
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

    return Promise.resolve([]);
  }
}

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

interface Folder {
  isFolder: true;
  folderName: string;
  folderPath: string;
  branch: string;
}

interface Commit {
  isFolder: false;
  shortSha: string;
  message: string;
  date: string;
}

type TreeItemType = Folder | Commit;

const splitter = '__SPLITTER__';

export default class MyCommitsTreeDataProvider implements TreeDataProvider<TreeItemType> {
  private _onDidChangeTreeData: EventEmitter<TreeItemType | undefined | null | void> =
    new EventEmitter<TreeItemType | undefined | null | void>();
  readonly onDidChangeTreeData: Event<TreeItemType | undefined | null | void> =
    this._onDidChangeTreeData.event;

  constructor(extensionContext: ExtensionContext) {
    const reloadAllMyCommits = commands.registerCommand(
      'vscode-sidekick.my-commits.reloadAll',
      () => this.refresh()
    );
    const reloadMyCommitsByFolder = commands.registerCommand(
      'vscode-sidekick.my-commits.reloadByFolder',
      (item: TreeItemType) => this.refresh(item)
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

  refresh(element: TreeItemType | void): void {
    this._onDidChangeTreeData.fire(element);
    window.showInformationMessage(
      `${element?.isFolder ? element?.folderName : 'All'} reloaded`
    );
  }

  getTreeItem(element: TreeItemType): TreeItem {
    if (element.isFolder) {
      return {
        label: element.folderName,
        description: element.branch,
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

  getChildren(element?: TreeItemType): Thenable<Folder[] | Commit[]> {
    if (element?.isFolder) {
      const configAuthors: string[] =
        workspace.getConfiguration('sidekick.git').get('authors') || [];
      const authors: string[] =
        configAuthors.map((author: String) => `--author=${author}`);
      if (!authors.length) {
        window.showErrorMessage('The "sidekick.git.authors" is not set.');
        return Promise.resolve([]);
      }

      return new Promise<Commit[]>(resolve => {
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
              return { shortSha, message, date } as Commit;
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
      } as Folder;
    });
    const promises = [];
    if (folders?.length) {
      for (const folder of folders) {
        promises.push(new Promise<string>(resolve => {
          child_process.exec(
            'git rev-parse --abbrev-ref HEAD',
            { cwd: folder.folderPath },
            (err, stdout) => {
              if (err) {
                resolve('');
                return;
              }
              resolve(stdout.trim());
            }
          );
        }));
      }
      return Promise.all(promises).then(branches =>
        folders.map((folder, index) => ({ ...folder, branch: branches[index] }))
      );
    }
    return Promise.resolve(folders || []);
  }
}

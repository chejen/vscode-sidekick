import { commands, window } from 'vscode';

const launchPythonServer = commands.registerCommand(
  'vscode-sidekick.launchPythonServer',
  () => {
    const terminal = window.createTerminal('Python Server Terminal');
    terminal.show();
    terminal.sendText('python -m SimpleHTTPServer', true);
  }
);

export default launchPythonServer;

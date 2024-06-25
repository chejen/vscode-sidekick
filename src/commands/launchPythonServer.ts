import { commands, window } from 'vscode';

const launchPythonServer = commands.registerCommand(
  'vscode-sidekick.launchPythonServer',
  () => {
    let terminal = window.activeTerminal;
    if (!terminal) {
      terminal = window.createTerminal('Python Server');
    }
    terminal.show();
    terminal.sendText('python -m SimpleHTTPServer', true);
  }
);

export default launchPythonServer;

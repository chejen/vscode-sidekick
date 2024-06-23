import { commands, window } from 'vscode';

const launchPython3Server = commands.registerCommand(
  'vscode-sidekick.launchPython3Server',
  () => {
    const terminal = window.createTerminal('Python3 Server Terminal');
    terminal.show();
    terminal.sendText('python3 -m http.server', true);
  }
);

export default launchPython3Server;

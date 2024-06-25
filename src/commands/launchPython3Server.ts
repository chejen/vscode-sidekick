import { commands, window } from 'vscode';

const launchPython3Server = commands.registerCommand(
  'vscode-sidekick.launchPython3Server',
  () => {
    let terminal = window.activeTerminal;
    if (!terminal) {
      terminal = window.createTerminal('Python3 Server');
    }
    terminal.show();
    terminal.sendText('python3 -m http.server', true);
  }
);

export default launchPython3Server;

import * as vscode from 'vscode';
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions
} from 'vscode-languageclient/node';

let client: LanguageClient;

export function activate(context: vscode.ExtensionContext) {
  const serverOptions: ServerOptions = {
    run: { command: 'node', args: ['dist/index.js'] },
    debug: { command: 'node', args: ['--inspect', 'dist/index.js'] }
  };

  const clientOptions: LanguageClientOptions = {
    documentSelector: [{ scheme: 'file', language: 'plaintext' }], // or whatever fits
  };

  client = new LanguageClient(
    'mcpClient',
    'MCP Server',
    serverOptions,
    clientOptions
  );

  context.subscriptions.push(
	client.start(),
	vscode.commands.registerCommand('beans.helloWorld', () => {
	  vscode.window.showInformationMessage('Hello World from mcp-server!');
	})
  );
}

export function deactivate(): Thenable<void> | undefined {
  if (!client) {
    return undefined;
  }
  return client.stop();
}

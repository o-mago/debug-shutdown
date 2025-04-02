const vscode = require('vscode');

const child_process = require('child_process');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	const disposable = vscode.commands.registerCommand('debug-shutdown.main', function () {
		const config = vscode.workspace.getConfiguration('debug-shutdown');
		const signal = config.get('signal');

		child_process.execSync(`pkill -${signal} __debug_bin`);
	});

	context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
	activate,
	deactivate
}

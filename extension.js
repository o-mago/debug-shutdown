const vscode = require('vscode');

const child_process = require('child_process');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	const disposable = vscode.commands.registerCommand('debug-shutdown.main', function () {
		const config = vscode.workspace.getConfiguration('debug-shutdown');
		
		let signal = config.get('signal');
		if (signal.startsWith('SIG')) {
			signal = signal.slice(3);
		}

		const pid = getThisDebugBinPid();
		if (!pid) {
			vscode.window.showErrorMessage('No __debug_bin found under the active process.');
			return;
		}

		child_process.execSync(`kill -s ${signal} ${pid}`);
	});

	context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
	activate,
	deactivate
}

function getThisDebugBinPid() {
	const pids = getAllDebugBinPids();
	if (pids.length === 0) {
		return null;
	}

	for (const pid of pids) {
		if (isAncestor(process.pid, pid)) {
			return pid;
		}
	}

	return null;
}

function getAllDebugBinPids() {
	try {
		const output = child_process.execSync(`pgrep __debug_bin`).toString();
		return output.split('\n').filter(line => line.trim() !== '').map(line => parseInt(line.trim()));
	} catch (error) {
		return [];
	}
}

function getParentPid(pid) {
	try {
		const output = child_process.execSync(`ps -o ppid= -p ${pid}`).toString().trim();
		return parseInt(output);
	} catch (error) {
		return null;
	}
}

function isAncestor(ancestorPid, childPid) {
	let currentPid = childPid;
	while (currentPid !== 1) {
		if (currentPid === ancestorPid) {
			return true;
		}
		currentPid = getParentPid(currentPid);
	}
	return false;
}

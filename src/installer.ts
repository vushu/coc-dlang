import {window} from "coc.nvim";
import {exec, ExecException} from 'child_process';

export function chooseInstallation(extensionsFolder: string)
{
	window.showQuickpick(['pre-release', 'latest'], 'Select serve-d version').then(chosen => {
		if (chosen === 0) {
			downloadingLatestPrereleaseServeD(extensionsFolder);
			downloadingLatestDCD(extensionsFolder);
		}
		else {
			downloadingLatestServeD(extensionsFolder);
			downloadingLatestDCD(extensionsFolder);
		}
	});

}

export function downloadingLatestPrereleaseServeD(toPath: string) {
	let file = 'linux-x86_64';
	//let outputPath = '~/.local/share/code-d/bin/';
	let outputPath = toPath;
	let extract = `tar -xf serve-d*.tar.xz`;
	let cleanup = `rm serve-d*.tar.*`;
	switch (process.platform) {
		case 'win32':
			file = 'windows'
			extract = `unzip serve-d*.zip`;
			break;
		case 'darwin':
			file = 'osx-x86_64'
			break;
		default:
			//Is linux
			break;
	}

	const commando = `curl -s https://api.github.com/repos/Pure-D/serve-d/releases | grep browser_download_url | grep ${file} | cut -d '"' -f 4 |  head -n 1 | wget -qi - -P ${outputPath} && cd ${outputPath} && ${extract} && ${cleanup}`
	//window.showPrompt('downloading serve-d');
	exec(commando, (err: ExecException | null, stdout: string, stderr: string) => {
		if (stderr)
			window.showErrorMessage(stderr);
		if (stdout)
			window.showInformationMessage(stdout);
		if(err)
			window.showErrorMessage(err.message);
		window.showNotification({content:'done downloading serve-d, pre-release', timeout: 5000});
	});

}


export function downloadingLatestServeD(toPath: string) {
	let file = 'linux-x86_64';
	//let outputPath = '~/.local/share/code-d/bin/';
	let outputPath = toPath;
	let extract = `tar -xf serve-d*.tar.xz`;
	let cleanup = `rm serve-d*.tar.*`;
	switch (process.platform) {
		case 'win32':
			file = 'windows'
			extract = `unzip serve-d*.zip`;
			break;
		case 'darwin':
			file = 'osx-x86_64'
			break;
		default:
			//Is linux
			break;

	}

	const commando = `curl -s https://api.github.com/repos/Pure-D/serve-d/releases/latest | grep browser_download_url | grep ${file} | cut -d '"' -f 4 | wget -qi - -P ${outputPath} && cd ${outputPath} && ${extract} && ${cleanup}`
	//window.showPrompt('downloading serve-d');
	exec(commando, (err: ExecException | null, stdout: string, stderr: string) => {
		if (stderr)
			window.showErrorMessage(stderr);
		if (stdout)
			window.showInformationMessage(stdout);
		if(err)
			window.showErrorMessage(err.message);
	});

	window.showNotification({content: 'done downloading serve-d, latest stable', timeout: 5000});
}

export function downloadingLatestDCD(toPath: string) {
	let file = 'linux-x86_64';
	//let outputPath = '~/.local/share/code-d/bin/';
	let outputPath = toPath;
	let extract = `tar -xf dcd*.tar.gz`;
	let cleanup = `rm dcd*.tar.*`;
	switch (process.platform) {
		case 'win32':
			file = 'windows-x86_64'
			extract = `unzip dcd*.zip`;
			break;
		case 'darwin':
			file = 'osx-x86_64'
			break;
		default:
			//Is linux
			break;

	}

	const commando = `curl -s https://api.github.com/repos/dlang-community/DCD/releases/latest | grep browser_download_url | grep ${file} | cut -d '"' -f 4 | wget -qi - -P ${outputPath} && cd ${outputPath} && ${extract} && ${cleanup}`
	window.showNotification({content: 'done downloading dcd', timeout: 5000 });

	exec(commando, (err: ExecException | null, stdout: string, stderr: string) => {
		if (stderr)
			window.showErrorMessage(stderr);
		if (stdout)
			window.showInformationMessage(stdout);
		if(err)
			window.showErrorMessage(err.message);
	});

}


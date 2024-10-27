const core = require('@actions/core');
const exec = require('@actions/exec');

async function run() {
  try {
    // Get inputs
    const baseBranch = core.getInput('base-branch');
    const targetBranch = core.getInput('target-branch');
    const workingDirectory = core.getInput('working-directory');
    const ghToken = core.getInput('gh-token');
    const debug = core.getBooleanInput('debug');

    // Validate inputs
    const branchPattern = /^[a-zA-Z0-9._/-]+$/;
    const dirPattern = /^[a-zA-Z0-9_/-]+$/;

    if (!branchPattern.test(baseBranch)) {
      core.setFailed(`Invalid base branch name: ${baseBranch}`);
      return;
    }
    if (!branchPattern.test(targetBranch)) {
      core.setFailed(`Invalid target branch name: ${targetBranch}`);
      return;
    }
    if (!dirPattern.test(workingDirectory)) {
      core.setFailed(`Invalid working directory: ${workingDirectory}`);
      return;
    }

    // Print inputs
    core.info(`Base branch: ${baseBranch}`);
    core.info(`Target branch: ${targetBranch}`);
    core.info(`Working directory: ${workingDirectory}`);

    // Update NPM dependencies
    await exec.exec('npm', ['update'], { cwd: workingDirectory });

    // Check if there are changes to package files
    const { stdout: gitStatusOutput } = await exec.getExecOutput('git', ['status', '-s', 'package*.json'], { cwd: workingDirectory });

    if (gitStatusOutput.trim()) {
      core.info('There are updates available.');
    } else {
      core.info('No updates at this point in time.');
    }

  } catch (error) {
    core.setFailed(error.message);
  }
}

run();

const core = require('@actions/core');
const exec = require('@actions/exec');
const github = require('@actions/github');

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

    core.info(`Base branch: ${baseBranch}`);
    core.info(`Target branch: ${targetBranch}`);
    core.info(`Working directory: ${workingDirectory}`);

    // Update NPM dependencies
    await exec.exec('npm', ['update'], { cwd: workingDirectory });

    // Check for changes to package files
    const { stdout: gitStatusOutput } = await exec.getExecOutput('git', ['status', '-s', 'package*.json'], { cwd: workingDirectory });

    if (gitStatusOutput.trim()) {
      core.info('There are updates available.');

      // Create a new branch for dependency updates
      await exec.exec('git', ['checkout', '-b', targetBranch]);

      // Stage and commit changes
      await exec.exec('git', ['add', 'package.json', 'package-lock.json'], { cwd: workingDirectory });
      await exec.exec('git', ['commit', '-m', 'Update NPM dependencies'], { cwd: workingDirectory });

      // Push changes to the remote branch
      await exec.exec('git', ['push', '-u', 'origin', targetBranch], { cwd: workingDirectory });

      // Initialize Octokit
      const octokit = github.getOctokit(ghToken);

      // Create Pull Request
      try {
        await octokit.rest.pulls.create({
          owner: github.context.repo.owner,
          repo: github.context.repo.repo,
          title: 'Update NPM dependencies',
          body: 'This pull request updates NPM packages',
          base: baseBranch,
          head: targetBranch
        });
      } catch (e) {
        core.error('[js-dependency-update] : Error while creating the PR. A PR may already be open.');
        core.setFailed(e.message);
      }
    } else {
      core.info('No updates at this point in time.');
    }

  } catch (error) {
    core.setFailed(error.message);
  }
}

run();

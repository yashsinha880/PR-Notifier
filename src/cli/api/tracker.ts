import fetch from 'node-fetch';

export async function trackDeployment(mergeCommitSha: string): Promise<boolean> {
  const owner = 'AppDirect';
  const repo = 'AppDirect';
  const branch = 'develop';

  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/actions/runs?branch=${branch}&status=success&per_page=10`,
    {
      headers: {
        Authorization: `token ${process.env.GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'notify-pr-cli'
      }
    }
  );

  if (!response.ok) {
    console.error(`❌ GitHub API Error: ${response.status} ${response.statusText}`);
    const text = await response.text();
    console.error(text);
    return false;
  }

  const data = await response.json() as {
    workflow_runs: Array<{
      head_commit: { id: string };
      status: string;
      conclusion: string;
    }>;
  };

  return data.workflow_runs.some(
    (run) =>
      run.head_commit?.id === mergeCommitSha &&
      run.status === 'completed' &&
      run.conclusion === 'success'
  );
}

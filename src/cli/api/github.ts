// github.ts
import fetch from 'node-fetch';

interface GitHubPRResponse {
  head: {
    sha: string;
  };
  merge_commit_sha?: string;
}

export async function getMergeCommitShaForPR(prNumber: string): Promise<string | null> {
  const owner = 'AppDirect';
  const repo = 'AppDirect';

  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}`, {
    headers: {
      Authorization: `token ${process.env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'notify-pr-cli'
    }
  });

  if (!response.ok) {
    console.error(`GitHub API Error: ${response.status} ${response.statusText}`);
    const text = await response.text();
    console.error(text); 
    return null;
  }

  const data = await response.json() as GitHubPRResponse;
  return data.merge_commit_sha || null;
}

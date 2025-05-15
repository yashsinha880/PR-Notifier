import { getMergeCommitShaForPR } from '../api/github';
import yargs from 'yargs';
import dotenv from 'dotenv';
import { trackDeployment } from '../api/tracker';
dotenv.config();

const argv = yargs
  .option('pr', { type: 'string', demandOption: true })
  .argv as any;

(async () => {
  const prNumber = argv.pr;

  const sha = await getMergeCommitShaForPR(prNumber);
  if (!sha) {
    console.error(`Could not find commit SHA for PR #${prNumber}`);
    process.exit(1);
  }

  console.log(`🔍 Watching PR #${prNumber} (SHA: ${sha})`);

  // First, check immediately
  const isDeployed = await trackDeployment(sha);
  if (isDeployed) {
    console.log(`PR #${prNumber} is now live!`);
    process.exit(0);
  } else {
    console.log(`PR #${prNumber} is not deployed yet...`);
    const interval = setInterval(async () => {
      const isDeployed = await trackDeployment(sha);
      if (isDeployed) {
        console.log(`PR #${prNumber} is now live!`);
        clearInterval(interval);
        process.exit(0);
      } else {
        console.log(`PR #${prNumber} is not deployed yet...`);
      }
    }, 5000);
  }
})();
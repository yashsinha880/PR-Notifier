// slack bot for the Monolith projectimport { App } from '@slack/bolt';
import fetch from 'node-fetch';
import { trackDeployment } from '../cli/api/tracker';
import { App } from '@slack/bolt';
import dotenv from 'dotenv';
import { getMergeCommitShaForPR } from '../cli/api/github';

dotenv.config();

const app = new App({
  token: process.env.SLACK_BOT_TOKEN!,
  signingSecret: process.env.SLACK_SIGNING_SECRET!,
});

interface TrackingRequest {
  userId: string;
  prNumber: string;
  env: string;
  sha: string;
}

const trackedPRs: TrackingRequest[] = [];

app.command('/notify-on-env', async ({ command, ack, say }) => {
  await ack();
  const [prNumber, env] = command.text.split(' ');
  if (!prNumber || !env) {
    void say('Please provide both a PR number and environment. Example: `/notify-on-env 1234 staging`');
    return;
  }

  const sha = await getMergeCommitShaForPR(prNumber);
  if (!sha) {
    void say(`Could not find commit SHA for PR #${prNumber}`);
    return;
  }

  trackedPRs.push({ userId: command.user_id, prNumber, env, sha });
  void say(`Tracking PR #${prNumber} on *${env}*. You'll get a ping when it's deployed.`);
});

setInterval(async () => {
  for (const track of [...trackedPRs]) {
    const isDeployed = await trackDeployment(track.sha);
    if (isDeployed) {
      await app.client.chat.postMessage({
        channel: track.userId,
        text: `PR #${track.prNumber} is now live on *${track.env}*!`
      });
      const index = trackedPRs.findIndex(t => t.prNumber === track.prNumber && t.env === track.env);
      trackedPRs.splice(index, 1);
    }
  }
}, 15000);

(async () => {
  await app.start(process.env.PORT || 3000);
  console.log('⚡️ Slack PR notifier is running!');
})();

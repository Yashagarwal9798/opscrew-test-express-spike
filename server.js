const express = require('express');

const app = express();
const port = Number(process.env.PORT || 4000);
const spikeMode = process.env.SPIKE_MODE === 'true';

let requestCount = 0;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'checkout',
    spikeMode,
    requestCount,
  });
});

app.get('/checkout', async (_req, res) => {
  requestCount += 1;

  if (spikeMode) {
    await sleep(900);

    if (requestCount % 3 === 0) {
      console.error(JSON.stringify({
        level: 'error',
        service: 'checkout',
        route: '/checkout',
        message: 'Synthetic checkout payment timeout',
        requestCount,
      }));

      res.status(503).json({
        ok: false,
        error: 'Synthetic checkout payment timeout',
        requestCount,
      });
      return;
    }
  } else {
    await sleep(40);
  }

  res.json({
    ok: true,
    service: 'checkout',
    route: '/checkout',
    latencyMode: spikeMode ? 'spike' : 'normal',
    requestCount,
  });
});

app.listen(port, () => {
  console.log(`opscrew-test-express-spike listening on http://127.0.0.1:${port}`);
  console.log(`SPIKE_MODE=${spikeMode}`);
});

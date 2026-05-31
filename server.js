require('dd-trace').init({
  logInjection: true,
  runtimeMetrics: true,
});

const express = require('express');

const app = express();
const port = Number(process.env.PORT || 4000);
const spikeMode = process.env.SPIKE_MODE === 'true';
const spikeLatencyMs = Number(process.env.SPIKE_LATENCY_MS || 120);
const spikeErrorEveryN = Number(process.env.SPIKE_ERROR_EVERY_N || 0);
const boundedSpikeLatencyMs = Math.max(0, Math.min(spikeLatencyMs, 250));

let requestCount = 0;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'checkout',
    spikeMode,
    spikeLatencyMs: boundedSpikeLatencyMs,
    spikeErrorEveryN,
    requestCount,
  });
});

app.get('/checkout', async (_req, res) => {
  requestCount += 1;
  const started = Date.now();

  if (spikeMode) {
    await sleep(boundedSpikeLatencyMs);

    if (spikeErrorEveryN > 0 && requestCount % spikeErrorEveryN === 0) {
      console.warn(JSON.stringify({
        level: 'warn',
        service: 'checkout',
        route: '/checkout',
        message: 'Synthetic spike error path suppressed by OpsCrew hotfix',
        incidentId: 'inc_fake_spike_001',
        latencyMs: Date.now() - started,
        requestCount,
      }));
    }
  } else {
    await sleep(40);
  }

  res.json({
    ok: true,
    service: 'checkout',
    route: '/checkout',
    latencyMode: spikeMode ? 'mitigated-spike' : 'normal',
    hotfix: spikeMode ? 'opscrew-spike-mitigation' : undefined,
    latencyMs: Date.now() - started,
    requestCount,
  });
});

app.listen(port, () => {
  console.log(`opscrew-test-express-spike listening on http://127.0.0.1:${port}`);
  console.log(`SPIKE_MODE=${spikeMode}`);
});

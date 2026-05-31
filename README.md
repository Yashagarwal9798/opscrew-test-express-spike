# OpsCrew Test Express Spike

Fake Express service for testing OpsCrew-style incident detection.

## Run Normal Mode

```bash
npm install
npm start
```

Open:

```text
http://127.0.0.1:4000/health
http://127.0.0.1:4000/checkout
```

## Run Spike Mode

```bash
$env:SPIKE_MODE='true'
npm start
```

In spike mode, `/checkout` waits roughly 900 ms and returns a synthetic `503` every third request.

## Generate Load

```bash
npm run load
```

This prints JSON lines with status code and latency. Those events can later be sent to Datadog/Sentry or converted into OpsCrew demo data for detection.

## GitHub Test Plan

1. Push this folder to a GitHub repository.
2. Make one normal commit.
3. Make one "bad deploy" commit enabling spike mode or changing timeout behavior.
4. Connect OpsCrew to live GitHub through Coral.
5. Connect telemetry through Datadog/Sentry or load equivalent demo JSON.
6. Start an OpsCrew investigation for service `checkout`.

Current OpsCrew status: demo mode works; live Coral MCP execution is not implemented yet in `backend/src/opscrew/infrastructure/coral/adapter.py`.

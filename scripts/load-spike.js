const target = process.env.TARGET_URL || 'http://127.0.0.1:4000/checkout';
const requests = Number(process.env.REQUESTS || 30);

async function main() {
  let errors = 0;
  const started = Date.now();

  for (let i = 0; i < requests; i += 1) {
    const requestStarted = Date.now();
    const response = await fetch(target);
    const latencyMs = Date.now() - requestStarted;

    if (!response.ok) {
      errors += 1;
    }

    console.log(JSON.stringify({
      index: i + 1,
      status: response.status,
      latencyMs,
    }));
  }

  console.log(JSON.stringify({
    target,
    requests,
    errors,
    durationMs: Date.now() - started,
  }));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

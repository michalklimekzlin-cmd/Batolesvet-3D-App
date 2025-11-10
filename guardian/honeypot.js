// Netlify function stub: /guardian/honeypot
exports.handler = async function(event, context) {
  const log = {
    ts: Date.now(),
    path: event.path,
    headers: event.headers,
    bodySample: (event.body || '').slice(0, 500)
  };
  console.log('HONEYPOT LOG', JSON.stringify(log));

  await new Promise(r => setTimeout(r, 1500));

  return {
    statusCode: 200,
    body: JSON.stringify({ ok: true, note: 'honeypot recorded' })
  };
};

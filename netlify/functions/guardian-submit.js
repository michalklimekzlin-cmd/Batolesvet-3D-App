// netlify/functions/guardian-submit.js
exports.handler = async function (event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'POST only' };
  }

  const data = JSON.parse(event.body || '{}');

  // tady bys normálně ověřil challengeId + seed + hash
  // teď jen řekneme "ok" a zapíšeme si, že přišla zpráva
  const log = {
    ts: Date.now(),
    msgLen: (data.message || '').length,
    fromChallenge: data.challengeId
  };

  console.log('[guardian] submit', log);

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ status: 'ok', received: log })
  };
};

// /.netlify/functions/guardian-submit
exports.handler = async function (event, context) {
  try {
    const body = JSON.parse(event.body || '{}');

    if (!body.challengeId || !body.nonce) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ ok: false, error: 'missing-fields' })
      };
    }

    // tady normálně ověříš nonce proti seed+difficulty
    const authToken = 'vaft-' + body.challengeId;

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ ok: true, authToken })
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ ok: false, error: String(e) })
    };
  }
};

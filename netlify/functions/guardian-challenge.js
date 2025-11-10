// /.netlify/functions/guardian-challenge
exports.handler = async function (event, context) {
  const crypto = require('crypto');

  const seed = crypto.randomBytes(16).toString('hex');
  const challengeId = crypto.randomBytes(8).toString('hex');
  const difficulty = 18; // můžeš zvednout až budeš chtít

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      challengeId,
      seed,
      difficulty,
      ttlSeconds: 60
    })
  };
};

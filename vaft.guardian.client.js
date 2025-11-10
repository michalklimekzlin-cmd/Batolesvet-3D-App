// vaft.guardian.client.js
// Lehce integrovateľný klient pro volání guardian endpoints.

(function (global) {
  const VAFTG = global.VAFTGuardian = global.VAFTGuardian || {};

  const API = {
    challenge: '/guardian/challenge',
    submit: '/guardian/submit',
    honeypot: '/guardian/honeypot'
  };

  async function sha256Hex(message) {
    const enc = new TextEncoder();
    const data = enc.encode(message);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash)).map(b=>('0'+b.toString(16)).slice(-2)).join('');
  }

  async function solvePow(seed, difficulty, maxMs = 3000) {
    const start = Date.now();
    let nonce = 0;
    const zeros = Math.floor(difficulty / 4);
    while (true) {
      const candidate = seed + ':' + nonce;
      const h = await sha256Hex(candidate);
      if (h.startsWith('0'.repeat(zeros))) {
        return { nonce: String(nonce), proof: h };
      }
      nonce++;
      if ((Date.now() - start) > maxMs) return null;
      if (nonce % 256 === 0) await new Promise(r => setTimeout(r, 0));
    }
  }

  async function ensureChallenge(meta = {}) {
    try {
      const resp = await fetch(API.challenge, { method: 'GET', cache: 'no-store' });
      if (!resp.ok) throw new Error('challenge failed');
      const chal = await resp.json();

      const solved = await solvePow(chal.seed, chal.difficulty, 2500);
      if (!solved) {
        try {
          await fetch(API.honeypot, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reason: 'pow_timeout', chal, meta })
          });
        } catch (e) { /* ignore */ }
        return { ok:false, reason:'pow_timeout' };
      }

      const submitResp = await fetch(API.submit, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challengeId: chal.challengeId,
          nonce: solved.nonce,
          proof: solved.proof,
          meta
        })
      });
      if (!submitResp.ok) {
        try {
          await fetch(API.honeypot, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reason: 'submit_rejected', chal, meta })
          });
        } catch (e) {}
        return { ok:false, reason:'submit_rejected' };
      }
      const token = await submitResp.json();
      return { ok:true, token };
    } catch (err) {
      console.warn('VAFTGuardian.ensureChallenge error', err);
      return { ok:false, reason:'error' };
    }
  }

  async function sendWithGuard(handlerFn, meta = {}) {
    const pre = await ensureChallenge(meta);
    if (!pre.ok) return { ok:false, reason: pre.reason || 'guard_failed' };
    const ctx = Object.assign({}, meta, { guardToken: pre.token?.authToken });
    try {
      const res = await handlerFn(ctx);
      return { ok:true, res };
    } catch (e) {
      return { ok:false, reason:'handler_error', error:e };
    }
  }

  VAFTG.ensureChallenge = ensureChallenge;
  VAFTG.sendWithGuard = sendWithGuard;
  VAFTG._internal = { sha256Hex, solvePow };

})(window);

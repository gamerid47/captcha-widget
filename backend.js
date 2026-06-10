// backend.js - Deploy to Cloudflare Workers
// Free forever - 100k requests/day

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };
    
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    
    // CREATE CHALLENGE
    if (url.pathname === '/api/captcha/challenge' && request.method === 'POST') {
      const { instanceId, type, answer } = await request.json();
      const challengeId = crypto.randomUUID();
      
      await env.MY_KV.put(challengeId, JSON.stringify({
        answer: answer,
        expires: Date.now() + 300000
      }), { expirationTtl: 300 });
      
      return new Response(JSON.stringify({ success: true, challengeId }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    
    // VERIFY SOLUTION
    if (url.pathname === '/api/captcha/verify' && request.method === 'POST') {
      const { challengeId, solution } = await request.json();
      const stored = await env.MY_KV.get(challengeId);
      
      if (!stored) {
        return new Response(JSON.stringify({ success: false, error: 'Expired' }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }
      
      const challenge = JSON.parse(stored);
      let isCorrect = false;
      
      if (Array.isArray(challenge.answer) && Array.isArray(solution)) {
        isCorrect = JSON.stringify(challenge.answer) === JSON.stringify(solution);
      } else if (typeof challenge.answer === 'object') {
        isCorrect = JSON.stringify(challenge.answer) === JSON.stringify(solution);
      } else {
        isCorrect = challenge.answer === solution;
      }
      
      if (isCorrect) {
        await env.MY_KV.delete(challengeId);
        return new Response(JSON.stringify({ success: true, token: crypto.randomUUID() }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }
      
      return new Response(JSON.stringify({ success: false, error: 'Wrong' }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    
    return new Response('Not found', { status: 404 });
  }
};
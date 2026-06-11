// Complete Cloudflare Worker for gCAPTCHA - WITH ORDER-INSENSITIVE ARRAY COMPARISON
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
      'Access-Control-Allow-Headers': 'Content-Type',
    };
    
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    
    // HEALTH CHECK
    if (path === '/api/captcha/health' && request.method === 'GET') {
      return new Response(JSON.stringify({ 
        status: 'ok', 
        timestamp: Date.now(),
        message: 'gCAPTCHA backend is running'
      }), { 
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    
    // CREATE CHALLENGE
    if (path === '/api/captcha/challenge' && request.method === 'POST') {
      try {
        const body = await request.json();
        const challengeId = crypto.randomUUID();
        
        await env.MY_KV.put(challengeId, JSON.stringify({
          answer: body.answer,
          instanceId: body.instanceId,
          type: body.type,
          expires: Date.now() + 300000
        }), { expirationTtl: 300 });
        
        return new Response(JSON.stringify({ 
          success: true, 
          challengeId: challengeId 
        }), { 
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      } catch (err) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: err.message 
        }), { 
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }
    }
    
    // VERIFY SOLUTION
    if (path === '/api/captcha/verify' && request.method === 'POST') {
      try {
        const body = await request.json();
        const stored = await env.MY_KV.get(body.challengeId);
        
        if (!stored) {
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'Challenge expired or not found' 
          }), { 
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
        
        const challenge = JSON.parse(stored);
        
        if (challenge.expires < Date.now()) {
          await env.MY_KV.delete(body.challengeId);
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'Challenge expired' 
          }), { 
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
        
        let isCorrect = false;
        
        // TYPE 1: Array comparison (order doesn't matter)
        if (Array.isArray(challenge.answer) && Array.isArray(body.solution)) {
          const sortedAnswer = [...challenge.answer].sort();
          const sortedSolution = [...body.solution].sort();
          isCorrect = JSON.stringify(sortedAnswer) === JSON.stringify(sortedSolution);
        }
        // TYPE 2: Boolean comparison
        else if (typeof challenge.answer === 'boolean' && typeof body.solution === 'boolean') {
          isCorrect = challenge.answer === body.solution;
        }
        // TYPE 3: Array with order (click sequence matters)
        else if (Array.isArray(challenge.answer) && Array.isArray(body.solution)) {
          isCorrect = JSON.stringify(challenge.answer) === JSON.stringify(body.solution);
        }
        // Default comparison
        else {
          isCorrect = challenge.answer === body.solution;
        }
        
        if (isCorrect) {
          await env.MY_KV.delete(body.challengeId);
          const token = crypto.randomUUID() + Date.now().toString(36);
          
          return new Response(JSON.stringify({ 
            success: true, 
            token: token 
          }), { 
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        } else {
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'Incorrect solution' 
          }), { 
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
      } catch (err) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: err.message 
        }), { 
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }
    }
    
    return new Response(JSON.stringify({ 
      error: 'Not found',
      available_endpoints: [
        'GET /api/captcha/health',
        'POST /api/captcha/challenge', 
        'POST /api/captcha/verify'
      ]
    }), { 
      status: 404,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
};

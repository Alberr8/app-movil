import Anthropic from 'npm:@anthropic-ai/sdk';
import { createClient } from 'npm:@supabase/supabase-js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
if (!ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY secret is not configured');
const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

const DAILY_LIMIT = 5;

interface OutfitSummary {
  exerciseType: string;
  score: {
    total: number;
    breakdown: {
      coordination: number;
      fit: number;
      appropriateness: number;
      trend: number;
      completeness: number;
    };
  };
}

function jsonError(message: string, status: number): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function isValidOutfit(o: unknown): o is OutfitSummary {
  if (!o || typeof o !== 'object') return false;
  const obj = o as Record<string, unknown>;
  if (typeof obj.exerciseType !== 'string') return false;
  if (!obj.score || typeof obj.score !== 'object') return false;
  const score = obj.score as Record<string, unknown>;
  if (typeof score.total !== 'number') return false;
  if (!score.breakdown || typeof score.breakdown !== 'object') return false;
  const b = score.breakdown as Record<string, unknown>;
  return ['coordination', 'fit', 'appropriateness', 'trend', 'completeness'].every(
    k => typeof b[k] === 'number',
  );
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // ── 1. Auth ───────────────────────────────────────────────────────────────────
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return jsonError('Unauthorized', 401);

  const userSupabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } },
  );
  const { data: { user } } = await userSupabase.auth.getUser();
  if (!user) return jsonError('Unauthorized', 401);

  // ── 2. Rate limit ─────────────────────────────────────────────────────────────
  const adminSupabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );
  const since = new Date(Date.now() - 86_400_000).toISOString();
  const { count } = await adminSupabase
    .from('ai_call_log')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('function_name', 'weekly-coaching')
    .gte('called_at', since);
  if ((count ?? 0) >= DAILY_LIMIT) {
    return jsonError('Daily coaching limit reached. Try again tomorrow.', 429);
  }

  try {
    // ── 3. Parse & validate body ──────────────────────────────────────────────
    const body = await req.json();
    const lang: 'es' | 'en' = body.lang === 'en' ? 'en' : 'es';
    const userName = typeof body.userName === 'string'
      ? body.userName.trim().slice(0, 100)
      : '';
    const rawOutfits: unknown[] = Array.isArray(body.weekOutfits) ? body.weekOutfits : [];
    const weekOutfits: OutfitSummary[] = rawOutfits.filter(isValidOutfit);

    if (weekOutfits.length === 0) {
      const empty = lang === 'es'
        ? 'Aún no has valorado ningún outfit esta semana. ¡Sube el primero y empieza a construir tu estilo!'
        : "You haven't rated any outfits this week yet. Upload your first one and start building your style!";
      return new Response(JSON.stringify({ summary: empty }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── 4. Log the call ───────────────────────────────────────────────────────
    await adminSupabase.from('ai_call_log').insert({ user_id: user.id, function_name: 'weekly-coaching' });

    // ── 5. Build prompt & call Claude ─────────────────────────────────────────
    const name = userName || (lang === 'es' ? 'campeón' : 'champ');
    const avg = (weekOutfits.reduce((s, o) => s + o.score.total, 0) / weekOutfits.length).toFixed(1);
    const best = Math.max(...weekOutfits.map(o => o.score.total));
    const bestOutfit = weekOutfits.find(o => o.score.total === best);

    const dims = ['coordination', 'fit', 'appropriateness', 'trend', 'completeness'] as const;
    const dimAvgs = dims.map(d => ({
      dim: d,
      avg: weekOutfits.reduce((s, o) => s + o.score.breakdown[d], 0) / weekOutfits.length,
    }));
    const weakest = [...dimAvgs].sort((a, b) => a.avg - b.avg)[0].dim;
    const strongest = [...dimAvgs].sort((a, b) => b.avg - a.avg)[0].dim;

    const dimLabelEs: Record<string, string> = {
      coordination: 'coordinación de colores', fit: 'ajuste de prendas',
      appropriateness: 'adecuación al deporte', trend: 'tendencia', completeness: 'completitud del outfit',
    };
    const dimLabelEn: Record<string, string> = {
      coordination: 'color coordination', fit: 'garment fit',
      appropriateness: 'sport appropriateness', trend: 'trend', completeness: 'outfit completeness',
    };

    const outfitLinesEs = weekOutfits.map((o, i) =>
      `${i + 1}. ${o.exerciseType.replace('_', ' ')} — ${o.score.total}/10 (coordinación ${o.score.breakdown.coordination}/2, ajuste ${o.score.breakdown.fit}/2, adecuación ${o.score.breakdown.appropriateness}/2, tendencia ${o.score.breakdown.trend}/2, completitud ${o.score.breakdown.completeness}/2)`
    ).join('\n');

    const outfitLinesEn = weekOutfits.map((o, i) =>
      `${i + 1}. ${o.exerciseType.replace('_', ' ')} — ${o.score.total}/10 (coordination ${o.score.breakdown.coordination}/2, fit ${o.score.breakdown.fit}/2, appropriateness ${o.score.breakdown.appropriateness}/2, trend ${o.score.breakdown.trend}/2, completeness ${o.score.breakdown.completeness}/2)`
    ).join('\n');

    const promptEs = `Eres el coach de estilo deportivo personal de ${name}. Escribe su resumen semanal: 3-4 frases, directo y motivador.

Outfits valorados esta semana (${weekOutfits.length} en total):
${outfitLinesEs}

Datos clave:
- Media semanal: ${avg}/10
- Mejor outfit: ${bestOutfit?.exerciseType.replace('_', ' ')} (${best}/10)
- Punto más fuerte: ${dimLabelEs[strongest]}
- Área a mejorar: ${dimLabelEs[weakest]}

Escribe el resumen usando estos datos. Menciona el punto fuerte, señala el área a mejorar con un consejo concreto y termina motivando para la próxima semana. Sin saludos formales, sin "Hola", ve directo al análisis. Usa "tú" y sé personal.

Responde solo con el texto, sin JSON ni formato adicional.`;

    const promptEn = `You are ${name}'s personal sports style coach. Write their weekly summary: 3-4 sentences, direct and motivating.

Outfits rated this week (${weekOutfits.length} total):
${outfitLinesEn}

Key data:
- Weekly average: ${avg}/10
- Best outfit: ${bestOutfit?.exerciseType.replace('_', ' ')} (${best}/10)
- Strongest area: ${dimLabelEn[strongest]}
- Area to improve: ${dimLabelEn[weakest]}

Write the summary using this data. Mention the strength, point out the improvement area with a concrete tip, and end by motivating for next week. No formal greetings, no "Hello", go straight to the analysis. Use "you" and be personal.

Respond only with the text, no JSON or additional formatting.`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 512,
      messages: [{ role: 'user', content: lang === 'es' ? promptEs : promptEn }],
    });

    const summary = response.content[0].type === 'text' ? response.content[0].text.trim() : '';

    return new Response(JSON.stringify({ summary }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: unknown) {
    console.error('[weekly-coaching]', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

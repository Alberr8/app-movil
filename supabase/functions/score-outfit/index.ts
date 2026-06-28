import Anthropic from 'npm:@anthropic-ai/sdk';
import { createClient } from 'npm:@supabase/supabase-js';

const corsHeaders = {
  // Wildcard is safe here: browsers don't auto-send Authorization headers cross-origin,
  // so the JWT auth check below already prevents CSRF-style abuse.
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Fail fast at cold-start if the secret is missing rather than cryptically at call time.
const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
if (!ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY secret is not configured');
const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

const VALID_EXERCISE_TYPES = new Set([
  'running', 'cycling', 'swimming', 'triathlon',
  'gym', 'crossfit', 'boxing', 'martial_arts',
  'padel', 'tennis', 'golf',
  'football', 'basketball', 'rugby', 'volleyball', 'baseball',
  'hiking', 'skiing', 'surf', 'climbing', 'horse_riding', 'skateboard',
  'yoga', 'pilates', 'dance',
]);
const VALID_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp']);
const DAILY_LIMIT = 20;
const MAX_IMAGE_B64_LEN = 10_000_000; // ~7.5 MB decoded

type SportCategory = 'endurance' | 'strength' | 'court' | 'team' | 'outdoor' | 'mind_body';

const SPORT_CATEGORY: Record<string, SportCategory> = {
  running: 'endurance', cycling: 'endurance', swimming: 'endurance', triathlon: 'endurance',
  gym: 'strength', crossfit: 'strength', boxing: 'strength', martial_arts: 'strength',
  padel: 'court', tennis: 'court', golf: 'court',
  football: 'team', basketball: 'team', rugby: 'team', volleyball: 'team', baseball: 'team',
  hiking: 'outdoor', skiing: 'outdoor', surf: 'outdoor', climbing: 'outdoor',
  horse_riding: 'outdoor', skateboard: 'outdoor',
  yoga: 'mind_body', pilates: 'mind_body', dance: 'mind_body',
};

const SPORT_LABEL_ES: Record<string, string> = {
  running: 'running', cycling: 'ciclismo', swimming: 'natación', triathlon: 'triatlón',
  gym: 'gimnasio', crossfit: 'CrossFit', boxing: 'boxeo', martial_arts: 'artes marciales',
  padel: 'pádel', tennis: 'tenis', golf: 'golf',
  football: 'fútbol', basketball: 'baloncesto', rugby: 'rugby', volleyball: 'voleibol', baseball: 'béisbol',
  hiking: 'senderismo', skiing: 'esquí', surf: 'surf', climbing: 'escalada',
  horse_riding: 'equitación', skateboard: 'skateboard',
  yoga: 'yoga', pilates: 'pilates', dance: 'danza',
};

function jsonError(message: string, status: number): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
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
    .eq('function_name', 'score-outfit')
    .gte('called_at', since);
  if ((count ?? 0) >= DAILY_LIMIT) {
    return jsonError('Daily scoring limit reached. Try again tomorrow.', 429);
  }

  try {
    // ── 3. Parse & validate body ──────────────────────────────────────────────
    const body = await req.json();
    const { imageBase64, recentScores } = body;

    if (!imageBase64 || typeof imageBase64 !== 'string') return jsonError('imageBase64 is required', 400);
    if (imageBase64.length > MAX_IMAGE_B64_LEN) return jsonError('Image too large', 413);

    const exerciseType: string = VALID_EXERCISE_TYPES.has(body.exerciseType) ? body.exerciseType : 'gym';
    const lang: 'es' | 'en' = body.lang === 'en' ? 'en' : 'es';
    const mimeType = VALID_MIME_TYPES.has(body.mimeType) ? body.mimeType : 'image/jpeg';

    // ── 4. Log the call before hitting Anthropic (so failed calls count toward limit) ─
    await adminSupabase.from('ai_call_log').insert({ user_id: user.id, function_name: 'score-outfit' });

    // ── 5. Build prompt & call Claude ─────────────────────────────────────────
    const category = SPORT_CATEGORY[exerciseType] ?? 'strength';
    const sportLabel = lang === 'es'
      ? (SPORT_LABEL_ES[exerciseType] ?? exerciseType)
      : exerciseType.replace('_', ' ');

    const validScores = Array.isArray(recentScores)
      ? recentScores.filter((s): s is number => typeof s === 'number')
      : [];

    const historyCtxEs = validScores.length
      ? `\n\nContexto del usuario: ha valorado ${validScores.length} outfit(s) anteriormente, con puntuaciones [${validScores.join(', ')}] y una media de ${(validScores.reduce((a, b) => a + b, 0) / validScores.length).toFixed(1)}/10.`
      : '';
    const historyCtxEn = validScores.length
      ? `\n\nUser context: has previously rated ${validScores.length} outfit(s) with scores [${validScores.join(', ')}], average ${(validScores.reduce((a, b) => a + b, 0) / validScores.length).toFixed(1)}/10.`
      : '';

    const systemEs = `Eres un experto en moda deportiva y estilismo atlético de alto nivel. Analizas outfits deportivos con criterio profesional: coordinación de colores, ajuste de prendas, adecuación al deporte, tendencia actual y completitud del look. Respondes ÚNICAMENTE con JSON válido, sin texto adicional.`;
    const systemEn = `You are a high-level sports fashion and athletic styling expert. You analyze sports outfits with professional judgment: color coordination, garment fit, sport appropriateness, current trend, and outfit completeness. You respond ONLY with valid JSON, no additional text.`;

    const promptEs = `Analiza este outfit para ${sportLabel} (categoría: ${category}).${historyCtxEs}

Observa con detalle la imagen: colores, prendas, calzado, accesorios, ajuste y adecuación al deporte indicado.

Devuelve ÚNICAMENTE este JSON (sin markdown, sin explicaciones):
{
  "total": <número del 5 al 10, puede tener .5 como 7.5, debe ser suma exacta del breakdown>,
  "breakdown": {
    "coordination": <0 | 0.5 | 1 | 1.5 | 2>,
    "fit": <0 | 0.5 | 1 | 1.5 | 2>,
    "appropriateness": <0 | 0.5 | 1 | 1.5 | 2>,
    "trend": <0 | 0.5 | 1 | 1.5 | 2>,
    "completeness": <0 | 0.5 | 1 | 1.5 | 2>
  },
  "recommendations": [
    "<consejo 1: específico sobre algo visible en la imagen>",
    "<consejo 2: accionable y concreto>",
    "<consejo 3: para subir la nota>"
  ],
  "coachingNudge": "<1-2 frases: punto fuerte real del outfit + área principal a trabajar, en tono motivador y directo>"
}`;

    const promptEn = `Analyze this outfit for ${sportLabel} (category: ${category}).${historyCtxEn}

Carefully observe the image: colors, garments, footwear, accessories, fit, and appropriateness for the stated sport.

Return ONLY this JSON (no markdown, no explanations):
{
  "total": <number from 5 to 10, can have .5 like 7.5, must be exact sum of breakdown>,
  "breakdown": {
    "coordination": <0 | 0.5 | 1 | 1.5 | 2>,
    "fit": <0 | 0.5 | 1 | 1.5 | 2>,
    "appropriateness": <0 | 0.5 | 1 | 1.5 | 2>,
    "trend": <0 | 0.5 | 1 | 1.5 | 2>,
    "completeness": <0 | 0.5 | 1 | 1.5 | 2>
  },
  "recommendations": [
    "<tip 1: specific about something visible in the image>",
    "<tip 2: actionable and concrete>",
    "<tip 3: to improve the score>"
  ],
  "coachingNudge": "<1-2 sentences: real outfit strength + main area to work on, motivating and direct tone>"
}`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: lang === 'es' ? systemEs : systemEn,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mimeType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
                data: imageBase64,
              },
            },
            { type: 'text', text: lang === 'es' ? promptEs : promptEn },
          ],
        },
      ],
    });

    const raw = response.content[0].type === 'text' ? response.content[0].text.trim() : '{}';
    const cleaned = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
    const aiResult = JSON.parse(cleaned);

    return new Response(JSON.stringify({ ...aiResult, _source: 'ai', _category: category }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: unknown) {
    console.error('[score-outfit]', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

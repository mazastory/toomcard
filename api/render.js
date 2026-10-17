const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.SUPABASE_URL || "https://xhjauoabxybaksvbtcic.supabase.co";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhoamF1b2FieHliYWtzdmJ0Y2ljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwMzg0NzQsImV4cCI6MjEwNDYxNDQ3NH0.wBK3-8IIq3JKYbMrVlLtx6rRPRmhCblm74EwL_3PxBY";

let supabase = null;
try {
  const { createClient } = require('@supabase/supabase-js');
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} catch (e) {}

module.exports = async (req, res) => {
  let { slug } = req.query;
  const reqUrl = req.url || '';

  if (!slug) {
    slug = 'toomus'; // Default fallback
  }

  let decodedSlug = slug;
  try {
    decodedSlug = decodeURIComponent(slug);
  } catch (e) {}

  // Safe slug cleaning: allow English, Korean, Numbers, Hyphen, Underscore, Slash
  const cleanSlug = decodedSlug.replace(/[^a-zA-Z0-9_\-\/가-힣]/g, '').trim();

  let title = "TOOMCARD 3D 명함";
  let subtitle = "Next-Gen 3D Interactive Business Card";
  let company = "TOOMUS";
  let cardFound = false;

  try {
    // 1. Try local JSON first (instant zero-latency read)
    const candidates = [
      path.join(process.cwd(), 'cards', `${cleanSlug.replace('/', '_')}.json`),
      path.join(process.cwd(), 'cards', `${cleanSlug}.json`),
      path.join(process.cwd(), 'cards', `${decodedSlug.replace('/', '_')}.json`),
      path.join(process.cwd(), 'cards', `${decodedSlug}.json`)
    ];
    
    let targetJsonPath = candidates.find(p => fs.existsSync(p)) || null;

    if (targetJsonPath) {
      try {
        const raw = fs.readFileSync(targetJsonPath, 'utf8');
        const card = JSON.parse(raw);
        title = card.name || card.meta?.title || title;
        subtitle = `${card.role || ''} · ${card.slogan || ''}`.trim() || subtitle;
        company = card.company || company;
        cardFound = true;
      } catch (e) {}
    }

    // 2. Fallback to Supabase Cloud Pods if not found locally
    if (!cardFound) {
      let pod = null;
      let profile = null;

      if (supabase) {
        const { data: pData } = await supabase
          .from('pods')
          .select('components_json')
          .or(`slug.eq.${decodedSlug},slug.eq.${cleanSlug}`)
          .maybeSingle();
        pod = pData;

        const { data: prData } = await supabase
          .from('profiles')
          .select('*')
          .or(`slug.eq.${decodedSlug},slug.eq.${cleanSlug}`)
          .maybeSingle();
        profile = prData;
      } else {
        try {
          const res = await fetch(`${SUPABASE_URL}/rest/v1/pods?or=(slug.eq.${encodeURIComponent(decodedSlug)},slug.eq.${encodeURIComponent(cleanSlug)})&select=components_json&limit=1`, {
            headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` }
          });
          const rows = await res.json();
          if (Array.isArray(rows) && rows.length > 0) pod = rows[0];
        } catch (err) {}
      }

      if (pod && pod.components_json) {
        const card = pod.components_json.card || pod.components_json;
        title = card.name || profile?.name || title;
        subtitle = `${card.role || profile?.handle || ''} · ${card.slogan || card.tagline || ''}`.trim() || subtitle;
        company = card.company || profile?.bio || company;
        cardFound = true;
      } else if (profile) {
        title = profile.name || title;
        subtitle = profile.handle || subtitle;
        company = profile.bio || company;
        cardFound = true;
      }
    }

    // 3. Read HTML template (card.html)
    const htmlPath = path.join(process.cwd(), 'card.html');
    let html = fs.readFileSync(htmlPath, 'utf8');

    // 4. Inject Dynamic OG Meta Tags (Replace existing placeholder tags)
    const ogImageUrl = `https://toomcard.com/api/og?title=${encodeURIComponent(title)}&subtitle=${encodeURIComponent(subtitle)}&company=${encodeURIComponent(company)}`;
    
    html = html.replace(/<title>.*?<\/title>/i, `<title>${title} | ${company} - TOOMCARD</title>`);
    html = html.replace(/<meta\s+property=["']og:title["'].*?>/i, `<meta property="og:title" content="${title} | ${company}" />`);
    html = html.replace(/<meta\s+property=["']og:description["'].*?>/i, `<meta property="og:description" content="${subtitle}" />`);
    html = html.replace(/<meta\s+property=["']og:image["'].*?>/i, `<meta property="og:image" content="${ogImageUrl}" />`);

    const extraTags = `
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:image" content="${ogImageUrl}" />
    `;
    html = html.replace('</head>', `${extraTags}\n</head>`);

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
    return res.status(200).send(html);

  } catch (err) {
    console.error("Render API Error:", err);
    const htmlPath = path.join(process.cwd(), 'card.html');
    let html = fs.readFileSync(htmlPath, 'utf8');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(html);
  }
};

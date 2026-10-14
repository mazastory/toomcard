const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || "https://xhjauoabxybaksvbtcic.supabase.co";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhoamF1b2FieHliYWtzdmJ0Y2ljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwMzg0NzQsImV4cCI6MjEwNDYxNDQ3NH0.wBK3-8IIq3JKYbMrVlLtx6rRPRmhCblm74EwL_3PxBY";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

module.exports = async (req, res) => {
  let { slug } = req.query;
  const reqUrl = req.url || '';

  if (!slug) {
    slug = 'toomus'; // Default fallback
  }

  // Safe slug cleaning
  const cleanSlug = slug.replace(/[^a-zA-Z0-9_\-\/]/g, '').toLowerCase();

  let title = "TOOMCARD 3D 명함";
  let subtitle = "Next-Gen 3D Interactive Business Card";
  let company = "TOOMUS";
  let cardFound = false;

  try {
    // 1. Try local JSON first (instant zero-latency read)
    const localJsonPath = path.join(process.cwd(), 'cards', `${cleanSlug.replace('/', '_')}.json`);
    const fallbackPath = path.join(process.cwd(), 'cards', `${cleanSlug}.json`);
    
    let targetJsonPath = fs.existsSync(localJsonPath) ? localJsonPath : (fs.existsSync(fallbackPath) ? fallbackPath : null);

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
      const { data: pod } = await supabase
        .from('pods')
        .select('components_json')
        .eq('slug', cleanSlug)
        .single();

      if (pod && pod.components_json) {
        const card = pod.components_json.card || pod.components_json;
        title = card.name || title;
        subtitle = card.role || subtitle;
        company = card.company || company;
      }
    }

    // 3. Read HTML template (card.html)
    const htmlPath = path.join(process.cwd(), 'card.html');
    let html = fs.readFileSync(htmlPath, 'utf8');

    // 4. Inject Dynamic OG Meta Tags
    const ogImageUrl = `https://toomcard.com/api/og?title=${encodeURIComponent(title)}&subtitle=${encodeURIComponent(subtitle)}&company=${encodeURIComponent(company)}`;
    
    const metaTags = `
      <title>${title} | ${company} - TOOMCARD</title>
      <meta property="og:title" content="${title} | ${company}" />
      <meta property="og:description" content="${subtitle}" />
      <meta property="og:image" content="${ogImageUrl}" />
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:image" content="${ogImageUrl}" />
    `;

    html = html.replace('</head>', `${metaTags}\n</head>`);

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

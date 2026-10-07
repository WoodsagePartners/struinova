// POST /api/send-brief
// Emails a visitor's Reframing Engine brief to Ron through Resend.
// Required env var (set in Vercel): RESEND_API_KEY
// Optional env vars: BRIEF_TO (default ron@struinova.com), BRIEF_FROM (default Struinova Briefs <briefs@struinova.com>)

const hits = new Map(); // best-effort per-instance rate limit: ip -> [timestamps]
const WINDOW_MS = 10 * 60 * 1000;
const MAX_HITS = 5;

function rateLimited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter(t => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 500) {
    for (const [k, v] of hits) if (!v.some(t => now - t < WINDOW_MS)) hits.delete(k);
  }
  return recent.length > MAX_HITS;
}

const str = (v, max) => String(v == null ? '' : v).replace(/\r/g, '').trim().slice(0, max);
const oneLine = (v, max) => str(v, max).replace(/\s+/g, ' ');
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const EMAIL_RE = /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/;

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'method not allowed' }); return; }

  const key = process.env.RESEND_API_KEY;
  if (!key) { res.status(503).json({ error: 'email not configured' }); return; }

  const ip = String((req.headers['x-forwarded-for'] || '').split(',')[0] || req.socket?.remoteAddress || 'unknown').trim();
  if (rateLimited(ip)) { res.status(429).json({ error: 'too many requests' }); return; }

  const b = req.body && typeof req.body === 'object' ? req.body : {};

  // Honeypot: real visitors never fill this hidden field. Pretend success so bots move on.
  if (str(b.hp, 200)) { res.status(200).json({ ok: true }); return; }

  const name = oneLine(b.name, 120);
  const email = oneLine(b.email, 200);
  const org = oneLine(b.org, 160);
  const site = oneLine(b.site, 200);
  const note = str(b.note, 3000);
  if (!EMAIL_RE.test(email)) { res.status(400).json({ error: 'valid email required' }); return; }

  const challenges = (Array.isArray(b.challenges) ? b.challenges : []).slice(0, 12).map(c => oneLine(c, 400)).filter(Boolean);
  const transcript = (Array.isArray(b.history) ? b.history : []).slice(0, 40)
    .map(m => ({ role: m && m.role === 'assistant' ? 'Struinova' : 'Visitor', text: str(m && m.content, 1500) }))
    .filter(m => m.text);

  const who = name || email;
  const subject = ('Challenge brief: ' + (org || who)).replace(/[\r\n]+/g, ' ').slice(0, 150);

  const text = [
    'New Reframing Engine brief from struinova.com', '',
    'Name: ' + (name || '(not given)'),
    'Email: ' + email,
    'Organization: ' + (org || '(not given)'),
    'Website: ' + (site || '(not given)'), '',
    'What is stuck:',
    ...(challenges.length ? challenges.map(c => '- ' + c) : ['(none selected)']),
    ...(note ? ['', 'Notes:', note] : []),
    ...(transcript.length ? ['', 'Conversation with the Reframing Engine:', ...transcript.map(m => m.role + ': ' + m.text)] : []),
    '', 'Reply to this email to respond directly to the visitor.'
  ].join('\n');

  const html =
    '<div style="font-family:Arial,Helvetica,sans-serif;color:#1a2433;max-width:640px;line-height:1.5">' +
    '<h2 style="margin:0 0 4px;color:#C2571B">New Reframing Engine brief</h2>' +
    '<p style="margin:0 0 16px;color:#6b7a90;font-size:13px">from struinova.com &middot; reply to respond directly to the visitor</p>' +
    '<table style="border-collapse:collapse;font-size:14px">' +
    '<tr><td style="padding:2px 14px 2px 0;color:#6b7a90">Name</td><td>' + esc(name || '(not given)') + '</td></tr>' +
    '<tr><td style="padding:2px 14px 2px 0;color:#6b7a90">Email</td><td><a href="mailto:' + esc(email) + '">' + esc(email) + '</a></td></tr>' +
    '<tr><td style="padding:2px 14px 2px 0;color:#6b7a90">Organization</td><td>' + esc(org || '(not given)') + '</td></tr>' +
    '<tr><td style="padding:2px 14px 2px 0;color:#6b7a90">Website</td><td>' + esc(site || '(not given)') + '</td></tr>' +
    '</table>' +
    '<h3 style="margin:20px 0 6px;font-size:15px">What is stuck</h3>' +
    (challenges.length ? '<ul style="margin:0;padding-left:20px">' + challenges.map(c => '<li>' + esc(c) + '</li>').join('') + '</ul>' : '<p style="margin:0">(none selected)</p>') +
    (note ? '<h3 style="margin:20px 0 6px;font-size:15px">Notes</h3><p style="margin:0;white-space:pre-wrap">' + esc(note) + '</p>' : '') +
    (transcript.length ? '<h3 style="margin:20px 0 6px;font-size:15px">Conversation with the Reframing Engine</h3>' +
      transcript.map(m => '<p style="margin:0 0 8px"><b>' + m.role + ':</b> ' + esc(m.text) + '</p>').join('') : '') +
    '</div>';

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.BRIEF_FROM || 'Struinova Briefs <briefs@struinova.com>',
        to: [process.env.BRIEF_TO || 'ron@struinova.com'],
        reply_to: email,
        subject,
        text,
        html
      })
    });
    if (!r.ok) { res.status(502).json({ error: 'upstream ' + r.status }); return; }
    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'server error' });
  }
}

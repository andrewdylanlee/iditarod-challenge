import { useState, useEffect, useCallback, useRef } from "react";

// ─── TEAMS ────────────────────────────────────────────────────────────────────
const TEAMS = [
  { id: 1, name: "Kevin, Jennika & Family", emoji: "🐺", mushers: ["Jessie Holmes", "Jessie Royer", "Mille Porsild"] },
  { id: 2, name: "Andrew, Jessica & Family", emoji: "🦅", mushers: ["Matt Hall", "Travis Beals", "Jeff Deeter"] },
  { id: 3, name: "David & Debbie", emoji: "🐻", mushers: ["Paige Drobny", "Ryan Redington", "Peter Kaiser"] },
  { id: 4, name: "Adam, Jana & Family", emoji: "🦌", mushers: ["Rohn Buser", "Michelle Phillips", "Wade Marrs"] },
];

// Iditarod checkpoints in order with approx miles from Willow
const CHECKPOINTS = [
  { name: "Willow", miles: 0 },
  { name: "Yentna", miles: 30 },
  { name: "Skwentna", miles: 65 },
  { name: "Finger Lake", miles: 98 },
  { name: "Rainy Pass", miles: 130 },
  { name: "Rohn", miles: 163 },
  { name: "Nikolai", miles: 230 },
  { name: "McGrath", miles: 280 },
  { name: "Takotna", miles: 295 },
  { name: "Ophir", miles: 310 },
  { name: "Iditarod", miles: 420 },
  { name: "Shageluk", miles: 465 },
  { name: "Anvik", miles: 490 },
  { name: "Grayling", miles: 510 },
  { name: "Eagle Island", miles: 545 },
  { name: "Kaltag", miles: 575 },
  { name: "Unalakleet", miles: 650 },
  { name: "Shaktoolik", miles: 700 },
  { name: "Koyuk", miles: 748 },
  { name: "Elim", miles: 793 },
  { name: "Golovin", miles: 820 },
  { name: "White Mountain", miles: 835 },
  { name: "Safety", miles: 893 },
  { name: "Nome", miles: 938 },
];
const TOTAL_MILES = 938;

const STANDINGS_URL = "https://iditarod.com/race/2026/standings/";

// ─── DEMO DATA ────────────────────────────────────────────────────────────────
const DEMO = [
  { place: 1,  name: "Mille Porsild",     checkpoint: "Rohn", inTime: "3/9 20:45:00", dogs: "16", timeEnroute: "4h 4m",  speed: "8.61" },
  { place: 2,  name: "Paige Drobny",      checkpoint: "Rohn", inTime: "3/9 20:40:00", dogs: "15", timeEnroute: "7h 12m", speed: "4.86" },
  { place: 3,  name: "Jessie Holmes",     checkpoint: "Rohn", inTime: "3/9 16:54:00", dogs: "16", timeEnroute: "4h 30m", speed: "7.78" },
  { place: 4,  name: "Ryan Redington",    checkpoint: "Rohn", inTime: "3/9 22:10:00", dogs: "14", timeEnroute: "5h 42m", speed: "6.20" },
  { place: 5,  name: "Matt Hall",         checkpoint: "Rohn", inTime: "3/9 21:05:00", dogs: "16", timeEnroute: "4h 24m", speed: "8.00" },
  { place: 6,  name: "Michelle Phillips", checkpoint: "Rohn", inTime: "3/9 22:30:00", dogs: "15", timeEnroute: "5h 49m", speed: "6.10" },
  { place: 7,  name: "Travis Beals",      checkpoint: "Rohn", inTime: "3/9 21:50:00", dogs: "16", timeEnroute: "5h 9m",  speed: "6.90" },
  { place: 8,  name: "Riley Dyche",       checkpoint: "Rohn", inTime: "3/9 22:00:00", dogs: "15", timeEnroute: "5h 19m", speed: "6.60" },
  { place: 9,  name: "Rohn Buser",        checkpoint: "Rohn", inTime: "3/9 23:15:00", dogs: "14", timeEnroute: "6h 34m", speed: "5.40" },
  { place: 10, name: "Wade Marrs",        checkpoint: "Rohn", inTime: "3/9 23:45:00", dogs: "15", timeEnroute: "6h 4m",  speed: "5.80" },
  { place: 11, name: "Jessie Royer",      checkpoint: "Rohn", inTime: "3/10 00:10:00", dogs: "15", timeEnroute: "7h 29m", speed: "4.70" },
  { place: 12, name: "Lauro Eklund",      checkpoint: "Rohn", inTime: "3/10 00:20:00", dogs: "14", timeEnroute: "7h 39m", speed: "4.60" },
  { place: 13, name: "Peter Kaiser",      checkpoint: "Rohn", inTime: "3/10 00:30:00", dogs: "16", timeEnroute: "7h 49m", speed: "4.50" },
  { place: 14, name: "Keaton Loebrich",   checkpoint: "Rohn", inTime: "3/10 00:40:00", dogs: "15", timeEnroute: "7h 59m", speed: "4.40" },
  { place: 16, name: "Jeff Deeter",       checkpoint: "Rainy Pass", inTime: "3/9 18:00:00", dogs: "14", timeEnroute: "5h 36m", speed: "5.20" },
  { place: 17, name: "Chad Stoddard",     checkpoint: "Rainy Pass", inTime: "3/9 18:30:00", dogs: "15", timeEnroute: "6h 6m",  speed: "4.90" },
  { place: 18, name: "Hanna Lyrek",       checkpoint: "Rainy Pass", inTime: "3/9 19:00:00", dogs: "14", timeEnroute: "6h 36m", speed: "4.60" },
  { place: 19, name: "Gabe Dunham",       checkpoint: "Rainy Pass", inTime: "3/9 19:30:00", dogs: "15", timeEnroute: "7h 6m",  speed: "4.30" },
  { place: 20, name: "Josi Shelley",      checkpoint: "Rainy Pass", inTime: "3/9 20:00:00", dogs: "13", timeEnroute: "7h 36m", speed: "4.00" },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function matchMusher(teamName, standingsName) {
  const norm = s => s.toLowerCase().trim()
    .replace(/æ/g,"ae").replace(/ø/g,"o").replace(/å/g,"aa").replace(/[^a-z\s]/g,"");
  const a = norm(teamName), b = norm(standingsName);
  if (a === b) return true;
  const lastA = a.split(" ").pop(), lastB = b.split(" ").pop();
  if (lastA && lastA.length > 3 && lastA === lastB) return true;
  return false;
}

function getCheckpointMiles(name) {
  const cp = CHECKPOINTS.find(c => c.name.toLowerCase() === name?.toLowerCase());
  return cp ? cp.miles : 0;
}

function parseStandingsHTML(html) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const rows = doc.querySelectorAll("table tr");
  const results = [];
  rows.forEach(row => {
    const cells = row.querySelectorAll("td");
    if (cells.length < 10) return;
    const place = parseInt(cells[0]?.textContent?.trim(), 10);
    if (isNaN(place)) return;
    const name = cells[1]?.textContent?.trim().replace(/\s+/g," ");
    const checkpoint = cells[3]?.textContent?.trim();
    const inTime = cells[4]?.textContent?.trim();
    const dogs = cells[5]?.textContent?.trim();
    const timeEnroute = cells[9]?.textContent?.trim();
    const speed = cells[12]?.textContent?.trim();
    if (name && checkpoint) results.push({ place, name, checkpoint, inTime, dogs, timeEnroute, speed });
  });
  return results;
}

async function fetchStandings() {
  const proxies = [
    `https://corsproxy.io/?url=${encodeURIComponent(STANDINGS_URL)}`,
    `https://api.allorigins.win/get?url=${encodeURIComponent(STANDINGS_URL)}`,
  ];
  for (const url of proxies) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
      if (!res.ok) continue;
      const ct = res.headers.get("content-type") || "";
      let html = ct.includes("json") ? (await res.json())?.contents : await res.text();
      if (!html) continue;
      const data = parseStandingsHTML(html);
      if (data.length > 0) return data;
    } catch (_) {}
  }
  return null;
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Source+Serif+4:ital,opsz,wght@0,8..60,300;0,8..60,400;0,8..60,600;1,8..60,400&family=Courier+Prime:wght@400;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #0d1a0f; --surface: #13231a; --surface-alt: #192e20; --surface-lift: #1e3626;
    --border: #2a4a30; --border-subtle: #1e3626;
    --gold: #c9973a; --gold-light: #e8b84b; --gold-dim: rgba(201,151,58,.15);
    --green: #4a9060; --green-light: #6ab87e; --green-dim: rgba(74,144,96,.12);
    --text: #e8e0d0; --text-muted: #6a8070; --text-dim: #3a5040;
    --red: #c95a3a; --white: #f5f0e8; --aurora: #3a8060;
  }
  body, #root { min-height: 100vh; background: var(--bg); color: var(--text); font-family: 'Source Serif 4', Georgia, serif; }

  /* Snowflake background effect */
  .app {
    min-height: 100vh;
    background:
      radial-gradient(ellipse 80% 40% at 20% 0%, rgba(58,128,96,.08) 0%, transparent 60%),
      radial-gradient(ellipse 60% 50% at 80% 100%, rgba(201,151,58,.05) 0%, transparent 60%),
      var(--bg);
    position: relative; overflow-x: hidden;
  }

  /* ── Header ── */
  .header {
    position: sticky; top: 0; z-index: 200;
    background: rgba(13,26,15,0.94); backdrop-filter: blur(16px) saturate(180%);
    border-bottom: 1px solid var(--border);
    padding: 14px 28px; display: flex; align-items: center; justify-content: space-between; gap: 16px;
  }
  .header-brand { display: flex; flex-direction: column; gap: 2px; }
  .header-eyebrow { font-family: 'Courier Prime', monospace; font-size: 9px; letter-spacing: .35em; text-transform: uppercase; color: var(--gold); }
  .header-title { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 900; color: var(--white); letter-spacing: -.01em; }
  .header-actions { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
  .live-badge { display: flex; align-items: center; gap: 7px; font-family: 'Courier Prime', monospace; font-size: 10px; letter-spacing: .2em; color: var(--green-light); text-transform: uppercase; white-space: nowrap; }
  .live-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--green-light); animation: pulse 2s ease-in-out infinite; flex-shrink: 0; }
  @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.3;transform:scale(.7)} }
  .icon-btn { background: transparent; border: 1px solid var(--border); border-radius: 2px; color: var(--text-muted); cursor: pointer; padding: 6px 12px; font-family: 'Courier Prime', monospace; font-size: 10px; letter-spacing: .12em; text-transform: uppercase; transition: border-color .2s, color .2s, background .2s; white-space: nowrap; }
  .icon-btn:hover { border-color: var(--gold); color: var(--gold); }
  .icon-btn:disabled { opacity: .4; cursor: not-allowed; }
  .icon-btn.active { border-color: var(--green); color: var(--green-light); background: var(--green-dim); }

  /* ── Nav tabs ── */
  .tab-nav { display: flex; gap: 0; border-bottom: 1px solid var(--border); background: var(--surface); padding: 0 28px; overflow-x: auto; scrollbar-width: none; }
  .tab-nav::-webkit-scrollbar { display: none; }
  .tab-btn { font-family: 'Courier Prime', monospace; font-size: 10px; letter-spacing: .2em; text-transform: uppercase; padding: 14px 20px; background: transparent; border: none; border-bottom: 2px solid transparent; color: var(--text-muted); cursor: pointer; white-space: nowrap; transition: color .2s, border-color .2s; margin-bottom: -1px; }
  .tab-btn:hover { color: var(--text); }
  .tab-btn.active { color: var(--gold); border-bottom-color: var(--gold); }

  /* ── Main ── */
  .main { max-width: 900px; margin: 0 auto; padding: 32px 20px 100px; }

  /* ── Status bar ── */
  .status-bar { display: flex; align-items: center; gap: 10px; padding: 10px 16px; border-radius: 2px; margin-bottom: 20px; font-family: 'Courier Prime', monospace; font-size: 11px; letter-spacing: .04em; }
  .status-loading { background: rgba(74,144,96,.07); border: 1px solid rgba(74,144,96,.2); color: var(--green-light); }
  .status-error { background: rgba(201,90,58,.07); border: 1px solid rgba(201,90,58,.22); color: #e8866a; }
  .spinner { width:12px; height:12px; flex-shrink:0; border: 2px solid rgba(106,184,126,.2); border-top-color: var(--green-light); border-radius: 50%; animation: spin .75s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .timestamp { text-align:center; font-family: 'Courier Prime', monospace; font-size:10px; letter-spacing:.1em; color:var(--text-muted); margin-bottom:28px; }

  /* ── Family Cards ── */
  .family-board { display: flex; flex-direction: column; gap: 16px; }
  .family-card { background: var(--surface); border: 1px solid var(--border); border-radius: 3px; overflow: hidden; animation: rise .4s ease both; }
  .family-card.is-leading { border-color: var(--gold); box-shadow: 0 0 40px rgba(201,151,58,.12), 0 0 0 1px rgba(201,151,58,.08); }
  @keyframes rise { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
  .card-header { display:flex; align-items:center; gap:14px; padding:15px 20px; border-bottom: 1px solid var(--border-subtle); cursor: default; }
  .rank-num { font-family:'Playfair Display',serif; font-weight:900; font-size:34px; width:40px; flex-shrink:0; line-height:1; color:var(--border); }
  .r1 { color:var(--gold) !important; }
  .r2 { color:#8a8a8a !important; }
  .r3 { color:#7a5530 !important; }
  .card-family { flex:1; min-width:0; }
  .family-emoji { font-size:20px; margin-bottom:2px; }
  .family-name { font-family:'Playfair Display',serif; font-size:18px; font-weight:700; color:var(--white); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .card-avg { text-align:right; flex-shrink:0; }
  .avg-label { font-family:'Courier Prime',monospace; font-size:8px; letter-spacing:.28em; text-transform:uppercase; color:var(--text-muted); display:block; margin-bottom:2px; }
  .avg-value { font-family:'Playfair Display',serif; font-size:26px; font-weight:900; color:var(--gold); line-height:1; }
  .avg-value.tbd { font-size:16px; color:var(--text-muted); font-style:italic; font-weight:400; }
  .musher-list { padding:2px 0; }
  .musher-row { display:grid; grid-template-columns:42px 1fr auto; align-items:center; gap:12px; padding:10px 20px; border-bottom:1px solid rgba(42,74,48,.3); transition:background .15s; }
  .musher-row:last-child { border-bottom:none; }
  .musher-row:hover { background:rgba(255,255,255,.018); }
  .m-place { font-family:'Courier Prime',monospace; font-size:13px; font-weight:700; color:var(--green-light); text-align:center; }
  .m-place.tbd { color:var(--text-muted); }
  .m-info { min-width:0; }
  .m-name { font-size:14px; color:var(--text); }
  .m-meta { display:flex; gap:14px; margin-top:3px; flex-wrap:wrap; }
  .m-meta-item { font-family:'Courier Prime',monospace; font-size:10px; color:var(--text-muted); white-space:nowrap; }
  .m-meta-item span { color:var(--text-dim); margin-right:3px; }
  .m-checkpoint { font-family:'Courier Prime',monospace; font-size:11px; color:var(--text-muted); text-align:right; white-space:nowrap; }

  /* ── Trail Map ── */
  .trail-section { margin-bottom: 40px; }
  .section-header { display:flex; align-items:center; gap:12px; margin-bottom:20px; }
  .section-title { font-family:'Playfair Display',serif; font-size:22px; font-weight:700; color:var(--white); }
  .section-rule { flex:1; height:1px; background:var(--border); }
  .trail-map { background:var(--surface); border:1px solid var(--border); border-radius:3px; padding:28px 24px; overflow:hidden; }
  .trail-scroll { overflow-x:auto; padding-bottom:8px; }
  .trail-canvas { position:relative; height:200px; min-width:800px; }
  /* Trail line */
  .trail-line { position:absolute; top:50%; left:0; right:0; height:3px; background:linear-gradient(90deg,var(--border),var(--border-subtle)); transform:translateY(-50%); border-radius:2px; }
  .trail-progress { position:absolute; top:0; left:0; height:100%; background:linear-gradient(90deg,var(--green),var(--aurora)); border-radius:2px; }
  /* Checkpoint markers */
  .cp-marker { position:absolute; top:50%; transform:translate(-50%,-50%); display:flex; flex-direction:column; align-items:center; gap:4px; cursor:default; }
  .cp-dot { width:8px; height:8px; border-radius:50%; background:var(--border); border:2px solid var(--surface); transition:background .2s; flex-shrink:0; }
  .cp-dot.reached { background:var(--green-light); box-shadow:0 0 8px rgba(106,184,126,.5); }
  .cp-dot.current { background:var(--gold); box-shadow:0 0 12px rgba(201,151,58,.6); animation:glow 2s ease-in-out infinite; }
  @keyframes glow { 0%,100%{box-shadow:0 0 12px rgba(201,151,58,.6)} 50%{box-shadow:0 0 20px rgba(201,151,58,.9)} }
  .cp-label { font-family:'Courier Prime',monospace; font-size:8px; letter-spacing:.05em; color:var(--text-muted); white-space:nowrap; position:absolute; top:28px; }
  .cp-label.flip { top:auto; bottom:28px; }
  /* Musher dots on map */
  .musher-dot { position:absolute; top:50%; transform:translate(-50%,-50%); width:20px; height:20px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:700; border:2px solid var(--bg); transition:left .8s ease; cursor:pointer; z-index:10; }
  .musher-dot:hover .musher-tooltip { display:block; }
  .musher-tooltip { display:none; position:absolute; bottom:28px; left:50%; transform:translateX(-50%); background:rgba(10,20,12,.95); border:1px solid var(--border); border-radius:2px; padding:8px 12px; white-space:nowrap; font-family:'Courier Prime',monospace; font-size:10px; color:var(--text); z-index:20; pointer-events:none; }
  .musher-tooltip::after { content:''; position:absolute; top:100%; left:50%; transform:translateX(-50%); border:5px solid transparent; border-top-color:var(--border); }
  .map-legend { display:flex; gap:20px; flex-wrap:wrap; margin-top:20px; padding-top:16px; border-top:1px solid var(--border-subtle); }
  .legend-item { display:flex; align-items:center; gap:8px; font-family:'Courier Prime',monospace; font-size:10px; color:var(--text-muted); }
  .legend-dot { width:14px; height:14px; border-radius:50%; border:2px solid var(--bg); flex-shrink:0; }
  .nome-flag { position:absolute; top:50%; right:0; transform:translateY(-50%); font-size:20px; }

  /* ── Position History Chart ── */
  .chart-container { background:var(--surface); border:1px solid var(--border); border-radius:3px; padding:24px; overflow:hidden; }
  .chart-svg { width:100%; overflow:visible; }
  .chart-axis-label { font-family:'Courier Prime',monospace; font-size:9px; fill:var(--text-muted); }
  .chart-grid-line { stroke:var(--border-subtle); stroke-width:1; }
  .chart-line { fill:none; stroke-width:2.5; stroke-linecap:round; stroke-linejoin:round; transition:opacity .2s; }
  .chart-dot { transition:r .15s, opacity .2s; cursor:pointer; }
  .chart-legend { display:flex; gap:16px; flex-wrap:wrap; margin-top:16px; padding-top:14px; border-top:1px solid var(--border-subtle); }
  .chart-legend-item { display:flex; align-items:center; gap:7px; font-family:'Courier Prime',monospace; font-size:10px; color:var(--text-muted); cursor:pointer; transition:color .2s; }
  .chart-legend-swatch { width:24px; height:3px; border-radius:2px; flex-shrink:0; }
  .chart-legend-item:hover { color:var(--text); }
  .chart-legend-item.dimmed { opacity:.35; }
  .chart-no-data { text-align:center; padding:48px; font-family:'Courier Prime',monospace; font-size:12px; color:var(--text-muted); letter-spacing:.1em; }

  /* ── Celebration overlay ── */
  .celebration-overlay { position:fixed; inset:0; z-index:1000; pointer-events:none; display:flex; align-items:center; justify-content:center; }
  .celebration-backdrop { position:absolute; inset:0; background:rgba(0,0,0,.7); backdrop-filter:blur(4px); }
  .celebration-card { position:relative; z-index:1; background:var(--surface); border:2px solid var(--gold); border-radius:4px; padding:48px 64px; text-align:center; animation:celebIn .6s cubic-bezier(.34,1.56,.64,1) both; max-width:500px; margin:20px; }
  @keyframes celebIn { from{opacity:0;transform:scale(.7) translateY(40px)} to{opacity:1;transform:scale(1) translateY(0)} }
  .celebration-trophy { font-size:72px; margin-bottom:16px; animation:bounce 1s ease-in-out infinite alternate; }
  @keyframes bounce { from{transform:translateY(0) rotate(-5deg)} to{transform:translateY(-12px) rotate(5deg)} }
  .celebration-title { font-family:'Playfair Display',serif; font-size:14px; font-weight:700; color:var(--gold); letter-spacing:.3em; text-transform:uppercase; margin-bottom:8px; }
  .celebration-winner { font-family:'Playfair Display',serif; font-size:32px; font-weight:900; color:var(--white); margin-bottom:4px; }
  .celebration-avg { font-family:'Courier Prime',monospace; font-size:13px; color:var(--text-muted); letter-spacing:.1em; }
  .confetti-piece { position:absolute; width:8px; height:8px; opacity:0; animation:confetti-fall 3s ease-in infinite; }
  @keyframes confetti-fall { 0%{opacity:1;transform:translateY(-20px) rotate(0deg)} 100%{opacity:0;transform:translateY(100vh) rotate(720deg)} }

  /* ── Full standings table ── */
  .standings-table-wrap { background:var(--surface); border:1px solid var(--border); border-radius:3px; overflow:hidden; }
  .standings-table { width:100%; border-collapse:collapse; font-size:13px; }
  .standings-table th { font-family:'Courier Prime',monospace; font-size:8px; letter-spacing:.22em; text-transform:uppercase; color:var(--text-muted); font-weight:400; padding:10px 14px; text-align:left; border-bottom:1px solid var(--border); background:var(--surface-alt); }
  .standings-table td { padding:9px 14px; border-bottom:1px solid rgba(42,74,48,.25); color:var(--text); vertical-align:middle; }
  .standings-table tr:last-child td { border-bottom:none; }
  .standings-table tr:hover td { background:rgba(255,255,255,.018); }
  .col-place { font-family:'Courier Prime',monospace; font-weight:700; color:var(--green-light); }
  .col-name { font-size:14px; }
  .col-sub { font-family:'Courier Prime',monospace; font-size:10px; color:var(--text-muted); }
  .standings-table tr.hl td { background:rgba(201,151,58,.07); }
  .standings-table tr.hl .col-name { color:var(--gold-light); }

  /* ── Notif permission bar ── */
  .notif-bar { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:12px 20px; background:var(--gold-dim); border:1px solid rgba(201,151,58,.25); border-radius:2px; margin-bottom:20px; }
  .notif-bar-text { font-family:'Courier Prime',monospace; font-size:11px; color:var(--gold-light); letter-spacing:.04em; }
  .notif-bar-actions { display:flex; gap:8px; flex-shrink:0; }

  /* ── Section toggle ── */
  .section-row { display:flex; align-items:center; gap:12px; margin-bottom:14px; }
  .section-label { font-family:'Courier Prime',monospace; font-size:9px; letter-spacing:.28em; text-transform:uppercase; color:var(--text-muted); white-space:nowrap; }
  .section-rule2 { flex:1; height:1px; background:var(--border); }
  .toggle-btn { font-family:'Courier Prime',monospace; font-size:9px; letter-spacing:.15em; text-transform:uppercase; padding:5px 12px; background:transparent; border:1px solid var(--border); border-radius:2px; color:var(--text-muted); cursor:pointer; transition:border-color .2s,color .2s; }
  .toggle-btn:hover { border-color:var(--gold); color:var(--gold); }

  @media(max-width:600px) {
    .header { padding:12px 16px; }
    .header-title { font-size:16px; }
    .tab-nav { padding:0 12px; }
    .main { padding:20px 12px 80px; }
    .family-name { font-size:15px; }
    .avg-value { font-size:20px; }
    .rank-num { font-size:26px; width:32px; }
    .m-meta { display:none; }
    .m-checkpoint { display:none; }
    .celebration-card { padding:32px 24px; }
  }
`;

// Team colors for chart
const TEAM_COLORS = ["#c9973a", "#6ab87e", "#7aa8e0", "#e07a7a"];

// ─── COMPONENT ────────────────────────────────────────────────────────────────
export default function App() {
  const [standings, setStandings]       = useState(DEMO);
  const [isDemo, setIsDemo]             = useState(true);
  const [loading, setLoading]           = useState(true);
  const [errorMsg, setErrorMsg]         = useState(null);
  const [updatedAt, setUpdatedAt]       = useState(null);
  const [activeTab, setActiveTab]       = useState("leaderboard");
  const [showFull, setShowFull]         = useState(false);
  const [history, setHistory]           = useState([]);  // [{time, teamAvgs}]
  const [notifState, setNotifState]     = useState("prompt"); // prompt | granted | denied | hidden
  const [prevAvgs, setPrevAvgs]         = useState(null);
  const [celebration, setCelebration]   = useState(null); // winner team
  const [hoveredTeam, setHoveredTeam]   = useState(null);
  const notifWorkerRef                  = useRef(null);

  // Check notification permission on mount
  useEffect(() => {
    if (!("Notification" in window)) { setNotifState("hidden"); return; }
    if (Notification.permission === "granted") setNotifState("granted");
    else if (Notification.permission === "denied") setNotifState("denied");
  }, []);

  const requestNotifPermission = async () => {
    const perm = await Notification.requestPermission();
    setNotifState(perm);
  };

  const sendNotification = useCallback((title, body) => {
    if (Notification.permission === "granted") {
      new Notification(title, { body, icon: "https://iditarod.com/favicon.ico" });
    }
  }, []);

  const allMusherNames = TEAMS.flatMap(t => t.mushers);

  const teamResults = TEAMS.map(team => {
    const musherData = team.mushers.map(name => {
      const entry = standings.find(s => matchMusher(name, s.name));
      return entry ? { ...entry, label: name } : { label: name, place: null, checkpoint: "", dogs: "", timeEnroute: "" };
    }).sort((a, b) => {
      if (a.place === null && b.place === null) return 0;
      if (a.place === null) return 1;
      if (b.place === null) return -1;
      return a.place - b.place;
    });
    const allPlaced = musherData.every(d => d.place !== null);
    const avg = allPlaced ? musherData.reduce((s, d) => s + d.place, 0) / musherData.length : null;
    return { ...team, musherData, avg };
  });

  const ranked = [...teamResults].sort((a, b) => {
    if (a.avg === null && b.avg === null) return 0;
    if (a.avg === null) return 1;
    if (b.avg === null) return -1;
    return a.avg - b.avg;
  });

  const load = useCallback(async () => {
    setLoading(true); setErrorMsg(null);
    const data = await fetchStandings();
    const finalData = data && data.length > 0 ? data : null;
    if (finalData) {
      setStandings(finalData);
      setIsDemo(false);
    } else {
      setIsDemo(true);
      setErrorMsg("Showing last known standings — live fetch unavailable.");
    }

    const now = new Date();
    setUpdatedAt(now);
    setLoading(false);

    // Record history snapshot
    const currentAvgs = TEAMS.map(team => {
      const musherData = team.mushers.map(name => {
        const entry = (finalData || standings).find(s => matchMusher(name, s.name));
        return entry ? entry.place : null;
      });
      const allPlaced = musherData.every(p => p !== null);
      return allPlaced ? musherData.reduce((s, p) => s + p, 0) / musherData.length : null;
    });

    setHistory(prev => {
      const newEntry = { time: now.toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" }), avgs: currentAvgs };
      const updated = [...prev, newEntry].slice(-20); // keep last 20 snapshots
      return updated;
    });

    // Check for leader changes and notify
    if (prevAvgs) {
      const prevLeader = prevAvgs.indexOf(Math.min(...prevAvgs.filter(v => v !== null)));
      const newLeader  = currentAvgs.indexOf(Math.min(...currentAvgs.filter(v => v !== null)));
      if (newLeader !== prevLeader && currentAvgs[newLeader] !== null) {
        sendNotification("🐕 Lead Change!", `${TEAMS[newLeader].name} takes the lead with avg ${currentAvgs[newLeader].toFixed(2)}`);
      }
    }
    setPrevAvgs(currentAvgs);

    // Check for a finisher at Nome
    if (finalData) {
      const nomeMusher = finalData.find(m => m.checkpoint?.toLowerCase() === "nome");
      if (nomeMusher) {
        const winnerTeam = TEAMS.find(t => t.mushers.some(n => matchMusher(n, nomeMusher.name)));
        if (winnerTeam) setCelebration(winnerTeam);
      }
    }
  }, [prevAvgs, standings, sendNotification]);

  useEffect(() => {
    load();
    const id = setInterval(load, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  // ─── Trail Map rendering ──────────────────────────────────────────────────
  const TrailMap = () => {
    const furthestCP = standings.reduce((best, m) => {
      const miles = getCheckpointMiles(m.checkpoint);
      return miles > best ? miles : best;
    }, 0);

    return (
      <div className="trail-section">
        <div className="section-header">
          <h2 className="section-title">Trail Map</h2>
          <div className="section-rule" />
        </div>
        <div className="trail-map">
          <div className="trail-scroll">
            <div className="trail-canvas">
              {/* Main trail line */}
              <div className="trail-line">
                <div className="trail-progress" style={{ width: `${(furthestCP / TOTAL_MILES) * 100}%` }} />
              </div>
              <div className="nome-flag">🏁</div>

              {/* Checkpoint dots */}
              {CHECKPOINTS.map((cp, i) => {
                const pct = (cp.miles / TOTAL_MILES) * 100;
                const reached = standings.some(m => {
                  const mMiles = getCheckpointMiles(m.checkpoint);
                  return mMiles >= cp.miles;
                });
                const isCurrent = standings.some(m => m.checkpoint === cp.name);
                return (
                  <div key={cp.name} className="cp-marker" style={{ left: `${pct}%` }}>
                    <div className={`cp-dot ${isCurrent ? "current" : reached ? "reached" : ""}`} />
                    <div className={`cp-label ${i % 2 === 0 ? "" : "flip"}`}>{cp.name}</div>
                  </div>
                );
              })}

              {/* Musher dots — one per team musher */}
              {TEAMS.flatMap((team, ti) =>
                team.mushers.map((name, mi) => {
                  const entry = standings.find(s => matchMusher(name, s.name));
                  if (!entry) return null;
                  const miles = getCheckpointMiles(entry.checkpoint);
                  const pct = (miles / TOTAL_MILES) * 100;
                  const initials = name.split(" ").map(w => w[0]).join("").slice(0,2);
                  return (
                    <div
                      key={name}
                      className="musher-dot"
                      style={{
                        left: `${pct}%`,
                        top: `calc(50% + ${(mi - 1) * 24}px)`,
                        background: TEAM_COLORS[ti],
                        color: "#0d1a0f",
                        fontFamily: "'Courier Prime', monospace",
                      }}
                    >
                      {initials}
                      <div className="musher-tooltip">
                        #{entry.place} {name}<br/>
                        📍 {entry.checkpoint} · {miles}mi<br/>
                        {entry.dogs && `🐕 ${entry.dogs} dogs`}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Legend */}
          <div className="map-legend">
            {TEAMS.map((team, i) => (
              <div key={team.id} className="legend-item">
                <div className="legend-dot" style={{ background: TEAM_COLORS[i] }} />
                {team.name}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // ─── Position History Chart ───────────────────────────────────────────────
  const HistoryChart = () => {
    if (history.length < 2) {
      return (
        <div className="chart-container">
          <div className="chart-no-data">
            COLLECTING DATA — CHECK BACK AFTER NEXT REFRESH
          </div>
        </div>
      );
    }

    const W = 800, H = 260, padL = 40, padR = 16, padT = 20, padB = 36;
    const chartW = W - padL - padR, chartH = H - padT - padB;

    // Y axis: positions 1 to maxAvg+1 (lower = better, flip axis)
    const allAvgs = history.flatMap(h => h.avgs.filter(v => v !== null));
    const minAvg = Math.floor(Math.min(...allAvgs, 1));
    const maxAvg = Math.ceil(Math.max(...allAvgs, 15));
    const yRange = maxAvg - minAvg;

    const xOf = i => padL + (i / (history.length - 1)) * chartW;
    const yOf = v => padT + ((v - minAvg) / yRange) * chartH;

    const gridLines = Array.from({ length: 5 }, (_, i) => minAvg + (i / 4) * yRange);

    return (
      <div className="chart-container">
        <svg viewBox={`0 0 ${W} ${H}`} className="chart-svg">
          {/* Grid */}
          {gridLines.map((v, i) => (
            <g key={i}>
              <line x1={padL} x2={W - padR} y1={yOf(v)} y2={yOf(v)} className="chart-grid-line" strokeDasharray="4 4" />
              <text x={padL - 6} y={yOf(v) + 4} textAnchor="end" className="chart-axis-label">{v.toFixed(1)}</text>
            </g>
          ))}
          {/* X axis labels */}
          {history.map((h, i) => (
            i % Math.max(1, Math.floor(history.length / 6)) === 0 && (
              <text key={i} x={xOf(i)} y={H - 4} textAnchor="middle" className="chart-axis-label">{h.time}</text>
            )
          ))}
          {/* Y axis label */}
          <text x={10} y={H / 2} textAnchor="middle" className="chart-axis-label" transform={`rotate(-90,10,${H/2})`}>AVG PLACE</text>

          {/* Team lines */}
          {TEAMS.map((team, ti) => {
            const points = history.map((h, i) => ({ x: xOf(i), y: h.avgs[ti] !== null ? yOf(h.avgs[ti]) : null })).filter(p => p.y !== null);
            if (points.length < 2) return null;
            const d = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
            const isHovered = hoveredTeam === ti;
            return (
              <g key={team.id} style={{ opacity: hoveredTeam !== null && !isHovered ? 0.2 : 1, transition: "opacity .2s" }}>
                <path d={d} className="chart-line" stroke={TEAM_COLORS[ti]} />
                {points.map((p, i) => (
                  <circle key={i} cx={p.x} cy={p.y} r={isHovered ? 5 : 3} fill={TEAM_COLORS[ti]} className="chart-dot" />
                ))}
              </g>
            );
          })}
        </svg>
        <div className="chart-legend">
          {TEAMS.map((team, i) => (
            <div
              key={team.id}
              className={`chart-legend-item ${hoveredTeam !== null && hoveredTeam !== i ? "dimmed" : ""}`}
              onMouseEnter={() => setHoveredTeam(i)}
              onMouseLeave={() => setHoveredTeam(null)}
            >
              <div className="chart-legend-swatch" style={{ background: TEAM_COLORS[i] }} />
              {team.name}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ─── Celebration ─────────────────────────────────────────────────────────
  const Celebration = ({ team }) => {
    const confettiPieces = Array.from({ length: 24 }, (_, i) => ({
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 2}s`,
      color: [TEAM_COLORS[0], TEAM_COLORS[1], TEAM_COLORS[2], TEAM_COLORS[3], "#fff"][Math.floor(Math.random() * 5)],
      size: `${6 + Math.random() * 8}px`,
    }));
    return (
      <div className="celebration-overlay">
        <div className="celebration-backdrop" onClick={() => setCelebration(null)} />
        {confettiPieces.map((p, i) => (
          <div key={i} className="confetti-piece" style={{
            left: p.left, top: 0, animationDelay: p.delay,
            background: p.color, width: p.size, height: p.size,
            borderRadius: Math.random() > .5 ? "50%" : "2px",
          }} />
        ))}
        <div className="celebration-card">
          <div className="celebration-trophy">{team.emoji}</div>
          <div className="celebration-title">Race Complete · Winner</div>
          <div className="celebration-winner">{team.name}</div>
          <div className="celebration-avg">
            {ranked.find(r => r.id === team.id)?.avg?.toFixed(2)} avg place
          </div>
        </div>
      </div>
    );
  };

  const rc = r => r === 0 ? "r1" : r === 1 ? "r2" : r === 2 ? "r3" : "";

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        {celebration && <Celebration team={celebration} />}

        <header className="header">
          <div className="header-brand">
            <span className="header-eyebrow">2026 Iditarod · 54th Running</span>
            <span className="header-title">Iditarod Challenge</span>
          </div>
          <div className="header-actions">
            <div className="live-badge">
              <div className="live-dot" />
              {loading ? "Updating…" : isDemo ? "Cached" : "Live"}
            </div>
            {notifState === "granted" && (
              <div className="live-badge" style={{ color: "var(--gold)" }}>🔔 Alerts on</div>
            )}
            <button className="icon-btn" onClick={load} disabled={loading}>↻ Refresh</button>
          </div>
        </header>

        <nav className="tab-nav">
          {[["leaderboard","🏆 Leaderboard"],["map","🗺 Trail Map"],["chart","📈 History"],["standings","📋 All Mushers"]].map(([id, label]) => (
            <button key={id} className={`tab-btn ${activeTab === id ? "active" : ""}`} onClick={() => setActiveTab(id)}>{label}</button>
          ))}
        </nav>

        <main className="main">
          {/* Notification prompt */}
          {notifState === "prompt" && (
            <div className="notif-bar">
              <span className="notif-bar-text">🔔 Get notified when the lead changes</span>
              <div className="notif-bar-actions">
                <button className="icon-btn active" onClick={requestNotifPermission}>Enable alerts</button>
                <button className="icon-btn" onClick={() => setNotifState("hidden")}>Dismiss</button>
              </div>
            </div>
          )}

          {loading && (
            <div className="status-bar status-loading"><div className="spinner" />Fetching standings from iditarod.com…</div>
          )}
          {!loading && errorMsg && (
            <div className="status-bar status-error">⚠ {errorMsg}</div>
          )}
          {updatedAt && !loading && (
            <p className="timestamp">
              {isDemo ? "Last known standings · " : "Live · "}
              {updatedAt.toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" })} · Auto-refreshes every 5 min
            </p>
          )}

          {/* ── Leaderboard tab ── */}
          {activeTab === "leaderboard" && (
            <div className="family-board">
              {ranked.map((team, rank) => (
                <div className={`family-card${rank === 0 ? " is-leading" : ""}`} key={team.id} style={{ animationDelay: `${rank * .07}s` }}>
                  <div className="card-header">
                    <div className={`rank-num ${rc(rank)}`}>{rank + 1}</div>
                    <div className="card-family">
                      <div className="family-emoji">{team.emoji}</div>
                      <div className="family-name">{team.name}</div>
                    </div>
                    <div className="card-avg">
                      <span className="avg-label">Avg Place</span>
                      <div className={`avg-value${team.avg === null ? " tbd" : ""}`}>
                        {team.avg !== null ? team.avg.toFixed(2) : "TBD"}
                      </div>
                    </div>
                  </div>
                  <div className="musher-list">
                    {team.musherData.map((m, i) => (
                      <div className="musher-row" key={i}>
                        <div className={`m-place${m.place === null ? " tbd" : ""}`}>
                          {m.place === null ? "?" : `#${m.place}`}
                        </div>
                        <div className="m-info">
                          <div className="m-name">{m.label}</div>
                          <div className="m-meta">
                            {m.checkpoint && <div className="m-meta-item"><span>📍</span>{m.checkpoint}</div>}
                            {m.dogs && <div className="m-meta-item"><span>🐕</span>{m.dogs} dogs</div>}
                            {m.timeEnroute && m.timeEnroute !== "0h 0m" && <div className="m-meta-item"><span>⏱</span>{m.timeEnroute} to checkpoint</div>}
                            {m.speed && <div className="m-meta-item"><span>💨</span>{m.speed} mph</div>}
                          </div>
                        </div>
                        {m.checkpoint && <div className="m-checkpoint">{getCheckpointMiles(m.checkpoint)}mi</div>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Trail Map tab ── */}
          {activeTab === "map" && <TrailMap />}

          {/* ── History Chart tab ── */}
          {activeTab === "chart" && (
            <div>
              <div className="section-header">
                <h2 className="section-title">Position History</h2>
                <div className="section-rule" />
              </div>
              <HistoryChart />
              <p style={{ marginTop: 12, fontFamily: "'Courier Prime', monospace", fontSize: 10, color: "var(--text-muted)", letterSpacing: ".08em" }}>
                Chart records average placement snapshots each time standings refresh. Hover a team name to highlight.
              </p>
            </div>
          )}

          {/* ── All Mushers tab ── */}
          {activeTab === "standings" && (
            <div>
              <div className="section-header">
                <h2 className="section-title">Full Race Standings</h2>
                <div className="section-rule" />
              </div>
              <div className="standings-table-wrap">
                <table className="standings-table">
                  <thead>
                    <tr>
                      <th>#</th><th>Musher</th><th>Checkpoint</th><th>Dogs</th><th>Enroute</th><th>Speed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {standings.map((s, i) => {
                      const hl = allMusherNames.some(n => matchMusher(n, s.name));
                      return (
                        <tr key={i} className={hl ? "hl" : ""}>
                          <td className="col-place">{s.place}</td>
                          <td className="col-name">{s.name}</td>
                          <td className="col-sub">{s.checkpoint}</td>
                          <td className="col-sub">{s.dogs || "—"}</td>
                          <td className="col-sub">{s.timeEnroute || "—"}</td>
                          <td className="col-sub">{s.speed ? `${s.speed}mph` : "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}

import { useState, useEffect, useCallback } from "react";

// ─── TEAMS ────────────────────────────────────────────────────────────────────
const TEAMS = [
  {
    id: 1,
    name: "Kevin, Jennika & Family",
    mushers: ["Jessie Holmes", "Thomas Wærner", "Mille Porsild"],
  },
  {
    id: 2,
    name: "Andrew, Jessica & Family",
    mushers: ["Matt Hall", "Travis Beals", "Jeff Deeter"],
  },
  {
    id: 3,
    name: "David & Debbie",
    mushers: ["Paige Drobny", "Ryan Redington", "Peter Kaiser"],
  },
  {
    id: 4,
    name: "Adam, Jana & Family",
    mushers: ["Rohn Buser", "Michelle Phillips", "Wade Marrs"],
  },
];

const STANDINGS_URL = "https://iditarod.com/race/2026/standings/";

// ─── STYLES ───────────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Source+Serif+4:ital,wght@0,300;0,400;0,600;1,400&family=Courier+Prime:wght@400;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #0d1a0f;
    --surface: #13231a;
    --surface-alt: #192e20;
    --border: #2a4a30;
    --gold: #c9973a;
    --gold-light: #e8b84b;
    --green: #4a9060;
    --green-light: #6ab87e;
    --text: #e8e0d0;
    --text-muted: #7a9080;
    --red: #c95a3a;
    --white: #f5f0e8;
  }

  body, #root {
    min-height: 100vh;
    background: var(--bg);
    color: var(--text);
    font-family: 'Source Serif 4', Georgia, serif;
  }

  .app {
    min-height: 100vh;
    background:
      radial-gradient(ellipse at 15% 10%, rgba(74,144,96,0.07) 0%, transparent 45%),
      radial-gradient(ellipse at 85% 85%, rgba(201,151,58,0.05) 0%, transparent 45%),
      var(--bg);
  }

  .header {
    position: sticky; top: 0; z-index: 100;
    background: rgba(13,26,15,0.92);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border);
    padding: 16px 28px;
    display: flex; align-items: center; justify-content: space-between;
  }
  .header-brand { display: flex; flex-direction: column; gap: 3px; }
  .header-eyebrow {
    font-family: 'Courier Prime', monospace;
    font-size: 9px; letter-spacing: 0.35em; text-transform: uppercase; color: var(--gold);
  }
  .header-title {
    font-family: 'Playfair Display', serif;
    font-size: 20px; font-weight: 900; color: var(--white); letter-spacing: -0.01em; line-height: 1;
  }
  .header-right { display: flex; align-items: center; gap: 16px; }
  .live-badge {
    display: flex; align-items: center; gap: 7px;
    font-family: 'Courier Prime', monospace;
    font-size: 10px; letter-spacing: 0.2em; color: var(--green-light); text-transform: uppercase;
  }
  .live-dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: var(--green-light);
    animation: pulse 2s ease-in-out infinite;
  }
  @keyframes pulse {
    0%,100% { opacity: 1; transform: scale(1); }
    50%      { opacity: .35; transform: scale(.75); }
  }
  .refresh-btn {
    font-family: 'Courier Prime', monospace;
    font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase;
    padding: 6px 14px; background: transparent;
    border: 1px solid var(--border); border-radius: 2px;
    color: var(--text-muted); cursor: pointer; transition: border-color .2s, color .2s;
  }
  .refresh-btn:hover { border-color: var(--gold); color: var(--gold); }

  .main { max-width: 860px; margin: 0 auto; padding: 36px 20px 80px; }

  .status-bar {
    display: flex; align-items: center; gap: 10px;
    padding: 11px 18px; border-radius: 2px; margin-bottom: 20px;
    font-family: 'Courier Prime', monospace; font-size: 11px; letter-spacing: .04em;
  }
  .status-loading {
    background: rgba(74,144,96,.07); border: 1px solid rgba(74,144,96,.2); color: var(--green-light);
  }
  .status-error {
    background: rgba(201,90,58,.07); border: 1px solid rgba(201,90,58,.22); color: #e8866a;
  }
  .spinner {
    width:13px; height:13px; flex-shrink:0;
    border: 2px solid rgba(106,184,126,.2); border-top-color: var(--green-light);
    border-radius: 50%; animation: spin .75s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  .timestamp {
    text-align: center; font-family: 'Courier Prime', monospace;
    font-size: 10px; letter-spacing: .12em; color: var(--text-muted); margin-bottom: 28px;
  }

  .family-board { display: flex; flex-direction: column; gap: 18px; margin-bottom: 52px; }

  .family-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 3px; overflow: hidden;
    animation: rise .45s ease both;
  }
  .family-card.is-leading { border-color: var(--gold); box-shadow: 0 0 28px rgba(201,151,58,.10); }
  @keyframes rise {
    from { opacity:0; transform:translateY(10px); }
    to   { opacity:1; transform:translateY(0); }
  }

  .card-header {
    display: flex; align-items: center; gap: 14px;
    padding: 15px 20px; border-bottom: 1px solid var(--border);
  }
  .rank-num {
    font-family: 'Playfair Display', serif; font-weight: 900; font-size: 34px;
    line-height: 1; width: 40px; flex-shrink: 0; color: var(--border);
  }
  .rank-num.r1 { color: var(--gold); }
  .rank-num.r2 { color: #888; }
  .rank-num.r3 { color: #7a5530; }
  .card-family { flex: 1; min-width: 0; }
  .family-name {
    font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700;
    color: var(--white); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .card-avg { text-align: right; flex-shrink: 0; }
  .avg-label {
    font-family: 'Courier Prime', monospace; font-size: 8px;
    letter-spacing: .28em; text-transform: uppercase; color: var(--text-muted);
    display: block; margin-bottom: 2px;
  }
  .avg-value {
    font-family: 'Playfair Display', serif; font-size: 26px; font-weight: 900;
    line-height: 1; color: var(--gold);
  }
  .avg-value.tbd { font-size: 16px; color: var(--text-muted); font-style: italic; font-weight: 400; }

  .musher-list { padding: 2px 0; }
  .musher-row {
    display: flex; align-items: center; gap: 12px;
    padding: 9px 20px; border-bottom: 1px solid rgba(42,74,48,.35);
    transition: background .15s;
  }
  .musher-row:last-child { border-bottom: none; }
  .musher-row:hover { background: rgba(255,255,255,.018); }
  .m-place {
    font-family: 'Courier Prime', monospace; font-size: 13px; font-weight: 700;
    width: 36px; flex-shrink: 0; text-align: center; color: var(--green-light);
  }
  .m-place.tbd  { color: var(--text-muted); }
  .m-name { flex: 1; font-size: 14px; color: var(--text); }
  .m-checkpoint { font-family: 'Courier Prime', monospace; font-size: 11px; color: var(--text-muted); }

  .section-row { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
  .section-label {
    font-family: 'Courier Prime', monospace; font-size: 9px;
    letter-spacing: .28em; text-transform: uppercase; color: var(--text-muted); white-space: nowrap;
  }
  .section-rule { flex: 1; height: 1px; background: var(--border); }
  .toggle-btn {
    font-family: 'Courier Prime', monospace; font-size: 9px;
    letter-spacing: .15em; text-transform: uppercase;
    padding: 5px 12px; background: transparent;
    border: 1px solid var(--border); border-radius: 2px;
    color: var(--text-muted); cursor: pointer; transition: border-color .2s, color .2s;
    white-space: nowrap;
  }
  .toggle-btn:hover { border-color: var(--gold); color: var(--gold); }

  .standings-table { width: 100%; border-collapse: collapse; font-size: 13px; }
  .standings-table th {
    font-family: 'Courier Prime', monospace; font-size: 8px;
    letter-spacing: .22em; text-transform: uppercase;
    color: var(--text-muted); font-weight: 400;
    padding: 7px 12px; text-align: left; border-bottom: 1px solid var(--border);
  }
  .standings-table td {
    padding: 8px 12px; border-bottom: 1px solid rgba(42,74,48,.28);
    color: var(--text); vertical-align: middle;
  }
  .standings-table tr:last-child td { border-bottom: none; }
  .standings-table tr:hover td { background: rgba(255,255,255,.018); }
  .col-place { font-family: 'Courier Prime', monospace; font-weight: 700; color: var(--green-light); width: 50px; }
  .col-name  { font-size: 14px; }
  .col-checkpoint { font-family: 'Courier Prime', monospace; font-size: 11px; color: var(--text-muted); }
  .standings-table tr.hl td { background: rgba(201,151,58,.07); }
  .standings-table tr.hl .col-name { color: var(--gold-light); }

  @media (max-width: 580px) {
    .header-title { font-size: 16px; }
    .family-name  { font-size: 16px; }
    .avg-value    { font-size: 20px; }
    .rank-num     { font-size: 26px; width: 32px; }
    .m-checkpoint, .col-checkpoint { display: none; }
  }
`;

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function matchMusher(teamName, standingsName) {
  const norm = (s) =>
    s.toLowerCase().trim()
      .replace(/æ/g, "ae").replace(/ø/g, "o").replace(/å/g, "aa")
      .replace(/[^a-z\s]/g, "");
  const a = norm(teamName), b = norm(standingsName);
  if (a === b) return true;
  const lastA = a.split(" ").pop();
  const lastB = b.split(" ").pop();
  if (lastA && lastA.length > 3 && lastA === lastB) return true;
  return false;
}

// Use Claude API to fetch and parse the standings page, bypassing CORS
async function fetchStandingsViaAPI() {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      tools: [{ type: "web_search_20250305", name: "web_search" }],
      messages: [
        {
          role: "user",
          content: `Search for the current 2026 Iditarod race standings at iditarod.com/race/2026/standings and return ONLY a JSON array with no explanation, no markdown, no code blocks. Each item should have: place (number), name (string), checkpoint (string). Example format: [{"place":1,"name":"Jessie Holmes","checkpoint":"Finger Lake"}]. Return only the JSON array, nothing else.`,
        },
      ],
    }),
  });

  if (!response.ok) throw new Error(`API error ${response.status}`);
  const data = await response.json();

  // Extract text from response
  const text = data.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("");

  // Parse JSON — strip any accidental markdown fences
  const clean = text.replace(/```json|```/g, "").trim();
  // Find the JSON array in the response
  const match = clean.match(/\[[\s\S]*\]/);
  if (!match) throw new Error("No JSON array found in response");
  return JSON.parse(match[0]);
}

// Also try direct CORS proxies as fallback
async function fetchStandingsDirect() {
  const proxies = [
    `https://corsproxy.io/?url=${encodeURIComponent(STANDINGS_URL)}`,
    `https://api.allorigins.win/get?url=${encodeURIComponent(STANDINGS_URL)}`,
  ];
  for (const url of proxies) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(12000) });
      if (!res.ok) continue;
      const ct = res.headers.get("content-type") || "";
      let html = ct.includes("json") ? (await res.json())?.contents : await res.text();
      if (!html) continue;
      const data = parseHTML(html);
      if (data.length > 0) return data;
    } catch (_) {}
  }
  return null;
}

function parseHTML(html) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const result = [];
  doc.querySelectorAll("table tr").forEach((row) => {
    const cells = row.querySelectorAll("td");
    if (cells.length < 2) return;
    const place = parseInt(cells[0]?.textContent?.trim(), 10);
    if (isNaN(place)) return;
    const name = (cells[1]?.textContent?.trim() || cells[2]?.textContent?.trim() || "").replace(/\s+/g, " ");
    const checkpoint = cells[cells.length - 2]?.textContent?.trim() || "";
    if (name) result.push({ place, name, checkpoint });
  });
  return result;
}

async function fetchStandings() {
  // Try direct CORS proxy first (faster)
  const direct = await fetchStandingsDirect();
  if (direct && direct.length > 0) return direct;
  // Fall back to Claude API
  return await fetchStandingsViaAPI();
}

// ─── DEMO DATA ────────────────────────────────────────────────────────────────
const DEMO = [
  { place: 1,  name: "Jessie Holmes",        checkpoint: "Skwentna" },
  { place: 2,  name: "Matt Hall",             checkpoint: "Skwentna" },
  { place: 3,  name: "Paige Drobny",          checkpoint: "Finger Lake" },
  { place: 4,  name: "Ryan Redington",        checkpoint: "Finger Lake" },
  { place: 5,  name: "Mille Porsild",         checkpoint: "Finger Lake" },
  { place: 6,  name: "Travis Beals",          checkpoint: "Rainy Pass" },
  { place: 7,  name: "Thomas Wærner",         checkpoint: "Rainy Pass" },
  { place: 8,  name: "Peter Kaiser",          checkpoint: "Rohn" },
  { place: 9,  name: "Wade Marrs",            checkpoint: "Rohn" },
  { place: 10, name: "Richie Diehl",          checkpoint: "Rohn" },
  { place: 11, name: "Brent Sass",            checkpoint: "Rohn" },
  { place: 12, name: "Aaron Burmeister",      checkpoint: "Rohn" },
  { place: 13, name: "Lauro Eklund",          checkpoint: "Willow" },
  { place: 14, name: "Jessie Royer",          checkpoint: "Willow" },
  { place: 15, name: "Bailey Vitello",        checkpoint: "Willow" },
  { place: 16, name: "Keaton Loebrich",       checkpoint: "Willow" },
  { place: 17, name: "Chad Stoddard",         checkpoint: "Willow" },
  { place: 18, name: "Rohn Buser",            checkpoint: "Willow" },
  { place: 19, name: "Gabe Dunham",           checkpoint: "Willow" },
  { place: 20, name: "Michelle Phillips",     checkpoint: "Willow" },
  { place: 21, name: "Jeff Deeter",           checkpoint: "Willow" },
  { place: 22, name: "Martin Apayauq Reitan", checkpoint: "Willow" },
  { place: 23, name: "Anna Berington",        checkpoint: "Willow" },
  { place: 24, name: "Kristy Berington",      checkpoint: "Willow" },
  { place: 25, name: "Gunnar Johnson",        checkpoint: "Willow" },
  { place: 26, name: "Joseph Sabin",          checkpoint: "Willow" },
  { place: 27, name: "Riley Dyche",           checkpoint: "Willow" },
  { place: 28, name: "Nathaniel Hamlyn",      checkpoint: "Willow" },
  { place: 29, name: "Adam Lindenmuth",       checkpoint: "Willow" },
  { place: 30, name: "Joey Hinkle",           checkpoint: "Willow" },
  { place: 31, name: "Josi Shelley",          checkpoint: "Willow" },
  { place: 32, name: "Sadie Delia",           checkpoint: "Willow" },
  { place: 33, name: "Zach Steer",            checkpoint: "Willow" },
  { place: 34, name: "Quince Mountain",       checkpoint: "Willow" },
  { place: 35, name: "Lev Shvarts",           checkpoint: "Willow" },
  { place: 36, name: "Hanna Lyrek",           checkpoint: "Willow" },
  { place: 37, name: "Nicolas Petit",         checkpoint: "Willow" },
];

// ─── COMPONENT ────────────────────────────────────────────────────────────────
export default function App() {
  const [standings, setStandings] = useState(DEMO);
  const [isDemo,    setIsDemo]    = useState(true);
  const [loading,   setLoading]   = useState(true);
  const [errorMsg,  setErrorMsg]  = useState(null);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [showFull,  setShowFull]  = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await fetchStandings();
      if (data && data.length > 0) {
        setStandings(data);
        setIsDemo(false);
      } else {
        throw new Error("Empty standings");
      }
    } catch (e) {
      setIsDemo(true);
      setErrorMsg("Showing estimated positions — live data will update automatically.");
    }
    setUpdatedAt(new Date());
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, [load]);

  const allMusherNames = TEAMS.flatMap((t) => t.mushers);

  const teamResults = TEAMS.map((team) => {
    const musherData = team.mushers.map((name) => {
      const entry = standings.find((s) => matchMusher(name, s.name));
      return entry ? { ...entry, label: name } : { label: name, place: null, checkpoint: "" };
    });
    const allPlaced = musherData.every((d) => d.place !== null);
    const avg = allPlaced
      ? musherData.reduce((s, d) => s + d.place, 0) / musherData.length
      : null;
    return { ...team, musherData, avg };
  });

  const ranked = [...teamResults].sort((a, b) => {
    if (a.avg === null && b.avg === null) return 0;
    if (a.avg === null) return 1;
    if (b.avg === null) return -1;
    return a.avg - b.avg;
  });

  const rc = (r) => (r === 0 ? "r1" : r === 1 ? "r2" : r === 2 ? "r3" : "");

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        <header className="header">
          <div className="header-brand">
            <span className="header-eyebrow">2026 Iditarod · 54th Running</span>
            <span className="header-title">Iditarod Challenge</span>
          </div>
          <div className="header-right">
            <div className="live-badge">
              <div className="live-dot" />
              {loading ? "Updating…" : "Live"}
            </div>
            <button className="refresh-btn" onClick={load} disabled={loading}>
              ↻ Refresh
            </button>
          </div>
        </header>

        <main className="main">
          {loading && (
            <div className="status-bar status-loading">
              <div className="spinner" />
              Fetching standings from iditarod.com…
            </div>
          )}
          {!loading && errorMsg && (
            <div className="status-bar status-error">⚠ {errorMsg}</div>
          )}
          {updatedAt && !loading && (
            <p className="timestamp">
              {isDemo ? "Demo data · " : ""}
              Last updated {updatedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              {" · "}Auto-refreshes every 5 min
            </p>
          )}

          <div className="family-board">
            {ranked.map((team, rank) => (
              <div
                className={`family-card${rank === 0 ? " is-leading" : ""}`}
                key={team.id}
                style={{ animationDelay: `${rank * 0.08}s` }}
              >
                <div className="card-header">
                  <div className={`rank-num ${rc(rank)}`}>{rank + 1}</div>
                  <div className="card-family">
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
                      <div className="m-name">{m.label}</div>
                      {m.checkpoint && (
                        <div className="m-checkpoint">{m.checkpoint}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="section-row">
            <span className="section-label">Full Race Standings</span>
            <div className="section-rule" />
            <button className="toggle-btn" onClick={() => setShowFull((s) => !s)}>
              {showFull ? "Hide" : "Show all"}
            </button>
          </div>

          {showFull && (
            <table className="standings-table">
              <thead>
                <tr>
                  <th>Place</th>
                  <th>Musher</th>
                  <th>Last Checkpoint</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((s, i) => {
                  const hl = allMusherNames.some((n) => matchMusher(n, s.name));
                  return (
                    <tr key={i} className={hl ? "hl" : ""}>
                      <td className="col-place">{s.place}</td>
                      <td className="col-name">{s.name}</td>
                      <td className="col-checkpoint">{s.checkpoint}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </main>
      </div>
    </>
  );
}

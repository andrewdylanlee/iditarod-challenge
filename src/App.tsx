import { useState, useEffect, useCallback, useRef } from "react";

// ─── TEAMS ────────────────────────────────────────────────────────────────────
const TEAMS = [
  { id: 1, name: "Kevin, Jennika & Family", emoji: "🐺", mushers: ["Jessie Holmes", "Jessie Royer", "Mille Porsild"] },
  { id: 2, name: "Andrew, Jessica & Family", emoji: "🦅", mushers: ["Matt Hall", "Travis Beals", "Jeff Deeter"] },
  { id: 3, name: "David & Debbie", emoji: "🐻", mushers: ["Paige Drobny", "Ryan Redington", "Peter Kaiser"] },
  { id: 4, name: "Adam, Jana & Family", emoji: "🦌", mushers: ["Rohn Buser", "Michelle Phillips", "Wade Marrs"] },
];
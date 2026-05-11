export interface Player {
  id: number;
  slug: string;
  firstName: string;
  lastName: string;
  fullName: string;
  position: string;
  jerseyNumber: string;
  teamId: number;
  teamAbbr: string;
  teamName: string;
  teamCity: string;
  heightFt: string;
  weightLbs: number;
  birthDate: string;
  country: string;
  yearsExperience: number;
  draftYear?: number;
  draftRound?: number;
  draftPick?: number;
  salary?: number;
  injuryStatus?: "Healthy" | "GTD" | "Out" | "IL";
  injuryNote?: string;
  headshot?: string;
}

export interface PlayerStats {
  playerId: number;
  season: string;
  teamAbbr: string;
  gp: number;
  gs: number;
  min: number;
  pts: number;
  reb: number;
  ast: number;
  stl: number;
  blk: number;
  tov: number;
  pf: number;
  fgm: number;
  fga: number;
  fgPct: number;
  fg3m: number;
  fg3a: number;
  fg3Pct: number;
  ftm: number;
  fta: number;
  ftPct: number;
  oreb: number;
  dreb: number;
  plusMinus?: number;
  per?: number;
  tsPct?: number;
  usgPct?: number;
  bpm?: number;
  vorp?: number;
  winShares?: number;
  ws48?: number;
}

export interface Team {
  id: number;
  slug: string;
  abbreviation: string;
  city: string;
  name: string;
  fullName: string;
  conference: "East" | "West";
  division: string;
  wins: number;
  losses: number;
  pct: number;
  gb: number;
  homeRecord: string;
  awayRecord: string;
  l10: string;
  streak: string;
  confRank: number;
  primaryColor: string;
  logo?: string;
}

export interface Game {
  id: string;
  date: string;
  status: "scheduled" | "live" | "final";
  period?: number;
  clock?: string;
  homeTeam: {
    id: number;
    abbr: string;
    name: string;
    score: number;
    record?: string;
  };
  awayTeam: {
    id: number;
    abbr: string;
    name: string;
    score: number;
    record?: string;
  };
  arena?: string;
  odds?: {
    spread: number;
    moneylineHome: number;
    moneylineAway: number;
    total: number;
  };
}

export interface GameLog {
  date: string;
  opponent: string;
  homeAway: "H" | "A";
  result: "W" | "L";
  score: string;
  min: number;
  pts: number;
  reb: number;
  ast: number;
  stl: number;
  blk: number;
  tov: number;
  fgm: number;
  fga: number;
  fg3m: number;
  fg3a: number;
  ftm: number;
  fta: number;
  plusMinus: number;
}

export interface ShotData {
  x: number;
  y: number;
  made: boolean;
  shotType: string;
  distance: number;
}

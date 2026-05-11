import type { Player, PlayerStats, Team, Game } from "@/types";

export const MOCK_PLAYERS: Player[] = [
  { id: 1, slug: "luka-doncic", firstName: "Luka", lastName: "Doncic", fullName: "Luka Doncic", position: "PG", jerseyNumber: "77", teamId: 1, teamAbbr: "DAL", teamName: "Mavericks", teamCity: "Dallas", heightFt: "6-7", weightLbs: 230, birthDate: "1999-02-28", country: "Slovenia", yearsExperience: 6, salary: 43031220, injuryStatus: "Healthy" },
  { id: 2, slug: "nikola-jokic", firstName: "Nikola", lastName: "Jokic", fullName: "Nikola Jokic", position: "C", jerseyNumber: "15", teamId: 2, teamAbbr: "DEN", teamName: "Nuggets", teamCity: "Denver", heightFt: "6-11", weightLbs: 284, birthDate: "1995-02-19", country: "Serbia", yearsExperience: 9, salary: 51415938, injuryStatus: "Healthy" },
  { id: 3, slug: "shai-gilgeous-alexander", firstName: "Shai", lastName: "Gilgeous-Alexander", fullName: "Shai Gilgeous-Alexander", position: "PG", jerseyNumber: "2", teamId: 3, teamAbbr: "OKC", teamName: "Thunder", teamCity: "Oklahoma City", heightFt: "6-6", weightLbs: 195, birthDate: "1998-07-12", country: "Canada", yearsExperience: 6, salary: 34005250, injuryStatus: "Healthy" },
  { id: 4, slug: "jayson-tatum", firstName: "Jayson", lastName: "Tatum", fullName: "Jayson Tatum", position: "SF", jerseyNumber: "0", teamId: 4, teamAbbr: "BOS", teamName: "Celtics", teamCity: "Boston", heightFt: "6-8", weightLbs: 210, birthDate: "1998-03-03", country: "USA", yearsExperience: 7, salary: 37576750, injuryStatus: "Healthy" },
  { id: 5, slug: "giannis-antetokounmpo", firstName: "Giannis", lastName: "Antetokounmpo", fullName: "Giannis Antetokounmpo", position: "PF", jerseyNumber: "34", teamId: 5, teamAbbr: "MIL", teamName: "Bucks", teamCity: "Milwaukee", heightFt: "6-11", weightLbs: 242, birthDate: "1994-12-06", country: "Greece", yearsExperience: 11, salary: 48787676, injuryStatus: "GTD" },
  { id: 6, slug: "stephen-curry", firstName: "Stephen", lastName: "Curry", fullName: "Stephen Curry", position: "PG", jerseyNumber: "30", teamId: 6, teamAbbr: "GSW", teamName: "Warriors", teamCity: "Golden State", heightFt: "6-2", weightLbs: 185, birthDate: "1988-03-14", country: "USA", yearsExperience: 15, salary: 51915615, injuryStatus: "Healthy" },
  { id: 7, slug: "devin-booker", firstName: "Devin", lastName: "Booker", fullName: "Devin Booker", position: "SG", jerseyNumber: "1", teamId: 7, teamAbbr: "PHX", teamName: "Suns", teamCity: "Phoenix", heightFt: "6-5", weightLbs: 206, birthDate: "1996-10-30", country: "USA", yearsExperience: 9, salary: 36016200, injuryStatus: "Healthy" },
  { id: 8, slug: "lebron-james", firstName: "LeBron", lastName: "James", fullName: "LeBron James", position: "SF", jerseyNumber: "23", teamId: 1, teamAbbr: "LAL", teamName: "Lakers", teamCity: "Los Angeles", heightFt: "6-9", weightLbs: 250, birthDate: "1984-12-30", country: "USA", yearsExperience: 21, salary: 47607350, injuryStatus: "Healthy" },
];

export const MOCK_PLAYER_STATS: PlayerStats[] = [
  { playerId: 1, season: "2025-26", teamAbbr: "DAL", gp: 58, gs: 58, min: 37.2, pts: 28.7, reb: 9.2, ast: 8.1, stl: 1.2, blk: 0.5, tov: 4.0, pf: 2.3, fgm: 10.2, fga: 22.1, fgPct: 0.462, fg3m: 3.1, fg3a: 8.9, fg3Pct: 0.348, ftm: 5.2, fta: 6.5, ftPct: 0.800, oreb: 1.1, dreb: 8.1, plusMinus: 4.2, per: 26.8, tsPct: 0.578, usgPct: 34.2, bpm: 6.1, vorp: 5.8, winShares: 9.2 },
  { playerId: 2, season: "2025-26", teamAbbr: "DEN", gp: 61, gs: 61, min: 34.8, pts: 26.4, reb: 12.4, ast: 9.0, stl: 1.4, blk: 0.9, tov: 3.2, pf: 2.8, fgm: 10.1, fga: 18.2, fgPct: 0.555, fg3m: 0.8, fg3a: 2.1, fg3Pct: 0.381, ftm: 5.4, fta: 6.1, ftPct: 0.885, oreb: 2.8, dreb: 9.6, plusMinus: 8.1, per: 30.4, tsPct: 0.648, usgPct: 29.8, bpm: 9.8, vorp: 8.4, winShares: 14.1 },
  { playerId: 3, season: "2025-26", teamAbbr: "OKC", gp: 65, gs: 65, min: 34.5, pts: 30.1, reb: 5.5, ast: 6.4, stl: 2.0, blk: 0.9, tov: 2.5, pf: 2.1, fgm: 10.8, fga: 21.6, fgPct: 0.500, fg3m: 2.4, fg3a: 6.1, fg3Pct: 0.393, ftm: 6.1, fta: 7.0, ftPct: 0.871, oreb: 0.8, dreb: 4.7, plusMinus: 9.2, per: 28.9, tsPct: 0.629, usgPct: 31.8, bpm: 8.5, vorp: 7.2, winShares: 11.8 },
  { playerId: 4, season: "2025-26", teamAbbr: "BOS", gp: 60, gs: 60, min: 36.1, pts: 27.4, reb: 8.5, ast: 4.7, stl: 1.0, blk: 0.6, tov: 2.8, pf: 2.4, fgm: 9.8, fga: 20.8, fgPct: 0.471, fg3m: 3.2, fg3a: 8.3, fg3Pct: 0.386, ftm: 4.6, fta: 5.5, ftPct: 0.836, oreb: 0.9, dreb: 7.6, plusMinus: 6.4, per: 25.2, tsPct: 0.591, usgPct: 29.4, bpm: 5.8, vorp: 4.9, winShares: 8.7 },
  { playerId: 5, season: "2025-26", teamAbbr: "MIL", gp: 55, gs: 55, min: 33.2, pts: 29.8, reb: 11.8, ast: 5.9, stl: 0.9, blk: 1.2, tov: 3.5, pf: 2.9, fgm: 11.2, fga: 20.4, fgPct: 0.549, fg3m: 0.3, fg3a: 1.0, fg3Pct: 0.300, ftm: 6.8, fta: 9.2, ftPct: 0.739, oreb: 2.4, dreb: 9.4, plusMinus: 3.8, per: 27.1, tsPct: 0.609, usgPct: 33.5, bpm: 7.2, vorp: 6.1, winShares: 10.4 },
];

export const MOCK_TEAMS: Team[] = [
  { id: 1, slug: "boston-celtics", abbreviation: "BOS", city: "Boston", name: "Celtics", fullName: "Boston Celtics", conference: "East", division: "Atlantic", wins: 51, losses: 20, pct: 0.718, gb: 0, homeRecord: "28-8", awayRecord: "23-12", l10: "7-3", streak: "W3", confRank: 1, primaryColor: "#007A33" },
  { id: 2, slug: "oklahoma-city-thunder", abbreviation: "OKC", city: "Oklahoma City", name: "Thunder", fullName: "Oklahoma City Thunder", conference: "West", division: "Northwest", wins: 57, losses: 14, pct: 0.803, gb: 0, homeRecord: "30-5", awayRecord: "27-9", l10: "8-2", streak: "W5", confRank: 1, primaryColor: "#007AC1" },
  { id: 3, slug: "denver-nuggets", abbreviation: "DEN", city: "Denver", name: "Nuggets", fullName: "Denver Nuggets", conference: "West", division: "Northwest", wins: 45, losses: 26, pct: 0.634, gb: 12, homeRecord: "25-10", awayRecord: "20-16", l10: "6-4", streak: "W1", confRank: 3, primaryColor: "#0E2240" },
  { id: 4, slug: "cleveland-cavaliers", abbreviation: "CLE", city: "Cleveland", name: "Cavaliers", fullName: "Cleveland Cavaliers", conference: "East", division: "Central", wins: 50, losses: 21, pct: 0.704, gb: 1, homeRecord: "27-9", awayRecord: "23-12", l10: "8-2", streak: "W2", confRank: 2, primaryColor: "#860038" },
  { id: 5, slug: "memphis-grizzlies", abbreviation: "MEM", city: "Memphis", name: "Grizzlies", fullName: "Memphis Grizzlies", conference: "West", division: "Southwest", wins: 42, losses: 29, pct: 0.592, gb: 15, homeRecord: "24-12", awayRecord: "18-17", l10: "5-5", streak: "L1", confRank: 4, primaryColor: "#5D76A9" },
];

export const MOCK_GAMES: Game[] = [
  { id: "g1", date: new Date().toISOString(), status: "live", period: 4, clock: "2:34", homeTeam: { id: 1, abbr: "LAL", name: "Lakers", score: 112, record: "38-33" }, awayTeam: { id: 2, abbr: "GSW", name: "Warriors", score: 108, record: "29-42" } },
  { id: "g2", date: new Date().toISOString(), status: "live", period: 3, clock: "8:12", homeTeam: { id: 3, abbr: "BOS", name: "Celtics", score: 98, record: "51-20" }, awayTeam: { id: 4, abbr: "MIA", name: "Heat", score: 95, record: "36-35" }, odds: { spread: -6.5, moneylineHome: -240, moneylineAway: 190, total: 218.5 } },
  { id: "g3", date: new Date().toISOString(), status: "scheduled", homeTeam: { id: 5, abbr: "PHX", name: "Suns", score: 0, record: "30-41" }, awayTeam: { id: 6, abbr: "DEN", name: "Nuggets", score: 0, record: "45-26" }, odds: { spread: 3.5, moneylineHome: 148, moneylineAway: -178, total: 226.5 } },
  { id: "g4", date: new Date().toISOString(), status: "final", homeTeam: { id: 7, abbr: "NYK", name: "Knicks", score: 118, record: "44-27" }, awayTeam: { id: 8, abbr: "PHI", name: "76ers", score: 104, record: "24-47" } },
  { id: "g5", date: new Date().toISOString(), status: "scheduled", homeTeam: { id: 9, abbr: "MIL", name: "Bucks", score: 0, record: "37-34" }, awayTeam: { id: 10, abbr: "IND", name: "Pacers", score: 0, record: "41-30" }, odds: { spread: -1.5, moneylineHome: -122, moneylineAway: 102, total: 233.0 } },
];

export const TOP_PERFORMERS = [
  { name: "Shai G-A", team: "OKC", stat: "30.1", label: "PPG", trend: 2.3, sparkData: [28, 32, 25, 35, 30, 28, 34, 32] },
  { name: "Nikola Jokic", team: "DEN", stat: "12.4", label: "RPG", trend: 0.8, sparkData: [11, 14, 12, 13, 10, 14, 12, 13] },
  { name: "Luka Doncic", team: "DAL", stat: "8.1", label: "APG", trend: -0.4, sparkData: [9, 8, 7, 10, 8, 8, 9, 7] },
  { name: "OKC Thunder", team: "OKC", stat: "57-14", label: "Record", trend: 0, sparkData: [1, 1, 0, 1, 1, 1, 0, 1] },
];

// Static team metadata — slug → nba_api team_id mapping + colors
export const TEAM_META: Record<string, {
  id: number;
  abbreviation: string;
  city: string;
  name: string;
  conference: "East" | "West";
  division: string;
  primaryColor: string;
  secondaryColor: string;
  salary_cap: number;   // current season cap in dollars
  luxury_tax: number;
}> = {
  "atlanta-hawks":           { id: 1610612737, abbreviation: "ATL", city: "Atlanta",        name: "Hawks",       conference: "East", division: "Southeast", primaryColor: "#E03A3E", secondaryColor: "#C1D32F", salary_cap: 140588000, luxury_tax: 170814000 },
  "boston-celtics":          { id: 1610612738, abbreviation: "BOS", city: "Boston",         name: "Celtics",     conference: "East", division: "Atlantic",  primaryColor: "#007A33", secondaryColor: "#BA9653", salary_cap: 140588000, luxury_tax: 170814000 },
  "brooklyn-nets":           { id: 1610612751, abbreviation: "BKN", city: "Brooklyn",       name: "Nets",        conference: "East", division: "Atlantic",  primaryColor: "#000000", secondaryColor: "#FFFFFF", salary_cap: 140588000, luxury_tax: 170814000 },
  "charlotte-hornets":       { id: 1610612766, abbreviation: "CHA", city: "Charlotte",      name: "Hornets",     conference: "East", division: "Southeast", primaryColor: "#1D1160", secondaryColor: "#00788C", salary_cap: 140588000, luxury_tax: 170814000 },
  "chicago-bulls":           { id: 1610612741, abbreviation: "CHI", city: "Chicago",        name: "Bulls",       conference: "East", division: "Central",   primaryColor: "#CE1141", secondaryColor: "#000000", salary_cap: 140588000, luxury_tax: 170814000 },
  "cleveland-cavaliers":     { id: 1610612739, abbreviation: "CLE", city: "Cleveland",      name: "Cavaliers",   conference: "East", division: "Central",   primaryColor: "#860038", secondaryColor: "#041E42", salary_cap: 140588000, luxury_tax: 170814000 },
  "dallas-mavericks":        { id: 1610612742, abbreviation: "DAL", city: "Dallas",         name: "Mavericks",   conference: "West", division: "Southwest", primaryColor: "#00538C", secondaryColor: "#B8C4CA", salary_cap: 140588000, luxury_tax: 170814000 },
  "denver-nuggets":          { id: 1610612743, abbreviation: "DEN", city: "Denver",         name: "Nuggets",     conference: "West", division: "Northwest", primaryColor: "#0E2240", secondaryColor: "#FEC524", salary_cap: 140588000, luxury_tax: 170814000 },
  "detroit-pistons":         { id: 1610612765, abbreviation: "DET", city: "Detroit",        name: "Pistons",     conference: "East", division: "Central",   primaryColor: "#C8102E", secondaryColor: "#006BB6", salary_cap: 140588000, luxury_tax: 170814000 },
  "golden-state-warriors":   { id: 1610612744, abbreviation: "GSW", city: "Golden State",   name: "Warriors",    conference: "West", division: "Pacific",   primaryColor: "#1D428A", secondaryColor: "#FFC72C", salary_cap: 140588000, luxury_tax: 170814000 },
  "houston-rockets":         { id: 1610612745, abbreviation: "HOU", city: "Houston",        name: "Rockets",     conference: "West", division: "Southwest", primaryColor: "#CE1141", secondaryColor: "#000000", salary_cap: 140588000, luxury_tax: 170814000 },
  "indiana-pacers":          { id: 1610612754, abbreviation: "IND", city: "Indiana",        name: "Pacers",      conference: "East", division: "Central",   primaryColor: "#002D62", secondaryColor: "#FDBB30", salary_cap: 140588000, luxury_tax: 170814000 },
  "los-angeles-clippers":    { id: 1610612746, abbreviation: "LAC", city: "Los Angeles",    name: "Clippers",    conference: "West", division: "Pacific",   primaryColor: "#C8102E", secondaryColor: "#1D428A", salary_cap: 140588000, luxury_tax: 170814000 },
  "los-angeles-lakers":      { id: 1610612747, abbreviation: "LAL", city: "Los Angeles",    name: "Lakers",      conference: "West", division: "Pacific",   primaryColor: "#552583", secondaryColor: "#FDB927", salary_cap: 140588000, luxury_tax: 170814000 },
  "memphis-grizzlies":       { id: 1610612763, abbreviation: "MEM", city: "Memphis",        name: "Grizzlies",   conference: "West", division: "Southwest", primaryColor: "#5D76A9", secondaryColor: "#12173F", salary_cap: 140588000, luxury_tax: 170814000 },
  "miami-heat":              { id: 1610612748, abbreviation: "MIA", city: "Miami",          name: "Heat",        conference: "East", division: "Southeast", primaryColor: "#98002E", secondaryColor: "#F9A01B", salary_cap: 140588000, luxury_tax: 170814000 },
  "milwaukee-bucks":         { id: 1610612749, abbreviation: "MIL", city: "Milwaukee",      name: "Bucks",       conference: "East", division: "Central",   primaryColor: "#00471B", secondaryColor: "#EEE1C6", salary_cap: 140588000, luxury_tax: 170814000 },
  "minnesota-timberwolves":  { id: 1610612750, abbreviation: "MIN", city: "Minnesota",      name: "Timberwolves",conference: "West", division: "Northwest", primaryColor: "#0C2340", secondaryColor: "#236192", salary_cap: 140588000, luxury_tax: 170814000 },
  "new-orleans-pelicans":    { id: 1610612740, abbreviation: "NOP", city: "New Orleans",    name: "Pelicans",    conference: "West", division: "Southwest", primaryColor: "#0C2340", secondaryColor: "#C8102E", salary_cap: 140588000, luxury_tax: 170814000 },
  "new-york-knicks":         { id: 1610612752, abbreviation: "NYK", city: "New York",       name: "Knicks",      conference: "East", division: "Atlantic",  primaryColor: "#006BB6", secondaryColor: "#F58426", salary_cap: 140588000, luxury_tax: 170814000 },
  "oklahoma-city-thunder":   { id: 1610612760, abbreviation: "OKC", city: "Oklahoma City",  name: "Thunder",     conference: "West", division: "Northwest", primaryColor: "#007AC1", secondaryColor: "#EF3B24", salary_cap: 140588000, luxury_tax: 170814000 },
  "orlando-magic":           { id: 1610612753, abbreviation: "ORL", city: "Orlando",        name: "Magic",       conference: "East", division: "Southeast", primaryColor: "#0077C0", secondaryColor: "#C4CED4", salary_cap: 140588000, luxury_tax: 170814000 },
  "philadelphia-76ers":      { id: 1610612755, abbreviation: "PHI", city: "Philadelphia",   name: "76ers",       conference: "East", division: "Atlantic",  primaryColor: "#006BB6", secondaryColor: "#ED174C", salary_cap: 140588000, luxury_tax: 170814000 },
  "phoenix-suns":            { id: 1610612756, abbreviation: "PHX", city: "Phoenix",        name: "Suns",        conference: "West", division: "Pacific",   primaryColor: "#1D1160", secondaryColor: "#E56020", salary_cap: 140588000, luxury_tax: 170814000 },
  "portland-trail-blazers":  { id: 1610612757, abbreviation: "POR", city: "Portland",       name: "Trail Blazers",conference: "West", division: "Northwest", primaryColor: "#E03A3E", secondaryColor: "#000000", salary_cap: 140588000, luxury_tax: 170814000 },
  "sacramento-kings":        { id: 1610612758, abbreviation: "SAC", city: "Sacramento",     name: "Kings",       conference: "West", division: "Pacific",   primaryColor: "#5A2D81", secondaryColor: "#63727A", salary_cap: 140588000, luxury_tax: 170814000 },
  "san-antonio-spurs":       { id: 1610612759, abbreviation: "SAS", city: "San Antonio",    name: "Spurs",       conference: "West", division: "Southwest", primaryColor: "#C4CED4", secondaryColor: "#000000", salary_cap: 140588000, luxury_tax: 170814000 },
  "toronto-raptors":         { id: 1610612761, abbreviation: "TOR", city: "Toronto",        name: "Raptors",     conference: "East", division: "Atlantic",  primaryColor: "#CE1141", secondaryColor: "#000000", salary_cap: 140588000, luxury_tax: 170814000 },
  "utah-jazz":               { id: 1610612762, abbreviation: "UTA", city: "Utah",           name: "Jazz",        conference: "West", division: "Northwest", primaryColor: "#002B5C", secondaryColor: "#00471B", salary_cap: 140588000, luxury_tax: 170814000 },
  "washington-wizards":      { id: 1610612764, abbreviation: "WAS", city: "Washington",     name: "Wizards",     conference: "East", division: "Southeast", primaryColor: "#002B5C", secondaryColor: "#E31837", salary_cap: 140588000, luxury_tax: 170814000 },
};

export function getTeamBySlug(slug: string) {
  return TEAM_META[slug] ?? null;
}

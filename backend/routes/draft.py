from fastapi import APIRouter, Query

router = APIRouter(prefix="/draft", tags=["draft"])

# 2025 NBA Draft — Round 1
DRAFT_2025 = [
    (1, 1, "Cooper Flagg", "DAL", "Duke", "College"),
    (1, 2, "Dylan Harper", "SAS", "Rutgers", "College"),
    (1, 3, "VJ Edgecombe", "PHI", "Baylor", "College"),
    (1, 4, "Kon Knueppel", "CHA", "Duke", "College"),
    (1, 5, "Ace Bailey", "UTA", "Rutgers", "College"),
    (1, 6, "Tre Johnson", "WAS", "Texas", "College"),
    (1, 7, "Jeremiah Fears", "NOP", "Oklahoma", "College"),
    (1, 8, "Egor Demin", "BKN", "BYU", "College"),
    (1, 9, "Collin Murray-Boyles", "TOR", "South Carolina", "College"),
    (1, 10, "Khaman Maluach", "PHX", "Duke", "College"),
    (1, 11, "Cedric Coward", "POR", "Washington State", "College"),
    (1, 12, "Noa Essengue", "CHI", "Ratiopharm Ulm", "International"),
    (1, 13, "Derik Queen", "NOP", "Maryland", "College"),
    (1, 14, "Carter Bryant", "SAS", "Arizona", "College"),
    (1, 15, "Thomas Sorber", "OKC", "Georgetown", "College"),
    (1, 16, "Yang Hansen", "POR", "Qingdao Eagles", "International"),
    (1, 17, "Joan Beringer", "MIN", "Cedevita Olimpija", "International"),
    (1, 18, "Walter Clayton Jr.", "UTA", "Florida", "College"),
    (1, 19, "Nolan Traore", "BKN", "Saint-Quentin", "International"),
    (1, 20, "Kasparas Jakucionis", "MIA", "Illinois", "College"),
    (1, 21, "Will Riley", "UTA", "Illinois", "College"),
    (1, 22, "Drake Powell", "BKN", "North Carolina", "College"),
    (1, 23, "Asa Newell", "ATL", "Georgia", "College"),
    (1, 24, "Nique Clifford", "SAC", "Colorado State", "College"),
    (1, 25, "Jase Richardson", "ORL", "Michigan State", "College"),
    (1, 26, "Ben Saraf", "BKN", "Ratiopharm Ulm", "International"),
    (1, 27, "Hansen Yang", "BKN", "Qingdao Eagles", "International"),
    (1, 28, "Danny Wolf", "BKN", "Michigan", "College"),
    (1, 29, "Liam McNeeley", "CHA", "UConn", "College"),
    (1, 30, "Ryan Kalkbrenner", "CHA", "Creighton", "College"),
]


@router.get("/history")
async def get_draft_history(year: int = Query(2025)):
    if year == 2025:
        return [
            {
                "year": 2025,
                "round": r,
                "pick": p,
                "playerName": name,
                "teamAbbr": team,
                "origin": origin,
                "originType": otype,
            }
            for (r, p, name, team, origin, otype) in DRAFT_2025
        ]
    return []


@router.get("/years")
async def get_available_years():
    return [2025]

// ─── CLUB BADGE REGISTRY ───
// Visual data for rendering stylized club crests
// Each club: { primary color, secondary color, abbreviation, country flag emoji }

export const CLUBS = {
  // ─── ENGLAND ───
  "Arsenal": { p: "#EF0107", s: "#FFFFFF", abbr: "ARS", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  "Chelsea": { p: "#034694", s: "#DBA111", abbr: "CHE", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  "Liverpool": { p: "#C8102E", s: "#00B2A9", abbr: "LIV", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  "Manchester United": { p: "#DA291C", s: "#FBE122", abbr: "MUN", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  "Manchester City": { p: "#6CABDD", s: "#1C2C5B", abbr: "MCI", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  "Tottenham": { p: "#132257", s: "#FFFFFF", abbr: "TOT", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  "Everton": { p: "#003399", s: "#FFFFFF", abbr: "EVE", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  "Southampton": { p: "#D71920", s: "#130C0E", abbr: "SOU", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  "West Ham": { p: "#7A263A", s: "#1BB1E7", abbr: "WHU", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  "Fulham": { p: "#000000", s: "#CC0000", abbr: "FUL", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  "Crystal Palace": { p: "#1B458F", s: "#C4122E", abbr: "CRY", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  "Bolton": { p: "#263B6E", s: "#BE1E2D", abbr: "BOL", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  "West Brom": { p: "#122F67", s: "#FFFFFF", abbr: "WBA", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  "Aston Villa": { p: "#670E36", s: "#95BFE5", abbr: "AVL", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  "Newcastle United": { p: "#241F20", s: "#FFFFFF", abbr: "NEW", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  "Leeds United": { p: "#FFCD00", s: "#1D428A", abbr: "LEE", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  "Leicester City": { p: "#003090", s: "#FDBE11", abbr: "LEI", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  "Wolverhampton": { p: "#FDB913", s: "#231F20", abbr: "WOL", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  "Nottingham Forest": { p: "#DD0000", s: "#FFFFFF", abbr: "NFO", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  "Blackburn": { p: "#009EE0", s: "#FFFFFF", abbr: "BLB", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  "Sunderland": { p: "#EB172B", s: "#211E1E", abbr: "SUN", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  "Burnley": { p: "#6C1D45", s: "#99D6EA", abbr: "BUR", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  "Brighton": { p: "#0057B8", s: "#FFCD00", abbr: "BHA", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  "Brentford": { p: "#E30613", s: "#FBB800", abbr: "BRE", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },

  // ─── SCOTLAND ───
  "Celtic": { p: "#138847", s: "#FFFFFF", abbr: "CEL", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿" },
  "Rangers": { p: "#0066CC", s: "#FFFFFF", abbr: "RAN", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿" },

  // ─── SPAIN ───
  "FC Barcelona": { p: "#A50044", s: "#004D98", abbr: "BAR", flag: "🇪🇸" },
  "Real Madryt": { p: "#FEBE10", s: "#00529F", abbr: "RMA", flag: "🇪🇸" },
  "Atlético Madryt": { p: "#CB3524", s: "#272E61", abbr: "ATM", flag: "🇪🇸" },
  "Valencia": { p: "#EE8707", s: "#000000", abbr: "VAL", flag: "🇪🇸" },
  "Sevilla": { p: "#D80027", s: "#FFFFFF", abbr: "SEV", flag: "🇪🇸" },
  "Mallorca": { p: "#CE1126", s: "#000000", abbr: "MAL", flag: "🇪🇸" },
  "Deportivo": { p: "#003DA5", s: "#FFFFFF", abbr: "DEP", flag: "🇪🇸" },
  "Real Sociedad": { p: "#143C8B", s: "#FFFFFF", abbr: "RSO", flag: "🇪🇸" },
  "Eibar": { p: "#2D2F7C", s: "#C3001D", abbr: "EIB", flag: "🇪🇸" },
  "Celta Vigo": { p: "#8AC3EE", s: "#CD0E26", abbr: "CEL", flag: "🇪🇸" },
  "Real Betis": { p: "#00954C", s: "#FFFFFF", abbr: "BET", flag: "🇪🇸" },
  "Villarreal": { p: "#FFE114", s: "#005AA7", abbr: "VIL", flag: "🇪🇸" },
  "Rayo Vallecano": { p: "#E53027", s: "#FFFFFF", abbr: "RAY", flag: "🇪🇸" },
  "Athletic Bilbao": { p: "#EE2523", s: "#FFFFFF", abbr: "ATH", flag: "🇪🇸" },

  // ─── GERMANY ───
  "Bayern Monachium": { p: "#DC052D", s: "#0066B2", abbr: "BAY", flag: "🇩🇪" },
  "Borussia Dortmund": { p: "#FDE100", s: "#000000", abbr: "BVB", flag: "🇩🇪" },
  "Bayer Leverkusen": { p: "#E32221", s: "#000000", abbr: "LEV", flag: "🇩🇪" },
  "RB Lipsk": { p: "#DD0741", s: "#001F47", abbr: "RBL", flag: "🇩🇪" },
  "Wolfsburg": { p: "#65B32E", s: "#FFFFFF", abbr: "WOB", flag: "🇩🇪" },
  "Werder Brema": { p: "#1D9053", s: "#FFFFFF", abbr: "WER", flag: "🇩🇪" },
  "Schalke 04": { p: "#004D9D", s: "#FFFFFF", abbr: "S04", flag: "🇩🇪" },
  "Kaiserslautern": { p: "#E4002B", s: "#FFFFFF", abbr: "FCK", flag: "🇩🇪" },
  "Eintracht Frankfurt": { p: "#E1000F", s: "#000000", abbr: "SGE", flag: "🇩🇪" },
  "Hamburg": { p: "#0A3C85", s: "#FFFFFF", abbr: "HSV", flag: "🇩🇪" },
  "Stuttgart": { p: "#E32219", s: "#FFFFFF", abbr: "VFB", flag: "🇩🇪" },
  "Freiburg": { p: "#E4002B", s: "#000000", abbr: "SCF", flag: "🇩🇪" },
  "Mönchengladbach": { p: "#18A950", s: "#000000", abbr: "BMG", flag: "🇩🇪" },

  // ─── ITALY ───
  "Juventus": { p: "#000000", s: "#FFFFFF", abbr: "JUV", flag: "🇮🇹" },
  "AC Milan": { p: "#FB090B", s: "#000000", abbr: "ACM", flag: "🇮🇹" },
  "Inter Mediolan": { p: "#010E80", s: "#000000", abbr: "INT", flag: "🇮🇹" },
  "AS Roma": { p: "#9B2335", s: "#FDB913", abbr: "ROM", flag: "🇮🇹" },
  "Napoli": { p: "#12A0D7", s: "#FFFFFF", abbr: "NAP", flag: "🇮🇹" },
  "Lazio": { p: "#87D8F7", s: "#FFFFFF", abbr: "LAZ", flag: "🇮🇹" },
  "Fiorentina": { p: "#482D8C", s: "#FFFFFF", abbr: "FIO", flag: "🇮🇹" },
  "Parma": { p: "#FEDD00", s: "#003DA5", abbr: "PAR", flag: "🇮🇹" },
  "Udinese": { p: "#000000", s: "#FFFFFF", abbr: "UDI", flag: "🇮🇹" },
  "Genoa": { p: "#A6093D", s: "#003171", abbr: "GEN", flag: "🇮🇹" },
  "Brescia": { p: "#0047AB", s: "#FFFFFF", abbr: "BRE", flag: "🇮🇹" },
  "Monza": { p: "#EE1C25", s: "#FFFFFF", abbr: "MON", flag: "🇮🇹" },
  "Como": { p: "#0045A6", s: "#FFFFFF", abbr: "COM", flag: "🇮🇹" },
  "Sampdoria": { p: "#0043A8", s: "#E81E26", abbr: "SAM", flag: "🇮🇹" },
  "Atalanta": { p: "#1E71B8", s: "#000000", abbr: "ATA", flag: "🇮🇹" },
  "Bologna": { p: "#A31D30", s: "#1A2857", abbr: "BOL", flag: "🇮🇹" },

  // ─── FRANCE ───
  "PSG": { p: "#004170", s: "#DA291C", abbr: "PSG", flag: "🇫🇷" },
  "AS Monaco": { p: "#E7352B", s: "#FFFFFF", abbr: "ASM", flag: "🇫🇷" },
  "Olympique Marsylia": { p: "#2FAEE0", s: "#FFFFFF", abbr: "OM", flag: "🇫🇷" },
  "Lyon": { p: "#1B3B7B", s: "#DA291C", abbr: "OL", flag: "🇫🇷" },
  "Lille": { p: "#E2001A", s: "#1D3054", abbr: "LIL", flag: "🇫🇷" },
  "Nice": { p: "#000000", s: "#C8102E", abbr: "NIC", flag: "🇫🇷" },
  "Saint-Étienne": { p: "#18A950", s: "#FFFFFF", abbr: "STE", flag: "🇫🇷" },
  "Metz": { p: "#8B0018", s: "#FFFFFF", abbr: "FCM", flag: "🇫🇷" },
  "Bordeaux": { p: "#13264B", s: "#FFFFFF", abbr: "BOR", flag: "🇫🇷" },
  "Rennes": { p: "#D41A2A", s: "#000000", abbr: "REN", flag: "🇫🇷" },
  "Montpellier": { p: "#FF6900", s: "#003DA5", abbr: "MHR", flag: "🇫🇷" },
  "Lens": { p: "#F7B718", s: "#D71920", abbr: "RCL", flag: "🇫🇷" },

  // ─── PORTUGAL ───
  "Sporting CP": { p: "#008B4A", s: "#FFFFFF", abbr: "SCP", flag: "🇵🇹" },
  "Benfica": { p: "#FF0000", s: "#FFFFFF", abbr: "SLB", flag: "🇵🇹" },
  "FC Porto": { p: "#003899", s: "#FFFFFF", abbr: "FCP", flag: "🇵🇹" },
  "Braga": { p: "#D71920", s: "#FFFFFF", abbr: "BRA", flag: "🇵🇹" },

  // ─── NETHERLANDS ───
  "Ajax": { p: "#D2122E", s: "#FFFFFF", abbr: "AJX", flag: "🇳🇱" },
  "PSV": { p: "#EE1C25", s: "#FFFFFF", abbr: "PSV", flag: "🇳🇱" },
  "Feyenoord": { p: "#ED1C24", s: "#000000", abbr: "FEY", flag: "🇳🇱" },
  "Groningen": { p: "#009739", s: "#FFFFFF", abbr: "GRO", flag: "🇳🇱" },
  "AZ Alkmaar": { p: "#CC0000", s: "#FFFFFF", abbr: "AZ", flag: "🇳🇱" },
  "Vitesse": { p: "#FFD700", s: "#000000", abbr: "VIT", flag: "🇳🇱" },

  // ─── CROATIA ───
  "Dinamo Zagrzeb": { p: "#0050A0", s: "#FFFFFF", abbr: "DIN", flag: "🇭🇷" },

  // ─── BELGIUM ───
  "Genk": { p: "#0047AB", s: "#FFFFFF", abbr: "GNK", flag: "🇧🇪" },
  "Anderlecht": { p: "#5B2D8E", s: "#FFFFFF", abbr: "AND", flag: "🇧🇪" },
  "Club Brugge": { p: "#005BA6", s: "#000000", abbr: "CBR", flag: "🇧🇪" },

  // ─── SWITZERLAND ───
  "Basel": { p: "#E4002B", s: "#0038A8", abbr: "BAS", flag: "🇨🇭" },

  // ─── AUSTRIA ───
  "RB Salzburg": { p: "#E4002B", s: "#00245D", abbr: "RBS", flag: "🇦🇹" },

  // ─── NORWAY ───
  "Molde": { p: "#004B93", s: "#FFFFFF", abbr: "MOL", flag: "🇳🇴" },

  // ─── SWEDEN ───
  "Malmö": { p: "#7FC4E6", s: "#FFFFFF", abbr: "MFF", flag: "🇸🇪" },

  // ─── POLAND ───
  "Lech Poznań": { p: "#0047AB", s: "#FFFFFF", abbr: "LPO", flag: "🇵🇱" },
  "Znicz Pruszków": { p: "#FF0000", s: "#000000", abbr: "ZNI", flag: "🇵🇱" },
  "Legia Warszawa": { p: "#006A44", s: "#FFFFFF", abbr: "LEG", flag: "🇵🇱" },

  // ─── TURKEY ───
  "Galatasaray": { p: "#FF8C00", s: "#A10000", abbr: "GAL", flag: "🇹🇷" },
  "Fenerbahçe": { p: "#FFED00", s: "#063278", abbr: "FEN", flag: "🇹🇷" },
  "Beşiktaş": { p: "#000000", s: "#FFFFFF", abbr: "BJK", flag: "🇹🇷" },
  "Trabzonspor": { p: "#800020", s: "#003DA5", abbr: "TRA", flag: "🇹🇷" },
  "Istanbul Başakşehir": { p: "#F8690D", s: "#1A3463", abbr: "IBB", flag: "🇹🇷" },
  "Sivasspor": { p: "#D71920", s: "#FFFFFF", abbr: "SIV", flag: "🇹🇷" },
  "Adana Demirspor": { p: "#005BAB", s: "#FFFFFF", abbr: "ADS", flag: "🇹🇷" },

  // ─── GREECE ───
  "Olympiacos": { p: "#CC0000", s: "#FFFFFF", abbr: "OLY", flag: "🇬🇷" },
  "PAOK": { p: "#000000", s: "#FFFFFF", abbr: "PAO", flag: "🇬🇷" },
  "AEK Ateny": { p: "#FFD700", s: "#000000", abbr: "AEK", flag: "🇬🇷" },

  // ─── BRAZIL ───
  "Santos": { p: "#000000", s: "#FFFFFF", abbr: "SAN", flag: "🇧🇷" },
  "Grêmio": { p: "#0067B1", s: "#000000", abbr: "GRE", flag: "🇧🇷" },
  "São Paulo": { p: "#FF0000", s: "#000000", abbr: "SAO", flag: "🇧🇷" },
  "Flamengo": { p: "#E4002B", s: "#000000", abbr: "FLA", flag: "🇧🇷" },
  "Corinthians": { p: "#000000", s: "#FFFFFF", abbr: "COR", flag: "🇧🇷" },
  "Palmeiras": { p: "#006437", s: "#FFFFFF", abbr: "PAL", flag: "🇧🇷" },
  "Cruzeiro": { p: "#003DA5", s: "#FFFFFF", abbr: "CRU", flag: "🇧🇷" },
  "Atlético Mineiro": { p: "#000000", s: "#FFFFFF", abbr: "CAM", flag: "🇧🇷" },
  "Internacional": { p: "#D71920", s: "#FFFFFF", abbr: "INT", flag: "🇧🇷" },
  "Bahia": { p: "#004B93", s: "#D71920", abbr: "BAH", flag: "🇧🇷" },
  "Mogi Mirim": { p: "#008000", s: "#FFFFFF", abbr: "MOG", flag: "🇧🇷" },
  "Vasco da Gama": { p: "#000000", s: "#FFFFFF", abbr: "VAS", flag: "🇧🇷" },
  "Fluminense": { p: "#8B0037", s: "#006338", abbr: "FLU", flag: "🇧🇷" },

  // ─── ARGENTINA ───
  "River Plate": { p: "#D71920", s: "#FFFFFF", abbr: "RIV", flag: "🇦🇷" },
  "Boca Juniors": { p: "#004699", s: "#FFD700", abbr: "BOC", flag: "🇦🇷" },
  "Independiente": { p: "#D71920", s: "#FFFFFF", abbr: "IND", flag: "🇦🇷" },
  "Racing Club": { p: "#6CB4EE", s: "#FFFFFF", abbr: "RAC", flag: "🇦🇷" },
  "Rosario Central": { p: "#FFDD00", s: "#003DA5", abbr: "ROS", flag: "🇦🇷" },
  "Banfield": { p: "#006A42", s: "#FFFFFF", abbr: "BAN", flag: "🇦🇷" },
  "Newell's Old Boys": { p: "#D71920", s: "#000000", abbr: "NOB", flag: "🇦🇷" },
  "Vélez Sarsfield": { p: "#FFFFFF", s: "#0047AB", abbr: "VEL", flag: "🇦🇷" },

  // ─── URUGUAY ───
  "Nacional": { p: "#0047AB", s: "#D71920", abbr: "NAC", flag: "🇺🇾" },
  "Peñarol": { p: "#FFD700", s: "#000000", abbr: "PEN", flag: "🇺🇾" },

  // ─── COLOMBIA ───
  "Cobreloa": { p: "#FF6600", s: "#000000", abbr: "COB", flag: "🇨🇱" },

  // ─── USA ───
  "LA Galaxy": { p: "#00245D", s: "#FFD200", abbr: "LAG", flag: "🇺🇸" },
  "NY Red Bulls": { p: "#D71920", s: "#FFFFFF", abbr: "NYR", flag: "🇺🇸" },
  "Inter Miami": { p: "#F7B5CD", s: "#231F20", abbr: "MIA", flag: "🇺🇸" },
  "DC United": { p: "#231F20", s: "#EF3E42", abbr: "DCU", flag: "🇺🇸" },
  "LAFC": { p: "#C39E6D", s: "#000000", abbr: "LAF", flag: "🇺🇸" },
  "Orlando City": { p: "#633492", s: "#FFFFFF", abbr: "ORL", flag: "🇺🇸" },

  // ─── MEXICO ───
  "UNAM Pumas": { p: "#003DA5", s: "#FFD700", abbr: "PUM", flag: "🇲🇽" },

  // ─── JAPAN ───
  "Sagan Tosu": { p: "#7B59A5", s: "#FFD100", abbr: "SAG", flag: "🇯🇵" },

  // ─── ENGLAND (more) ───
  "Derby County": { p: "#000000", s: "#FFFFFF", abbr: "DER", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },

  // ─── RUSSIA ───
  "Anży Machaczkała": { p: "#FFD700", s: "#006A42", abbr: "ANZ", flag: "🇷🇺" },
  "Zenit Petersburg": { p: "#00AEEF", s: "#FFFFFF", abbr: "ZEN", flag: "🇷🇺" },

  // ─── SAUDI ARABIA ───
  "Al-Nassr": { p: "#FFC800", s: "#003DA5", abbr: "NAS", flag: "🇸🇦" },
  "Al-Hilal": { p: "#003DA5", s: "#FFFFFF", abbr: "HIL", flag: "🇸🇦" },
  "Al-Ittihad": { p: "#FFD700", s: "#000000", abbr: "ITT", flag: "🇸🇦" },
  "Al-Ahli": { p: "#006A42", s: "#FFFFFF", abbr: "AHL", flag: "🇸🇦" },

  // ─── QATAR ───
  "Al-Rayyan": { p: "#800020", s: "#FFFFFF", abbr: "RAY", flag: "🇶🇦" },
  "Al-Sadd": { p: "#000000", s: "#FFFFFF", abbr: "SAD", flag: "🇶🇦" },
  "Al-Duhail": { p: "#CC0033", s: "#FFFFFF", abbr: "DUH", flag: "🇶🇦" },

  // ─── CHINA ───
  "Shanghai Shenhua": { p: "#0047AB", s: "#D71920", abbr: "SHE", flag: "🇨🇳" },
  "Guangzhou": { p: "#D71920", s: "#FFD700", abbr: "GUA", flag: "🇨🇳" },
  "Hebei Fortune": { p: "#D71920", s: "#FFFFFF", abbr: "HEB", flag: "🇨🇳" },

  // ─── INDIA ───
  "Kerala Blasters": { p: "#FFD700", s: "#231F20", abbr: "KBF", flag: "🇮🇳" },

  // ─── UZBEKISTAN ───
  "Bunyodkor": { p: "#FFD700", s: "#003DA5", abbr: "BUN", flag: "🇺🇿" },

  // ─── ANGOLA ───
  "Kabuscorp": { p: "#003DA5", s: "#FFD700", abbr: "KAB", flag: "🇦🇴" },

  // ─── BULGARIA ───
  "CSKA Sofia": { p: "#D71920", s: "#FFFFFF", abbr: "CSK", flag: "🇧🇬" },
};

// Fallback for clubs not in registry
export function getClubData(clubName) {
  return CLUBS[clubName] || {
    p: "#4a5568",
    s: "#FFFFFF",
    abbr: clubName.slice(0, 3).toUpperCase(),
    flag: "⚽",
  };
}

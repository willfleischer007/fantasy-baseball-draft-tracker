import { normalizeName } from './csvParser';
import { HitterData } from '../scoring/hitterModel';
import { PitcherData } from '../scoring/pitcherModel';

export interface RawHitterFG {
  Name: string;
  Team: string;
  PA: number;
  OBP: number | string;
  'K%': string | number;
  'BB%': string | number;
  wOBA: number | string;
}

export interface RawHitterSavant {
  'last_name, first_name': string;
  xwoba: number | string;
  hard_hit_percent: number | string;
  barrel_batted_rate: number | string;
  oz_swing_percent: number | string;
  sprint_speed: number | string;
}

export interface RawContact {
  Name: string;
  'Contact%': string | number;
}

export interface RawAuction {
  Name: string;
  Dollars: number;
}

export const mergeHitterData = (
  fg: RawHitterFG[],
  savant: RawHitterSavant[],
  contact: RawContact[],
  auction: RawAuction[]
): HitterData[] => {
  const merged: HitterData[] = [];

  const parseNum = (val: any): number => {
    if (typeof val === 'number') return val;
    if (typeof val === 'string') {
      const clean = val.replace('%', '').trim();
      return isNaN(parseFloat(clean)) ? 0 : parseFloat(clean);
    }
    return 0;
  };

  const parsePct = (val: any): number => parseNum(val) / 100;

  auction.forEach((player) => {
    const name = normalizeName(player.Name);
    
    const fgMatch = fg.find((f) => normalizeName(f.Name) === name);
    const savantMatch = savant.find((s) => normalizeName(s['last_name, first_name']) === name);
    const contactMatch = contact.find((c) => normalizeName(c.Name) === name);

    if (fgMatch) {
      merged.push({
        name: player.Name.trim(),
        team: fgMatch.Team,
        age: 28, // Default if not in projection
        pa: fgMatch.PA,
        obp: parseNum(fgMatch.OBP),
        kRate: parsePct(fgMatch['K%']),
        bbRate: parsePct(fgMatch['BB%']),
        contactRate: contactMatch ? parsePct(contactMatch['Contact%']) : 0.75,
        oSwingRate: savantMatch ? parsePct(savantMatch.oz_swing_percent) : 0.30,
        hardHitRate: savantMatch ? parsePct(savantMatch.hard_hit_percent) : 0,
        barrelRate: savantMatch ? parsePct(savantMatch.barrel_batted_rate) : 0,
        xwOBA: savantMatch ? parseNum(savantMatch.xwoba) : parseNum(fgMatch.wOBA),
        wOBA: parseNum(fgMatch.wOBA),
        sprintSpeed: savantMatch ? parseNum(savantMatch.sprint_speed) : 27.0,
        projectedPA: fgMatch.PA,
      });
    }
  });

  return merged;
};

export interface RawPitcherFG {
  Name: string;
  Team: string;
  SIERA: number | string;
  'Stuff+': number | string;
  'Location+': number | string;
  'Pitching+': number | string;
  QS: number | string;
  GS: number | string;
}

export interface RawPitcherSavant {
  'last_name, first_name': string;
  hard_hit_percent: number | string;
  f_strike_percent: number | string;
  whiff_percent: number | string;
  oz_swing_miss_percent: number | string;
  p_era: number | string;
  player_age: number;
  p_formatted_ip: number | string;
}

export interface RawPitcherProjections {
  Name: string;
  Team: string;
  IP: number | string;
  ERA: number | string;
}

export const mergePitcherData = (
  fg: RawPitcherFG[],
  savant: RawPitcherSavant[],
  projections: RawPitcherProjections[],
  auction: RawAuction[]
): PitcherData[] => {
  const merged: PitcherData[] = [];

  const parseNum = (val: any): number => {
    if (typeof val === 'number') return val;
    if (typeof val === 'string') {
      const clean = val.replace('%', '').trim();
      return isNaN(parseFloat(clean)) ? 0 : parseFloat(clean);
    }
    return 0;
  };

  const parsePct = (val: any): number => parseNum(val) / 100;

  auction.forEach((player) => {
    const name = normalizeName(player.Name);
    
    const fgMatch = fg.find((f) => normalizeName(f.Name) === name);
    const savantMatch = savant.find((s) => normalizeName(s['last_name, first_name']) === name);
    const projMatch = projections.find((p) => normalizeName(p.Name) === name);

    if (projMatch) {
      merged.push({
        name: player.Name.trim(),
        team: projMatch.Team,
        age: savantMatch ? savantMatch.player_age : 30,
        ip2025: savantMatch ? parseNum(savantMatch.p_formatted_ip) : 150,
        gs2025: fgMatch ? parseNum(fgMatch.GS) : 25,
        qs2025: fgMatch ? parseNum(fgMatch.QS) : 10,
        kRate: 0.24, // Fallback if not available
        bbRate: 0.08, // Fallback
        fStrikeRate: savantMatch ? parsePct(savantMatch.f_strike_percent) : 0.62,
        pitchingPlus: fgMatch ? parseNum(fgMatch['Pitching+']) : 100,
        stuffPlus: fgMatch ? parseNum(fgMatch['Stuff+']) : 100,
        cswRate: 0.28, // Default
        siera: fgMatch ? parseNum(fgMatch.SIERA) : 4.0,
        xERA: savantMatch ? parseNum(savantMatch.p_era) : 4.0,
        hardHitRateAgainst: savantMatch ? parsePct(savantMatch.hard_hit_percent) : 0.35,
        projectedIP: parseNum(projMatch.IP),
        teamProjectedWins: 81,
        parkFactor: 100,
        era: parseNum(projMatch.ERA),
      });
    }
  });

  return merged;
};

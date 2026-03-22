import { normalizeName } from './csvParser';
import { HitterData } from '../scoring/hitterModel';
import { PitcherData } from '../scoring/pitcherModel';

export interface RawHitterFG {
  Name: string;
  Team: string;
  Age: number;
  PA: number;
  OBP: number;
  'K%': string | number;
  'BB%': string | number;
  'Contact%': string | number;
  'O-Swing%': string | number;
  wOBA: number;
}

export interface RawHitterSavant {
  Name: string;
  Team: string;
  xwOBA: number;
  'HardHit%': string | number;
  'Barrel%': string | number;
  wOBA: number;
}

export interface RawSprintSpeed {
  Name: string;
  Team: string;
  SprintSpeed: number;
}

export interface RawAuction {
  Name: string;
  POS: string;
  Dollars: number;
  PTS: number;
  ADP: number;
}

export const mergeHitterData = (
  fg: RawHitterFG[],
  savant: RawHitterSavant[],
  speed: RawSprintSpeed[],
  auction: RawAuction[]
): HitterData[] => {
  const merged: HitterData[] = [];

  auction.forEach((player) => {
    const name = normalizeName(player.Name);
    
    const fgMatch = fg.find((f) => normalizeName(f.Name) === name);
    const savantMatch = savant.find((s) => normalizeName(s.Name) === name);
    const speedMatch = speed.find((sp) => normalizeName(sp.Name) === name);

    if (fgMatch) {
      const parsePct = (val: string | number | undefined): number => {
        if (typeof val === 'number') return val / 100;
        if (typeof val === 'string') return parseFloat(val.replace('%', '')) / 100;
        return 0;
      };

      merged.push({
        name: player.Name,
        team: fgMatch.Team,
        age: fgMatch.Age,
        pa: fgMatch.PA,
        obp: fgMatch.OBP,
        kRate: parsePct(fgMatch['K%']),
        bbRate: parsePct(fgMatch['BB%']),
        contactRate: parsePct(fgMatch['Contact%']),
        oSwingRate: parsePct(fgMatch['O-Swing%']),
        hardHitRate: savantMatch ? parsePct(savantMatch['HardHit%']) : 0,
        barrelRate: savantMatch ? parsePct(savantMatch['Barrel%']) : 0,
        xwOBA: savantMatch ? savantMatch.xwOBA : fgMatch.wOBA, // fallback
        wOBA: fgMatch.wOBA,
        sprintSpeed: speedMatch ? speedMatch.SprintSpeed : 26.0, // default
        projectedPA: fgMatch.PA, // Use FG PA as projection for now
      });
    }
  });

  return merged;
};

export interface RawPitcherFG {
  Name: string;
  Team: string;
  Age: number;
  IP: number;
  GS: number;
  QS: number;
  'K%': string | number;
  'BB%': string | number;
  'F-Strike%': string | number;
  SIERA: number;
  ERA: number;
  wOBA: number;
}

export interface RawPitcherSavant {
  Name: string;
  Team: string;
  xERA: number;
  'HardHit%': string | number;
}

export interface RawStuffPlus {
  Name: string;
  'Stuff+': number;
  'Location+': number;
  'Pitching+': number;
  'CSW%': string | number;
}

export const mergePitcherData = (
  fg: RawPitcherFG[],
  savant: RawPitcherSavant[],
  stuff: RawStuffPlus[],
  auction: RawAuction[]
): PitcherData[] => {
  const merged: PitcherData[] = [];

  auction.forEach((player) => {
    const name = normalizeName(player.Name);
    
    const fgMatch = fg.find((f) => normalizeName(f.Name) === name);
    const savantMatch = savant.find((s) => normalizeName(s.Name) === name);
    const stuffMatch = stuff.find((st) => normalizeName(st.Name) === name);

    if (fgMatch) {
      const parsePct = (val: string | number | undefined): number => {
        if (typeof val === 'number') return val / 100;
        if (typeof val === 'string') return parseFloat(val.replace('%', '')) / 100;
        return 0;
      };

      merged.push({
        name: player.Name,
        team: fgMatch.Team,
        age: fgMatch.Age,
        ip2025: fgMatch.IP,
        gs2025: fgMatch.GS,
        qs2025: fgMatch.QS,
        kRate: parsePct(fgMatch['K%']),
        bbRate: parsePct(fgMatch['BB%']),
        fStrikeRate: parsePct(fgMatch['F-Strike%']),
        pitchingPlus: stuffMatch ? stuffMatch['Pitching+'] : 100,
        stuffPlus: stuffMatch ? stuffMatch['Stuff+'] : 100,
        cswRate: stuffMatch ? parsePct(stuffMatch['CSW%']) : 0.28,
        siera: fgMatch.SIERA,
        xERA: savantMatch ? savantMatch.xERA : fgMatch.SIERA, // fallback
        hardHitRateAgainst: savantMatch ? parsePct(savantMatch['HardHit%']) : 0.35,
        projectedIP: fgMatch.IP, // fallback
        teamProjectedWins: 81, // default
        parkFactor: 100, // default
        era: fgMatch.ERA,
      });
    }
  });

  return merged;
};

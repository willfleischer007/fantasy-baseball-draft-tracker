export interface HitterData {
  name: string;
  team: string;
  pos?: string;
  age: number;
  pa: number;
  obp: number;
  kRate: number;
  bbRate: number;
  contactRate: number;
  oSwingRate: number;
  hardHitRate: number;
  barrelRate: number;
  xwOBA: number;
  wOBA: number;
  sprintSpeed: number;
  projectedPA: number;
}

export interface HitterScore {
  total: number;
  breakdown: {
    plateDiscipline: number;
    contactQuality: number;
    onBaseAbility: number;
    contactRate: number;
    sustainability: number;
    speedUpside: number;
    age: number;
    playingTime: number;
  };
  details: {
    kBBGapScore: number;
    oSwingScore: number;
    hardHitScore: number;
    barrelScore: number;
    obpScore: number;
    contactRateScore: number;
    xwOBAScore: number;
    luckGapScore: number;
    speedScore: number;
    ageScore: number;
    paScore: number;
  };
  tier: string;
  flags: string[];
}

export const calculateHitterScore = (data: HitterData): HitterScore => {
  const breakdown = {
    plateDiscipline: 0,
    contactQuality: 0,
    onBaseAbility: 0,
    contactRate: 0,
    sustainability: 0,
    speedUpside: 0,
    age: 0,
    playingTime: 0,
  };

  const details = {
    kBBGapScore: 0,
    oSwingScore: 0,
    hardHitScore: 0,
    barrelScore: 0,
    obpScore: 0,
    contactRateScore: 0,
    xwOBAScore: 0,
    luckGapScore: 0,
    speedScore: 0,
    ageScore: 0,
    paScore: 0,
  };

  const flags: string[] = [];

  // 1a. K% - BB% gap (max 20)
  const kBBGap = (data.kRate - data.bbRate) * 100;
  if (kBBGap < 0) details.kBBGapScore = 20;
  else if (kBBGap <= 5) details.kBBGapScore = 15;
  else if (kBBGap <= 10) details.kBBGapScore = 10;
  else if (kBBGap <= 15) details.kBBGapScore = 5;
  else if (kBBGap <= 20) details.kBBGapScore = 2;
  else details.kBBGapScore = 0;

  // 1b. O-Swing% (max 8)
  const oSwing = data.oSwingRate * 100;
  if (oSwing <= 22) details.oSwingScore = 8;
  else if (oSwing <= 26) details.oSwingScore = 6;
  else if (oSwing <= 30) details.oSwingScore = 3;
  else if (oSwing <= 34) details.oSwingScore = 1;
  else details.oSwingScore = 0;

  breakdown.plateDiscipline = details.kBBGapScore + details.oSwingScore;

  // 2a. Hard Hit% (max 15)
  const hardHit = data.hardHitRate * 100;
  if (hardHit >= 45) details.hardHitScore = 15;
  else if (hardHit >= 40) details.hardHitScore = 12;
  else if (hardHit >= 36) details.hardHitScore = 8;
  else if (hardHit >= 32) details.hardHitScore = 4;
  else details.hardHitScore = 0;

  // 2b. Barrel% (max 10)
  const barrel = data.barrelRate * 100;
  if (barrel >= 12) details.barrelScore = 10;
  else if (barrel >= 9) details.barrelScore = 7;
  else if (barrel >= 6) details.barrelScore = 4;
  else if (barrel >= 3) details.barrelScore = 1;
  else details.barrelScore = 0;

  breakdown.contactQuality = details.hardHitScore + details.barrelScore;

  // 3. OBP (max 15)
  if (data.obp >= 0.380) details.obpScore = 15;
  else if (data.obp >= 0.350) details.obpScore = 12;
  else if (data.obp >= 0.330) details.obpScore = 8;
  else if (data.obp >= 0.310) details.obpScore = 4;
  else details.obpScore = 0;

  breakdown.onBaseAbility = details.obpScore;

  // 4. Contact% (max 10)
  const contact = data.contactRate * 100;
  if (contact >= 85) details.contactRateScore = 10;
  else if (contact >= 80) details.contactRateScore = 7;
  else if (contact >= 75) details.contactRateScore = 4;
  else if (contact >= 70) details.contactRateScore = 2;
  else details.contactRateScore = 0;

  breakdown.contactRate = details.contactRateScore;

  // 5a. xwOBA (max 7)
  if (data.xwOBA >= 0.380) details.xwOBAScore = 7;
  else if (data.xwOBA >= 0.350) details.xwOBAScore = 5;
  else if (data.xwOBA >= 0.330) details.xwOBAScore = 3;
  else if (data.xwOBA >= 0.310) details.xwOBAScore = 1;
  else details.xwOBAScore = 0;

  // 5b. wOBA - xwOBA gap (max 3)
  const luckGap = (data.wOBA - data.xwOBA) * 1000;
  if (Math.abs(luckGap) <= 10) details.luckGapScore = 3;
  else if (Math.abs(luckGap) <= 20) details.luckGapScore = 1;
  else details.luckGapScore = 0;

  breakdown.sustainability = details.xwOBAScore + details.luckGapScore;

  // 6. Speed (max 8)
  if (data.sprintSpeed >= 29.0) details.speedScore = 8;
  else if (data.sprintSpeed >= 28.0) details.speedScore = 5;
  else if (data.sprintSpeed >= 27.0) details.speedScore = 2;
  else details.speedScore = 0;

  breakdown.speedUpside = details.speedScore;

  // 7. Age (max 6)
  if (data.age <= 25) details.ageScore = 6;
  else if (data.age <= 28) details.ageScore = 4;
  else if (data.age <= 31) details.ageScore = 2;
  else if (data.age <= 33) details.ageScore = 0;
  else details.ageScore = -3;

  breakdown.age = details.ageScore;

  // 8. Playing Time (max 4)
  if (data.projectedPA >= 650) details.paScore = 4;
  else if (data.projectedPA >= 600) details.paScore = 3;
  else if (data.projectedPA >= 550) details.paScore = 1;
  else details.paScore = 0;

  breakdown.playingTime = details.paScore;

  const total = Object.values(breakdown).reduce((a, b) => a + b, 0);

  // Tiers
  let tier = 'AVOID';
  if (total >= 75) tier = 'ELITE';
  else if (total >= 60) tier = 'STRONG BUY';
  else if (total >= 50) tier = 'GOOD TARGET';
  else if (total >= 40) tier = 'USABLE';
  else if (total >= 30) tier = 'CAUTION';

  // Flags
  if (luckGap > 20) flags.push('REGRESSION RISK');
  if (luckGap < -20) flags.push('BREAKOUT CANDIDATE');
  if (data.sprintSpeed >= 29.0) flags.push('SPEED UPSIDE');
  if (data.projectedPA < 550) flags.push('INJURY RISK');
  if (data.age >= 34) flags.push('AGE CLIFF');

  return { total, breakdown, details, tier, flags };
};

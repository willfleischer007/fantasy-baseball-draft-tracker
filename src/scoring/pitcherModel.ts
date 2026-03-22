export interface PitcherData {
  name: string;
  team: string;
  age: number;
  ip2025: number;
  gs2025: number;
  qs2025: number;
  kRate: number;
  bbRate: number;
  fStrikeRate: number;
  pitchingPlus: number;
  stuffPlus: number;
  cswRate: number;
  siera: number;
  xERA: number;
  hardHitRateAgainst: number;
  projectedIP: number;
  teamProjectedWins: number;
  parkFactor: number;
  era: number;
}

export interface PitcherScore {
  total: number;
  breakdown: {
    control: number;
    strikeoutAbility: number;
    stuffAndCommand: number;
    contactManagement: number;
    volumeAndDurability: number;
    teamAndEnvironment: number;
    sustainability: number;
    ageAndHealth: number;
  };
  details: {
    bbScore: number;
    fStrikeScore: number;
    kBBScore: number;
    cswScore: number;
    pitchingPlusScore: number;
    stuffPlusScore: number;
    eraEstimatorScore: number;
    hardHitAgainstScore: number;
    ipScore: number;
    qsScore: number;
    teamWinsScore: number;
    parkFactorScore: number;
    regressionScore: number;
    ageScore: number;
  };
  tier: string;
  flags: string[];
}

export const calculatePitcherScore = (data: PitcherData): PitcherScore => {
  const breakdown = {
    control: 0,
    strikeoutAbility: 0,
    stuffAndCommand: 0,
    contactManagement: 0,
    volumeAndDurability: 0,
    teamAndEnvironment: 0,
    sustainability: 0,
    ageAndHealth: 0,
  };

  const details = {
    bbScore: 0,
    fStrikeScore: 0,
    kBBScore: 0,
    cswScore: 0,
    pitchingPlusScore: 0,
    stuffPlusScore: 0,
    eraEstimatorScore: 0,
    hardHitAgainstScore: 0,
    ipScore: 0,
    qsScore: 0,
    teamWinsScore: 0,
    parkFactorScore: 0,
    regressionScore: 0,
    ageScore: 0,
  };

  const flags: string[] = [];

  // 1a. BB% (max 18)
  const bb = data.bbRate * 100;
  if (bb <= 4.5) details.bbScore = 18;
  else if (bb <= 6.0) details.bbScore = 14;
  else if (bb <= 7.5) details.bbScore = 10;
  else if (bb <= 9.0) details.bbScore = 6;
  else if (bb <= 10.5) details.bbScore = 2;
  else details.bbScore = 0;

  // 1b. F-Strike% (max 7)
  const fStrike = data.fStrikeRate * 100;
  if (fStrike >= 68) details.fStrikeScore = 7;
  else if (fStrike >= 64) details.fStrikeScore = 5;
  else if (fStrike >= 60) details.fStrikeScore = 3;
  else if (fStrike >= 56) details.fStrikeScore = 1;
  else details.fStrikeScore = 0;

  breakdown.control = details.bbScore + details.fStrikeScore;

  // 2a. K-BB% (max 14)
  const kBB = (data.kRate - data.bbRate) * 100;
  if (kBB >= 25) details.kBBScore = 14;
  else if (kBB >= 20) details.kBBScore = 11;
  else if (kBB >= 15) details.kBBScore = 8;
  else if (kBB >= 10) details.kBBScore = 5;
  else if (kBB >= 5) details.kBBScore = 2;
  else details.kBBScore = 0;

  // 2b. CSW% (max 6)
  const csw = data.cswRate * 100;
  if (csw >= 32) details.cswScore = 6;
  else if (csw >= 29) details.cswScore = 4;
  else if (csw >= 26) details.cswScore = 2;
  else details.cswScore = 0;

  breakdown.strikeoutAbility = details.kBBScore + details.cswScore;

  // 3a. Pitching+ (max 10)
  if (data.pitchingPlus >= 115) details.pitchingPlusScore = 10;
  else if (data.pitchingPlus >= 105) details.pitchingPlusScore = 7;
  else if (data.pitchingPlus >= 95) details.pitchingPlusScore = 4;
  else if (data.pitchingPlus >= 85) details.pitchingPlusScore = 1;
  else details.pitchingPlusScore = 0;

  // 3b. Stuff+ (max 5)
  if (data.stuffPlus >= 120) details.stuffPlusScore = 5;
  else if (data.stuffPlus >= 105) details.stuffPlusScore = 3;
  else if (data.stuffPlus >= 95) details.stuffPlusScore = 1;
  else details.stuffPlusScore = 0;

  breakdown.stuffAndCommand = details.pitchingPlusScore + details.stuffPlusScore;

  // 4a. xERA or SIERA (max 8)
  const eraEstimator = (data.xERA + data.siera) / 2;
  if (eraEstimator <= 2.80) details.eraEstimatorScore = 8;
  else if (eraEstimator <= 3.30) details.eraEstimatorScore = 6;
  else if (eraEstimator <= 3.80) details.eraEstimatorScore = 4;
  else if (eraEstimator <= 4.30) details.eraEstimatorScore = 2;
  else details.eraEstimatorScore = 0;

  // 4b. Hard Hit% Against (max 4)
  const hardHitAgainst = data.hardHitRateAgainst * 100;
  if (hardHitAgainst <= 33) details.hardHitAgainstScore = 4;
  else if (hardHitAgainst <= 37) details.hardHitAgainstScore = 3;
  else if (hardHitAgainst <= 40) details.hardHitAgainstScore = 1;
  else details.hardHitAgainstScore = 0;

  breakdown.contactManagement = details.eraEstimatorScore + details.hardHitAgainstScore;

  // 5a. Projected IP (max 8)
  if (data.projectedIP >= 190) details.ipScore = 8;
  else if (data.projectedIP >= 175) details.ipScore = 6;
  else if (data.projectedIP >= 160) details.ipScore = 4;
  else if (data.projectedIP >= 140) details.ipScore = 2;
  else details.ipScore = 0;

  // 5b. QS% (max 4)
  const qsRate = data.qs2025 / data.gs2025;
  if (qsRate >= 0.65) details.qsScore = 4;
  else if (qsRate >= 0.50) details.qsScore = 3;
  else if (qsRate >= 0.35) details.qsScore = 1;
  else details.qsScore = 0;

  breakdown.volumeAndDurability = details.ipScore + details.qsScore;

  // 6a. Team Wins (max 6)
  if (data.teamProjectedWins >= 90) details.teamWinsScore = 6;
  else if (data.teamProjectedWins >= 85) details.teamWinsScore = 4;
  else if (data.teamProjectedWins >= 80) details.teamWinsScore = 2;
  else if (data.teamProjectedWins >= 75) details.teamWinsScore = 1;
  else details.teamWinsScore = 0;

  // 6b. Park Factor (max 4)
  if (data.parkFactor <= 95) details.parkFactorScore = 4;
  else if (data.parkFactor <= 100) details.parkFactorScore = 2;
  else if (data.parkFactor <= 105) details.parkFactorScore = 1;
  else details.parkFactorScore = 0;

  breakdown.teamAndEnvironment = details.teamWinsScore + details.parkFactorScore;

  // 7. Sustainability (max 6)
  const regressionGap = data.era - eraEstimator;
  if (regressionGap >= 0.30) details.regressionScore = 6;
  else if (regressionGap >= -0.30) details.regressionScore = 4;
  else if (regressionGap >= -0.60) details.regressionScore = 1;
  else details.regressionScore = 0;

  breakdown.sustainability = details.regressionScore;

  // 8. Age (max 4)
  if (data.age <= 26) details.ageScore = 4;
  else if (data.age <= 29) details.ageScore = 3;
  else if (data.age <= 32) details.ageScore = 1;
  else details.ageScore = 0;

  breakdown.ageAndHealth = details.ageScore;

  const total = Object.values(breakdown).reduce((a, b) => a + b, 0);

  // Tiers
  let tier = 'AVOID';
  if (total >= 75) tier = 'ELITE';
  else if (total >= 60) tier = 'STRONG BUY';
  else if (total >= 50) tier = 'GOOD TARGET';
  else if (total >= 40) tier = 'USABLE';
  else if (total >= 30) tier = 'CAUTION';

  // Flags
  if (regressionGap <= -0.60) flags.push('REGRESSION RISK');
  if (regressionGap >= 0.50) flags.push('BREAKOUT CANDIDATE');
  if (data.bbRate > 0.09) flags.push('CONTROL PROBLEM');
  if (data.pitchingPlus >= 115 || data.stuffPlus >= 120) flags.push('ELITE STUFF');
  if (data.projectedIP >= 190) flags.push('WORKHORSE');
  if (data.projectedIP < 140) flags.push('INJURY RISK');
  if (data.parkFactor <= 95) flags.push('GOOD PARK');
  if (data.parkFactor > 105) flags.push('BAD PARK');
  if (data.age >= 33) flags.push('AGE CONCERN');
  if (data.teamProjectedWins >= 90) flags.push('WIN SUPPORT');

  return { total, breakdown, details, tier, flags };
};

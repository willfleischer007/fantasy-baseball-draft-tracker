import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Papa from 'papaparse';
import { normalizeName } from './csvParser';
import { mergeHitterData, mergePitcherData } from './dataMerging';
import { calculateHitterScore } from '../scoring/hitterModel';
import { calculatePitcherScore } from '../scoring/pitcherModel';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '../../data/raw');
const OUTPUT_DIR = path.join(__dirname, '../../public/data');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const parseCSV = (filename: string): any[] => {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    console.warn(`File not found: ${filename}`);
    return [];
  }
  const content = fs.readFileSync(filePath, 'utf8');
  return Papa.parse(content, { header: true, dynamicTyping: true, skipEmptyLines: true }).data;
};

const main = () => {
  console.log('Starting data pre-processing...');

  // Hitter CSVs
  const rawHitterAuction = parseCSV('fangraphs-auction-calculator-THEBATX-hitters.csv');
  const rawHitterFG = parseCSV('2026-THEBATX-hitting-projections - Sheet1.csv');
  const rawHitterSavant = parseCSV('baseballsavant_hitters.csv');
  const rawContact = parseCSV('fangraphs-2025-hitters-contact-perct - Sheet1.csv');

  // Pitcher CSVs
  const rawPitcherAuction = parseCSV('fangraphs-auction-calculator-ATC-pitchers.csv');
  const rawPitcherProjections = parseCSV('2026-ATC-pitching-projections - Sheet1.csv');
  const rawPitcherFG = parseCSV('fangraphs-2025-pitchers - Sheet1.csv');
  const rawPitcherSavant = parseCSV('baseballsavant_pitchers.csv');

  // Merge Hitter Data
  const mergedHitters = mergeHitterData(rawHitterFG, rawHitterSavant, rawContact, rawHitterAuction);
  const hitters = mergedHitters.map(data => ({
    name: data.name,
    team: data.team,
    age: data.age,
    fgValue: rawHitterAuction.find((a: any) => normalizeName(a.Name) === normalizeName(data.name))?.Dollars || 0,
    isDrafted: false,
    score: calculateHitterScore(data),
    stats: {
      OBP: data.obp,
      'K%': (data.kRate * 100).toFixed(1) + '%',
      'BB%': (data.bbRate * 100).toFixed(1) + '%',
      'HH%': (data.hardHitRate * 100).toFixed(1) + '%',
      'xwOBA': data.xwOBA,
    }
  }));

  // Merge Pitcher Data
  const mergedPitchers = mergePitcherData(rawPitcherFG, rawPitcherSavant, rawPitcherProjections, rawPitcherAuction);
  const pitchers = mergedPitchers.map(data => ({
    name: data.name,
    team: data.team,
    age: data.age,
    fgValue: rawPitcherAuction.find((a: any) => normalizeName(a.Name) === normalizeName(data.name))?.Dollars || 0,
    isDrafted: false,
    score: calculatePitcherScore(data),
    stats: {
      SIERA: data.siera,
      'Proj IP': data.projectedIP,
      'Pitching+': data.pitchingPlus,
      'Stuff+': data.stuffPlus,
      'xERA': data.xERA,
    }
  }));

  const output = { hitters, pitchers, lastUpdated: new Date().toISOString() };
  fs.writeFileSync(path.join(OUTPUT_DIR, 'players.json'), JSON.stringify(output, null, 2));

  console.log('Pre-processing complete. Data saved to public/data/players.json');
};

main();

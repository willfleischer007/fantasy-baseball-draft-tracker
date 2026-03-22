import React, { useState } from 'react';
import PlayerTable from './PlayerTable';
import { calculateHitterScore } from '../scoring/hitterModel';
import { calculatePitcherScore } from '../scoring/pitcherModel';
import { parseCSV } from '../data_ingestion/csvParser';
import * as DataMerging from '../data_ingestion/dataMerging';

interface Player {
  name: string;
  team: string;
  pos?: string;
  age: number;
  fgValue: number;
  paidValue?: number;
  isDrafted: boolean;
  score: any;
  stats: Record<string, string | number>;
}

const Dashboard: React.FC = () => {
  const [view, setView] = useState<'hitters' | 'pitchers' | 'all'>('hitters');
  const [hitters, setHitters] = useState<Player[]>([]);
  const [pitchers, setPitchers] = useState<Player[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // State for raw data
  const [rawHitterFG, setRawHitterFG] = useState<DataMerging.RawHitterFG[]>([]);
  const [rawHitterSavant, setRawHitterSavant] = useState<DataMerging.RawHitterSavant[]>([]);
  const [rawContact, setRawContact] = useState<DataMerging.RawContact[]>([]);
  const [rawHitterAuction, setRawHitterAuction] = useState<DataMerging.RawAuction[]>([]);

  const [rawPitcherFG, setRawPitcherFG] = useState<DataMerging.RawPitcherFG[]>([]);
  const [rawPitcherSavant, setRawPitcherSavant] = useState<DataMerging.RawPitcherSavant[]>([]);
  const [rawPitcherProjections, setRawPitcherProjections] = useState<DataMerging.RawPitcherProjections[]>([]);
  const [rawPitcherAuction, setRawPitcherAuction] = useState<DataMerging.RawAuction[]>([]);

  const totalSpent = [...hitters, ...pitchers]
    .filter(p => p.isDrafted)
    .reduce((sum, p) => sum + (p.paidValue || 0), 0);

  const budgetRemaining = 260 - totalSpent;

  const handleUpdatePlayer = (name: string, updates: Partial<Player>) => {
    setHitters(prev => prev.map(p => p.name === name ? { ...p, ...updates } : p));
    setPitchers(prev => prev.map(p => p.name === name ? { ...p, ...updates } : p));
  };

  const processHitters = () => {
    if (rawHitterAuction.length && rawHitterFG.length) {
      const merged = DataMerging.mergeHitterData(rawHitterFG, rawHitterSavant, rawContact, rawHitterAuction);
      const players: Player[] = merged.map(data => ({
        name: data.name,
        team: data.team,
        age: data.age,
        fgValue: rawHitterAuction.find(a => a.Name.trim() === data.name)?.Dollars || 0,
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
      setHitters(players);
    }
  };

  const processPitchers = () => {
    if (rawPitcherAuction.length && rawPitcherProjections.length) {
      const merged = DataMerging.mergePitcherData(rawPitcherFG, rawPitcherSavant, rawPitcherProjections, rawPitcherAuction);
      const players: Player[] = merged.map(data => ({
        name: data.name,
        team: data.team,
        age: data.age,
        fgValue: rawPitcherAuction.find(a => a.Name.trim() === data.name)?.Dollars || 0,
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
      setPitchers(players);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const text = await file.text();
      const data = await parseCSV<any>(text);
      
      switch (type) {
        case 'hitter_auction': setRawHitterAuction(data); break;
        case 'hitter_stats': setRawHitterFG(data); break;
        case 'hitter_savant': setRawHitterSavant(data); break;
        case 'hitter_contact': setRawContact(data); break;
        case 'pitcher_auction': setRawPitcherAuction(data); break;
        case 'pitcher_stats': setRawPitcherFG(data); break;
        case 'pitcher_savant': setRawPitcherSavant(data); break;
        case 'pitcher_projections': setRawPitcherProjections(data); break;
      }
    } catch (e) {
      console.error(e);
      alert('Error parsing CSV');
    }
    setIsLoading(false);
  };

  const filteredHitters = hitters.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPitchers = pitchers.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="app-container">
      <header>
        <h1>Fantasy Baseball Draft Tracker 2026</h1>
        <div className="summary-grid">
          <div className="summary-item">
            <div className="summary-label">Budget Remaining</div>
            <div className="summary-value">${budgetRemaining}</div>
          </div>
          <div className="summary-item">
            <div className="summary-label">Total Spent</div>
            <div className="summary-value">${totalSpent}</div>
          </div>
          <div className="summary-item">
            <div className="summary-label">Drafted Count</div>
            <div className="summary-value">
              {hitters.filter(p => p.isDrafted).length} H / {pitchers.filter(p => p.isDrafted).length} P
            </div>
          </div>
        </div>
      </header>

      <div className="controls" style={{ background: '#eee', padding: '15px', borderRadius: '8px' }}>
        <div>
          <strong>Upload CSVs:</strong>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginTop: '10px' }}>
            <label>Auction (Batters): <input type="file" onChange={(e) => handleFileUpload(e, 'hitter_auction')} /></label>
            <label>THE BATX (Batters): <input type="file" onChange={(e) => handleFileUpload(e, 'hitter_stats')} /></label>
            <label>Savant (Batters): <input type="file" onChange={(e) => handleFileUpload(e, 'hitter_savant')} /></label>
            <label>Contact%: <input type="file" onChange={(e) => handleFileUpload(e, 'hitter_contact')} /></label>
            <label>Auction (Pitchers): <input type="file" onChange={(e) => handleFileUpload(e, 'pitcher_auction')} /></label>
            <label>ATC (Pitchers): <input type="file" onChange={(e) => handleFileUpload(e, 'pitcher_projections')} /></label>
            <label>Savant (Pitchers): <input type="file" onChange={(e) => handleFileUpload(e, 'pitcher_savant')} /></label>
            <label>Stuff+/Pitching+: <input type="file" onChange={(e) => handleFileUpload(e, 'pitcher_stats')} /></label>
          </div>
          <div style={{ marginTop: '10px' }}>
            <button className="btn btn-secondary" onClick={processHitters} disabled={!rawHitterAuction.length || !rawHitterFG.length}>Process Hitters</button>
            <button className="btn btn-secondary" onClick={processPitchers} disabled={!rawPitcherAuction.length || !rawPitcherProjections.length} style={{ marginLeft: '10px' }}>Process Pitchers</button>
          </div>
        </div>
      </div>

      <div className="controls">
        <button 
          className={`btn ${view === 'hitters' ? 'btn-primary' : ''}`}
          onClick={() => setView('hitters')}
        >
          Hitters
        </button>
        <button 
          className={`btn ${view === 'pitchers' ? 'btn-primary' : ''}`}
          onClick={() => setView('pitchers')}
        >
          Pitchers
        </button>
        <button 
          className={`btn ${view === 'all' ? 'btn-primary' : ''}`}
          onClick={() => setView('all')}
        >
          All Players
        </button>
        <input 
          type="text" 
          placeholder="Search player..." 
          style={{ marginLeft: 'auto', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {isLoading && <p>Processing data...</p>}

      {!isLoading && view === 'hitters' && (
        <PlayerTable 
          players={filteredHitters} 
          onUpdatePlayer={handleUpdatePlayer} 
          type="hitter"
        />
      )}
      {!isLoading && view === 'pitchers' && (
        <PlayerTable 
          players={filteredPitchers} 
          onUpdatePlayer={handleUpdatePlayer} 
          type="pitcher"
        />
      )}
      {!isLoading && view === 'all' && (
        <PlayerTable 
          players={[...filteredHitters, ...filteredPitchers].sort((a, b) => b.fgValue - a.fgValue)} 
          onUpdatePlayer={handleUpdatePlayer} 
          type="hitter" // Mixed view
        />
      )}
      
      {hitters.length === 0 && pitchers.length === 0 && !isLoading && (
        <div style={{ textAlign: 'center', padding: '40px', background: 'white', borderRadius: '8px' }}>
          <h3>No data loaded yet.</h3>
          <p>Please upload the FanGraphs and Baseball Savant CSV files and click "Process" to get started.</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

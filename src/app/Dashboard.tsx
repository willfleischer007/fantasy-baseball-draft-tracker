import React, { useState } from 'react';
import PlayerTable from './PlayerTable';
import { calculateHitterScore } from '../scoring/hitterModel';
import { calculatePitcherScore } from '../scoring/pitcherModel';
import { 
  parseCSV, 
  mergeHitterData, 
  mergePitcherData,
  RawHitterFG,
  RawHitterSavant,
  RawSprintSpeed,
  RawAuction,
  RawPitcherFG,
  RawPitcherSavant,
  RawStuffPlus
} from '../data_ingestion/csvParser'; // Actually I should export from dataMerging too

// Refactoring imports to be cleaner
import * as DataMerging from '../data_ingestion/dataMerging';
import * as CSVParser from '../data_ingestion/csvParser';

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

  const totalSpent = [...hitters, ...pitchers]
    .filter(p => p.isDrafted)
    .reduce((sum, p) => sum + (p.paidValue || 0), 0);

  const budgetRemaining = 260 - totalSpent;

  const handleUpdatePlayer = (name: string, updates: Partial<Player>) => {
    setHitters(prev => prev.map(p => p.name === name ? { ...p, ...updates } : p));
    setPitchers(prev => prev.map(p => p.name === name ? { ...p, ...updates } : p));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    const text = await file.text();
    const data = await CSVParser.parseCSV(text);
    
    // In a real app, we'd wait for all files and then merge.
    // For now, I'll provide a mock process for demonstration if I don't have all files yet.
    console.log(`Loaded ${type}:`, data);
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginTop: '10px' }}>
            <label>Auction (Batters): <input type="file" onChange={(e) => handleFileUpload(e, 'hitter_auction')} /></label>
            <label>Auction (Pitchers): <input type="file" onChange={(e) => handleFileUpload(e, 'pitcher_auction')} /></label>
            <label>FG Stats (Batters): <input type="file" onChange={(e) => handleFileUpload(e, 'hitter_stats')} /></label>
            <label>FG Stats (Pitchers): <input type="file" onChange={(e) => handleFileUpload(e, 'pitcher_stats')} /></label>
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
      
      {hitters.length === 0 && !isLoading && (
        <div style={{ textAlign: 'center', padding: '40px', background: 'white', borderRadius: '8px' }}>
          <h3>No data loaded yet.</h3>
          <p>Please upload the FanGraphs and Baseball Savant CSV files to get started.</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

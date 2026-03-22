import React, { useState, useEffect } from 'react';
import PlayerTable from './PlayerTable';

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
  notes?: string;
}

const Dashboard: React.FC = () => {
  const [view, setView] = useState<'hitters' | 'pitchers' | 'all'>('hitters');
  const [hitters, setHitters] = useState<Player[]>([]);
  const [pitchers, setPitchers] = useState<Player[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [minPA, setMinPA] = useState(200);
  const [posFilter, setPosFilter] = useState('ALL');
  const [flagFilter, setFlagFilter] = useState('ALL');
  const [minContactQuality, setMinContactQuality] = useState(0);
  const [minContactRate, setMinContactRate] = useState(0);
  const [minControl, setMinControl] = useState(0);
  const [minStrikeoutAbility, setMinStrikeoutAbility] = useState(0);
  const [minContactManagement, setMinContactManagement] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}data/players.json`);
        const data = await response.json();
        // Load notes from local storage
        const savedNotes = JSON.parse(localStorage.getItem('playerNotes') || '{}');
        const addNotes = (players: Player[]) => players.map(p => ({
          ...p,
          notes: savedNotes[p.name] || ''
        }));

        setHitters(addNotes(data.hitters));
        setPitchers(addNotes(data.pitchers));
        setLastUpdated(data.lastUpdated);
      } catch (e) {
        console.error('Error loading pre-processed data:', e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalSpent = [...hitters, ...pitchers]
    .filter(p => p.isDrafted)
    .reduce((sum, p) => sum + (p.paidValue || 0), 0);

  const budgetRemaining = 260 - totalSpent;

  const handleUpdatePlayer = (name: string, updates: Partial<Player>) => {
    const updateFn = (prev: Player[]) => prev.map(p => {
      if (p.name === name) {
        const updated = { ...p, ...updates };
        if (updates.notes !== undefined) {
          const savedNotes = JSON.parse(localStorage.getItem('playerNotes') || '{}');
          savedNotes[name] = updates.notes;
          localStorage.setItem('playerNotes', JSON.stringify(savedNotes));
        }
        return updated;
      }
      return p;
    });
    setHitters(updateFn);
    setPitchers(updateFn);
  };

  const filteredHitters = hitters.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPA = (p.stats['PA'] as number || 0) >= minPA;
    const matchesPos = posFilter === 'ALL' || (p.pos || '').includes(posFilter);
    const matchesFlag = flagFilter === 'ALL' || (p.score?.flags || []).includes(flagFilter);
    const matchesContactQuality = (p.score?.breakdown?.contactQuality?.score || 0) >= minContactQuality;
    const matchesContactRate = (p.score?.breakdown?.contactRate?.score || 0) >= minContactRate;
    return matchesSearch && matchesPA && matchesPos && matchesFlag && matchesContactQuality && matchesContactRate;
  });

  const filteredPitchers = pitchers.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesIP = (p.stats['Proj IP'] as number || 0) >= (minPA / 4); // Rough proxy for pitchers
    const matchesFlag = flagFilter === 'ALL' || (p.score?.flags || []).includes(flagFilter);
    const matchesControl = (p.score?.breakdown?.control?.score || 0) >= minControl;
    const matchesStrikeout = (p.score?.breakdown?.strikeoutAbility?.score || 0) >= minStrikeoutAbility;
    const matchesContactMgmt = (p.score?.breakdown?.contactManagement?.score || 0) >= minContactManagement;
    return matchesSearch && matchesIP && matchesFlag && matchesControl && matchesStrikeout && matchesContactMgmt;
  });

  const positions = ['ALL', 'C', '1B', '2B', '3B', 'SS', 'OF', 'DH'];
  const hitterFlags = ['ALL', 'REGRESSION RISK', 'BREAKOUT CANDIDATE', 'SPEED UPSIDE', 'INJURY RISK', 'AGE CLIFF'];
  const pitcherFlags = ['ALL', 'REGRESSION RISK', 'BREAKOUT CANDIDATE', 'CONTROL PROBLEM', 'ELITE STUFF', 'WORKHORSE', 'INJURY RISK', 'GOOD PARK', 'BAD PARK', 'AGE CONCERN', 'WIN SUPPORT'];

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
          {lastUpdated && (
            <div className="summary-item">
              <div className="summary-label">Data Last Updated</div>
              <div className="summary-value" style={{ fontSize: '0.8rem' }}>{new Date(lastUpdated).toLocaleString()}</div>
            </div>
          )}
        </div>
      </header>

      <div className="controls filter-panel">
        <div className="control-group">
          <label>View:</label>
          <button className={`btn ${view === 'hitters' ? 'btn-primary' : ''}`} onClick={() => setView('hitters')}>Hitters</button>
          <button className={`btn ${view === 'pitchers' ? 'btn-primary' : ''}`} onClick={() => setView('pitchers')}>Pitchers</button>
          <button className={`btn ${view === 'all' ? 'btn-primary' : ''}`} onClick={() => setView('all')}>All Players</button>
        </div>

        <div className="control-group">
          <label>Search:</label>
          <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>

        <div className="control-group">
          <label>Min PA/IP:</label>
          <input type="number" value={minPA} onChange={(e) => setMinPA(parseInt(e.target.value) || 0)} style={{ width: '80px' }} />
        </div>

        {view !== 'all' && (
          <div className="control-group">
            <label>Flag:</label>
            <select value={flagFilter} onChange={(e) => setFlagFilter(e.target.value)}>
              {(view === 'pitchers' ? pitcherFlags : hitterFlags).map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
        )}

        {view === 'hitters' && (
          <>
            <div className="control-group">
              <label>Position:</label>
              <select value={posFilter} onChange={(e) => setPosFilter(e.target.value)}>
                {positions.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="control-group">
              <label>Min Contact Qual:</label>
              <input type="number" step="1" value={minContactQuality} onChange={(e) => setMinContactQuality(parseFloat(e.target.value) || 0)} style={{ width: '60px' }} />
            </div>
            <div className="control-group">
              <label>Min Contact Rate:</label>
              <input type="number" step="1" value={minContactRate} onChange={(e) => setMinContactRate(parseFloat(e.target.value) || 0)} style={{ width: '60px' }} />
            </div>
          </>
        )}

        {view === 'pitchers' && (
          <>
            <div className="control-group">
              <label>Min Control:</label>
              <input type="number" step="1" value={minControl} onChange={(e) => setMinControl(parseFloat(e.target.value) || 0)} style={{ width: '60px' }} />
            </div>
            <div className="control-group">
              <label>Min K Ability:</label>
              <input type="number" step="1" value={minStrikeoutAbility} onChange={(e) => setMinStrikeoutAbility(parseFloat(e.target.value) || 0)} style={{ width: '60px' }} />
            </div>
            <div className="control-group">
              <label>Min Contact Mgmt:</label>
              <input type="number" step="1" value={minContactManagement} onChange={(e) => setMinContactManagement(parseFloat(e.target.value) || 0)} style={{ width: '60px' }} />
            </div>
          </>
        )}
      </div>

      {isLoading && <p>Loading draft data...</p>}

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
      
      {!isLoading && hitters.length === 0 && pitchers.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', background: 'white', borderRadius: '8px' }}>
          <h3>No data found.</h3>
          <p>Please run `npm run preprocess` to generate the draft data from your CSV exports.</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

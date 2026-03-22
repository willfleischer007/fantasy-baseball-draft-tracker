import React, { useState } from 'react';

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

interface PlayerTableProps {
  players: Player[];
  onUpdatePlayer: (name: string, updates: Partial<Player>) => void;
  type: 'hitter' | 'pitcher';
}

const PlayerTable: React.FC<PlayerTableProps> = ({ players, onUpdatePlayer, type }) => {
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);
  const [tooltip, setTooltip] = useState<{ visible: boolean, x: number, y: number, content: any } | null>(null);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'desc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  const sortedPlayers = [...players].sort((a, b) => {
    if (!sortConfig) return 0;
    const { key, direction } = sortConfig;
    
    let aValue: any = a[key as keyof Player] || a.stats[key] || 0;
    let bValue: any = b[key as keyof Player] || b.stats[key] || 0;

    if (key === 'score') {
      aValue = a.score.totalScore;
      bValue = b.score.totalScore;
    }

    if (aValue < bValue) return direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return direction === 'asc' ? 1 : -1;
    return 0;
  });

  const getTierColor = (tier: string) => {
    const tiers: Record<string, string> = {
      'Elite': '#d4af37',
      'Strong Buy': '#2ecc71',
      'Average': '#3498db',
      'Low End': '#95a5a6',
      'Avoid': '#e74c3c',
      'Ace': '#d4af37',
      'SP1': '#2ecc71',
      'SP2': '#27ae60',
      'SP3': '#3498db',
      'SP4': '#2980b9',
      'Fringe': '#95a5a6',
    };
    return tiers[tier] || '#ccc';
  };

  const renderScoreBreakdown = (score: any) => {
    return (
      <div className="tooltip-content">
        <h4>{type === 'hitter' ? 'Hitter' : 'Pitcher'} Score Breakdown</h4>
        {Object.entries(score.componentScores).map(([name, val]: [string, any]) => (
          <div key={name} className="tooltip-row">
            <span className="label">{name}</span>
            <span className="value">{val >= 0 ? `+${val}` : val}</span>
          </div>
        ))}
        <div className="tooltip-total">
          <div className="tooltip-row">
            <span className="label">Total Score</span>
            <span className="value">{score.totalScore}</span>
          </div>
        </div>
        <div style={{ marginTop: '10px', fontSize: '0.8rem', color: '#666' }}>
          <strong>Flags:</strong> {score.flags.join(', ') || 'None'}
        </div>
      </div>
    );
  };

  return (
    <div className="table-container">
      <table className="player-table">
        <thead>
          <tr>
            <th onClick={() => handleSort('name')}>Player</th>
            <th>Team</th>
            <th>Pos</th>
            <th onClick={() => handleSort('score')}>Score</th>
            <th>Tier</th>
            <th onClick={() => handleSort('fgValue')}>FG $</th>
            <th>Paid $</th>
            <th>Value</th>
            <th>Notes</th>
            <th>Drafted</th>
          </tr>
        </thead>
        <tbody>
          {sortedPlayers.map(player => (
            <tr key={player.name} className={player.isDrafted ? 'drafted' : ''}>
              <td>
                <div style={{ fontWeight: 'bold' }}>{player.name}</div>
                <div style={{ fontSize: '0.75rem', color: '#666' }}>Age: {player.age}</div>
              </td>
              <td>{player.team}</td>
              <td>{player.pos}</td>
              <td 
                className="score-cell"
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setTooltip({
                    visible: true,
                    x: rect.right + 10,
                    y: rect.top,
                    content: renderScoreBreakdown(player.score)
                  });
                }}
                onMouseLeave={() => setTooltip(null)}
              >
                {player.score.totalScore}
              </td>
              <td>
                <span 
                  className="tier-badge" 
                  style={{ backgroundColor: getTierColor(player.score.tier) }}
                >
                  {player.score.tier}
                </span>
              </td>
              <td>${player.fgValue.toFixed(2)}</td>
              <td>
                <input 
                  type="number" 
                  className="editable-input"
                  value={player.paidValue || ''}
                  onChange={(e) => onUpdatePlayer(player.name, { paidValue: parseFloat(e.target.value) || 0 })}
                  placeholder="0"
                />
              </td>
              <td style={{ color: (player.fgValue - (player.paidValue || 0)) >= 0 ? 'green' : 'red' }}>
                ${(player.fgValue - (player.paidValue || 0)).toFixed(2)}
              </td>
              <td>
                <input 
                  type="text"
                  className="notes-input"
                  value={player.notes || ''}
                  onChange={(e) => onUpdatePlayer(player.name, { notes: e.target.value })}
                  placeholder="Add note..."
                />
              </td>
              <td style={{ textAlign: 'center' }}>
                <input 
                  type="checkbox" 
                  checked={player.isDrafted}
                  onChange={(e) => onUpdatePlayer(player.name, { isDrafted: e.target.checked })}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {tooltip && tooltip.visible && (
        <div 
          className="tooltip"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          {tooltip.content}
        </div>
      )}
    </div>
  );
};

export default PlayerTable;

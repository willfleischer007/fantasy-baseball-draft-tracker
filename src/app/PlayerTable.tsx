import React, { useState } from 'react';
import { HitterScore } from '../scoring/hitterModel';
import { PitcherScore } from '../scoring/pitcherModel';

interface Player {
  name: string;
  team: string;
  pos?: string;
  age: number;
  fgValue: number;
  paidValue?: number;
  isDrafted: boolean;
  score: HitterScore | PitcherScore;
  stats: Record<string, string | number>;
}

interface PlayerTableProps {
  players: Player[];
  onUpdatePlayer: (name: string, updates: Partial<Player>) => void;
  type: 'hitter' | 'pitcher';
}

const PlayerTable: React.FC<PlayerTableProps> = ({ players, onUpdatePlayer, type }) => {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>({
    key: 'totalScore',
    direction: 'desc',
  });

  const sortedPlayers = [...players].sort((a, b) => {
    if (!sortConfig) return 0;
    
    let aVal: any = a[sortConfig.key as keyof Player] || a.score.total;
    let bVal: any = b[sortConfig.key as keyof Player] || b.score.total;

    if (sortConfig.key === 'totalScore') {
      aVal = a.score.total;
      bVal = b.score.total;
    }

    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th onClick={() => requestSort('name')}>Player</th>
            <th onClick={() => requestSort('team')}>Team</th>
            {type === 'hitter' && <th onClick={() => requestSort('pos')}>Pos</th>}
            <th onClick={() => requestSort('totalScore')}>Score</th>
            <th onClick={() => requestSort('tier')}>Tier</th>
            <th onClick={() => requestSort('fgValue')}>FG $</th>
            <th>Paid $</th>
            <th>Value</th>
            <th>Drafted</th>
            {Object.keys(players[0]?.stats || {}).map((stat) => (
              <th key={stat} onClick={() => requestSort(`stats.${stat}`)}>{stat}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedPlayers.map((player) => (
            <tr key={player.name} className={player.isDrafted ? 'drafted' : ''}>
              <td>{player.name}</td>
              <td>{player.team}</td>
              {type === 'hitter' && <td>{player.pos}</td>}
              <td title="Hover for breakdown">{player.score.total}</td>
              <td>
                <span className={`tier-badge tier-${player.score.tier.replace(' ', '-')}`}>
                  {player.score.tier}
                </span>
              </td>
              <td>${player.fgValue}</td>
              <td>
                <input
                  type="number"
                  className="input-paid"
                  value={player.paidValue || ''}
                  onChange={(e) => onUpdatePlayer(player.name, { paidValue: parseInt(e.target.value) || 0 })}
                />
              </td>
              <td style={{ color: (player.fgValue - (player.paidValue || 0)) >= 0 ? 'green' : 'red' }}>
                ${player.fgValue - (player.paidValue || 0)}
              </td>
              <td>
                <input
                  type="checkbox"
                  checked={player.isDrafted}
                  onChange={(e) => onUpdatePlayer(player.name, { isDrafted: e.target.checked })}
                />
              </td>
              {Object.entries(player.stats).map(([key, val]) => (
                <td key={key}>{typeof val === 'number' ? val.toFixed(3).replace(/\.000$/, '') : val}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PlayerTable;

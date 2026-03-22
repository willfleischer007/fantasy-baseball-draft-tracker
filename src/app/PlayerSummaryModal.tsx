import React from 'react';

interface PlayerSummaryModalProps {
  player: any;
  type: 'hitter' | 'pitcher';
  onClose: () => void;
}

const PlayerSummaryModal: React.FC<PlayerSummaryModalProps> = ({ player, type, onClose }) => {
  const { score, stats } = player;

  const generateHitterSummary = () => {
    const lines = [];
    if (score.details.barrelScore >= 10) lines.push(`Elite Barrel rate (${stats['HH%']} range) is a massive driver of the contact quality score.`);
    if (score.details.obpScore >= 12) lines.push(`Excellent OBP (${stats['OBP']}) provides a high floor for value.`);
    if (score.details.kBBGapScore >= 15) lines.push(`Exceptional plate discipline with a narrow K-BB gap.`);
    if (score.flags.includes('BREAKOUT CANDIDATE')) lines.push(`Currently flagged as a BREAKOUT CANDIDATE due to the gap between their wOBA and xwOBA.`);
    if (score.flags.includes('SPEED UPSIDE')) lines.push(`Plus speed provides stolen base upside.`);
    
    return lines.length > 0 ? lines : ["A solid all-around performer with balanced scoring components."];
  };

  const generatePitcherSummary = () => {
    const lines = [];
    if (score.details.stuffPlusScore >= 5) lines.push(`Elite Stuff+ (${stats['Stuff+']}) indicates dominant raw offerings.`);
    if (score.details.bbScore >= 14) lines.push(`Outstanding control with a very low walk rate.`);
    if (score.details.eraEstimatorScore >= 6) lines.push(`Strong underlying metrics (SIERA: ${stats['SIERA']}) suggest elite run prevention.`);
    if (score.flags.includes('WORKHORSE')) lines.push(`Workhorse profile with high projected volume (${stats['Proj IP']} IP).`);
    
    return lines.length > 0 ? lines : ["A reliable arm with consistent performance metrics."];
  };

  const summaryLines = type === 'hitter' ? generateHitterSummary() : generatePitcherSummary();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <header className="modal-header">
          <h2>{player.name} - Summary</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </header>
        <div className="modal-body">
          <div className="summary-section">
            <h3>Overall Analysis</h3>
            <p className="tier-text">
              Tier: <strong className={`tier-${score.tier.replace(' ', '-')}`}>{score.tier}</strong>
            </p>
            <ul>
              {summaryLines.map((line, i) => <li key={i}>{line}</li>)}
            </ul>
          </div>
          
          <div className="stats-grid">
            {Object.entries(stats).map(([label, val]) => (
              <div key={label} className="stat-pill">
                <span className="stat-label">{label}</span>
                <span className="stat-value">{val as string | number}</span>
              </div>
            ))}
          </div>

          <div className="score-bars">
            <h3>Component Breakdown</h3>
            {Object.entries(score.breakdown).map(([name, val]: [string, any]) => (
              <div key={name} className="score-bar-row">
                <span className="bar-label">{name.replace(/([A-Z])/g, ' $1').toUpperCase()}</span>
                <div className="bar-container">
                  <div 
                    className="bar-fill" 
                    style={{ width: `${Math.min(100, (val / 25) * 100)}%` }}
                  ></div>
                </div>
                <span className="bar-value">{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerSummaryModal;

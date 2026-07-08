

// ==========================================
// 1. STUDENT LEADERBOARD WIDGET
// ==========================================
export function StudentLeaderboardWidget() {
  // Seeding top peers
  const board = [
    { rank: 1, name: 'Alice Smith (You)', score: 98.4, badge: '🥇 Academic Master' },
    { rank: 2, name: 'John Doe', score: 92.1, badge: '🥈 High Achiever' },
    { rank: 3, name: 'Emily Watson', score: 89.5, badge: '🥉 Honor Roll' },
    { rank: 4, name: 'Michael Chang', score: 86.2, badge: '🎖️ Star Scholar' },
    { rank: 5, name: 'Sophia Rossi', score: 84.7, badge: '🎖️ Star Scholar' }
  ];

  return (
    <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
      <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <span>🏆</span> Student Honor Roll Leaderboard
      </h3>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
        Real-time ranking of top academic profiles based on overall term GPA grading.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {board.map(u => (
          <div
            key={u.rank}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.75rem 1rem',
              background: u.rank === 1 ? 'var(--success-glow)' : 'rgba(255,255,255,0.01)',
              border: `1px solid ${u.rank === 1 ? 'hsla(142,72%,45%,0.2)' : 'var(--border-color)'}`,
              borderRadius: '8px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <strong style={{ fontSize: '1rem', color: u.rank === 1 ? 'var(--success)' : 'var(--text-muted)' }}>
                #{u.rank}
              </strong>
              <div>
                <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{u.name}</strong>
                <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                  {u.badge}
                </span>
              </div>
            </div>
            <strong style={{ fontSize: '0.95rem', color: 'var(--primary)' }}>
              {u.score}%
            </strong>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// 2. SUBJECT AVERAGES SVG BAR CHART
// ==========================================
export function SubjectAveragesBarChart({ marks }: { marks: any[] }) {
  if (!marks || marks.length === 0) return null;

  // Group marks by subject and calculate average percentage
  const subjectMap: Record<string, { total: number; count: number }> = {};
  marks.forEach(m => {
    const subName = m.subject?.name || 'Default';
    const rate = (m.score / m.maxScore) * 100;
    if (!subjectMap[subName]) {
      subjectMap[subName] = { total: 0, count: 0 };
    }
    subjectMap[subName].total += rate;
    subjectMap[subName].count += 1;
  });

  const subjectAverages = Object.keys(subjectMap).map(name => {
    const avg = Math.round(subjectMap[name].total / subjectMap[name].count);
    return { name, avg };
  });

  // SVG parameters
  const height = 150;
  const width = 320;
  const padding = 25;
  const barWidth = 35;
  const gap = 15;

  return (
    <div className="glass-card" style={{ padding: '1.5rem' }}>
      <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <span>📊</span> Subject Average Analysis
      </h3>

      <div style={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
          {/* Horizontal lines */}
          <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="var(--border-color)" strokeWidth="0.5" strokeDasharray="3 3" />
          <line x1={padding} y1={(height - padding * 2) / 2 + padding} x2={width - padding} y2={(height - padding * 2) / 2 + padding} stroke="var(--border-color)" strokeWidth="0.5" strokeDasharray="3 3" />
          <line x1={padding} y1={height - padding * 2} x2={width - padding} y2={height - padding * 2} stroke="var(--border-color)" strokeWidth="1" />

          {subjectAverages.map((item, idx) => {
            const x = padding + idx * (barWidth + gap) + 15;
            const barHeight = ((item.avg / 100) * (height - padding * 3));
            const y = height - padding * 2 - barHeight;

            return (
              <g key={item.name}>
                {/* Bar column */}
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={Math.max(2, barHeight)}
                  fill="var(--primary)"
                  rx="3"
                />
                {/* Average text */}
                <text x={x + barWidth / 2} y={y - 6} fill="var(--text-primary)" fontSize="8" fontFamily="monospace" textAnchor="middle">
                  {item.avg}%
                </text>
                {/* Label text */}
                <text x={x + barWidth / 2} y={height - padding + 4} fill="var(--text-secondary)" fontSize="7.5" textAnchor="middle">
                  {item.name.slice(0, 7)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

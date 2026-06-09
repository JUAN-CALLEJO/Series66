import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

// Resolve a CSS var like "var(--sec-1)" to its computed color for the SVG.
function resolveVar(cssVar) {
  const name = cssVar.replace(/var\((--[^)]+)\)/, '$1');
  if (typeof window === 'undefined') return '#888';
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || '#888';
}

export function WeightingChart({ sections }) {
  const data = sections.map((s) => ({
    name: s.title,
    roman: s.roman,
    value: s.weight,
    questions: s.questions,
    color: resolveVar(s.accent),
  }));

  return (
    <div style={{ position: 'relative', width: '100%', height: 210 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={62}
            outerRadius={92}
            paddingAngle={2}
            stroke="none"
            startAngle={90}
            endAngle={-270}
          >
            {data.map((d, i) => (
              <Cell key={i} fill={d.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: '#161a24', border: '1px solid #252b3b', borderRadius: 10,
              fontSize: 12, color: '#eef0f7',
            }}
            formatter={(val, _n, p) => [`${val}% · ${p.payload.questions} Qs`, p.payload.name]}
          />
        </PieChart>
      </ResponsiveContainer>
      <div
        style={{
          position: 'absolute', inset: 0, display: 'grid', placeItems: 'center',
          pointerEvents: 'none', textAlign: 'center',
        }}
      >
        <div>
          <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px' }}>100</div>
          <div style={{ fontSize: 11, color: 'var(--text-3)' }}>scored Qs</div>
        </div>
      </div>
    </div>
  );
}

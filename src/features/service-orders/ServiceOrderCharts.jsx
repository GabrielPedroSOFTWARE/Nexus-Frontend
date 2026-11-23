import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

export function TrendCard({ title, value, caption, color, data, icon: Icon }) {
  return <article className="trend-card"><h3>{title}</h3><div className="trend-value"><Icon size={27} style={{ color }} /><b>{value}</b></div><p>{caption}</p><ResponsiveContainer width="100%" height={138}><LineChart data={data} margin={{ top: 9, right: 2, bottom: 1, left: -23 }}><CartesianGrid stroke="#e5e8ee" vertical horizontal /><XAxis dataKey="month" tick={{ fontSize: 10, fill: '#68758a' }} axisLine={false} tickLine={false} /><YAxis tick={{ fontSize: 9, fill: '#68758a' }} axisLine={false} tickLine={false} /><Tooltip /><Line dataKey="value" type="linear" stroke={color} strokeWidth={2.5} dot={{ r: 3, fill: color, strokeWidth: 0 }} /></LineChart></ResponsiveContainer></article>
}

export function StatusDonut({ compact = false }) {
  const data = compact
    ? [{ value: 75, color: '#307db7' }, { value: 25, color: '#ff7c82' }]
    : [
        { value: 58.34, color: '#72ee71' }, { value: 25, color: '#a9c4ff' },
        { value: 8.33, color: '#ffcfac' }, { value: 8.33, color: '#ff8e96' },
      ]
  const circumference = 2 * Math.PI * 37.5
  let offset = 0
  return <div className={`donut-chart ${compact ? 'donut-compact' : ''}`}>
    <svg viewBox="0 0 100 100" role="img" aria-label={compact ? '75% dentro do prazo e 25% atrasadas' : 'Ordens de serviço por status'}>
      <circle cx="50" cy="50" r="37.5" fill="none" stroke="#edf0f5" strokeWidth="25" />
      {data.map((entry, index) => {
        const length = (entry.value / 100) * circumference
        const currentOffset = offset
        offset += length
        return <circle key={index} cx="50" cy="50" r="37.5" fill="none" stroke={entry.color} strokeWidth="25" strokeDasharray={`${length} ${circumference}`} strokeDashoffset={-currentOffset} transform="rotate(-90 50 50)" />
      })}
    </svg>
    {!compact && <div className="donut-center"><b>10</b><span>Total de OS</span></div>}
  </div>
}

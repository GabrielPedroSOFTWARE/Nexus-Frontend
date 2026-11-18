import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { buildDashboardMetrics } from './dashboardMetrics.js'

function StatusChart({ metrics }) {
  const chartStatuses = metrics.statuses.filter(status => status.count > 0)
  return <section className="panel connected-panel connected-chart-panel">
    <h2>Ordens de serviço por status</h2>
    {metrics.total === 0 ? <p className="connected-chart-empty">Nenhuma ordem de serviço retornada pelo backend.</p> : <div className="connected-status-chart">
      <div className="connected-donut-wrap">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={chartStatuses} dataKey="count" nameKey="name" innerRadius="62%" outerRadius="88%" paddingAngle={2} stroke="none" isAnimationActive={false}>
              {chartStatuses.map(status => <Cell key={String(status.code)} fill={status.color} />)}
            </Pie>
            <Tooltip formatter={(value, name) => [value, name]} />
          </PieChart>
        </ResponsiveContainer>
        <div className="connected-donut-center"><b>{metrics.total}</b><span>Total de O.S.</span></div>
      </div>
      <ul className="connected-chart-legend">
        {metrics.statuses.map(status => <li key={String(status.code)}>
          <i style={{ backgroundColor: status.color }} />
          <span>{status.name}</span>
          <b>{status.count}</b>
          <small>{metrics.total ? `${Math.round(status.count / metrics.total * 100)}%` : '0%'}</small>
        </li>)}
      </ul>
    </div>}
  </section>
}

function MonthlyChart({ metrics }) {
  const monthlyTotal = metrics.months.reduce((sum, month) => sum + month.count, 0)
  const emptyMessage = metrics.ordersWithDate === 0
    ? 'O backend não retornou datas de abertura para as ordens.'
    : 'Nenhuma ordem foi aberta nos últimos seis meses.'

  return <section className="panel connected-panel connected-chart-panel">
    <h2>Ordens abertas por mês</h2>
    <p className="connected-chart-caption">Últimos seis meses, usando a data de início registrada no backend.</p>
    {monthlyTotal === 0 ? <p className="connected-chart-empty">{emptyMessage}</p> : <div className="connected-monthly-chart">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={metrics.months} margin={{ top: 12, right: 12, bottom: 0, left: -16 }}>
          <CartesianGrid stroke="#e5e8ee" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#68758a' }} axisLine={false} tickLine={false} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#68758a' }} axisLine={false} tickLine={false} />
          <Tooltip formatter={value => [value, 'Ordens abertas']} />
          <Bar dataKey="count" name="Ordens abertas" fill="#8877ff" radius={[5, 5, 0, 0]} maxBarSize={42} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>}
  </section>
}

export function ConnectedDashboardCharts({ orders }) {
  const metrics = buildDashboardMetrics(orders)
  return <div className="connected-chart-grid">
    <StatusChart metrics={metrics} />
    <MonthlyChart metrics={metrics} />
  </div>
}

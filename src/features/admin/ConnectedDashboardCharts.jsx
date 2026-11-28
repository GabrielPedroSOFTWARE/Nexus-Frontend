import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { buildDashboardMetrics } from './dashboardMetrics.js'

function StatusChart({ metrics }) {
  const chartStatuses = metrics.statuses.filter(status => status.count > 0)
  return <section className="panel connected-panel connected-chart-panel">
    <h2>Ordens de serviço por status</h2>
    {metrics.total === 0 ? <p className="connected-chart-empty">Nenhuma ordem de serviço disponível.</p> : <div className="connected-status-chart">
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
    ? 'As ordens não têm data de abertura disponível.'
    : 'Nenhuma ordem foi aberta nos últimos seis meses.'

  return <section className="panel connected-panel connected-chart-panel">
    <h2>Ordens abertas por mês</h2>
    <p className="connected-chart-caption">Últimos 6 meses, por data de abertura.</p>
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

function formatMttrAverage(minutes) {
  const rounded = Math.round(minutes)
  const hours = Math.floor(rounded / 60)
  const remainder = rounded % 60
  return hours ? `${hours}h${String(remainder).padStart(2, '0')}min` : `${remainder}min`
}

function PerformanceChart({ title, state, unit, color, averageScale = 1, formatAverage }) {
  if (state.loading) return <section className="panel connected-panel connected-chart-panel"><h2>{title}</h2><p className="connected-chart-empty">Carregando indicador...</p></section>
  if (state.error) return <section className="panel connected-panel connected-chart-panel"><h2>{title}</h2><p className="connected-chart-empty">Não foi possível carregar este indicador.</p><button className="outline-button" onClick={state.refresh}>Tentar novamente</button></section>

  const data = Array.isArray(state.data?.dados) ? state.data.dados : []
  const hasAverage = typeof state.data?.mediaGeral === 'number'
  const hasData = hasAverage && data.some(point => typeof point.media === 'number')
  const averageText = hasAverage
    ? formatAverage?.(state.data.mediaGeral) ?? `${(state.data.mediaGeral * averageScale).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} ${unit}`
    : 'Sem dados suficientes'
  return <section className="panel connected-panel connected-chart-panel">
    <div className="section-title-row"><h2>{title}</h2>{state.data?.periodo && <span className="date-chip">{state.data.periodo}</span>}</div>
    <p className="connected-chart-caption">Média geral: {averageText}</p>
    {!hasData ? <p className="connected-chart-empty">Ainda não há dados suficientes para este indicador.</p> : <div className="connected-monthly-chart">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 12, right: 12, bottom: 0, left: -16 }}>
          <CartesianGrid stroke="#e5e8ee" vertical={false} />
          <XAxis dataKey="mes" interval={0} tick={{ fontSize: 10, fill: '#68758a' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#68758a' }} axisLine={false} tickLine={false} />
          <Tooltip formatter={value => [`${Number(value).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} ${unit}`, 'Média']} />
          <Bar dataKey="media" name="Média" fill={color} radius={[5, 5, 0, 0]} maxBarSize={42} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>}
  </section>
}

export function ConnectedDashboardCharts({ orders, mtbf, mttr }) {
  const metrics = buildDashboardMetrics(orders)
  return <div className="connected-chart-grid">
    <StatusChart metrics={metrics} />
    <MonthlyChart metrics={metrics} />
    <PerformanceChart title="MTBF · intervalo entre falhas" state={mtbf} unit="dias" color="#4263eb" />
    <PerformanceChart title="MTTR · tempo de reparo" state={mttr} unit="horas" color="#239b8e" averageScale={1 / 60} formatAverage={formatMttrAverage} />
  </div>
}

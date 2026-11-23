import { CalendarDays, Clock3 } from 'lucide-react'
import { CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { isOverdueOrder } from './dashboardMetrics.js'

const STATUS_GROUPS = [
  { key: 'completed', name: 'Concluídas', color: '#72ee71' },
  { key: 'progress', name: 'Em andamento', color: '#a9c4ff' },
  { key: 'waiting', name: 'Aguardando peças', color: '#ffcfac' },
  { key: 'overdue', name: 'Atrasadas', color: '#ff8e96' },
  { key: 'canceled', name: 'Canceladas', color: '#a8b0bf' },
  { key: 'other', name: 'Outras', color: '#8877ff' },
]
const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]
const currentYear = new Date().getFullYear()
const YEAR_OPTIONS = Array.from({ length: 6 }, (_, index) => currentYear - index)
const MONTH_ORDER = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ']

function statusBreakdown(orders) {
  const counts = Object.fromEntries(STATUS_GROUPS.map(group => [group.key, 0]))
  for (const order of orders) {
    const status = order?.status == null || order.status === '' ? Number.NaN : Number(order.status)
    if (status === 5) counts.completed += 1
    else if (status === 6) counts.canceled += 1
    else if (isOverdueOrder(order)) counts.overdue += 1
    else if (status === 3) counts.waiting += 1
    else if (Number.isInteger(status) && status >= 0 && status <= 4) counts.progress += 1
    else counts.other += 1
  }
  return STATUS_GROUPS.map(group => ({ ...group, count: counts[group.key] }))
}

function metricValue(value, unit) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 'Sem dados'
  if (unit === 'minutos') {
    const minutes = Math.round(value)
    const hours = Math.floor(minutes / 60)
    const remainder = minutes % 60
    return hours ? `${hours}h${String(remainder).padStart(2, '0')}min` : `${minutes}min`
  }
  return `${value.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} ${unit}`
}

function PerformanceCard({ title, caption, state, color, Icon, unit, formatPoint, average, limitMonth }) {
  const points = Array.isArray(state.data?.dados) ? state.data.dados : []
  const hasAverage = typeof state.data?.mediaGeral === 'number' && Number.isFinite(state.data.mediaGeral)
  const chartPoints = points
    .filter(point => {
      const monthIndex = MONTH_ORDER.indexOf(String(point.mes || '').trim().slice(0, 3).toUpperCase()) + 1
      return !monthIndex || monthIndex <= limitMonth
    })
    .map(point => ({ ...point, media: point.media === 0 ? null : point.media }))
  const hasPoints = chartPoints.some(point => typeof point.media === 'number' && Number.isFinite(point.media) && point.media > 0)
  const averageText = hasAverage ? metricValue(average(state.data.mediaGeral), unit) : 'Sem dados suficientes'

  return <article className="connected-performance-card">
    <h3>{title}</h3>
    <div className="connected-performance-value">
      <span style={{ color }}><Icon aria-hidden="true" /></span>
      <div><b>{averageText}</b><small>{caption}</small></div>
    </div>
    {state.loading ? <p className="connected-chart-empty">Carregando indicador...</p>
      : state.error ? <div className="connected-chart-empty connected-chart-error"><p>Indicador indisponível.</p><button className="outline-button" onClick={state.refresh}>Tentar novamente</button></div>
        : !hasPoints ? <p className="connected-chart-empty">Ainda não há dados suficientes.</p>
          : <div className="connected-performance-chart"><ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartPoints} margin={{ top: 8, right: 7, bottom: 0, left: -18 }}>
              <CartesianGrid stroke="#e5e8ee" vertical />
              <XAxis dataKey="mes" tick={{ fontSize: 10, fill: '#68758a' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: '#68758a' }} axisLine={false} tickLine={false} width={30} />
              <Tooltip formatter={value => [`${Number(value).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} ${formatPoint.unit}`, 'Média']} />
              <Line dataKey="media" type="linear" stroke={color} strokeWidth={2.5} dot={{ r: 3, fill: color, strokeWidth: 0 }} activeDot={{ r: 5 }} connectNulls={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer></div>}
  </article>
}

function StatusDonut({ orders, ordersState }) {
  const total = orders.length
  const groups = statusBreakdown(orders)
  const chartGroups = groups.filter(group => group.count > 0)
  return <section className="panel connected-order-status-panel">
    <h2>Ordens de serviço por status</h2>
    {ordersState?.loading ? <p className="connected-chart-empty">Carregando ordens de serviço...</p>
      : ordersState?.error ? <p className="connected-chart-empty">Não foi possível carregar a distribuição.</p>
        : !total ? <p className="connected-chart-empty">Nenhuma ordem de serviço disponível.</p> : <div className="connected-order-status-content">
      <div className="connected-order-donut">
        <ResponsiveContainer width="100%" height="100%"><PieChart>
          <Pie data={chartGroups} dataKey="count" nameKey="name" innerRadius="61%" outerRadius="88%" paddingAngle={2} stroke="none" isAnimationActive={false}>
            {chartGroups.map(group => <Cell key={group.key} fill={group.color} />)}
          </Pie>
          <Tooltip formatter={(value, name) => [value, name]} />
        </PieChart></ResponsiveContainer>
        <div className="connected-order-donut-center"><b>{total}</b><span>Total de OS</span></div>
      </div>
      <ul className="connected-order-legend">{chartGroups.map(group => <li key={group.key}>
        <i style={{ backgroundColor: group.color }} /><span>{group.name}</span><small>{group.count} ({Math.round(group.count / total * 100)}%)</small>
      </li>)}</ul>
    </div>}
  </section>
}

export function ConnectedOrdersOverview({ orders, ordersState, mtbf, mttr, period, onPeriodChange }) {
  return <div className="connected-orders-overview">
    <section className="panel connected-performance-panel">
      <div className="connected-orders-panel-heading"><h2>Desempenho (MTBF e MTTR)</h2>
        <div className="connected-order-period-controls">
          <label><span>Mês</span><select aria-label="Mês dos indicadores" value={period.mes} onChange={event => onPeriodChange('mes', Number(event.target.value))}>{MONTHS.map((month, index) => <option value={index + 1} key={month}>{month}</option>)}</select></label>
          <label><span>Ano</span><select aria-label="Ano dos indicadores" value={period.ano} onChange={event => onPeriodChange('ano', Number(event.target.value))}>{YEAR_OPTIONS.map(year => <option value={year} key={year}>{year}</option>)}</select></label>
        </div>
      </div>
      <div className="connected-performance-grid">
        <PerformanceCard title="MTBF" caption="Tempo médio entre falhas" state={mtbf} color="#4386b4" Icon={CalendarDays} unit="dias" formatPoint={{ unit: 'dias' }} average={value => value} limitMonth={period.mes} />
        <PerformanceCard title="MTTR" caption="Tempo médio de reparo" state={mttr} color="#28a745" Icon={Clock3} unit="minutos" formatPoint={{ unit: 'horas' }} average={value => value} limitMonth={period.mes} />
      </div>
    </section>
    <StatusDonut orders={orders} ordersState={ordersState} />
  </div>
}

import React, { useState, useMemo } from 'react'
import {
  PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  AreaChart, Area, ComposedChart, Line,
} from 'recharts'
import { BarChart2 } from 'lucide-react'
import { formatAmount } from '../utils/format'
import { EXPENSE_CATEGORY_COLORS, INCOME_CATEGORY_COLORS } from '../constants'

const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg px-3 py-2 text-xs">
      {label && <div className="font-semibold text-slate-700 mb-1">{label}</div>}
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || p.fill || '#6366f1' }}>
          {p.name}: <span className="font-semibold">{p.payload._fmt ? p.payload._fmt(p.value) : p.value}</span>
        </div>
      ))}
    </div>
  )
}

export default function Reports({ data }) {
  const { expenses = [], income = [], currency = 'LKR' } = data
  const fmt = (n) => formatAmount(n, currency)

  const currentYear = new Date().getFullYear()
  const [selectedYear, setSelectedYear] = useState(String(currentYear))
  const [selectedMonth, setSelectedMonth] = useState('')

  const years = useMemo(() => {
    const ys = new Set([
      ...expenses.map((e) => e.date.slice(0, 4)),
      ...income.map((i) => i.date.slice(0, 4)),
      String(currentYear),
    ])
    return [...ys].sort().reverse()
  }, [expenses, income, currentYear])

  const yearExpenses = useMemo(() => expenses.filter((e) => e.date.startsWith(selectedYear)), [expenses, selectedYear])
  const yearIncome   = useMemo(() => income.filter((i) => i.date.startsWith(selectedYear)),   [income, selectedYear])

  const scopedExpenses = useMemo(() =>
    selectedMonth ? yearExpenses.filter((e) => e.date.startsWith(`${selectedYear}-${selectedMonth}`)) : yearExpenses,
    [yearExpenses, selectedYear, selectedMonth])

  const scopedIncome = useMemo(() =>
    selectedMonth ? yearIncome.filter((i) => i.date.startsWith(`${selectedYear}-${selectedMonth}`)) : yearIncome,
    [yearIncome, selectedYear, selectedMonth])

  // Expense category breakdown
  const expCategoryData = useMemo(() => {
    const t = {}
    scopedExpenses.forEach((e) => { t[e.category] = (t[e.category] || 0) + e.amount })
    return Object.entries(t).map(([name, value]) => ({ name, value, _fmt: fmt })).sort((a, b) => b.value - a.value)
  }, [scopedExpenses, fmt])

  // Income category breakdown
  const incCategoryData = useMemo(() => {
    const t = {}
    scopedIncome.forEach((i) => { t[i.category] = (t[i.category] || 0) + i.amount })
    return Object.entries(t).map(([name, value]) => ({ name, value, _fmt: fmt })).sort((a, b) => b.value - a.value)
  }, [scopedIncome, fmt])

  // Monthly income vs expenses
  const monthlyData = useMemo(() =>
    MONTHS_SHORT.map((month, i) => {
      const m = String(i + 1).padStart(2, '0')
      const expenses = yearExpenses.filter((e) => e.date.startsWith(`${selectedYear}-${m}`)).reduce((s, e) => s + e.amount, 0)
      const incomeVal = yearIncome.filter((inc) => inc.date.startsWith(`${selectedYear}-${m}`)).reduce((s, i) => s + i.amount, 0)
      return { month, expenses, income: incomeVal, net: incomeVal - expenses, _fmt: fmt }
    }),
    [yearExpenses, yearIncome, selectedYear, fmt])

  // Daily spending
  const dailyData = useMemo(() => {
    const now = new Date()
    let start, end
    if (selectedMonth) {
      start = new Date(`${selectedYear}-${selectedMonth}-01`)
      end   = new Date(start.getFullYear(), start.getMonth() + 1, 0)
    } else {
      end   = now
      start = new Date(now); start.setDate(now.getDate() - 29)
    }
    const days = []
    const cur  = new Date(start)
    while (cur <= end) {
      const ds  = cur.toISOString().split('T')[0]
      const exp = expenses.filter((e) => e.date === ds).reduce((s, e) => s + e.amount, 0)
      const inc = income.filter((i) => i.date === ds).reduce((s, i) => s + i.amount, 0)
      days.push({ day: cur.getDate(), date: ds, expenses: exp, income: inc, _fmt: fmt })
      cur.setDate(cur.getDate() + 1)
    }
    return days
  }, [expenses, income, selectedYear, selectedMonth, fmt])

  const totalExp  = scopedExpenses.reduce((s, e) => s + e.amount, 0)
  const totalInc  = scopedIncome.reduce((s, i)   => s + i.amount, 0)
  const netSaving = totalInc - totalExp
  const topExpCat = expCategoryData[0]
  const topIncSrc = incCategoryData[0]

  const hasData = expenses.length > 0 || income.length > 0

  if (!hasData) {
    return (
      <div className="p-8 flex flex-col items-center justify-center h-full text-slate-400">
        <BarChart2 size={48} className="opacity-20 mb-3" />
        <p className="text-sm">No data yet. Add income or expenses to see reports.</p>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-7">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Reports</h2>
          <p className="text-slate-400 text-sm mt-0.5">Visualize your financial patterns</p>
        </div>
        <div className="flex gap-3">
          <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
            {years.map((y) => <option key={y}>{y}</option>)}
          </select>
          <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
            <option value="">All Months</option>
            {MONTHS_SHORT.map((m, i) => <option key={m} value={String(i + 1).padStart(2, '0')}>{m}</option>)}
          </select>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Income',    value: fmt(totalInc),           sub: `${scopedIncome.length} records`,            color: 'text-emerald-700' },
          { label: 'Total Expenses',  value: fmt(totalExp),           sub: `${scopedExpenses.length} records`,          color: 'text-rose-600' },
          { label: 'Net Savings',     value: fmt(Math.abs(netSaving)), sub: netSaving >= 0 ? 'surplus' : 'deficit',     color: netSaving >= 0 ? 'text-emerald-700' : 'text-rose-600' },
          { label: 'Top Expense',     value: topExpCat?.name ?? '—',  sub: topExpCat ? fmt(topExpCat.value) : 'no data', color: 'text-slate-900' },
        ].map(({ label, value, sub, color }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">{label}</div>
            <div className={`text-base font-bold truncate ${color}`}>{value}</div>
            <div className="text-xs text-slate-400 mt-0.5">{sub}</div>
          </div>
        ))}
      </div>

      {/* Monthly Income vs Expenses bar chart */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 mb-5">
        <h3 className="font-semibold text-slate-800 text-sm mb-4">Monthly Income vs Expenses — {selectedYear}</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={monthlyData} margin={{ top: 4, right: 20, left: 10, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
            <Tooltip content={<ChartTooltip />} />
            <Bar dataKey="income"   name="Income"   fill="#10b981" radius={[4,4,0,0]} />
            <Bar dataKey="expenses" name="Expenses" fill="#f43f5e" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Category pies */}
      <div className="grid grid-cols-2 gap-5 mb-5">
        {/* Expense categories */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <h3 className="font-semibold text-slate-800 text-sm mb-4">Expenses by Category</h3>
          {expCategoryData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-slate-400 text-sm">No expense data</div>
          ) : (
            <ResponsiveContainer width="100%" height={230}>
              <PieChart>
                <Pie data={expCategoryData} cx="50%" cy="50%" innerRadius={55} outerRadius={88} paddingAngle={2} dataKey="value">
                  {expCategoryData.map((e) => <Cell key={e.name} fill={EXPENSE_CATEGORY_COLORS[e.name] || '#6b7280'} />)}
                </Pie>
                <Tooltip formatter={(v) => fmt(v)} />
                <Legend iconSize={8} iconType="circle" formatter={(v) => <span className="text-xs text-slate-600">{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Income categories */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <h3 className="font-semibold text-slate-800 text-sm mb-4">Income by Category</h3>
          {incCategoryData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-slate-400 text-sm">No income data</div>
          ) : (
            <ResponsiveContainer width="100%" height={230}>
              <PieChart>
                <Pie data={incCategoryData} cx="50%" cy="50%" innerRadius={55} outerRadius={88} paddingAngle={2} dataKey="value">
                  {incCategoryData.map((i) => <Cell key={i.name} fill={INCOME_CATEGORY_COLORS[i.name] || '#6b7280'} />)}
                </Pie>
                <Tooltip formatter={(v) => fmt(v)} />
                <Legend iconSize={8} iconType="circle" formatter={(v) => <span className="text-xs text-slate-600">{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Daily area chart */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
        <h3 className="font-semibold text-slate-800 text-sm mb-1">Daily Activity</h3>
        <p className="text-xs text-slate-400 mb-4">
          {selectedMonth ? `${MONTHS_SHORT[parseInt(selectedMonth) - 1]} ${selectedYear}` : 'Last 30 days'}
        </p>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={dailyData} margin={{ top: 4, right: 20, left: 10, bottom: 4 }}>
            <defs>
              <linearGradient id="gradInc" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#10b981" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradExp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#f43f5e" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="day" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const { date } = payload[0].payload
                return (
                  <div className="bg-white border border-slate-200 rounded-lg shadow px-3 py-2 text-xs">
                    <div className="font-semibold text-slate-700 mb-1">{date}</div>
                    {payload.map((p, i) => (
                      <div key={i} style={{ color: p.stroke || p.fill }}>
                        {p.name}: <span className="font-semibold">{fmt(p.value)}</span>
                      </div>
                    ))}
                  </div>
                )
              }}
            />
            <Area type="monotone" dataKey="income"   stroke="#10b981" strokeWidth={2} fill="url(#gradInc)" name="Income"   dot={false} activeDot={{ r: 3 }} />
            <Area type="monotone" dataKey="expenses" stroke="#f43f5e" strokeWidth={2} fill="url(#gradExp)" name="Expenses" dot={false} activeDot={{ r: 3 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

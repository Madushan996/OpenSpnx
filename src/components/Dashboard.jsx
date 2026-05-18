import React from 'react'
import { Wallet, TrendingDown, TrendingUp, Scale, Banknote } from 'lucide-react'
import { formatAmount, formatDate } from '../utils/format'
import { EXPENSE_CATEGORY_COLORS, INCOME_CATEGORY_COLORS } from '../constants'

function StatCard({ label, value, sub, icon: Icon, iconBg, iconColor }) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-slate-500 text-xs font-semibold uppercase tracking-wide">{label}</span>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${iconBg}`}>
          <Icon size={17} className={iconColor} />
        </div>
      </div>
      <div className="text-xl font-bold text-slate-900 truncate">{value}</div>
      {sub && <div className="text-xs text-slate-400 mt-1">{sub}</div>}
    </div>
  )
}

export default function Dashboard({ data }) {
  const { accounts = [], expenses = [], income = [], currency = 'LKR' } = data
  const fmt = (n) => formatAmount(n, currency)

  const totalBalance = accounts.reduce((s, a) => s + (a.balance || 0), 0)

  const now = new Date()
  const isThisMonth = (dateStr) => {
    const d = new Date(dateStr)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }

  const monthExpenses = expenses.filter((e) => isThisMonth(e.date))
  const monthIncome   = income.filter((i) => isThisMonth(i.date))
  const monthExpTotal = monthExpenses.reduce((s, e) => s + e.amount, 0)
  const monthIncTotal = monthIncome.reduce((s, i) => s + i.amount, 0)
  const monthNet      = monthIncTotal - monthExpTotal

  // Recent activity — merge income + expenses, sort by date desc, take 8
  const activity = [
    ...expenses.map((e) => ({ ...e, _kind: 'expense' })),
    ...income.map((i)   => ({ ...i, _kind: 'income'  })),
  ]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 8)

  const dateLabel = now.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <div className="p-8">
      <div className="mb-7">
        <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
        <p className="text-slate-400 text-sm mt-0.5">{dateLabel}</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4 mb-7">
        <StatCard label="Total Balance"    value={fmt(totalBalance)}  sub={`${accounts.length} account${accounts.length !== 1 ? 's' : ''}`} icon={Wallet}       iconBg="bg-green-100" iconColor="text-green-600" />
        <StatCard label="Monthly Income"   value={fmt(monthIncTotal)} sub={`${monthIncome.length} record${monthIncome.length !== 1 ? 's' : ''}`}   icon={TrendingUp}   iconBg="bg-emerald-100" iconColor="text-emerald-600" />
        <StatCard label="Monthly Expenses" value={fmt(monthExpTotal)} sub={`${monthExpenses.length} record${monthExpenses.length !== 1 ? 's' : ''}`} icon={TrendingDown} iconBg="bg-rose-100"    iconColor="text-rose-500" />
        <StatCard
          label="Monthly Net"
          value={fmt(Math.abs(monthNet))}
          sub={monthNet >= 0 ? 'surplus this month' : 'deficit this month'}
          icon={Scale}
          iconBg={monthNet >= 0 ? 'bg-emerald-100' : 'bg-amber-100'}
          iconColor={monthNet >= 0 ? 'text-emerald-600' : 'text-amber-500'}
        />
      </div>

      <div className="grid grid-cols-2 gap-5">
        {/* Accounts */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <h3 className="font-semibold text-slate-800 mb-4 text-sm">Your Accounts</h3>
          {accounts.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">No accounts yet.</p>
          ) : (
            <div className="space-y-2">
              {accounts.map((a) => (
                <div key={a.id} className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${a.type === 'cash' ? 'bg-emerald-100' : 'bg-green-100'}`}>
                      {a.type === 'cash'
                        ? <Banknote size={14} className="text-emerald-600" />
                        : <Wallet size={14} className="text-green-600" />}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-800">{a.name}</div>
                      <div className="text-xs text-slate-400">{a.type === 'cash' ? 'Cash' : 'Bank'}</div>
                    </div>
                  </div>
                  <div className="text-sm font-bold text-slate-900">{fmt(a.balance)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <h3 className="font-semibold text-slate-800 mb-4 text-sm">Recent Activity</h3>
          {activity.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">No records yet.</p>
          ) : (
            <div className="space-y-1">
              {activity.map((item) => {
                const isIncome  = item._kind === 'income'
                const colorMap  = isIncome ? INCOME_CATEGORY_COLORS : EXPENSE_CATEGORY_COLORS
                const color     = colorMap[item.category] || '#6b7280'
                const label     = isIncome ? item.source : item.reason
                return (
                  <div key={item.id} className="flex items-center justify-between py-2 px-1 border-b border-slate-50 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                      <div>
                        <div className="text-sm font-medium text-slate-800 leading-tight">{label}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{item.category} · {formatDate(item.date)}</div>
                      </div>
                    </div>
                    <div className={`text-sm font-semibold flex-shrink-0 ml-2 ${isIncome ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {isIncome ? '+' : '-'}{fmt(item.amount)}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

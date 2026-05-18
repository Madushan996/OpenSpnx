import React from 'react'
import {
  LayoutDashboard, Wallet, TrendingUp, Receipt, ArrowLeftRight, BarChart2,
  Leaf,
} from 'lucide-react'
import { VIEWS, CURRENCIES } from '../constants'

const NAV = [
  { view: VIEWS.DASHBOARD,  icon: LayoutDashboard, label: 'Dashboard' },
  { view: VIEWS.ACCOUNTS,   icon: Wallet,           label: 'Accounts' },
  { view: VIEWS.INCOME,     icon: TrendingUp,       label: 'Income' },
  { view: VIEWS.EXPENSES,   icon: Receipt,          label: 'Expenses' },
  { view: VIEWS.TRANSFERS,  icon: ArrowLeftRight,   label: 'Transfers' },
  { view: VIEWS.REPORTS,    icon: BarChart2,        label: 'Reports' },
]

export default function Layout({ children, view, setView, data, saveData }) {
  const currency = data?.currency || 'LKR'

  const setCurrency = (code) => {
    if (saveData && data) saveData({ ...data, currency: code })
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-slate-200 flex flex-col flex-shrink-0 select-none">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center shadow-sm">
              <Leaf size={15} className="text-white" />
            </div>
            <div>
              <span className="text-slate-800 font-bold text-base leading-none">OpenSpnx</span>
              <div className="text-green-600 text-xs font-medium mt-0.5">Budget Tracker</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV.map(({ view: v, icon: Icon, label }) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors text-sm font-medium ${
                view === v
                  ? 'bg-green-50 text-green-700 font-semibold'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
              }`}
            >
              <Icon size={16} className={view === v ? 'text-green-600' : ''} />
              {label}
              {view === v && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-green-500" />}
            </button>
          ))}
        </nav>

        {/* Currency selector */}
        <div className="px-4 pt-3 pb-4 border-t border-slate-100">
          <label className="block text-slate-400 text-xs font-medium mb-1.5">Currency</label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full bg-slate-50 text-slate-700 text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-green-500"
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code} — {c.name}
              </option>
            ))}
          </select>
          <p className="text-slate-300 text-xs text-center mt-3">Data saved locally</p>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}

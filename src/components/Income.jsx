import React, { useState, useMemo } from 'react'
import { Plus, Trash2, Search, X, TrendingUp } from 'lucide-react'
import { formatAmount, formatDate, today, monthLabel } from '../utils/format'
import { v4 as uuid } from 'uuid'
import { INCOME_CATEGORIES, INCOME_CATEGORY_COLORS } from '../constants'

const emptyForm = () => ({
  amount: '', date: today(), source: '', category: 'Salary', accountId: '', addToAccount: false,
})

export default function Income({ data, saveData }) {
  const { accounts = [], income = [], currency = 'LKR' } = data
  const fmt = (n) => formatAmount(n, currency)

  const [showForm, setShowForm]   = useState(false)
  const [form, setForm]           = useState(emptyForm())
  const [search, setSearch]       = useState('')
  const [filterCat, setFilterCat] = useState('')
  const [filterMonth, setFilterMonth] = useState('')

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const addIncome = () => {
    const amount = parseFloat(form.amount)
    const source = form.source.trim()
    if (!source || isNaN(amount) || amount <= 0 || !form.date) return

    const record = {
      id: uuid(), amount, date: form.date, source,
      category: form.category,
      accountId: form.addToAccount && form.accountId ? form.accountId : null,
    }

    let newAccounts = accounts
    if (form.addToAccount && form.accountId) {
      newAccounts = accounts.map((a) =>
        a.id === form.accountId ? { ...a, balance: a.balance + amount } : a
      )
    }

    saveData({ ...data, accounts: newAccounts, income: [...income, record] })
    setForm(emptyForm()); setShowForm(false)
  }

  const deleteIncome = (record) => {
    if (!window.confirm('Delete this income record?')) return
    let newAccounts = accounts
    if (record.accountId) {
      newAccounts = accounts.map((a) =>
        a.id === record.accountId ? { ...a, balance: Math.max(0, a.balance - record.amount) } : a
      )
    }
    saveData({ ...data, accounts: newAccounts, income: income.filter((i) => i.id !== record.id) })
  }

  const availableMonths = useMemo(() => {
    const s = new Set(income.map((i) => i.date.slice(0, 7)))
    return [...s].sort().reverse()
  }, [income])

  const filtered = useMemo(() => {
    let list = income
    if (search) { const s = search.toLowerCase(); list = list.filter((i) => i.source.toLowerCase().includes(s) || i.category.toLowerCase().includes(s)) }
    if (filterCat)   list = list.filter((i) => i.category === filterCat)
    if (filterMonth) list = list.filter((i) => i.date.startsWith(filterMonth))
    return [...list].sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [income, search, filterCat, filterMonth])

  const filteredTotal = filtered.reduce((s, i) => s + i.amount, 0)
  const hasFilters = search || filterCat || filterMonth

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-7">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Income</h2>
          <p className="text-slate-400 text-sm mt-0.5">Record your earnings and deposits</p>
        </div>
        <button onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium">
          <Plus size={15} /> Add Income
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-5">
          <h3 className="font-semibold text-slate-800 mb-4">New Income Record</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Amount</label>
              <input type="number" value={form.amount} onChange={(e) => set('amount', e.target.value)}
                placeholder="0.00" min="0" step="0.01" autoFocus
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Date</label>
              <input type="date" value={form.date} onChange={(e) => set('date', e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Source / Description</label>
              <input type="text" value={form.source} onChange={(e) => set('source', e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addIncome()}
                placeholder="e.g. Monthly Salary, Client Payment…"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Category</label>
              <select value={form.category} onChange={(e) => set('category', e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                {INCOME_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {accounts.length > 0 && (
            <div className="bg-slate-50 rounded-lg p-3 mb-4">
              <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer select-none">
                <input type="checkbox" checked={form.addToAccount} onChange={(e) => set('addToAccount', e.target.checked)} className="rounded text-emerald-600" />
                Add to an account balance
              </label>
              {form.addToAccount && (
                <select value={form.accountId} onChange={(e) => set('accountId', e.target.value)}
                  className="mt-2 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white">
                  <option value="">— Select account —</option>
                  {accounts.map((a) => <option key={a.id} value={a.id}>{a.name} ({fmt(a.balance)})</option>)}
                </select>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <button onClick={addIncome} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">Add Income</button>
            <button onClick={() => { setShowForm(false); setForm(emptyForm()) }}
              className="border border-slate-200 text-slate-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">Cancel</button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 mb-5">
        <div className="flex gap-3 flex-wrap">
          <div className="flex-1 min-w-48 relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search income records…"
              className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
            <option value="">All Categories</option>
            {INCOME_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
          <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
            <option value="">All Months</option>
            {availableMonths.map((m) => <option key={m} value={m}>{monthLabel(m)}</option>)}
          </select>
          {hasFilters && (
            <button onClick={() => { setSearch(''); setFilterCat(''); setFilterMonth('') }}
              className="flex items-center gap-1 text-slate-400 hover:text-slate-600 text-sm px-2">
              <X size={13} /> Clear
            </button>
          )}
        </div>
      </div>

      {filtered.length > 0 && (
        <div className="flex justify-between text-xs text-slate-500 mb-3 px-1">
          <span>{filtered.length} record{filtered.length !== 1 ? 's' : ''}{hasFilters ? ' (filtered)' : ''}</span>
          <span>Total: <span className="font-semibold text-emerald-700">{fmt(filteredTotal)}</span></span>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <TrendingUp size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">{income.length === 0 ? 'No income recorded yet. Add your first record.' : 'No records match your filters.'}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((i) => {
            const account = accounts.find((a) => a.id === i.accountId)
            return (
              <div key={i.id} className="bg-white rounded-xl border border-slate-100 shadow-sm px-5 py-4 flex items-center justify-between hover:border-slate-200 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-1 h-10 rounded-full flex-shrink-0" style={{ backgroundColor: INCOME_CATEGORY_COLORS[i.category] || '#6b7280' }} />
                  <div>
                    <div className="font-medium text-slate-900 text-sm">{i.source}</div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      <span className="inline-block px-1.5 py-0.5 rounded text-white text-xs mr-1" style={{ backgroundColor: INCOME_CATEGORY_COLORS[i.category] || '#6b7280', opacity: 0.85 }}>{i.category}</span>
                      {formatDate(i.date)}{account && ` · ${account.name}`}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="font-bold text-emerald-600 text-sm">+{fmt(i.amount)}</div>
                  <button onClick={() => deleteIncome(i)} className="text-slate-200 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100 p-1"><Trash2 size={14} /></button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

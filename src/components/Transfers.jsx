import React, { useState } from 'react'
import { ArrowLeftRight, Banknote, Trash2, Plus } from 'lucide-react'
import { formatAmount, formatDate, today } from '../utils/format'
import { v4 as uuid } from 'uuid'

const TYPES = {
  ATM: 'atm_withdrawal',
  TRANSFER: 'account_transfer',
}

const emptyForm = () => ({
  type: TYPES.ATM,
  fromAccountId: '',
  toAccountId: '',
  amount: '',
  date: today(),
  note: '',
})

export default function Transfers({ data, saveData }) {
  const { accounts = [], transfers = [], currency = 'LKR' } = data
  const fmt = (n) => formatAmount(n, currency)

  const [showForm, setShowForm] = useState(false)
  const [form, setForm]         = useState(emptyForm())

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const bankAccounts = accounts.filter((a) => a.type !== 'cash')
  const cashAccount  = accounts.find((a)  => a.type === 'cash')

  const toAccountOptions = () => {
    if (form.type === TYPES.ATM) return cashAccount ? [cashAccount] : []
    return accounts.filter((a) => a.id !== form.fromAccountId)
  }

  const addTransfer = () => {
    const amount = parseFloat(form.amount)
    if (isNaN(amount) || amount <= 0 || !form.fromAccountId || !form.date) return

    const toId = form.type === TYPES.ATM
      ? (cashAccount?.id ?? null)
      : form.toAccountId

    if (!toId) return

    const fromAccount = accounts.find((a) => a.id === form.fromAccountId)
    const toAccount   = accounts.find((a) => a.id === toId)
    if (!fromAccount || !toAccount) return

    const transfer = {
      id: uuid(),
      type: form.type,
      fromAccountId: form.fromAccountId,
      toAccountId: toId,
      amount,
      date: form.date,
      note: form.note.trim(),
    }

    const newAccounts = accounts.map((a) => {
      if (a.id === fromAccount.id) return { ...a, balance: Math.max(0, a.balance - amount) }
      if (a.id === toAccount.id)   return { ...a, balance: a.balance + amount }
      return a
    })

    saveData({ ...data, accounts: newAccounts, transfers: [...transfers, transfer] })
    setForm(emptyForm()); setShowForm(false)
  }

  const deleteTransfer = (transfer) => {
    if (!window.confirm('Delete this transfer? Account balances will be reversed.')) return

    const newAccounts = accounts.map((a) => {
      if (a.id === transfer.fromAccountId) return { ...a, balance: a.balance + transfer.amount }
      if (a.id === transfer.toAccountId)   return { ...a, balance: Math.max(0, a.balance - transfer.amount) }
      return a
    })

    saveData({ ...data, accounts: newAccounts, transfers: transfers.filter((t) => t.id !== transfer.id) })
  }

  const sorted = [...transfers].sort((a, b) => new Date(b.date) - new Date(a.date))

  const getAccountName = (id) => accounts.find((a) => a.id === id)?.name ?? 'Unknown'

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-7">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Transfers</h2>
          <p className="text-slate-400 text-sm mt-0.5">ATM withdrawals and account-to-account transfers</p>
        </div>
        <button onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
          <Plus size={15} /> New Transfer
        </button>
      </div>

      {/* Quick info cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center">
              <Banknote size={17} className="text-amber-600" />
            </div>
            <div className="font-semibold text-slate-800 text-sm">ATM / Cash Withdrawal</div>
          </div>
          <p className="text-xs text-slate-500">
            Money you withdraw from a bank account via ATM or counter. The amount is deducted from the bank account and added to your Cash balance automatically.
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center">
              <ArrowLeftRight size={17} className="text-green-600" />
            </div>
            <div className="font-semibold text-slate-800 text-sm">Account Transfer</div>
          </div>
          <p className="text-xs text-slate-500">
            Money transferred between your own accounts (e.g. Commercial Bank → Sampath Bank). Deducted from source and added to destination.
          </p>
        </div>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-5">
          <h3 className="font-semibold text-slate-800 mb-4">New Transfer</h3>

          {/* Type selector */}
          <div className="flex gap-3 mb-5">
            {[
              { value: TYPES.ATM,      label: 'ATM / Cash Withdrawal',  icon: Banknote,       bg: 'bg-amber-500' },
              { value: TYPES.TRANSFER, label: 'Account Transfer',        icon: ArrowLeftRight, bg: 'bg-green-500' },
            ].map(({ value, label, icon: Icon, bg }) => (
              <button key={value} onClick={() => set('type', value)}
                className={`flex-1 flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-sm font-medium ${
                  form.type === value
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}>
                <div className={`w-7 h-7 ${bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <Icon size={14} className="text-white" />
                </div>
                {label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                {form.type === TYPES.ATM ? 'Bank Account (withdraw from)' : 'From Account'}
              </label>
              <select value={form.fromAccountId} onChange={(e) => set('fromAccountId', e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="">— Select account —</option>
                {(form.type === TYPES.ATM ? bankAccounts : accounts).map((a) => (
                  <option key={a.id} value={a.id}>{a.name} ({fmt(a.balance)})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                {form.type === TYPES.ATM ? 'To (Cash — automatic)' : 'To Account'}
              </label>
              {form.type === TYPES.ATM ? (
                <div className="w-full border border-slate-100 bg-slate-50 rounded-lg px-3 py-2 text-sm text-slate-500">
                  {cashAccount ? `${cashAccount.name} (${fmt(cashAccount.balance)})` : 'No cash account found'}
                </div>
              ) : (
                <select value={form.toAccountId} onChange={(e) => set('toAccountId', e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="">— Select account —</option>
                  {toAccountOptions().map((a) => (
                    <option key={a.id} value={a.id}>{a.name} ({fmt(a.balance)})</option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Amount</label>
              <input type="number" value={form.amount} onChange={(e) => set('amount', e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTransfer()}
                placeholder="0.00" min="0" step="0.01" autoFocus
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Date</label>
              <input type="date" value={form.date} onChange={(e) => set('date', e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-500 mb-1">Note (optional)</label>
              <input type="text" value={form.note} onChange={(e) => set('note', e.target.value)}
                placeholder="e.g. ATM at Keells, online transfer…"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={addTransfer} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">Confirm Transfer</button>
            <button onClick={() => { setShowForm(false); setForm(emptyForm()) }}
              className="border border-slate-200 text-slate-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">Cancel</button>
          </div>
        </div>
      )}

      {/* Transfer history */}
      <h3 className="font-semibold text-slate-700 text-sm mb-3">Transfer History</h3>
      {sorted.length === 0 ? (
        <div className="text-center py-14 text-slate-400">
          <ArrowLeftRight size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No transfers yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map((t) => {
            const isATM = t.type === TYPES.ATM
            return (
              <div key={t.id} className="bg-white rounded-xl border border-slate-100 shadow-sm px-5 py-4 flex items-center justify-between hover:border-slate-200 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${isATM ? 'bg-amber-100' : 'bg-green-100'}`}>
                    {isATM
                      ? <Banknote size={16} className="text-amber-600" />
                      : <ArrowLeftRight size={16} className="text-green-600" />}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-900">
                      {getAccountName(t.fromAccountId)}
                      <span className="text-slate-400 mx-1.5">→</span>
                      {getAccountName(t.toAccountId)}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {isATM ? 'ATM Withdrawal' : 'Account Transfer'}
                      {t.note && ` · ${t.note}`}
                      {' · '}{formatDate(t.date)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="font-bold text-slate-800 text-sm">{fmt(t.amount)}</div>
                  <button onClick={() => deleteTransfer(t)} className="text-slate-200 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100 p-1"><Trash2 size={14} /></button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

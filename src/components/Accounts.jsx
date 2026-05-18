import React, { useState } from 'react'
import { Plus, Trash2, Pencil, Check, X, Wallet, Banknote, Lock } from 'lucide-react'
import { formatAmount } from '../utils/format'
import { v4 as uuid } from 'uuid'

export default function Accounts({ data, saveData }) {
  const { accounts = [], currency = 'LKR' } = data
  const fmt = (n) => formatAmount(n, currency)

  const [showAdd, setShowAdd]     = useState(false)
  const [newName, setNewName]     = useState('')
  const [newBalance, setNewBalance] = useState('')
  const [newType, setNewType]     = useState('bank')

  const [editId, setEditId]       = useState(null)
  const [editName, setEditName]   = useState('')
  const [editBalance, setEditBalance] = useState('')

  const hasCash      = accounts.some((a) => a.type === 'cash')
  const totalBalance = accounts.reduce((s, a) => s + (a.balance || 0), 0)

  const addAccount = () => {
    const name    = newName.trim()
    const balance = parseFloat(newBalance)
    if (!name || isNaN(balance) || balance < 0) return
    saveData({ ...data, accounts: [...accounts, { id: uuid(), name, balance, type: newType }] })
    setNewName(''); setNewBalance(''); setNewType('bank'); setShowAdd(false)
  }

  const deleteAccount = (id) => {
    if (!window.confirm("Delete this account? Associated expenses won't be affected.")) return
    saveData({ ...data, accounts: accounts.filter((a) => a.id !== id) })
  }

  const startEdit = (a) => { setEditId(a.id); setEditName(a.name); setEditBalance(String(a.balance)) }

  const confirmEdit = (id) => {
    const name    = editName.trim()
    const balance = parseFloat(editBalance)
    if (!name || isNaN(balance) || balance < 0) return
    saveData({ ...data, accounts: accounts.map((a) => a.id === id ? { ...a, name, balance } : a) })
    setEditId(null)
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-7">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Accounts</h2>
          <p className="text-slate-400 text-sm mt-0.5">Manage your bank accounts and cash</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
        >
          <Plus size={15} /> Add Account
        </button>
      </div>

      {/* Total balance banner */}
      <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-6 mb-6 text-white shadow-md">
        <div className="text-xs font-semibold uppercase tracking-widest opacity-70 mb-1">Total Balance</div>
        <div className="text-3xl font-bold">{fmt(totalBalance)}</div>
        <div className="text-sm opacity-60 mt-1">{accounts.length} account{accounts.length !== 1 ? 's' : ''}</div>
      </div>

      {/* Add account form */}
      {showAdd && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-5">
          <h3 className="font-semibold text-slate-800 mb-4">New Account</h3>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Account Name</label>
              <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addAccount()}
                placeholder="e.g. Commercial Bank"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Current Balance</label>
              <input type="number" value={newBalance} onChange={(e) => setNewBalance(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addAccount()}
                placeholder="0.00" min="0" step="0.01"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Type</label>
              <select value={newType} onChange={(e) => setNewType(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="bank">Bank Account</option>
                {!hasCash && <option value="cash">Cash</option>}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={addAccount} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">Add Account</button>
            <button onClick={() => { setShowAdd(false); setNewName(''); setNewBalance('') }}
              className="border border-slate-200 text-slate-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">Cancel</button>
          </div>
        </div>
      )}

      {/* Account list */}
      {accounts.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <Wallet size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No accounts yet. Add your first account.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {accounts.map((a) => (
            <div key={a.id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
              {editId === a.id ? (
                <div className="flex items-center gap-3">
                  <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                  <input type="number" value={editBalance} onChange={(e) => setEditBalance(e.target.value)}
                    className="w-44 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                  <button onClick={() => confirmEdit(a.id)} className="text-emerald-600 hover:text-emerald-700 p-1.5"><Check size={18} /></button>
                  <button onClick={() => setEditId(null)} className="text-slate-400 hover:text-slate-600 p-1.5"><X size={18} /></button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${a.type === 'cash' ? 'bg-emerald-100' : 'bg-green-100'}`}>
                      {a.type === 'cash'
                        ? <Banknote size={20} className="text-emerald-600" />
                        : <Wallet   size={20} className="text-green-600" />}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 flex items-center gap-2">
                        {a.name}
                        {a.type === 'cash' && (
                          <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">Protected</span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">{a.type === 'cash' ? 'Cash' : 'Bank Account'}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-xl font-bold text-slate-900">{fmt(a.balance)}</div>
                      <div className="text-xs text-slate-400">Current Balance</div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => startEdit(a)}
                        className="text-slate-300 hover:text-green-500 transition-colors p-2 rounded-lg hover:bg-green-50">
                        <Pencil size={15} />
                      </button>
                      {a.type === 'cash' ? (
                        /* Cash accounts can never be deleted */
                        <div className="p-2 rounded-lg text-slate-200 cursor-not-allowed" title="The Cash account cannot be deleted">
                          <Lock size={15} />
                        </div>
                      ) : (
                        <button onClick={() => deleteAccount(a.id)}
                          className="text-slate-300 hover:text-rose-500 transition-colors p-2 rounded-lg hover:bg-rose-50">
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

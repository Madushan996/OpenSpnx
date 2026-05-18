import React, { useState, useEffect, useCallback } from 'react'
import Layout from './components/Layout'
import Dashboard from './components/Dashboard'
import Accounts from './components/Accounts'
import Income from './components/Income'
import Expenses from './components/Expenses'
import Transfers from './components/Transfers'
import Reports from './components/Reports'
import { VIEWS } from './constants'

export { VIEWS }

const DEFAULT_DATA = {
  accounts: [{ id: 'cash', name: 'Cash', balance: 0, type: 'cash' }],
  expenses: [],
  income: [],
  transfers: [],
  currency: 'LKR',
}

export default function App() {
  const [view, setView] = useState(VIEWS.DASHBOARD)
  const [data, setData] = useState(DEFAULT_DATA)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    window.api.getData().then((d) => {
      // Merge loaded data with defaults so new fields always exist
      setData({
        accounts: d.accounts ?? DEFAULT_DATA.accounts,
        expenses: d.expenses ?? [],
        income: d.income ?? [],
        transfers: d.transfers ?? [],
        currency: d.currency ?? 'LKR',
      })
      setLoading(false)
    })
  }, [])

  const saveData = useCallback((newData) => {
    setData(newData)
    window.api.saveData(newData)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-slate-400 text-sm">Loading…</div>
      </div>
    )
  }

  const props = { data, saveData }

  return (
    <Layout view={view} setView={setView} data={data} saveData={saveData}>
      {view === VIEWS.DASHBOARD  && <Dashboard  {...props} />}
      {view === VIEWS.ACCOUNTS   && <Accounts   {...props} />}
      {view === VIEWS.INCOME     && <Income     {...props} />}
      {view === VIEWS.EXPENSES   && <Expenses   {...props} />}
      {view === VIEWS.TRANSFERS  && <Transfers  {...props} />}
      {view === VIEWS.REPORTS    && <Reports    {...props} />}
    </Layout>
  )
}

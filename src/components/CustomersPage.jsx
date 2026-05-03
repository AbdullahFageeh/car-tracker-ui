import { useState } from 'react'
import { X, Search, Phone, Mail, IdCard, Calendar, Car } from 'lucide-react'
import { customers } from '../data/customers'
import { rentals } from '../data/rentals'

export default function CustomersPage({ onClose }) {
  const [query, setQuery] = useState('')

  const enriched = customers.map((c) => {
    const myRentals = rentals.filter((r) => r.customerId === c.id)
    const totalRentals = myRentals.length
    const active = myRentals.some((r) => r.status === 'active')
    const totalKm = myRentals.reduce((s, r) => s + r.totalKm, 0)
    return { ...c, totalRentals, active, totalKm }
  })

  const filtered = enriched.filter((c) => {
    if (!query) return true
    const q = query.toLowerCase()
    return (
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.nationalId.includes(q)
    )
  })

  return (
    <div className="fixed inset-0 z-[1000] bg-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-4">
        <h1 className="text-xl font-bold text-slate-900">Customers</h1>
        <span className="text-sm text-slate-500">
          {filtered.length} of {customers.length}
        </span>
        <div className="flex-1" />
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, phone, email, ID..."
            className="w-72 pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
        >
          <X size={18} />
        </button>
      </div>

      {/* List */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto h-[calc(100vh-65px)]">
        {filtered.map((c) => (
          <div
            key={c.id}
            className="bg-white rounded-2xl p-4 border border-slate-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center font-bold text-lg">
                  {initials(c.name)}
                </div>
                <div>
                  <div className="font-bold text-slate-900">{c.name}</div>
                  <div className="text-xs text-slate-500">{c.id}</div>
                </div>
              </div>
              {c.active && (
                <span className="text-[11px] font-bold uppercase bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                  Active
                </span>
              )}
            </div>

            <div className="space-y-1.5 text-xs text-slate-600">
              <Row icon={<Phone size={12} />} text={c.phone} />
              <Row icon={<Mail size={12} />} text={c.email} />
              <Row icon={<IdCard size={12} />} text={`ID: ${c.nationalId}`} />
              <Row icon={<Calendar size={12} />} text={`Joined ${c.joinedDate}`} />
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-slate-700">
                <Car size={13} />
                <span className="font-semibold">{c.totalRentals}</span>
                <span className="text-slate-500">rentals</span>
              </div>
              <div className="text-xs text-slate-700">
                <span className="font-semibold">{c.totalKm.toLocaleString()}</span>
                <span className="text-slate-500"> km</span>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center text-sm text-slate-500 py-12">
            No customers match your search
          </div>
        )}
      </div>
    </div>
  )
}

function Row({ icon, text }) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <span>{text}</span>
    </div>
  )
}

function initials(name) {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

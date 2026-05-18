import { useState } from 'react'
import {
  Shield,
  Building2,
  Car,
  DollarSign,
  TrendingUp,
  Search,
  Plus,
  Eye,
  MoreVertical,
  LogOut,
  Users,
} from 'lucide-react'
import AddCompanyModal from './AddCompanyModal'
import {
  getDevicePackageById,
  getPlatformStats,
  getTemplateById,
} from '../data/companies'

export default function MasterDashboard({
  user,
  companies,
  onCreateCompany,
  onOpenCompany,
  onLogout,
}) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showAddCompany, setShowAddCompany] = useState(false)
  const stats = getPlatformStats(companies)

  const filtered = companies.filter((company) => {
    const matchesSearch =
      company.name.toLowerCase().includes(search.toLowerCase()) ||
      company.contact.toLowerCase().includes(search.toLowerCase()) ||
      company.email.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || company.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-50">
      <div className="h-14 bg-slate-900 border-b border-slate-800 flex items-center px-4 gap-4 text-white">
        <div className="flex items-center gap-2 font-bold">
          <Shield size={20} className="text-amber-400" />
          <span>Fleet Tracker · Master</span>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-2 text-sm">
          <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-xs font-bold">
            {user.name?.split(' ').map((name) => name[0]).join('').slice(0, 2) || 'M'}
          </div>
          <div className="text-sm">
            <div className="font-medium">{user.name}</div>
            <div className="text-xs text-slate-400">Platform Admin</div>
          </div>
        </div>
        <button
          onClick={onLogout}
          title="Logout"
          className="p-2 rounded-lg hover:bg-slate-800"
        >
          <LogOut size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Platform Overview</h1>
              <p className="text-sm text-slate-500">
                Manage all companies, assign templates, and control feature access
              </p>
            </div>
            <button
              onClick={() => setShowAddCompany(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2.5 rounded-xl"
            >
              <Plus size={16} />
              Add Company
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatCard
              icon={<Building2 size={20} />}
              label="Total Companies"
              value={stats.totalCompanies}
              sub={`${stats.activeCompanies} active`}
              color="blue"
            />
            <StatCard
              icon={<Car size={20} />}
              label="Total Vehicles"
              value={stats.totalVehicles}
              sub="across all companies"
              color="green"
            />
            <StatCard
              icon={<DollarSign size={20} />}
              label="Annual Subscription"
              value={`${stats.annualSubscriptionRevenue.toLocaleString()} SAR`}
              sub="active yearly packages"
              color="amber"
            />
            <StatCard
              icon={<TrendingUp size={20} />}
              label="Trials & Suspended"
              value={`${stats.trialCount} / ${stats.suspendedCount}`}
              sub="trial / suspended"
              color="purple"
            />
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center gap-3">
              <div className="relative flex-1 max-w-md">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search companies..."
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
                {['all', 'active', 'trial', 'suspended'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors ${
                      statusFilter === status
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold">Company</th>
                  <th className="text-left px-4 py-3 font-semibold">Contact</th>
                  <th className="text-left px-4 py-3 font-semibold">Billing</th>
                  <th className="text-left px-4 py-3 font-semibold">Vehicles</th>
                  <th className="text-left px-4 py-3 font-semibold">Status</th>
                  <th className="text-left px-4 py-3 font-semibold">Last active</th>
                  <th className="text-right px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((company) => (
                  <tr key={company.id} className="hover:bg-slate-50 align-top">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-lg">
                          {company.logo}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{company.name}</div>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="text-xs text-slate-500">{company.city}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                            <BusinessTemplateBadge templateId={company.templateId} />
                            <span className="text-xs text-slate-500">
                              {company.enabledFeatures?.length || 0} features
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-slate-700">{company.contact}</div>
                      <div className="text-xs text-slate-500">{company.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <PlanBadge plan={company.plan} />
                        <DevicePackageBadge packageId={company.devicePackageId} />
                      </div>
                      <div className="text-xs text-slate-500">
                        {company.vehicleCount} devices
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        Hardware: {company.hardwareTotal.toLocaleString()} SAR
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Annual: {company.annualSubscriptionTotal.toLocaleString()} SAR
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-slate-900 font-medium">
                        {company.vehicleCount}{' '}
                        <span className="text-slate-400">/ {company.vehicleLimit}</span>
                      </div>
                      <div className="w-20 h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                        <div
                          className="h-full bg-blue-500"
                          style={{
                            width: `${(company.vehicleCount / company.vehicleLimit) * 100}%`,
                          }}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={company.status} />
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {formatLastActive(company.lastActiveAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onOpenCompany(company)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg"
                        >
                          <Eye size={13} />
                          Open
                        </button>
                        <button className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg">
                          <MoreVertical size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-500">
                      <Users size={32} className="mx-auto mb-2 text-slate-300" />
                      No companies match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showAddCompany && (
        <AddCompanyModal
          onClose={() => setShowAddCompany(false)}
          onCreateCompany={onCreateCompany}
        />
      )}
    </div>
  )
}

function DevicePackageBadge({ packageId }) {
  const devicePackage = getDevicePackageById(packageId)

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700">
      <span>{devicePackage.icon}</span>
      <span>{devicePackage.name}</span>
    </span>
  )
}

function BusinessTemplateBadge({ templateId }) {
  const template = getTemplateById(templateId)

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
      <span>{template.icon}</span>
      <span>{template.name}</span>
    </span>
  )
}

function StatCard({ icon, label, value, sub, color }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    amber: 'bg-amber-50 text-amber-600',
    purple: 'bg-purple-50 text-purple-600',
  }
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors[color]}`}>
          {icon}
        </div>
      </div>
      <div className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">
        {label}
      </div>
      <div className="text-2xl font-bold text-slate-900">{value}</div>
      <div className="text-xs text-slate-500 mt-0.5">{sub}</div>
    </div>
  )
}

function PlanBadge({ plan }) {
  const styles = {
    Starter: 'bg-slate-100 text-slate-700',
    Pro: 'bg-blue-100 text-blue-700',
    Enterprise: 'bg-purple-100 text-purple-700',
  }
  return (
    <span
      className={`inline-block text-xs font-semibold px-2 py-0.5 rounded ${styles[plan] || styles.Starter}`}
    >
      {plan}
    </span>
  )
}

function StatusBadge({ status }) {
  const styles = {
    active: 'bg-green-100 text-green-700',
    trial: 'bg-amber-100 text-amber-700',
    suspended: 'bg-red-100 text-red-700',
  }
  const dot = {
    active: 'bg-green-500',
    trial: 'bg-amber-500',
    suspended: 'bg-red-500',
  }
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full capitalize ${styles[status]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dot[status]}`} />
      {status}
    </span>
  )
}

function formatLastActive(iso) {
  const date = new Date(iso)
  const now = new Date()
  const diffMs = now - date
  const diffMin = Math.floor(diffMs / 60000)
  const diffHr = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHr / 24)

  if (diffMin < 1) return 'just now'
  if (diffMin < 60) return `${diffMin} min ago`
  if (diffHr < 24) return `${diffHr}h ago`
  if (diffDay < 7) return `${diffDay}d ago`
  return date.toLocaleDateString()
}

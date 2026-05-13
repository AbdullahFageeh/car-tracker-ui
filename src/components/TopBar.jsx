import { Bell, Wrench, Users, LogOut, Car, Settings, History } from 'lucide-react'
import { unreadAlertsCount, criticalAlertsCount } from '../data/alerts'
import { vehicles, maintenanceStatus } from '../data/vehicles'
export default function TopBar({
  user,
  onOpen,
  onLogout,
  impersonating,
  enabledFeatures,
}) {
  const unread = unreadAlertsCount()
  const critical = criticalAlertsCount()
  const overdue = vehicles.filter((v) => maintenanceStatus(v).status === 'overdue').length
  const hasFeature = (featureId) =>
    !enabledFeatures || enabledFeatures.includes(featureId)

  return (
    <div className="h-14 bg-slate-900 border-b border-slate-800 flex items-center px-4 gap-4 text-white">
      <div className="flex items-center gap-2 font-bold">
        <Car size={20} />
        <span>Fleet Tracker</span>
        {impersonating && (
          <>
            <span className="text-slate-500">/</span>
            <span className="text-amber-300 flex items-center gap-1">
              <span>{impersonating.logo}</span>
              <span>{impersonating.name}</span>
            </span>
          </>
        )}
      </div>

      <div className="flex-1" />

      {hasFeature('alerts') && (
        <button
          onClick={() => onOpen('alerts')}
          className="relative flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-800 text-sm"
        >
          <Bell size={16} />
          Alerts
          {unread > 0 && (
            <span
              className={`absolute -top-1 -right-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                critical > 0 ? 'bg-red-500' : 'bg-amber-500'
              }`}
            >
              {unread}
            </span>
          )}
        </button>
      )}

      {hasFeature('maintenance') && (
        <button
          onClick={() => onOpen('maintenance')}
          className="relative flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-800 text-sm"
        >
          <Wrench size={16} />
          Maintenance
          {overdue > 0 && (
            <span className="absolute -top-1 -right-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-500">
              {overdue}
            </span>
          )}
        </button>
      )}

      {hasFeature('customers') && (
        <button
          onClick={() => onOpen('customers')}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-800 text-sm"
        >
          <Users size={16} />
          Customers
        </button>
      )}

      {hasFeature('playback') && (
        <button
          onClick={() => onOpen('playback')}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-800 text-sm"
        >
          <History size={16} />
          Playback
        </button>
      )}

      <button
        onClick={() => onOpen('account')}
        title="Account settings"
        className="p-2 rounded-lg hover:bg-slate-800"
      >
        <Settings size={16} />
      </button>

      <div className="w-px h-6 bg-slate-700" />

      <button
        onClick={() => onOpen('account')}
        className="flex items-center gap-2 hover:bg-slate-800 px-2 py-1 rounded-lg"
      >
        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold">
          {user.name?.split(' ').map((n) => n[0]).join('').slice(0, 2) || 'U'}
        </div>
        <div className="text-sm text-left">
          <div className="font-medium">{user.name}</div>
          <div className="text-xs text-slate-400">{user.role}</div>
        </div>
      </button>

      <button
        onClick={onLogout}
        title="Logout"
        className="p-2 rounded-lg hover:bg-slate-800"
      >
        <LogOut size={16} />
      </button>
    </div>
  )
}

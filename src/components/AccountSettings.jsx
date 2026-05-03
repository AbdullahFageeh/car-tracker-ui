import { useState } from 'react'
import { X, User, Lock, Bell, Globe, Save, Check } from 'lucide-react'

export default function AccountSettings({ user, onClose, onSave }) {
  const [section, setSection] = useState('profile')
  const [savedFlash, setSavedFlash] = useState(false)

  const [profile, setProfile] = useState({
    name: user?.name || 'Demo User',
    email: user?.email || 'demo@example.com',
    phone: user?.phone || '+966 50 000 0000',
    company: user?.company || 'Riyadh Rentals',
    language: user?.language || 'en',
    timezone: user?.timezone || 'Asia/Riyadh',
    units: user?.units || 'metric',
  })

  const [pwd, setPwd] = useState({ current: '', next: '', confirm: '' })

  const [notifs, setNotifs] = useState({
    speeding: true,
    outsideZone: true,
    accident: true,
    engineOff: false,
    maintenanceDue: true,
    rentalEnding: true,
    emailDigest: true,
    smsUrgent: false,
    pushAll: true,
  })

  const flashSaved = () => {
    setSavedFlash(true)
    setTimeout(() => setSavedFlash(false), 1800)
  }

  const handleSaveProfile = () => {
    onSave && onSave({ ...user, ...profile })
    flashSaved()
  }

  const handleChangePwd = () => {
    if (!pwd.current || !pwd.next) return alert('Please fill all password fields')
    if (pwd.next !== pwd.confirm) return alert('New passwords do not match')
    if (pwd.next.length < 6) return alert('Password must be at least 6 characters')
    setPwd({ current: '', next: '', confirm: '' })
    flashSaved()
  }

  const handleSaveNotifs = () => {
    flashSaved()
  }

  return (
    <div className="fixed inset-0 z-[1000] bg-slate-100 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Account Settings</h1>
          <div className="text-xs text-slate-500">Manage your profile and preferences</div>
        </div>
        <div className="flex items-center gap-3">
          {savedFlash && (
            <span className="text-sm text-green-600 font-medium flex items-center gap-1.5">
              <Check size={16} /> Saved
            </span>
          )}
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-60 bg-white border-r border-slate-200 p-3">
          <NavItem
            icon={<User size={16} />}
            label="Profile"
            active={section === 'profile'}
            onClick={() => setSection('profile')}
          />
          <NavItem
            icon={<Lock size={16} />}
            label="Password"
            active={section === 'password'}
            onClick={() => setSection('password')}
          />
          <NavItem
            icon={<Bell size={16} />}
            label="Notifications"
            active={section === 'notifs'}
            onClick={() => setSection('notifs')}
          />
          <NavItem
            icon={<Globe size={16} />}
            label="Language & Region"
            active={section === 'region'}
            onClick={() => setSection('region')}
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl">
            {section === 'profile' && (
              <Card title="Profile" desc="Your personal information">
                <div className="flex items-center gap-4 mb-5 pb-5 border-b border-slate-200">
                  <div className="w-16 h-16 rounded-full bg-blue-500 text-white flex items-center justify-center text-xl font-bold">
                    {profile.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </div>
                  <button className="px-3 py-1.5 text-sm rounded-lg border border-slate-300 hover:bg-slate-50">
                    Change photo
                  </button>
                </div>

                <Field label="Full name" value={profile.name} onChange={(v) => setProfile({ ...profile, name: v })} />
                <Field label="Email" type="email" value={profile.email} onChange={(v) => setProfile({ ...profile, email: v })} />
                <Field label="Phone" value={profile.phone} onChange={(v) => setProfile({ ...profile, phone: v })} />
                <Field label="Company" value={profile.company} onChange={(v) => setProfile({ ...profile, company: v })} />

                <div className="pt-3">
                  <button
                    onClick={handleSaveProfile}
                    className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium flex items-center gap-2"
                  >
                    <Save size={16} /> Save changes
                  </button>
                </div>
              </Card>
            )}

            {section === 'password' && (
              <Card title="Change Password" desc="Use a strong, unique password">
                <Field
                  label="Current password"
                  type="password"
                  value={pwd.current}
                  onChange={(v) => setPwd({ ...pwd, current: v })}
                />
                <Field
                  label="New password"
                  type="password"
                  value={pwd.next}
                  onChange={(v) => setPwd({ ...pwd, next: v })}
                />
                <Field
                  label="Confirm new password"
                  type="password"
                  value={pwd.confirm}
                  onChange={(v) => setPwd({ ...pwd, confirm: v })}
                />

                <div className="pt-3">
                  <button
                    onClick={handleChangePwd}
                    className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium flex items-center gap-2"
                  >
                    <Lock size={16} /> Update password
                  </button>
                </div>
              </Card>
            )}

            {section === 'notifs' && (
              <Card title="Notifications" desc="Choose what you want to be notified about">
                <SectionTitle>Alert types</SectionTitle>
                <NotifRow label="🚨 Speeding alerts" value={notifs.speeding} onChange={(v) => setNotifs({ ...notifs, speeding: v })} />
                <NotifRow label="🛡️ Vehicle outside zone" value={notifs.outsideZone} onChange={(v) => setNotifs({ ...notifs, outsideZone: v })} />
                <NotifRow label="💥 Accident detection" value={notifs.accident} onChange={(v) => setNotifs({ ...notifs, accident: v })} />
                <NotifRow label="🔌 Engine off in unusual place" value={notifs.engineOff} onChange={(v) => setNotifs({ ...notifs, engineOff: v })} />
                <NotifRow label="🔧 Maintenance due" value={notifs.maintenanceDue} onChange={(v) => setNotifs({ ...notifs, maintenanceDue: v })} />
                <NotifRow label="🗓️ Rental ending soon" value={notifs.rentalEnding} onChange={(v) => setNotifs({ ...notifs, rentalEnding: v })} />

                <SectionTitle>Delivery</SectionTitle>
                <NotifRow label="📧 Daily email digest" value={notifs.emailDigest} onChange={(v) => setNotifs({ ...notifs, emailDigest: v })} />
                <NotifRow label="📱 SMS for urgent only" value={notifs.smsUrgent} onChange={(v) => setNotifs({ ...notifs, smsUrgent: v })} />
                <NotifRow label="🔔 Push notifications" value={notifs.pushAll} onChange={(v) => setNotifs({ ...notifs, pushAll: v })} />

                <div className="pt-4">
                  <button
                    onClick={handleSaveNotifs}
                    className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium flex items-center gap-2"
                  >
                    <Save size={16} /> Save preferences
                  </button>
                </div>
              </Card>
            )}

            {section === 'region' && (
              <Card title="Language & Region" desc="Localize your experience">
                <div className="mb-4">
                  <Label>Language</Label>
                  <div className="grid grid-cols-2 gap-2 mt-1.5">
                    {[
                      { id: 'en', label: '🇬🇧 English' },
                      { id: 'ar', label: '🇸🇦 العربية' },
                    ].map((l) => (
                      <button
                        key={l.id}
                        onClick={() => setProfile({ ...profile, language: l.id })}
                        className={`py-2.5 px-3 rounded-xl border text-sm font-medium transition-colors ${
                          profile.language === l.id
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        {l.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <Label>Timezone</Label>
                  <select
                    value={profile.timezone}
                    onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
                    className="w-full mt-1.5 px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                  >
                    <option value="Asia/Riyadh">Asia/Riyadh (GMT+3)</option>
                    <option value="Asia/Dubai">Asia/Dubai (GMT+4)</option>
                    <option value="Asia/Kuwait">Asia/Kuwait (GMT+3)</option>
                    <option value="Europe/London">Europe/London (GMT+0)</option>
                    <option value="UTC">UTC</option>
                  </select>
                </div>

                <div className="mb-4">
                  <Label>Units</Label>
                  <div className="grid grid-cols-2 gap-2 mt-1.5">
                    {[
                      { id: 'metric', label: 'Metric (km, °C)' },
                      { id: 'imperial', label: 'Imperial (mi, °F)' },
                    ].map((u) => (
                      <button
                        key={u.id}
                        onClick={() => setProfile({ ...profile, units: u.id })}
                        className={`py-2.5 px-3 rounded-xl border text-sm font-medium transition-colors ${
                          profile.units === u.id
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        {u.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleSaveProfile}
                    className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium flex items-center gap-2"
                  >
                    <Save size={16} /> Save changes
                  </button>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function NavItem({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors mb-0.5 ${
        active
          ? 'bg-blue-50 text-blue-700'
          : 'text-slate-600 hover:bg-slate-50'
      }`}
    >
      {icon}
      {label}
    </button>
  )
}

function Card({ title, desc, children }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <div className="mb-5">
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        {desc && <div className="text-sm text-slate-500">{desc}</div>}
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

function Label({ children }) {
  return <div className="text-xs font-medium text-slate-700 uppercase tracking-wide">{children}</div>
}

function Field({ label, value, onChange, type = 'text' }) {
  return (
    <div>
      <Label>{label}</Label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full mt-1.5 px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
      />
    </div>
  )
}

function SectionTitle({ children }) {
  return (
    <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold pt-3 pb-1 first:pt-0">
      {children}
    </div>
  )
}

function NotifRow({ label, value, onChange }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors"
    >
      <span className="text-sm text-slate-700">{label}</span>
      <span
        className={`w-10 h-5 rounded-full relative transition-colors ${
          value ? 'bg-blue-500' : 'bg-slate-300'
        }`}
      >
        <span
          className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${
            value ? 'left-5' : 'left-0.5'
          }`}
        />
      </span>
    </button>
  )
}

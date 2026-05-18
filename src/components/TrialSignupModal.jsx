import { useState } from 'react'
import { ArrowRight, Check, Lock, X } from 'lucide-react'
import {
  calculateDeviceBilling,
  companyTemplates,
  devicePackageCatalog,
  featureCatalog,
  getDefaultFeaturesForTemplate,
  getDevicePackageById,
  getTemplateById,
  planCatalog,
} from '../data/companies'

const firstTemplate = companyTemplates[0]
const firstDevicePackage = devicePackageCatalog[0]
const planOptions = Object.keys(planCatalog)

export default function TrialSignupModal({ onClose, onCreateTrial }) {
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState({
    companyName: '',
    adminName: '',
    email: '',
    phone: '',
    city: '',
    templateId: firstTemplate.id,
    plan: firstTemplate.recommendedPlan,
    vehicleCount: 5,
    devicePackageId: firstDevicePackage.id,
    password: '',
  })

  const selectedTemplate = getTemplateById(form.templateId)
  const selectedDevicePackage = getDevicePackageById(form.devicePackageId)
  const includedFeatureIds = getDefaultFeaturesForTemplate(form.templateId)
  const billingPreview = calculateDeviceBilling({
    devicePackageId: form.devicePackageId,
    vehicleCount: form.vehicleCount,
    trackingDeviceUnitPrice: selectedDevicePackage.defaultPricing.trackingDeviceUnitPrice,
    dashcamUnitPrice: selectedDevicePackage.defaultPricing.dashcamUnitPrice,
    yearlySubscriptionUnitPrice: selectedDevicePackage.defaultPricing.yearlySubscriptionUnitPrice,
  })
  const softwarePlan = planCatalog[form.plan] || planCatalog.Starter

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
    setError('')
  }

  const updateNumberField = (field, value) => {
    const numericValue = Number(value)
    setForm((current) => ({
      ...current,
      [field]: Number.isNaN(numericValue) ? 0 : numericValue,
    }))
    setError('')
  }

  const handleTemplateSelect = (templateId) => {
    const template = getTemplateById(templateId)
    setForm((current) => ({
      ...current,
      templateId,
      plan: template.recommendedPlan,
    }))
    setError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const normalizedEmail = form.email.trim().toLowerCase()

    if (
      !form.companyName.trim() ||
      !form.adminName.trim() ||
      !normalizedEmail ||
      !form.phone.trim() ||
      !form.city.trim()
    ) {
      setError('Please fill in the main company and admin details.')
      return
    }

    if ((form.password || '').trim().length < 6) {
      setError('Choose a password with at least 6 characters.')
      return
    }

    setIsSubmitting(true)

    try {
      await onCreateTrial({
        name: form.companyName.trim(),
        contact: form.adminName.trim(),
        email: normalizedEmail,
        phone: form.phone.trim(),
        city: form.city.trim(),
        vehicleCount: Math.max(Number(form.vehicleCount) || 0, 1),
        plan: form.plan,
        templateId: form.templateId,
        devicePackageId: form.devicePackageId,
        trackingDeviceUnitPrice: selectedDevicePackage.defaultPricing.trackingDeviceUnitPrice,
        dashcamUnitPrice: selectedDevicePackage.defaultPricing.dashcamUnitPrice,
        yearlySubscriptionUnitPrice: selectedDevicePackage.defaultPricing.yearlySubscriptionUnitPrice,
        enabledFeatures: includedFeatureIds,
        password: form.password.trim(),
      })
      onClose()
    } catch (signupError) {
      setError(signupError.message || 'We could not create your trial right now.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[1200] bg-slate-950/70 p-4 md:p-6 flex items-center justify-center">
      <div className="w-full max-w-5xl max-h-[92vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-slate-200 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Start free trial</h2>
            <p className="text-sm text-slate-500 mt-1">
              Create a tenant, seed the right modules, and sign in right away.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-500"
          >
            <X size={20} />
          </button>
        </div>

        <form
          id="trial-signup-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-6 grid lg:grid-cols-[1.3fr_0.7fr] gap-6"
        >
          <div className="space-y-6">
            <section>
              <div className="mb-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                  1. Choose a template
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  Start with the workflow that matches the fleet you want to sell into.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {companyTemplates.map((template) => {
                  const active = template.id === form.templateId
                  return (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => handleTemplateSelect(template.id)}
                      className={`text-left rounded-2xl border p-4 transition-all ${
                        active
                          ? 'border-blue-500 bg-blue-50 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 text-slate-900 font-semibold">
                            <span className="text-xl">{template.icon}</span>
                            <span>{template.name}</span>
                          </div>
                          <div className="text-sm text-slate-500 mt-2">
                            {template.description}
                          </div>
                        </div>
                        {active && (
                          <span className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                            <Check size={16} />
                          </span>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </section>

            <section>
              <div className="mb-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                  2. Company details
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  These details become the tenant record and first admin account.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field
                  label="Company name"
                  value={form.companyName}
                  onChange={(value) => updateField('companyName', value)}
                  placeholder="Riyadh Prime Mobility"
                />
                <Field
                  label="Admin name"
                  value={form.adminName}
                  onChange={(value) => updateField('adminName', value)}
                  placeholder="Sara Al-Harbi"
                />
                <Field
                  label="Work email"
                  type="email"
                  value={form.email}
                  onChange={(value) => updateField('email', value)}
                  placeholder="ops@company.com"
                />
                <Field
                  label="Phone"
                  value={form.phone}
                  onChange={(value) => updateField('phone', value)}
                  placeholder="+966 50 000 0000"
                />
                <Field
                  label="City"
                  value={form.city}
                  onChange={(value) => updateField('city', value)}
                  placeholder="Riyadh"
                />
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                    Plan
                  </label>
                  <select
                    value={form.plan}
                    onChange={(event) => updateField('plan', event.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {planOptions.map((plan) => (
                      <option key={plan} value={plan}>
                        {plan}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            <section>
              <div className="mb-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                  3. Fleet package
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  Choose how many vehicles need equipment and whether dashcams are included.
                </p>
              </div>

              <div className="max-w-sm mb-4">
                <NumberField
                  label="Vehicles to equip"
                  value={form.vehicleCount}
                  onChange={(value) => updateNumberField('vehicleCount', value)}
                  min={1}
                  step={1}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {devicePackageCatalog.map((devicePackage) => {
                  const active = devicePackage.id === form.devicePackageId
                  return (
                    <button
                      key={devicePackage.id}
                      type="button"
                      onClick={() => updateField('devicePackageId', devicePackage.id)}
                      className={`text-left rounded-2xl border p-4 transition-all ${
                        active
                          ? 'border-blue-500 bg-blue-50 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 text-slate-900 font-semibold">
                            <span className="text-xl">{devicePackage.icon}</span>
                            <span>{devicePackage.name}</span>
                          </div>
                          <div className="text-sm text-slate-500 mt-2">
                            {devicePackage.description}
                          </div>
                        </div>
                        {active && (
                          <span className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                            <Check size={16} />
                          </span>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </section>

            <section>
              <div className="mb-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                  4. Password
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  Choose the first admin password for this company. The account will be stored
                  in the backend database.
                </p>
              </div>

              <div className="max-w-md">
                <Field
                  label="Password"
                  type="password"
                  value={form.password}
                  onChange={(value) => updateField('password', value)}
                  placeholder="At least 6 characters"
                />
              </div>
            </section>

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
          </div>

          <aside className="space-y-4">
            <div className="rounded-3xl bg-slate-950 text-white p-5">
              <div className="text-xs uppercase tracking-wider text-blue-200 font-semibold">
                Trial summary
              </div>
              <div className="text-xl font-bold mt-2">{selectedTemplate.name}</div>
              <div className="text-sm text-slate-300 mt-1">
                {softwarePlan.monthlyFee} SAR/mo software · up to {softwarePlan.vehicleLimit} vehicles
              </div>

              <div className="grid grid-cols-2 gap-3 mt-5">
                <SummaryCard
                  label="Hardware total"
                  value={`${billingPreview.hardwareTotal.toLocaleString()} SAR`}
                />
                <SummaryCard
                  label="Annual tracking"
                  value={`${billingPreview.annualSubscriptionTotal.toLocaleString()} SAR`}
                />
                <SummaryCard label="Vehicles" value={`${form.vehicleCount}`} />
                <SummaryCard label="Package" value={selectedDevicePackage.name} />
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <div className="text-sm font-semibold text-slate-900">Included from this template</div>
              <div className="space-y-2 mt-4">
                {featureCatalog
                  .filter((feature) => includedFeatureIds.includes(feature.id))
                  .map((feature) => (
                    <div key={feature.id} className="flex items-start gap-2 text-sm text-slate-600">
                      <Check size={15} className="text-emerald-600 mt-0.5 shrink-0" />
                      <span>{feature.name}</span>
                    </div>
                  ))}
              </div>
            </div>

            <div className="rounded-3xl border border-blue-200 bg-blue-50 p-5 text-sm text-blue-900">
              <div className="flex items-start gap-2">
                <Lock size={16} className="mt-0.5 shrink-0" />
                <div>
                  You will be signed in immediately after creating the trial, so you can move
                  straight into the company workspace.
                </div>
              </div>
            </div>
          </aside>
        </form>

        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-4">
          <div className="text-sm text-slate-500">
            {selectedTemplate.name} · {form.vehicleCount} vehicles · {selectedDevicePackage.name}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-medium hover:bg-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="trial-signup-form"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white font-medium"
            >
              {isSubmitting ? 'Creating…' : 'Create trial'}
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function SummaryCard({ label, value }) {
  return (
    <div className="rounded-2xl bg-white/5 border border-white/8 px-3 py-3">
      <div className="text-[11px] uppercase tracking-wider text-slate-400">{label}</div>
      <div className="font-semibold mt-1">{value}</div>
    </div>
  )
}

function NumberField({ label, value, onChange, min = 0, step = 1 }) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
        {label}
      </label>
      <input
        type="number"
        min={min}
        step={step}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
  )
}

function Field({ label, value, onChange, placeholder, type = 'text' }) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
  )
}

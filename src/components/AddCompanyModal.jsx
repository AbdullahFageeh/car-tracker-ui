import { useState } from 'react'
import { X, Check, RotateCcw, Plus } from 'lucide-react'
import {
  calculateDeviceBilling,
  companyTemplates,
  devicePackageCatalog,
  featureCatalog,
  getDevicePackageById,
  getDefaultFeaturesForTemplate,
  getTemplateById,
  planCatalog,
} from '../data/companies'

const orderedFeatureIds = (featureIds) =>
  featureCatalog
    .map((feature) => feature.id)
    .filter((featureId) => featureIds.includes(featureId))

const firstTemplate = companyTemplates[0]
const firstDevicePackage = devicePackageCatalog[0]
const planOptions = Object.keys(planCatalog)

export default function AddCompanyModal({ onClose, onCreateCompany }) {
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState({
    name: '',
    contact: '',
    email: '',
    phone: '',
    city: '',
    vehicleCount: 1,
    plan: firstTemplate.recommendedPlan,
    templateId: firstTemplate.id,
    devicePackageId: firstDevicePackage.id,
    trackingDeviceUnitPrice: firstDevicePackage.defaultPricing.trackingDeviceUnitPrice,
    dashcamUnitPrice: firstDevicePackage.defaultPricing.dashcamUnitPrice,
    yearlySubscriptionUnitPrice: firstDevicePackage.defaultPricing.yearlySubscriptionUnitPrice,
    enabledFeatures: getDefaultFeaturesForTemplate(firstTemplate.id),
    password: '',
  })

  const selectedTemplate = getTemplateById(form.templateId)
  const selectedDevicePackage = getDevicePackageById(form.devicePackageId)
  const billingPreview = calculateDeviceBilling({
    devicePackageId: form.devicePackageId,
    vehicleCount: form.vehicleCount,
    trackingDeviceUnitPrice: form.trackingDeviceUnitPrice,
    dashcamUnitPrice: form.dashcamUnitPrice,
    yearlySubscriptionUnitPrice: form.yearlySubscriptionUnitPrice,
  })

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
      enabledFeatures: getDefaultFeaturesForTemplate(templateId),
    }))
    setError('')
  }

  const handleDevicePackageSelect = (devicePackageId) => {
    const devicePackage = getDevicePackageById(devicePackageId)
    setForm((current) => ({
      ...current,
      devicePackageId,
      trackingDeviceUnitPrice: devicePackage.defaultPricing.trackingDeviceUnitPrice,
      dashcamUnitPrice: devicePackage.defaultPricing.dashcamUnitPrice,
      yearlySubscriptionUnitPrice: devicePackage.defaultPricing.yearlySubscriptionUnitPrice,
    }))
    setError('')
  }

  const handleToggleFeature = (featureId) => {
    const feature = featureCatalog.find((item) => item.id === featureId)
    if (feature?.required) return

    setForm((current) => {
      const exists = current.enabledFeatures.includes(featureId)
      const nextFeatures = exists
        ? current.enabledFeatures.filter((id) => id !== featureId)
        : [...current.enabledFeatures, featureId]

      return {
        ...current,
        enabledFeatures: orderedFeatureIds(nextFeatures),
      }
    })
  }

  const resetToTemplateDefaults = () => {
    updateField('enabledFeatures', getDefaultFeaturesForTemplate(form.templateId))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (
      !form.name.trim() ||
      !form.contact.trim() ||
      !form.email.trim() ||
      !form.phone.trim() ||
      !form.city.trim() ||
      form.vehicleCount < 1
    ) {
      setError('Please fill in the main company details before saving.')
      return
    }

    if ((form.password || '').trim().length < 6) {
      setError('Choose an admin password with at least 6 characters.')
      return
    }

    setIsSubmitting(true)

    try {
      await onCreateCompany({
        ...form,
        name: form.name.trim(),
        contact: form.contact.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        city: form.city.trim(),
        password: form.password.trim(),
        vehicleCount: Math.max(Number(form.vehicleCount) || 0, 1),
        trackingDeviceUnitPrice: Math.max(Number(form.trackingDeviceUnitPrice) || 0, 0),
        dashcamUnitPrice: Math.max(Number(form.dashcamUnitPrice) || 0, 0),
        yearlySubscriptionUnitPrice: Math.max(Number(form.yearlySubscriptionUnitPrice) || 0, 0),
        enabledFeatures: orderedFeatureIds(form.enabledFeatures),
      })
      onClose()
    } catch (createError) {
      setError(createError.message || 'We could not create this company right now.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[1100] bg-slate-950/50 p-4 md:p-6 flex items-center justify-center">
      <div className="w-full max-w-5xl max-h-[92vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-slate-200 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Add Company</h2>
            <p className="text-sm text-slate-500 mt-1">
              Start with a business template, then fine-tune which features the company gets.
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

        <form id="add-company-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          <section>
            <div className="flex items-center justify-between gap-3 mb-3">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                  1. Choose a template
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  Each template comes with a ready-made feature set.
                </p>
              </div>
              <div className="text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
                Recommended plan:{' '}
                <span className="font-semibold text-slate-900">
                  {selectedTemplate.recommendedPlan}
                </span>
              </div>
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
                        <span className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center">
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
            <div className="flex items-center justify-between gap-3 mb-3">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                  2. Hardware & subscription
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  Every vehicle needs a tracking device. Add dashcams only when the client wants them.
                </p>
              </div>
              <div className="text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
                {form.vehicleCount} devices required
              </div>
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
                    onClick={() => handleDevicePackageSelect(devicePackage.id)}
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
                        <span className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center">
                          <Check size={16} />
                        </span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <NumberField
                label="Tracking device price / vehicle"
                value={form.trackingDeviceUnitPrice}
                onChange={(value) => updateNumberField('trackingDeviceUnitPrice', value)}
                min={0}
                step={10}
              />
              {selectedDevicePackage.id === 'tracking_dashcam' ? (
                <NumberField
                  label="Dashcam price / vehicle"
                  value={form.dashcamUnitPrice}
                  onChange={(value) => updateNumberField('dashcamUnitPrice', value)}
                  min={0}
                  step={10}
                />
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500 flex items-center">
                  Dashcam hardware is not included in this package.
                </div>
              )}
              <NumberField
                label="Yearly subscription / vehicle"
                value={form.yearlySubscriptionUnitPrice}
                onChange={(value) => updateNumberField('yearlySubscriptionUnitPrice', value)}
                min={0}
                step={10}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
              <SummaryTile
                label="Tracking devices"
                value={`${form.vehicleCount} × ${selectedDevicePackage.icon}`}
              />
              <SummaryTile
                label="Hardware total"
                value={`${billingPreview.hardwareTotal.toLocaleString()} SAR`}
              />
              <SummaryTile
                label="Yearly subscription"
                value={`${billingPreview.annualSubscriptionTotal.toLocaleString()} SAR`}
              />
            </div>
          </section>

          <section>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">
              3. Company details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field
                label="Company name"
                value={form.name}
                onChange={(value) => updateField('name', value)}
                placeholder="Riyadh Prime Mobility"
              />
              <Field
                label="Contact person"
                value={form.contact}
                onChange={(value) => updateField('contact', value)}
                placeholder="Sara Al-Harbi"
              />
              <Field
                label="Email"
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
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">
              4. Admin password
            </h3>
            <div className="max-w-md">
              <Field
                label="Initial admin password"
                type="password"
                value={form.password}
                onChange={(value) => updateField('password', value)}
                placeholder="At least 6 characters"
              />
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between gap-3 mb-3">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                  5. Adjust features
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  Turn modules on or off before creating the company.
                </p>
              </div>
              <button
                type="button"
                onClick={resetToTemplateDefaults}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border border-slate-300 hover:bg-slate-50 text-slate-700"
              >
                <RotateCcw size={14} />
                Reset to template
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {featureCatalog.map((feature) => {
                const enabled = form.enabledFeatures.includes(feature.id)
                return (
                  <button
                    key={feature.id}
                    type="button"
                    onClick={() => handleToggleFeature(feature.id)}
                    disabled={feature.required}
                    className={`text-left rounded-2xl border p-4 transition-all ${
                      enabled
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    } ${feature.required ? 'cursor-not-allowed opacity-90' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 font-semibold text-slate-900">
                          <span>{feature.name}</span>
                          {feature.required && (
                            <span className="text-[10px] uppercase tracking-wider bg-slate-900 text-white px-2 py-0.5 rounded-full">
                              Core
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-slate-500 mt-1">
                          {feature.description}
                        </div>
                      </div>
                      <span
                        className={`w-6 h-6 rounded-full border flex items-center justify-center ${
                          enabled
                            ? 'border-blue-600 bg-blue-600 text-white'
                            : 'border-slate-300 bg-white text-transparent'
                        }`}
                      >
                        <Check size={14} />
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </section>

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </form>

        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-4">
          <div className="text-sm text-slate-500">
            {form.enabledFeatures.length} features · {billingPreview.annualSubscriptionTotal.toLocaleString()} SAR per year
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
              form="add-company-form"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white font-medium"
            >
              <Plus size={16} />
              {isSubmitting ? 'Creating…' : 'Create company'}
            </button>
          </div>
        </div>
      </div>
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

function SummaryTile({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </div>
      <div className="text-lg font-bold text-slate-900 mt-1">{value}</div>
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

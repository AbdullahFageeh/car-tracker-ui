import { useState } from 'react'
import {
  ArrowRight,
  Bell,
  Car,
  CheckCircle2,
  MapPin,
  PlayCircle,
  Shield,
  Wrench,
} from 'lucide-react'
import TrialSignupModal from './TrialSignupModal'
import { companyTemplates, planCatalog } from '../data/companies'

const highlights = [
  {
    icon: MapPin,
    title: 'Live vehicle map',
    desc: 'See every car, route, and current status from one screen.',
  },
  {
    icon: Shield,
    title: 'Zones and restrictions',
    desc: 'Draw safe areas and catch city or country violations fast.',
  },
  {
    icon: Bell,
    title: 'Alerts that matter',
    desc: 'Spot speeding, accidents, and unusual activity without digging.',
  },
  {
    icon: Wrench,
    title: 'Ops + maintenance',
    desc: 'Track service work, rental context, and playback in one workspace.',
  },
]

const launchSteps = [
  {
    title: '1. Start a trial',
    desc: 'Create a company, choose a template, and get a tenant instantly.',
  },
  {
    title: '2. Fit the workflow',
    desc: 'Pick the plan, hardware package, and feature mix that match the fleet.',
  },
  {
    title: '3. Run the operation',
    desc: 'Use the master dashboard and company workspace without extra setup.',
  },
]

export default function MarketingPage({ onCreateTrial, onOpenLogin }) {
  const [showTrial, setShowTrial] = useState(false)

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-950/40">
              <Car size={22} />
            </div>
            <div>
              <div className="font-semibold">Fleet Tracker</div>
              <div className="text-xs text-slate-400">Multi-tenant fleet SaaS demo</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onOpenLogin}
              className="px-4 py-2 rounded-xl border border-white/15 text-sm font-medium hover:bg-white/5"
            >
              Demo login
            </button>
            <button
              type="button"
              onClick={() => setShowTrial(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-sm font-medium"
            >
              Start free trial
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10 space-y-16">
        <section className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 text-blue-200 text-xs font-medium mb-5">
              <PlayCircle size={14} />
              Public site + trial onboarding + tenant workspace
            </div>

            <h1 className="text-4xl md:text-5xl font-bold leading-tight text-balance">
              Launch a fleet tracking SaaS that feels ready on day one.
            </h1>

            <p className="text-lg text-slate-300 mt-4 max-w-2xl">
              Built for rental, transport, logistics, and delivery operators who need live
              tracking, zones, alerts, maintenance, and account-level billing in one product.
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-7">
              <button
                type="button"
                onClick={() => setShowTrial(true)}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 font-semibold"
              >
                Create trial workspace
                <ArrowRight size={17} />
              </button>
              <button
                type="button"
                onClick={onOpenLogin}
                className="px-5 py-3 rounded-2xl border border-white/15 font-semibold hover:bg-white/5"
              >
                Open demo account
              </button>
            </div>

            <div className="grid sm:grid-cols-3 gap-3 mt-8">
              <Bullet text="Trial signup creates a company tenant and admin account." />
              <Bullet text="Master mode manages companies, plans, and feature access." />
              <Bullet text="Company workspaces open directly into the live fleet app." />
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-2xl shadow-black/25">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">
              SaaS launch slice
            </div>
            <h2 className="text-2xl font-bold mt-3">From public page to active workspace</h2>
            <p className="text-sm text-slate-400 mt-2">
              This demo now covers the front door, signup flow, pricing story, tenant
              creation, and the actual in-product experience.
            </p>

            <div className="grid grid-cols-2 gap-3 mt-6">
              <MetricCard value={`${companyTemplates.length}`} label="Business templates" />
              <MetricCard value={`${Object.keys(planCatalog).length}`} label="Software plans" />
              <MetricCard value="2" label="Device packages" />
              <MetricCard value="1 click" label="Demo access" />
            </div>

            <div className="rounded-2xl bg-slate-950/70 border border-white/8 p-4 mt-6">
              <div className="text-sm font-semibold">Best first path</div>
              <div className="text-sm text-slate-400 mt-1">
                Start a free trial, choose the closest template, and then refine pricing and
                modules from the master dashboard.
              </div>
            </div>
          </div>
        </section>

        <section>
          <SectionHeader
            title="Core product value"
            desc="The fastest way to explain what this SaaS already does."
          />
          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
            {highlights.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="rounded-2xl border border-white/10 bg-slate-900/60 p-5"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-300 flex items-center justify-center mb-4">
                  <Icon size={18} />
                </div>
                <div className="font-semibold">{title}</div>
                <div className="text-sm text-slate-400 mt-2">{desc}</div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <SectionHeader
            title="Start with the right business template"
            desc="Each template chooses a recommended plan and feature mix so setup feels lighter."
          />
          <div className="grid md:grid-cols-2 gap-4">
            {companyTemplates.map((template) => (
              <div
                key={template.id}
                className="rounded-2xl border border-white/10 bg-slate-900/60 p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-lg font-semibold">
                      <span className="text-2xl">{template.icon}</span>
                      <span>{template.name}</span>
                    </div>
                    <div className="text-sm text-slate-400 mt-2">{template.description}</div>
                  </div>
                  <div className="text-xs px-3 py-1 rounded-full bg-blue-500/15 text-blue-200 whitespace-nowrap">
                    {template.recommendedPlan}
                  </div>
                </div>

                <div className="mt-4 text-sm text-slate-300">
                  Includes {template.defaultFeatures.length} core modules by default.
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <SectionHeader
            title="Simple software pricing"
            desc="Plan pricing stays separate from hardware and yearly tracking services."
          />
          <div className="grid md:grid-cols-3 gap-4">
            {Object.entries(planCatalog).map(([plan, meta]) => {
              const featured = plan === 'Pro'
              return (
                <div
                  key={plan}
                  className={`rounded-2xl border p-5 ${
                    featured
                      ? 'border-blue-500 bg-blue-950/40 shadow-lg shadow-blue-950/25'
                      : 'border-white/10 bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-xl font-semibold">{plan}</div>
                    {featured && (
                      <div className="text-[11px] uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-500 text-white">
                        Popular
                      </div>
                    )}
                  </div>
                  <div className="mt-4 text-3xl font-bold">
                    {meta.monthlyFee}
                    <span className="text-base text-slate-400 ml-1">SAR/mo</span>
                  </div>
                  <div className="text-sm text-slate-400 mt-2">
                    Up to {meta.vehicleLimit} vehicles before moving up a tier.
                  </div>
                  <div className="mt-5 space-y-2 text-sm text-slate-300">
                    <PlanBullet text="Tenant billing stays visible at account level." />
                    <PlanBullet text="Hardware is quoted separately per vehicle." />
                    <PlanBullet text="Feature access can be adjusted per company." />
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <section>
          <SectionHeader
            title="What the first rollout looks like"
            desc="A short path from signup to something a design partner can actually use."
          />
          <div className="grid md:grid-cols-3 gap-4">
            {launchSteps.map((step) => (
              <div
                key={step.title}
                className="rounded-2xl border border-white/10 bg-slate-900/60 p-5"
              >
                <div className="font-semibold">{step.title}</div>
                <div className="text-sm text-slate-400 mt-2">{step.desc}</div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {showTrial && (
        <TrialSignupModal
          onClose={() => setShowTrial(false)}
          onCreateTrial={onCreateTrial}
        />
      )}
    </div>
  )
}

function SectionHeader({ title, desc }) {
  return (
    <div className="mb-5">
      <h2 className="text-2xl font-bold">{title}</h2>
      <p className="text-slate-400 mt-2 max-w-2xl">{desc}</p>
    </div>
  )
}

function Bullet({ text }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-slate-300 flex items-start gap-2">
      <CheckCircle2 size={16} className="text-emerald-400 mt-0.5 shrink-0" />
      <span>{text}</span>
    </div>
  )
}

function MetricCard({ value, label }) {
  return (
    <div className="rounded-2xl bg-slate-800/90 border border-white/8 p-4">
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider">{label}</div>
    </div>
  )
}

function PlanBullet({ text }) {
  return (
    <div className="flex items-start gap-2">
      <CheckCircle2 size={15} className="text-emerald-400 mt-0.5 shrink-0" />
      <span>{text}</span>
    </div>
  )
}

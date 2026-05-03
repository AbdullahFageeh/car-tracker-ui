import { useState, useMemo } from 'react'
import { X, Share2, Copy, Check, Clock, Eye } from 'lucide-react'

// Generate a fake share token (in real backend this comes from API)
function makeToken() {
  return Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 6)
}

export default function ShareTripModal({ vehicle, onClose }) {
  const [duration, setDuration] = useState('24h')
  const [showSpeed, setShowSpeed] = useState(true)
  const [showDriver, setShowDriver] = useState(false)
  const [generated, setGenerated] = useState(false)
  const [copied, setCopied] = useState(false)

  const token = useMemo(() => makeToken(), [vehicle.id])
  const url = `https://track.example.com/share/${token}`

  const handleGenerate = () => setGenerated(true)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignore
    }
  }

  const expiryLabel = {
    '1h': '1 hour',
    '24h': '24 hours',
    '7d': '7 days',
    'rental': 'End of current rental',
  }[duration]

  return (
    <div className="fixed inset-0 z-[1000] bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 text-purple-700 rounded-xl flex items-center justify-center">
              <Share2 size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Share Live Location</h2>
              <div className="text-xs text-slate-500">{vehicle.plate} — {vehicle.name}</div>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {!generated ? (
            <>
              <p className="text-sm text-slate-600">
                Create a public link to share this car's live location. Anyone with the link can view —
                no login needed.
              </p>

              {/* Duration */}
              <div>
                <Label>Link expires after</Label>
                <div className="grid grid-cols-2 gap-2 mt-1.5">
                  {[
                    { id: '1h', label: '1 hour' },
                    { id: '24h', label: '24 hours' },
                    { id: '7d', label: '7 days' },
                    { id: 'rental', label: 'End of rental' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setDuration(opt.id)}
                      className={`py-2 px-3 rounded-xl border text-sm font-medium transition-colors ${
                        duration === opt.id
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* What to show */}
              <div>
                <Label>Show in shared view</Label>
                <div className="space-y-2 mt-2">
                  <Toggle label="Live location on map" value={true} disabled />
                  <Toggle label="Current speed" value={showSpeed} onChange={setShowSpeed} />
                  <Toggle label="Driver name" value={showDriver} onChange={setShowDriver} />
                </div>
              </div>

              <button
                onClick={handleGenerate}
                className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium flex items-center justify-center gap-2"
              >
                <Share2 size={16} /> Generate Share Link
              </button>
            </>
          ) : (
            <>
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-start gap-2">
                <Check className="text-green-600 mt-0.5" size={18} />
                <div>
                  <div className="text-sm font-semibold text-green-900">Link is ready!</div>
                  <div className="text-xs text-green-700">
                    Expires in {expiryLabel.toLowerCase()}.
                  </div>
                </div>
              </div>

              {/* URL display */}
              <div>
                <Label>Shareable URL</Label>
                <div className="mt-1.5 flex gap-2">
                  <input
                    readOnly
                    value={url}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-xl text-sm bg-slate-50 font-mono"
                    onFocus={(e) => e.target.select()}
                  />
                  <button
                    onClick={handleCopy}
                    className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-1.5 text-sm font-medium"
                  >
                    {copied ? (
                      <>
                        <Check size={14} /> Copied
                      </>
                    ) : (
                      <>
                        <Copy size={14} /> Copy
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="bg-slate-50 rounded-xl p-3 space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-slate-500" />
                  Expires after {expiryLabel.toLowerCase()}
                </div>
                <div className="flex items-center gap-2">
                  <Eye size={14} className="text-slate-500" />
                  Visible: location{showSpeed ? ', speed' : ''}{showDriver ? ', driver' : ''}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setGenerated(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-medium hover:bg-slate-50"
                >
                  Create another
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium"
                >
                  Done
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function Label({ children }) {
  return <div className="text-xs font-medium text-slate-700 uppercase tracking-wide">{children}</div>
}

function Toggle({ label, value, onChange, disabled }) {
  return (
    <button
      onClick={() => !disabled && onChange(!value)}
      disabled={disabled}
      className={`w-full flex items-center justify-between p-3 rounded-xl border transition-colors ${
        disabled
          ? 'border-slate-200 bg-slate-50 cursor-not-allowed'
          : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      <span className="text-sm text-slate-700">{label}</span>
      <span
        className={`w-10 h-5 rounded-full relative transition-colors ${
          value ? 'bg-purple-500' : 'bg-slate-300'
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

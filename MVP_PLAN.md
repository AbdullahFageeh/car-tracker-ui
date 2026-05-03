# Car Tracker UI — MVP Plan

A simplified, rental-company-focused fleet tracking dashboard.
Inspired by Navixy / Pilot, but designed specifically for car rental businesses.

---

## 🎯 Positioning

> Navixy is built for fleets. We're built for **car rentals**.
> Customers, contracts, rental days, revenue — all built in.

That's our selling point. We don't try to match Navixy feature-for-feature.
We are simpler, cleaner, and rental-focused.

---

## ✅ The 10 Original Features Required

1. Tracking
2. Zones / restrictions
3. Safe car deactivation
4. Reckless driving alert
5. Overview of all active cars on map
6. Security (login + roles)
7. Database
8. Mileage calculator per car
9. Car ON/OFF indicator
10. Live speed tracker

## ➕ Additional Features (Abdullah's ideas)

- Country-wide vs city-wide zones (some cars travel anywhere, others city-only)
- Accident reports / alerts
- Oil change / maintenance reminders
- Rental history per car (who, when, how long, $$$)
- Customer database (CRM)

---

## 🧱 The 8 Core Modules of the MVP

| # | Module | Description | Maps to features |
|---|---|---|---|
| 1 | 🔐 Auth & Users | Login, sessions, roles | #6 security |
| 2 | 🛰️ Vehicles | Vehicle list + map + cards | #1, #5, #9, #10 |
| 3 | 📍 Tracking & History | Live position, route playback | #1, #8 |
| 4 | 🛡️ Zones | Geofences, draw, assign cars | #2 |
| 5 | 🚨 Rules & Alerts | Speeding, accident, outside zone, reckless | #4, accident report |
| 6 | 🛢️ Maintenance | Oil change, service, overdue badges | oil change |
| 7 | 📋 Rentals (CUSTOM) | Customer DB + rental records + revenue | rental history |
| 8 | ⚡ Live Updates | Cars move on map, real-time speeds | brings to life |

---

## ❌ NOT in MVP (later phases)

- Fuel sensors / fuel management
- Employee / field service / dispatch
- Tasks & schedules (delivery use case)
- Detailed sensor data (raw IoT)
- Billing / subscriptions
- Dealer / admin panel
- Advanced custom reports

---

## 📱 Final Screen List (priority order)

| # | Screen | Status |
|---|---|---|
| 1 | 🔐 Login | ✅ |
| 2 | 🗺️ Main Dashboard | ✅ |
| 3 | 🚗 Vehicle Detail (Live + Rentals tabs) | ✅ |
| 4 | 🛡️ Zones page | ✅ |
| 5 | 🚨 Alerts panel | ✅ |
| 6 | 🛢️ Maintenance | ✅ |
| 7 | 👥 Customers list (CRM) | ✅ |
| 8 | 📋 All Rentals overview | ⏳ later |
| 9 | ⏪ Track playback | ⏳ later |
| 10 | ⚙️ Settings / Users | ⏳ later |

---

## 🛠️ Tech Stack

- **React** (Vite) — UI framework
- **Tailwind CSS** — styling
- **Leaflet + react-leaflet** — map
- **Lucide React** — icons
- All data is currently fake (mock data in `src/data/`)
- Backend team will replace mock data with real Navixy-style API calls

---

## 🗂️ Project Structure

```
src/
├── App.jsx              # Main app shell
├── data/
│   ├── vehicles.js      # Fake vehicle list
│   ├── zones.js         # Fake geofences + helper functions
│   ├── customers.js     # Fake customer DB
│   ├── rentals.js       # Fake rental history
│   └── alerts.js        # Fake alerts/notifications
├── components/
│   ├── Sidebar.jsx          # Left sidebar (vehicles + zones tabs)
│   ├── VehicleDetail.jsx    # Right panel with Live + Rentals tabs
│   ├── AlertsPanel.jsx      # Notifications drawer
│   ├── MaintenancePanel.jsx # Oil change / service reminders
│   ├── CustomersPage.jsx    # CRM
│   ├── Login.jsx            # Auth screen
│   └── TopBar.jsx           # Top navigation
└── hooks/
    └── useLiveMovement.js   # Simulates cars moving in real-time
```

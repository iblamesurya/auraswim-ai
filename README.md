# AuraSwim AI: Competitive Swimmer Biomechanics, SMR & Vision Hub

> **A mobile-first, client-side AI web application engineered for competitive swimmers, coaches, and sports scientists.** Seamlessly integrates **Self-Myofascial Release (SMR) injury prevention**, **real-time phone camera biomechanical analysis**, and **training load periodization (ACWR)**.

---

## 🌟 Key Features

### 1. 📱 Camera-Integrated Computer Vision (Mobile & Desktop)
* **Streamline & Shoulder Flexion Test:** Measures active overhead reach angle ($180^\circ$ vertical benchmark) and thoracic mobility to detect tight lats before water entry.
* **Early Vertical Forearm (EVF) Catch Analyzer:** Detects elbow flexion angle ($100^\circ - 125^\circ$ optimal anchor) vs. dropped elbow using live webcam or uploaded stroke video clips.
* **Bilateral Arm Pull Asymmetry:** Analyzes left vs. right arm pull cycle duration to identify unilateral shoulder overuse from breathing bias.

### 2. 🧘 Interactive Self-Myofascial Release (SMR) Guide
* Authored from **Coach Deniz Hekmati’s sports science protocols** (Swimming World Magazine).
* Built-in interactive countdown timer with **audio chimes (Web Audio API)** and real-time **Contract-Relax cues** (3s tension, 10s melt).
* Covers **Pec Minor**, **Subscapularis / High Lat**, **Thoracic Spine**, **Plantar Fascia**, and **Calves / Achilles**.

### 3. 📅 3-Phase Daily Swimmer Workflow
* **Phase 1: Pre-Swim Activation (5–8 min):** Deck/locker room readiness check, fast SMR, and 30-sec streamline camera check.
* **Phase 2: In-Pool & Split Check (2–3 min):** Stroke rate vs. distance per stroke (DPS), SWOLF efficiency calculator, and EVF video catch check.
* **Phase 3: Evening Soft-Tissue Recovery (10 min):** Restorative foam rolling, daily yardage logging, and ACWR injury risk monitoring.

### 4. 📊 Training Load Periodization & ACWR Model
* **Gabbett Sports Science ACWR Engine:** Compares recent 7-day acute volume against the 28-day chronic baseline.
* Real-time visual gauge identifying the **"Sweet Spot" (0.8–1.3)** vs. **"Danger Zone" (>1.5)** to prevent "swimmer’s shoulder" tendinopathy.

### 5. 🤖 AI Swimmer Intelligence Query Hub
* Interactive assistant indexed with **100 peer-reviewed swimming research studies** and clinical protocols.
* Ready-to-try query scenarios on shoulder pinching, stroke tempo optimization, workout surges, and meet warm-up routines.

---

## 🛠️ Technology Stack

* **Frontend:** React 19 + TypeScript + Vite
* **Styling:** Tailwind CSS v4 (Mobile-responsive, dark aquatic theme)
* **Icons:** Lucide React
* **Unit Testing:** Vitest + React Testing Library + jsdom
* **CI/CD:** GitHub Actions (`.github/workflows/ci-cd.yml`)

---

## 🚀 Quick Start Guide

### Prerequisites
* Node.js 18+ (tested on Node v20/v24)
* npm 9+

### 1. Installation
```bash
git clone https://github.com/iblamesurya/auraswim-ai.git
cd auraswim-ai
npm install
```

### 2. Development Server
```bash
npm run dev
```
Open `http://localhost:5173` on desktop or your phone via local Wi-Fi IP.

### 3. Running Unit Tests
```bash
npm test
```
Executes 15 comprehensive unit tests covering:
* 3-point joint angle math & Early Vertical Forearm detection
* Streamline alignment and active shoulder flexion formulas
* Acute-to-Chronic Workload Ratio (ACWR) and injury probability zones
* Stroke rate (spm), Distance Per Stroke (m), velocity (m/s), and SWOLF

### 4. Production Build
```bash
npm run build
```

---

## 🔄 CI/CD Pipeline

The automated GitHub Actions workflow (`.github/workflows/ci-cd.yml`) executes on every `push` and `pull_request`:
1. **Typecheck & Test:** Runs `tsc -b` and `vitest run` on Ubuntu runners.
2. **Build:** Compiles the optimized production bundle with gzip compression.
3. **Artifact Upload:** Packages production assets ready for deployment.

---

## 📚 Sports Science Citations & Reference
* Hekmati, D. *Swimmer Strength Tech Tip: Self-Myofascial Release*, Swimming World Magazine.
* Gabbett, T. J. *The training—injury prevention paradox: should athletes be training smarter and harder?* British Journal of Sports Medicine.
* Foster, C. et al. *A new approach to monitoring exercise training*. Journal of Strength and Conditioning Research.
* Mooney, R. et al. *Convolutional neural networks for swimming race analyses*. Sports Biomechanics.

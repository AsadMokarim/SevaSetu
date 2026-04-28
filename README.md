# 🌉 SevaSetu: Decentralized Disaster & Social Relief Orchestrator

**Bridging the gap between ground-level needs and volunteer action through Trust-based Decentralization and AI Matching**

🌐 **Live Demo:** https://sevasetu-1ed86.web.app/

---

## 🚀 The Problem

In disaster and social relief, seconds save lives. Current systems suffer from:

* **Centralized Bottlenecks:** Admin approval delays critical reports
* **Data Noise:** Difficult to verify truth during chaos
* **Inefficient Matching:** Volunteers lack a real-time “Digital Dispatcher”

---

## ✨ Our Solution: SevaSetu

SevaSetu is a **self-orchestrating platform** that empowers communities to verify data and automates volunteer logistics in real time.

---

## 🌟 Key Innovations

### 🛡️ Decentralized Verification

* Reports go live instantly
* Community-driven verification via **Confidence Score algorithm**
* Crowd validation replaces admin bottlenecks

---

### 📸 Visual AI Intake

* Upload handwritten notes or images
* OCR pipeline extracts structured needs automatically
* Supports real-world chaotic input

> ⚠️ *Note: For demo stability, OCR may run in mocked mode if external APIs are not configured. Full pipeline supports Google Vision + Tesseract.*

---

### 🤖 Emergency Matching Engine

A weighted algorithm acting as a **24/7 digital dispatcher**:

* **Skill Score (40%)**
* **Availability (20%)**
* **Trust Score (20%)**
* **Proximity (20%)**

🔥 Emergency Mode prioritizes *availability over distance*

---

## 🛠️ Tech Stack

### 🎨 Frontend

* React (Vite)
* Material UI (MUI)
* Tailwind CSS
* Leaflet + OpenStreetMap

---

### ⚙️ Backend

* Node.js + Express (deployed on Render)
* REST API architecture

---

### 🔥 Firebase (Core Infrastructure)

* Firestore → real-time database
* Firebase Auth → authentication
* Firebase Hosting → frontend deployment
* Firebase Cloud Messaging (planned)

---

### 🤖 AI & Image Processing

* Google Cloud Vision *(production-ready, optional in demo)*
* Tesseract.js *(fallback OCR)*
* Sharp *(image preprocessing)*

---

## 📍 Core Features

### 🔍 Smart Visual Intake

* Extracts data from handwritten or image-based reports
* Auto-enhancement improves OCR accuracy

---

### 🛡️ Trust & Reputation System

* Confidence scoring based on history
* Crowd verification (Verify / Flag)
* Gamified volunteer performance tracking

---

### 🤖 AI Matching Engine

* Intelligent volunteer assignment
* Prevents overload
* Optimizes response time

---

### 📊 Admin Command Center

* Real-time heatmap of crisis zones
* Alerts when tasks fail to match volunteers

---

## 🌍 Deployment

### 🚀 Frontend

Hosted on **Firebase Hosting**

```bash
npm run build
firebase deploy --only hosting
```

---

### ⚙️ Backend

Hosted on Render as a Web Service

* Root Directory: `backend`
* Start Command: `npm start`

---

### 🔐 Environment Variables (Backend)

```env
NODE_ENV=production
ADMIN_EMAILS=your-email@example.com

# Firebase Admin (JSON as single line)
FIREBASE_SERVICE_ACCOUNT={your_json_here}

# Google Vision (optional)
VISION_API_KEY={your_json_here}
```

---

### 🌐 Frontend Environment

```env
# Local
VITE_API_URL=http://localhost:5000/api

# Production
VITE_API_URL=https://your-backend.onrender.com/api
```

---

## ⚙️ Local Setup

### 📋 Prerequisites

* Node.js (v18+)
* Firebase account
* Google Cloud project (optional for OCR)

---

### 🧩 Installation

```bash
git clone https://github.com/asadmokarim/SevaSetu.git
cd SevaSetu
```

---

### Backend

```bash
cd backend
npm install
npm run dev
```

---

### Frontend

```bash
cd ../frontend
npm install
npm run dev
```

---

## 📈 Future Roadmap

* 🧠 AI-based crisis prediction
* 🚚 NGO logistics clustering
* 🌍 Multi-language OCR support
* 📱 Offline-first mobile app

---

## 🏆 Hackathon Context

SevaSetu solves the **Information Gap in Relief Work** by combining:

* Real-time data flow
* AI-driven decision making
* Community-powered verification

👉 Built to demonstrate how scalable, decentralized systems can **save lives in critical moments**

---

## 👥 Team

**SevaSetu**

Mohammad Asad Mokarim  - Team Lead
Mohammad Arham
Safiullah

---

## 📄 License

MIT License

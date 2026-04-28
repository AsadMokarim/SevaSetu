# 🌉 SevaSetu: Decentralized Disaster & Social Relief Orchestrator

> **Bridging the gap between ground-level needs and volunteer action through Trust-based Decentralization and AI Matching.**

[![Built with Firebase](https://img.shields.io/badge/Built%20with-Firebase-FFCA28?logo=firebase&logoColor=white)](https://firebase.google.com/)
[![Powered by Google Vision](https://img.shields.io/badge/AI-Google%20Vision-4285F4?logo=google-cloud&logoColor=white)](https://cloud.google.com/vision)
[![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

---

## 🚀 The Problem
In disaster and social relief, **seconds save lives**. Current systems suffer from:
- **Centralized Bottlenecks**: Admin approval queues stop reports from going live when needed most.
- **Data Noise**: Hard to verify the truth in the chaos of a disaster.
- **Inefficient Matching**: Volunteers are ready but lack a "Digital Dispatcher" to tell them where to go.

## ✨ Our Solution: SevaSetu
SevaSetu is a **self-orchestrating** platform that empowers the community to verify data and automates the logistics of volunteering.

### 🌟 Key Innovations
1. **Decentralized Verification**: Reports go live instantly. The community (Volunteers) verifies/flags them via a **Confidence Score** algorithm.
2. **Visual AI Intake**: Upload a handwritten note or a photo of a situation; our OCR pipeline (Google Vision) extracts the needs automatically.
3. **Emergency Matching Engine**: A weighted scoring algorithm that acts as a 24/7 digital dispatcher, matching volunteers by Skill, Location, Availability, and Trust.

---

## 🛠️ Tech Stack & Google Cloud Usage

### **Frontend**
- **React (Vite)**: Ultra-fast, responsive UI.
- **Material UI (MUI)**: Premium, accessible design components.
- **Tailwind CSS**: Modern utility-first styling.
- **Leaflet & OpenStreetMap**: Real-time geo-visualization and heatmap.

### **Backend & AI**
- **Node.js & Express**: Scalable API architecture.
- **Google Cloud Vision**: Enterprise-grade OCR for handwritten report extraction.
- **Sharp & Tesseract.js**: Advanced image preprocessing and fallback OCR.

### **🔥 Google Firebase (The Backbone)**
- **Firestore**: Real-time database for live map updates and notification syncing.
- **Firebase Auth**: Secure, frictionless identity management.
- **Firebase Cloud Messaging (FCM)**: Real-time push notifications for volunteers.
- **Firebase Hosting**: High-speed global content delivery.

---

## 🧠 Core Features in Detail

### 1. 🔍 Smart Visual Intake
Don't have time to type? Just snap a photo.
- **Handwriting Support**: Extracts text from rough notes using Google Vision.
- **Auto-Correction**: Deskews and cleans images before processing to maximize accuracy.

### 2. 🛡️ Trust & Reputation (Decentralized Verification)
- **Confidence Scoring**: Reports are weighted by the reporter's past performance.
- **Crowd-Voting**: Volunteers "Verify" or "Flag" reports. High-trust reports trigger auto-assignment.
- **Gamified Impact**: Volunteers earn `PerformanceScore` for successful missions.

### 3. 🤖 AI-Weighted Matching Engine
Matches are computed based on:
- **Skill Score (40%)**: Medical, Logistics, Driving, etc.
- **Availability (20%)**: Prevents overloading the same volunteers.
- **Trust Score (20%)**: Prioritizes proven responders.
- **Proximity (20%)**: Minimizes response time.
- **Emergency Mode**: Automatically prioritizes **Who is available NOW** over location when things get critical.

### 📍 Admin Command Center & Heatmap
- **Density Visualization**: See where crises are clustering in real-time.
- **Failure Alerting**: System alerts admins if a critical task fails to find volunteers, allowing for immediate intervention.

---

## 🚀 Getting Started

### 📋 Prerequisites
- Node.js (v18+)
- Firebase Account
- Google Cloud Project (for Vision API)

### ⚙️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/asadmokarim/SevaSetu.git
   cd SevaSetu
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file:
   ```env
   PORT=5000
   FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
   ADMIN_EMAILS=your-admin@email.com
   GOOGLE_APPLICATION_CREDENTIALS=./config/vision-key.json
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   ```
   Create a `.env` file:
   ```env
   VITE_FIREBASE_API_KEY=your_key
   VITE_FIREBASE_AUTH_DOMAIN=your_domain
   VITE_FIREBASE_PROJECT_ID=your_id
   VITE_API_URL=http://localhost:5000/api
   ```

4. **Run the Project**
   - Backend: `npm run dev`
   - Frontend: `npm run dev`

---

## 📈 Future Roadmap
- **AI Clustered Logistics**: Grouping tasks for efficient NGO routes.
- **Predictive Crisis Mapping**: Using historical data to forecast social needs.
- **Multi-lingual Support**: Regional language OCR for deeper penetration in rural India.

---

## 🏆 Hackathon Context
**SevaSetu** was designed to solve the **"Information Gap"** in relief work. It showcases the power of **Google Cloud's AI** and **Firebase's Real-time capabilities** to create a scalable, life-saving infrastructure.

**Team**: [Your Team Name]  
**Category**: Social Impact / AI for Good  

---
*Developed with ❤️ for the Google Gemini / AI Hackathon.*

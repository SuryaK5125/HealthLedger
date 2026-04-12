# HealthLedger

A family health record manager built with React and Firebase. Store and organize medical documents, track medications per family member, and manage upcoming appointments — all in one place.

---

## Features

- **Google Authentication** — sign in with a single click, no passwords
- **Family Profiles** — create profiles for each family member with DOB, gender, and blood group
- **Medication Tracking** — log medications per profile with dosage, frequency, and date range; toggle between current and history views
- **Medical Records** — upload prescriptions, test results, and vaccination documents via Cloudinary
- **Appointments** — schedule and view upcoming appointments with doctor, specialty, location, and notes
- **Dashboard** — overview of profiles, recent uploads, upcoming reminders, and next appointment

---

## Tech Stack

React, Firebase Firestore, Firebase Auth, Cloudinary, React Router

---

## Run locally

```bash
git clone https://github.com/SuryaK5125/healthledger.git
cd healthledger
npm install
```

Create a `.env` file in the root:

```
REACT_APP_FIREBASE_API_KEY=your_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

Then:

```bash
npm start
```

---

## Project structure

```
src/
├── components/
│   ├── Navbar.jsx
│   ├── RecordsList.jsx
│   └── UploadForm.jsx
├── context/
│   └── AuthContext.jsx
├── pages/
│   ├── Appointments.jsx
│   ├── Dashboard.jsx
│   ├── Login.jsx
│   ├── ProfileDetail.jsx
│   └── Profiles.jsx
├── App.js
├── firebase.js
└── index.css
```

---

*Built by [Surya Kalimuthu](https://github.com/SuryaK5125)*

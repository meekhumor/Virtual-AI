<h1 align="center">
  <br>
  <b>Virtual Interviewer</b>
  <br>
</h1>

<p align="center">
  <a href="https://usevirtual-ai.vercel.app">
    <img src="https://img.shields.io/badge/Live_Website-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Website" />
  </a>
  <a href="https://virtual-ai-iimu.onrender.com">
    <img src="https://img.shields.io/badge/Backend-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white" alt="Backend" />
  </a>
  <a href="https://github.com/meekhumor/virtual_interviewer">
    <img src="https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub" />
  </a>
</p>

<p align="center">
  <img src="https://github.com/user-attachments/assets/ef9fff91-264b-4029-993c-1c353f7cb78b" width="550" alt="Virtual AI Banner" />
</p>

---

## Overview

**Virtual AI** full stack platform that simulates realistic job interviews using real time voice, text, video, and code evaluation. Powered by an intelligent **LangGraph ReAct agent** with **Google Gemini**, Virtual AI dynamically adapts its questions based on your uploaded resume, selected job level, and interview mode.Also candidates receive immediate feedback, spoken questions via speech synthesis, and post interview analytics.

---

## Table of Contents

- [Features](#-features)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Database Schema](#-database-schema)
- [Project Setup](#-project-setup)
  - [Backend Setup](#1-backend-setup)
  - [Frontend Setup](#2-frontend-setup)
- [Live Links](#-live-links)
- [Team Members & Mentors](#-team-members--mentors)
- [Screenshots Showcase](#-screenshots-showcase)

---

## Features

- **Real Time Voice & Speech Interaction**: Hands-free speech-to-text (STT) transcription and automated speech synthesis (TTS) for natural, conversational interviews.
- **LangGraph ReAct AI Agent**: Context-aware AI interviewer that dynamically formulates targeted follow-up questions, evaluates technical accuracy, and scores candidate turns in real time.
- **Zero Downtime LLM Failover**: Primary LLM integration with **Google Gemini**, automatically failing over to **Llama-3.3-70B** without breaking active sessions.
- **Resume PDF Parsing & Context Injection**: Extracts resume text via `pdfplumber` and injects up to 3,000 characters of background context into the AI agent prompt.
- **Customizable Settings & Modes**: Supports Entry, Intermediate, and Senior experience levels with distinct evaluation modes.
- **Post Interview Analytics**: Evaluates overall, technical, communication, and confidence scores alongside word pace (WPM), filler word frequency, power words, strengths, and gives tips based on it.

---

## System Architecture

---

## Tech Stack

| Category | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide React, Monaco Editor, SpeechRecognition API |
| **Backend** | Python, Django, Django REST Framework |
| **AI / NLP Agent** | LangGraph ReAct Framework, LangChain, Google Gemini, Llama-3.3-70B |
| **Auth & Storage** | Supabase Auth (JWT), Supabase Storage Buckets (`resumes`, `profile-images`, `videos`) |
| **Database** | PostgreSQL (Supabase) & Django ORM) |
| **PDF Processing** | `pdfplumber` |

---

## Database Schema

<p align="center">
  <img width="500" alt="Database Schema Diagram" src="https://github.com/user-attachments/assets/a48a3bf4-3433-433b-8bb2-928e05c6c644" />
</p>

---

## Project Setup

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create & activate a virtual env
python -m venv venv
source venv/bin/activate  

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Start backend server
python manage.py runserver
```

> **Note**: Environment variables (`.env`) should contain: `SUPABASE_URL`, `SUPABASE_KEY`, `GEMINI_API_KEY`, `GROQ_API_KEY`, `FRONTEND_URL`.

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the server
npm run dev
```

---

## Live Links

- **Hosted Website**: [usevirtual-ai.vercel.app](https://usevirtual-ai.vercel.app)
- **Hosted Backend**: [virtual-ai-iimu.onrender.com](https://virtual-ai-iimu.onrender.com)
- **Demo Video**: [Google Drive Folder](https://drive.google.com/drive/u/0/folders/1px37x2HPjJ5sZkBsWWsPC9VrWcuJcfWN)
- **Screenshots Drive**: [Google Drive Folder](https://drive.google.com/drive/u/0/folders/1IXCwQUXPXyfOV45liRXjdBZev9kLT6cT)

---

## Team Members & Mentors

### Team Members
| Name | Email | GitHub |
| :--- | :--- | :--- |
| **Om Mukherjee** | `om17092004@gmail.com` | [@meekhumor](https://github.com/meekhumor) |
| **Aryan Yadav** | `aryanyadavgr10@gmail.com` | [@Aryan-y-77](https://github.com/Aryan-y-77) |
| **Aman Vatsa** | `amanvatsa13@gmail.com` | [@amanv13](https://github.com/amanv13) |

### Mentors
| Name | Email | GitHub |
| :--- | :--- | :--- |
| **Harshala Mahajan** | `mharshala334@gmail.com` | [@harshala334](https://github.com/harshala334) |
| **Sayali Khandare** | `sayalisayali924@gmail.com` | [@Toppersayali](https://github.com/Toppersayali) |

---

## 📱 Screenshots 
<div style="display: flex; flex-wrap: wrap; gap: 20px;">

### Landing Page  
<img src="https://github.com/user-attachments/assets/a2f55f78-620c-4d89-8f1b-1d6faff9045a" width="700" style="height: auto;"/>

### Interview Settings  
<img src="https://github.com/user-attachments/assets/d2e81305-9a0e-4508-859a-f989943ce143" width="700" style="height: auto;"/>

### Dashboard  
<img src="https://github.com/user-attachments/assets/b390b559-1496-4218-b31e-741523f581e6" width="700" style="height: auto;"/>

### Upload Resume  
<img src="https://github.com/user-attachments/assets/5ef36135-769f-448d-a484-fd40961c63ee" width="700" style="height: auto;"/>

### Review  
<img src="https://github.com/user-attachments/assets/1f492ebd-63c0-4260-ba8b-6a61bcf92fbf" width="700" style="height: auto;"/>

### Feedback  
<img src="https://github.com/user-attachments/assets/cdbdec5f-74e7-4e32-a2ae-392f58ad0f78" width="700" style="height: auto;"/>

### Analysis  
<img src="https://github.com/user-attachments/assets/2a7b13c6-92db-432a-b3ea-70c953e65ea6" width="700" style="height: auto;"/>

### Courses  
<img src="https://github.com/user-attachments/assets/3e8b5c5a-fd04-48e9-a862-6e3b87fa0f2f" width="700" style="height: auto;"/>

### Skill based Interview  
<img src="https://github.com/user-attachments/assets/62cdbf3d-3d98-47f8-b3e4-094b2c69f9aa" width="700" style="height: auto;"/>

### Job based Interview  
<img src="https://github.com/user-attachments/assets/a8c5ffff-4cde-4efa-aa14-e41fdfc1cb98" width="700" style="height: auto;"/>

</div>

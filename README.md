# ⚗️ CodeCure — AI Chemical Toxicity Prediction Platform 🧪

> Advanced AI-powered chemical informatics platform for predicting drug toxicity, analyzing molecular properties, and assessing chemical safety using cutting-edge machine learning models.

![Python](https://img.shields.io/badge/Python-3.14+-blue?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.135+-green?style=for-the-badge&logo=fastapi&logoColor=white)
![RDKit](https://img.shields.io/badge/RDKit-Cheminformatics-purple?style=for-the-badge&logo=molecule&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-Deployed-black?style=for-the-badge&logo=vercel&logoColor=white)

---

## 🎯 Project Overview

CodeCure is an intelligent chemical informatics platform designed to predict and analyze drug toxicity with high accuracy. By analyzing molecular structures (via SMILES notation), chemical descriptors (LogP, molecular weight, hydrogen bond donors/acceptors, etc.), and structural features, it helps researchers and pharmaceutical scientists assess toxicity risks early, offering comprehensive risk scoring alongside explainable AI insights.

---

## 🛠️ Tech Stack & Tools

| Component | Technology |
| --------- | ---------- |
| **Backend Framework** | [FastAPI](https://fastapi.tiangolo.com/) (High-performance Python API) |
| **Machine Learning** | [Scikit-Learn](https://scikit-learn.org/), [NumPy](https://numpy.org/), [Pandas](https://pandas.pydata.org/) |
| **Cheminformatics** | [RDKit](https://www.rdkit.org/) (Molecular descriptor calculation from SMILES) |
| **Database & ORM** | [SQLite](https://sqlite.org/) / [PostgreSQL](https://www.postgresql.org/) + [SQLAlchemy](https://www.sqlalchemy.org/) |
| **Frontend Utilities** | HTML5, CSS3, Vanilla JavaScript, Lucide Icons |
| **Persistence** | Hybrid: Server-side DB + Client-side `LocalStorage` |
| **Deployment** | [Vercel](https://vercel.com/) (Serverless) |

---

## ⚡ Key Features

- 🧪 **Chemical Toxicity Prediction**: Advanced ML models analyze molecular properties and SMILES strings for accurate toxicity assessment.
- 💯 **Toxicity Risk Score**: A 0-100 scoring system for quick chemical risk assessment.
- 🔍 **Explainable AI (XAI)**: Detailed breakdown of which molecular features contribute to toxicity (LogP, molecular weight, aromatic rings, HBD/HBA, etc.).
- 📊 **Molecular Dashboard**: High-level analytics with compound history and molecular property visualization.
- 🧬 **SMILES Processing**: Input molecules via SMILES notation with automatic descriptor calculation using RDKit.
- 💬 **ChemiBot Assistant**: Specialized chatbot for toxicology FAQs, SMILES guidance, and chemical property explanations.
- 📥 **Detailed Reports**: Export comprehensive toxicity assessment reports with molecular analysis as PDF.

---

## 🚀 Deployment (Vercel)

CodeCure is optimized for Vercel deployment using serverless functions.

1. **Database**: Automatically switches to `/tmp/codecure.db` in serverless mode to bypass read-only filesystems.
2. **Persistence**: Implements a `LocalStorage` fallback so your dashboard data survives server resets.
3. **Configuration**: Uses `vercel.json` for seamless FastAPI routing.

### Persistent Storage (Cloud)

To enable shared database storage across all users, connect a **Vercel Postgres** or **Neon DB** through the Vercel dashboard. The system will automatically detect the connection.

---

## 🏗️ Local Installation

```bash
# 1. Clone & Navigate
git clone https://github.com/KGFCH2/CodeCure.git
cd CodeCure

# 2. Environment Setup
cp .env.example .env  # Copy template
# Edit .env and add your GROQ_API_KEY

# 3. Virtual Env
python -m venv venv
source venv/bin/activate  # Or venv\Scripts\activate on Windows

# 4. Dependencies
pip install -r requirements.txt

# 5. Initialize AI
python train_model.py

# 6. Run Server
python -m uvicorn main:app --reload
```

Access at `http://127.0.0.1:8000`.

---

## 📁 Project structure

```text
CodeCure/
├── main.py            # FastAPI service & Chatbot logic
├── database.py        # SQLite/Postgres connection manager
├── vercel.json        # Deployment configuration
├── static/
│   ├── style.css      # Premium Glassmorphism UI
│   ├── script.js      # Core Vanilla JS (Predictions, Dashboard, AI Logic)
│   └── codecure_kb.json # Chatbot Knowledge Base
├── templates/
│   └── index.html     # Single Page Application Shell
└── model/             # Trained AI Models
```

---

## 📜 License & Support

MIT License. Created for the future of intelligent healthcare delivery.

*Built with ❤️ by the CodeCure Team.*

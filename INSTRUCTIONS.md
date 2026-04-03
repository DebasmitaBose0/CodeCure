# ⚗️ CodeCure Chemical Toxicity Prediction — Setup & Deployment Guide 🚀

This document details the setup, training, and deployment processes for the **CodeCure AI Chemical Toxicity Prediction Platform**.

---

## 1. Project Features 🌟

- **Toxicity Prediction**: Real-time chemical toxicity assessment using advanced ML models trained on molecular descriptors.
- **Toxicity Risk Score**: A unique 0-100 metric for instant chemical safety assessment.
- **Explainable AI (XAI)**: Breakdown of molecular features influencing toxicity (LogP, MW, aromatic rings, HBD, HBA, TPSA, etc.).
- **Smart Dashboard**: Analytics dashboard with detailed compound analysis and molecular property visualization.
- **SMILES Input**: Input molecules via SMILES notation for instant toxicity analysis.
- **Molecular Details Modal**: Click a compound in the dashboard to see detailed toxicity breakdown and molecular properties.
- **ChemiBot Assistant**: Specialized chatbot for toxicology FAQs, SMILES format help, and molecular descriptor explanations.
- **Detailed Reports**: Generate comprehensive toxicity assessment reports with molecular analysis for sharing/printing.
- **Optimized Performance**: Core prediction logic separated for faster loading and cleaner code.
- **Hybrid Persistence**: Optimized for serverless; data survives resets via `LocalStorage` + optional PostgreSQL.

---

## 2. Local Environment Setup 🛠️

### Prerequisites

- Python 3.10+
- `venv` (Virtual Environment)

### Installation

1. **Navigate to the project folder**:

   ```bash
   cd CodeCure
   ```

2. **Setup Environment Variables**:

   ```bash
   cp .env.example .env
   ```

   Edit the `.env` file and add your Groq API key:

   ```text
   GROQ_API_KEY=your_actual_groq_api_key_here
   ```

   > **Note**: Get your API key from [Groq Console](https://console.groq.com/keys)

3. **Setup Virtual Environment**:

   ```bash
   python -m venv venv
   source venv/bin/activate  # Or venv\Scripts\activate on Windows
   ```

4. **Install Dependencies**:

   ```bash
   pip install -r requirements.txt
   ```

---

## 3. AI Model Training 🧠

Before running the server, you must train the internal AI models:

```bash
python train_toxicity_model.py
```

- **Inputs**: Toxicity dataset with molecular SMILES strings and toxicity labels (tox21_processed.csv)
- **Outputs**: `model/toxicity_model.pkl`, `toxicity_scaler.pkl`, `toxicity_feature_names.pkl`
- **Logic**: Extracts molecular descriptors from SMILES using RDKit, evaluates multiple classifiers, and picks the most accurate one
- **Molecular Features**: LogP (lipophilicity), MW (molecular weight), HBD (hydrogen bond donors), HBA (hydrogen bond acceptors), TPSA (topological polar surface area), and more

---

## 4. Running Locally 🚀

```bash
python -m uvicorn main:app --reload
```

Open [http://127.0.0.1:8000](http://127.0.0.1:8000) in your browser.

---

## 5. Vercel Deployment Guide ☁️

CodeCure is 100% production-ready for **Vercel**.

### Deployment Steps

1. **Push to GitHub**: Ensure all files including `vercel.json` and the `model/` directory are pushed.
2. **Vercel Project**: Import the repository into Vercel.
3. **Auto-Configuration**: Vercel will detect `main.py` and the Python runtime automatically.

### Database Persistence on Vercel

Because Vercel serverless functions have a read-only filesystem (except `/tmp`), the application follows these rules:

- **Default (Free)**: Uses `/tmp/codecure.db`. Data is stored temporarily and mirrored in your browser's `LocalStorage`.
- **Permanent (Recommended)**: Connect a **Vercel Postgres** database in the Vercel dashboard. The app will automatically detect `POSTGRES_URL` and use it for permanent, shared storage.

---

## 6. ChemiBot Customization 🤖

ChemiBot uses `static/codecure_kb.json` as its knowledge base. To add more chemical/toxicology answers:

1. Open `static/codecure_kb.json`.
2. Add a new object with `keywords`, `question`, and `answer` related to toxicology, SMILES, molecular descriptors, or chemical properties.
3. The chatbot will instantly start recognizing the new keywords.

**Example**:
```json
{
  "keywords": ["SMILES", "structure", "notation"],
  "question": "What is SMILES notation?",
  "answer": "SMILES (Simplified Molecular Input Line Entry System) is a notation for representing molecules as text strings. For example, ethanol is CCO and benzene is c1ccccc1."
}
```

---

## 7. Troubleshooting 🔍

- **Blank PDFs**: Ensure you are using a Chromium-based browser (Chrome, Edge) for the best `html2pdf.js` results.
- **Dashboard Resetting**: If compound data disappears on refresh, ensure your browser allows `LocalStorage`. For permanent storage across devices, use a Vercel Postgres DB.
- **Model Errors**: If toxicity prediction fails, ensure you ran `python train_toxicity_model.py` and that the `model/` folder contains `.pkl` files (`toxicity_model.pkl`, `toxicity_scaler.pkl`, `toxicity_feature_names.pkl`).
- **Invalid SMILES**: The app validates SMILES notation via RDKit. Make sure your input follows valid SMILES rules. Example valid SMILES: `CCO` (ethanol), `CC(C)Cc1ccc(cc1)C(C)C` (ibuprofen).
- **Descriptor Calculation**: If molecular descriptors fail to calculate, check that RDKit is properly installed: `pip install -r requirements.txt`

---

**Happy Analyzing!** 🧪

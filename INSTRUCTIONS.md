# 🏥 CodeCure Setup & AI Chatbot Implementation Guide 🤖

This document contains instructions for setting up, training, and deploying the **CodeCure AI Health-Tech Platform**. It also details how to implement the AI Chatbot feature.

---

## 1. Project Overview & Theme

- **Theme**: Light Mode / Premium Medical Green.
- **Visuals**: Modern Lucide Icons (instead of emojis) for a professional look.
- **Tech Stack**: FastAPI, Scikit-learn, SQLite, Lucide Icons, Vanilla CSS.

---

## 2. Environment Setup 🛠️

### Prerequisites

- **Python 3.10+** 🐍
- **Virtual Environment** (Recommended) 📦

### Installation

1. **Navigate to project folder** 📁:

   ```bash
   cd CodeCure
   ```

2. **Setup Environment** ⚙️:

   ```bash
   python -m venv venv
   venv\Scripts\activate  # Windows
   ```

3. **Install Dependencies** 📥:

   ```bash
   pip install -r requirements.txt
   ```

---

## 3. AI Model Training 🧠

Before deployment, train the machine learning models. The script evaluates multiple classifiers and saves the best performer.

```bash
python train_model.py

```

- Outputs: `model/diabetes_model.pkl`, `model/scaler.pkl`. 💾
- Dataset: Uses `diabetes.csv` or generates synthetic clinical data if missing. 📊

---

## 4. Running for Deployment 🚀

Start the application using Uvicorn:

```bash
python -m uvicorn main:app --host 0.0.0.0 --port 8000

```

- **Local Address**: `http://127.0.0.1:8000` 🌐
- **Dashboard**: Track patient metrics and AI accuracy in real-time. 📈

---

## 5. Implementing the AI Chatbot (Point 3) 💬

To give answers to project-related questions through an AI chatbot, use the **Google Gemini API**.

### Prerequisites

1. **Get API Key** 🔑: Visit [Google AI Studio](https://aistudio.google.com/) and create a free API key.
2. **Install Library** 📚:

   ```bash
   pip install google-generativeai
   ```

### Implementation Steps

1. **Add API Config** ⚙️: Store your key in an `.env` file or environment variable.
2. **Backend Route** 🔗: Add the following to `main.py`:

   ```python
   import google.generativeai as genai

   genai.configure(api_key="YOUR_GEMINI_API_KEY")

   @app.post("/api/chat")
   async def chat(user_message: str):
       model = genai.GenerativeModel("gemini-1.5-flash")
       response = model.generate_content(
           f"You are the CodeCure Medical AI Assistant. Answer this question based on healthcare knowledge: {user_message}"
       )
       return {"response": response.text}
   ```

3. **Frontend Integration** 💻:
   - Add a fixed chat bubble in `index.html`.
   - Use `fetch('/api/chat', ...)` to send messages and display responses.

---

## 6. Icons & Assets 🎨

We transitioned from emojis to **Lucide Icons** for a premium feel.

- **Library**: `https://unpkg.com/lucide@latest` 📖
- **Usage**: `<i data-lucide="activity"></i>` followed by `lucide.createIcons()` in JS. 🛠️

---

## 7. Deployment Checklist ✅

- [x] Model trained and saved in `model/`. 🧠
- [x] Database initialized (`codecure.db`). 🗄️
- [x] Theme updated to Green/Light mode. 🎨
- [x] Emojis replaced with standard icons. 🖼️
- [x] requirements.txt up to date. 📦

---

## 8. License 📄

This project is licensed under the [MIT License](LICENSE). 🔓️

---

## 9. Health Metrics & Calculation Guide 🧬

Understanding how the health parameters used in CodeCure are calculated or measured is essential for accurate clinical prediction.

| Metric 📊 | Description 📝 | How it is Calculated / Measured 🛠️ |
| :--- | :--- | :--- |
| **BMI (Body Mass Index)** | Measures body fat based on height and weight. | **Formula**: `Weight (kg) ÷ [Height (m)]²`. |
| **Glucose** | Concentration of glucose in the blood. | Measured using a **Digital Glucometer**. Fasting values are preferred. |
| **Blood Pressure** | Pressure in the arteries. | Measured with a **BP Cuff**. We use the **Diastolic** (resting) pressure. |
| **Skin Thickness** | Subcutaneous fat thickness. | Measured with **Skin Calipers** on the triceps muscle area. |
| **Insulin** | Hormone regulating glucose. | Requires a **Laboratory Blood Test** (Serum Insulin). |
| **Diabetes Pedigree** | Genetic risk factor. | Calculated based on **Family History** (parents/grandparents with diabetes). |
| **Age** | Patient's chronological age. | Number of years since birth. |
| **Pregnancies** | Clinical history. | Total number of times a female patient has been pregnant. |

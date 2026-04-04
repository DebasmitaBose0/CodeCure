# CodeCure Deployment Guide: Render + Vercel

**Architecture:**

```text
Frontend (Vercel) ↔ API (Render) ↔ GROQ API
```

**Free Tier Benefits:**

- ✅ Vercel: Unlimited deployments, auto-scaling, global CDN
- ✅ Render: 750 hours/month free, auto-sleep after 15 min inactivity
- ✅ GROQ: Free API with rate limits (perfect for demo)

---

## **Part 1: Deploy Backend to Render**

### **Step 1: Prepare Backend for Render**

Your `main.py` already works! Just verify `requirements.txt`:

```text
fastapi==0.104.1
uvicorn[standard]==0.24.0
sqlalchemy==2.0.23
python-dotenv==1.0.0
scikit-learn>=1.3.0,<2.0
numpy
pandas
Jinja2
```

### **Step 2: Push Code to GitHub**

```powershell
# Make sure all changes are committed
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

### **Step 3: Create Render Account**

1. Go to **<https://render.com>**
2. Sign up with GitHub
3. Authorize Render to access your GitHub repos

### **Step 4: Create Web Service on Render**

1. Dashboard → **New +** → **Web Service**
2. **Connect Repository** → Select `CodeCure`
3. Fill in details:
   - **Name:** `codecure-backend`
   - **Environment:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Plan:** Free
4. Click **Create Web Service**

### **Step 5: Add Environment Variables on Render**

1. In Render dashboard, go to your service
2. Click **Environment** tab
3. Add variable:

   ```text
   GROQ_API_KEY = gsk_your_actual_api_key_here
   ```

4. **Save** and service will auto-redeploy

### **Step 6: Get Backend URL**

After deployment (2-5 minutes), you'll see:

```text
Backend URL: https://codecure-backend-8yt5.onrender.com
```

**Copy this URL** - you'll need it for frontend.

---

## **Part 2: Deploy Frontend to Vercel**

### **Step 1: Create Vercel Account**

1. Go to **<https://vercel.com>**
2. Sign up with GitHub
3. **Import Project** → Select `CodeCure`

### **Step 2: Configure Vercel Deployment**

1. **Project Settings:**
   - Framework Preset: **Other**
   - Build Command: (leave empty)
   - Output Directory: `.` (root)
   - Install Command: (leave empty)

2. **Environment Variables:**

   ```text
   BACKEND_URL = https://codecure-backend-8yt5.onrender.com
   GROQ_API_KEY = gsk_your_api_key  (optional, already on Render)
   ```

3. Click **Deploy**

### **Step 3: Get Frontend URL**

After deployment, Vercel shows:

```text
Frontend URL: https://code-cure.vercel.app
```

---

## **Part 2: Test the Integration**

### **Test Backend**

```text
GET https://your-backend-service.onrender.com/
Expected: CodeCure homepage
```

### **Test Frontend**

```text
GET https://code-cure.vercel.app
Expected: CodeCure homepage with working chatbot + predictions
```

### **Test API Connection**

1. Open Frontend: `https://code-cure.vercel.app`
2. Fill prediction form with health metrics
3. Click "Run AI Analysis"
4. Check Results section shows predictions
5. Open DevTools (F12) → Network tab
6. Verify requests go to your Render backend URL

---

## **Part 3: Environment Variables Reference**

### **Render (Backend)**

- `GROQ_API_KEY`: `gsk_xxx` from [Groq Console](https://console.groq.com/keys). Required: yes.
- `DATABASE_URL`: Not set; uses SQLite. Required: no.

### **Vercel (Frontend)**

- `BACKEND_URL`: Your Render backend URL. Required: yes.
- `GROQ_API_KEY`: Optional; already set on Render. Required: no.

**Example:** `BACKEND_URL` should be your Render service URL, e.g., `https://codecure-api-xyz.onrender.com`

### **Local Development (.env)**

```env
GROQ_API_KEY=gsk_your_key_from_groq_console
BACKEND_URL=http://localhost:8000
```

**Note:** The frontend automatically picks up `BACKEND_URL` from environment variables. No code changes needed!

## **Part 4: Custom Domain (Optional)**

### **Add Domain to Render**

1. Render Dashboard → Settings → Domains
2. Add custom domain: `api.yourdomain.com`
3. Update DNS records (Render provides instructions)

### **Add Domain to Vercel**

1. Vercel Dashboard → Settings → Domains
2. Add custom domain: `yourdomain.com`
3. Update DNS records (Vercel provides instructions)

---

## **Part 5: Troubleshooting**

### **Frontend can't reach backend**

**Problem:** CORS errors in console

```text
Access to XMLHttpRequest blocked by CORS policy
```

**Solution:** Check that `BACKEND_URL` is set correctly in Vercel environment variables. The backend automatically allows requests from Vercel's domain.

### **Backend returns 401 (API Key Error)**

**Problem:** GROQ_API_KEY not set on Render
**Solution:**

1. Render Dashboard → Environment → Check variable is set
2. Redeploy service: Click "Manual Deploy"

### **Render service goes to sleep**

**Info:** Free tier auto-sleeps after 15 min inactivity

- First request takes 10-30 seconds (cold start)
- Subsequent requests are fast
- Upgrade to paid tier if needed

---

## **Part 6: Deployment Checklist**

- [ ] Code committed and pushed to GitHub
- [ ] Render backend deployed with GROQ_API_KEY set
- [ ] Backend URL obtained (copy from Render dashboard)
- [ ] Vercel frontend deployed with BACKEND_URL set
- [ ] Frontend URL obtained: `https://code-cure.vercel.app`
- [ ] Tested: Form submission works
- [ ] Tested: Predictions return correctly
- [ ] Tested: Chatbot responds
- [ ] Verified: Chatbot markdown formatting displays correctly

---

## **Part 7: Monitoring & Updates**

### **View Backend Logs**

```text
Render Dashboard → CodeCure Backend → Logs
```

### **View Frontend Logs**

```text
Vercel Dashboard → code-cure → Deployments → Logs
```

### **Auto-Deploy on GitHub Push**

Both Render and Vercel watch your GitHub repository for changes:

```powershell
# Update backend
git push origin main
# → Render auto-deploys in 1-2 minutes

# Update frontend
git push origin main
# → Vercel auto-deploys in 1-2 minutes
```

---

## **Part 8: Performance Tips**

1. **Render:** Upgrade to paid tier to avoid auto-sleep if needed
2. **Vercel:** Free tier is unlimited - no upgrades needed
3. **GROQ API:** Monitor your API usage at <https://console.groq.com/>

---

## **Quick Reference: Common Commands**

```powershell
# Deploy backend changes
git add .
git commit -m "Backend updates"
git push origin main
# → Render auto-deploys

# Test backend locally
python main.py
# → http://localhost:8000

# Test backend API health
curl https://your-backend.onrender.com/api/health
# → Should return: {"status": "healthy", "model_loaded": true}

# Check frontend URL
# → https://code-cure.vercel.app
```

---

**✅ You're all set for production deployment! 🚀**  

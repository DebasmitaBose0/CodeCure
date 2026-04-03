// --------------- CODECURE CORE JAVASCRIPT ---------------
// Handles: Toxicity Predictions, Dashboard Analytics, Chatbot, and PDF Generation

// Initialize Lucide Icons & UI Effects
document.addEventListener("DOMContentLoaded", () => {
    if (typeof lucide !== "undefined") lucide.createIcons();

    // Page Loader logic
    const hideLoader = () => {
        const loader = document.getElementById("page-loader");
        const statusEl = loader ? loader.querySelector(".loader-status") : null;

        if (loader) {
            // Cycle status messages
            if (statusEl) {
                const messages = [
                    "Analyzing Molecular Structures...",
                    "Computing Chemical Descriptors...",
                    "Evaluating Toxicity Assays...",
                    "Generating Safety Profile..."
                ];
                let i = 0;
                const msgInterval = setInterval(() => {
                    if (i < messages.length - 1) {
                        i++;
                        statusEl.style.opacity = "0";
                        setTimeout(() => {
                            statusEl.textContent = messages[i];
                            statusEl.style.opacity = "1";
                        }, 200);
                    } else {
                        clearInterval(msgInterval);
                    }
                }, 600);
            }

            setTimeout(() => {
                loader.classList.add("fade-out");
                setTimeout(() => {
                    loader.style.display = "none";
                }, 600);
            }, 2500);
        }
    };

    if (document.readyState === "complete") {
        hideLoader();
    } else {
        window.addEventListener("load", hideLoader);
    }

    // Navbar scroll effect
    window.addEventListener("scroll", () => {
        const nav = document.getElementById("navbar");
        if (nav) {
            if (window.scrollY > 20) {
                nav.classList.add("scrolled");
                nav.style.borderBottomColor = "rgba(255, 255, 255, 0.1)";
                nav.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.3)";
            } else {
                nav.classList.remove("scrolled");
                nav.style.boxShadow = "none";
            }
        }
    });

    // Initialize components
    updateHomeStats();
    initSlideshows();
    loadKnowledgeBase();

    // Mobile Menu Toggle logic
    const mobileToggle = document.getElementById("mobile-toggle");
    const navMenu = document.getElementById("navbar-nav");

    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener("click", () => {
            navMenu.classList.toggle("active");
            const icon = mobileToggle.querySelector("i");
            if (icon && typeof lucide !== "undefined") {
                const isMenu = icon.getAttribute("data-lucide") === "menu";
                icon.setAttribute("data-lucide", isMenu ? "x" : "menu");
                lucide.createIcons();
            }
        });
    }
});

// ----------------------------------------
// State Management
// ----------------------------------------
let dashboardDataStore = [];
let knowledgeBase = [];

// ----------------------------------------
// Identity & Persistence
// ----------------------------------------

function getDeviceId() {
    const storageKey = "codecure_device_id";
    let id = localStorage.getItem(storageKey);
    if (!id) {
        id = (crypto?.randomUUID ? crypto.randomUUID() : `dev-${Date.now()}-${Math.random().toString(16).slice(2)}`);
        localStorage.setItem(storageKey, id);
    }
    return id;
}

function savePredictionLocally(input, result) {
    try {
        const storageKey = "codecure_toxicity_history";
        let history = JSON.parse(localStorage.getItem(storageKey) || "[]");

        const record = {
            id: Math.floor(Math.random() * 9000) + 1000,
            smiles: input.smiles || "Manual Input",
            mw: result.molecular_properties?.MW || input.mw,
            logp: result.molecular_properties?.LogP || input.logp,
            health_score: result.health_score,
            risk_level: result.risk_level,
            toxicity_risk: result.toxicity_risk,
            created_at: new Date().toISOString()
        };

        history.unshift(record);
        localStorage.setItem(storageKey, JSON.stringify(history.slice(0, 50)));
    } catch (e) { console.error("Local save failed:", e); }
}

function getLocalHistory() {
    try { return JSON.parse(localStorage.getItem("codecure_toxicity_history") || "[]"); }
    catch (e) { return []; }
}

// ----------------------------------------
// Tab Navigation
// ----------------------------------------
function switchTab(tabName) {
    document.querySelectorAll(".tab-content").forEach(el => el.classList.remove("active"));
    document.querySelectorAll(".navbar-nav a").forEach(el => el.classList.remove("active"));

    const tab = document.getElementById("tab-" + tabName);
    if (tab) tab.classList.add("active");

    const navLink = document.querySelector(`.navbar-nav a[data-tab="${tabName}"]`);
    if (navLink) navLink.classList.add("active");

    if (tabName === "dashboard") loadDashboard();
    window.scrollTo({ top: 0, behavior: "smooth" });
}

// ----------------------------------------
// Toast Notifications
// ----------------------------------------
function showToast(message, type = "info", duration = 4000) {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    const icons = { success: "check-circle", error: "x-circle", info: "info" };
    toast.innerHTML = `<i data-lucide="${icons[type] || "info"}"></i><span>${message}</span>`;

    container.appendChild(toast);
    if (typeof lucide !== "undefined") lucide.createIcons();

    setTimeout(() => {
        toast.style.animation = "slideOut 0.3s ease-out forwards";
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// ----------------------------------------
// Prediction Engine
// ----------------------------------------

// Load sample compound data
function loadSample(smiles, name) {
    const smilesInput = document.getElementById("input-smiles");
    const nameInput = document.getElementById("input-name");

    if (smilesInput) {
        smilesInput.value = smiles;
        smilesInput.focus();
    }

    if (nameInput) {
        nameInput.value = name;
    }

    // Clear other optional fields
    const optionalFields = ['input-mw', 'input-logp', 'input-tpsa', 'input-hbd', 'input-hba'];
    optionalFields.forEach(id => {
        const field = document.getElementById(id);
        if (field) field.value = '';
    });

    showToast(`Loaded ${name} sample data`, "info");
}

// Load sample descriptor data
function loadDescriptorSample(mw, logp, tpsa, hbd, hba) {
    const mwInput = document.getElementById("input-mw");
    const logpInput = document.getElementById("input-logp");
    const tpsaInput = document.getElementById("input-tpsa");
    const hbdInput = document.getElementById("input-hbd");
    const hbaInput = document.getElementById("input-hba");

    if (mwInput) mwInput.value = mw;
    if (logpInput) logpInput.value = logp;
    if (tpsaInput) tpsaInput.value = tpsa;
    if (hbdInput) hbdInput.value = hbd;
    if (hbaInput) hbaInput.value = hba;

    // Clear SMILES and name fields
    const smilesInput = document.getElementById("input-smiles");
    const nameInput = document.getElementById("input-name");

    if (smilesInput) smilesInput.value = '';
    if (nameInput) nameInput.value = '';

    showToast(`Loaded descriptor sample data`, "info");
}

async function handlePrediction(event) {
    event.preventDefault();

    const btn = document.getElementById("predict-btn");
    if (!btn) return;
    btn.classList.add("loading");

    const data = {
        smiles: document.getElementById("input-smiles").value.trim() || null,
        mw: parseFloat(document.getElementById("input-mw").value) || null,
        logp: parseFloat(document.getElementById("input-logp").value) || null,
        hbd: parseInt(document.getElementById("input-hbd").value) || null,
        hba: parseInt(document.getElementById("input-hba").value) || null,
        tpsa: parseFloat(document.getElementById("input-tpsa").value) || null,
        num_rot_bonds: parseInt(document.getElementById("input-rotatable").value) || null,
        num_arom_rings: parseInt(document.getElementById("input-aromatic").value) || null,
        num_heavy_atoms: parseInt(document.getElementById("input-heavy").value) || null
    };

    // Strict validation: Require either SMILES OR all key molecular descriptors
    const hasSmiles = data.smiles && data.smiles.length > 0;
    const hasAllDescriptors = data.mw !== null && data.logp !== null && data.tpsa !== null &&
        data.hbd !== null && data.hba !== null;

    if (!hasSmiles && !hasAllDescriptors) {
        showToast("Please provide either a SMILES string OR fill in all molecular descriptors (MW, LogP, TPSA, H-Bond Donors, H-Bond Acceptors).", "error");
        btn.classList.remove("loading");
        return;
    }

    // If using SMILES, clear descriptor fields to avoid conflicts
    if (hasSmiles) {
        data.mw = null;
        data.logp = null;
        data.hbd = null;
        data.hba = null;
        data.tpsa = null;
        data.num_rot_bonds = null;
        data.num_arom_rings = null;
        data.num_heavy_atoms = null;
    }

    try {
        const response = await fetch("/api/predict", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || "Prediction failed");
        }

        const result = await response.json();
        savePredictionLocally(data, result);
        displayResults(result);
        showToast("Molecular Toxicity Analysis Complete!", "success");
        updateHomeStats();
    } catch (error) {
        showToast(`Error: ${error.message}`, "error");
    } finally {
        btn.classList.remove("loading");
    }
}

function displayResults(result) {
    const section = document.getElementById("results-section");
    if (!section) return;
    section.classList.add("visible");

    setTimeout(() => section.scrollIntoView({ behavior: "smooth", block: "start" }), 100);

    // Score Ring
    const scoreNumber = document.getElementById("score-number");
    const ringFill = document.getElementById("score-ring-fill");
    const circumference = 2 * Math.PI * 52;
    const offset = circumference - (result.health_score / 100) * circumference;

    if (ringFill) {
        ringFill.style.stroke = getScoreColor(result.health_score);
        ringFill.style.strokeDashoffset = offset;
    }
    if (scoreNumber) animateCounter(scoreNumber, result.health_score);

    // Risk Badge
    const riskBadge = document.getElementById("risk-badge");
    const riskText = document.getElementById("risk-text");
    if (riskBadge) riskBadge.className = `risk-badge ${result.risk_level.toLowerCase().replace(" ", "-")}`;
    if (riskText) riskText.textContent = `${result.risk_level}`;

    // Summary
    const summaryEl = document.getElementById("result-summary");
    if (summaryEl) summaryEl.textContent = result.summary;

    // Recommendations
    const recsList = document.getElementById("recommendations-list");
    if (recsList) {
        recsList.innerHTML = "";
        result.recommendations.forEach(rec => {
            const li = document.createElement("li");
            li.className = "recommendation-item";
            li.innerHTML = `<i data-lucide="shield-alert"></i><span>${rec}</span>`;
            recsList.appendChild(li);
        });
    }

    // Factors Grid
    const factorsGrid = document.getElementById("risk-factors-grid");
    if (factorsGrid) {
        factorsGrid.innerHTML = "";
        result.risk_factors.forEach(f => {
            const card = document.createElement("div");
            card.className = "risk-factor-card";
            card.innerHTML = `
                <div class="risk-factor-header"><span class="risk-factor-name">${f.factor}</span></div>
                <div class="risk-factor-value">${f.value}</div>
                <p class="risk-factor-message">${f.message}</p>
            `;
            factorsGrid.appendChild(card);
        });
    }

    if (typeof lucide !== "undefined") lucide.createIcons();
}

// ----------------------------------------
// Dashboard Logic
// ----------------------------------------
function updateDashboardStats() {
    const total = dashboardDataStore.length;
    const toxic = dashboardDataStore.filter(p => [1, "Toxic", "High Risk"].includes(p.toxicity_risk) || p.risk_level === "Toxic").length;
    const safe = total - toxic;

    const avgScore = total > 0 ? (dashboardDataStore.reduce((acc, p) => acc + Number(p.health_score || 0), 0) / total).toFixed(1) : "�";
    const avgMW = total > 0 ? (dashboardDataStore.reduce((acc, p) => acc + Number(p.mw || 0), 0) / total).toFixed(1) : "�";
    const avgLogP = total > 0 ? (dashboardDataStore.reduce((acc, p) => acc + Number(p.logp || 0), 0) / total).toFixed(1) : "�";

    const els = {
        total: document.getElementById("dash-total"),
        toxic: document.getElementById("dash-toxic-count"),
        safe: document.getElementById("dash-safe-count"),
        avgScore: document.getElementById("dash-avg-score"),
        avgMW: document.getElementById("dash-avg-mw"),
        avgLogP: document.getElementById("dash-avg-logp")
    };

    if (els.total) animateCounter(els.total, total);
    if (els.toxic) animateCounter(els.toxic, toxic);
    if (els.safe) animateCounter(els.safe, safe);
    if (els.avgScore) els.avgScore.textContent = avgScore;
    if (els.avgMW) els.avgMW.textContent = avgMW;
    if (els.avgLogP) els.avgLogP.textContent = avgLogP;
}

async function loadDashboard() {
    try {
        const response = await fetch("/api/dashboard");
        const data = await response.json();

        dashboardDataStore = data.recent_predictions || [];
        updateDashboardStats();

        const container = document.getElementById("patients-table-container");
        if (container) renderDashboardTable(container);
    } catch (e) {
        const local = getLocalHistory();
        dashboardDataStore = local;
        updateDashboardStats();
        renderDashboardTable(document.getElementById("patients-table-container"));
    }
}

function renderDashboardTable(container) {
    if (!container) return;
    if (dashboardDataStore.length === 0) {
        container.innerHTML = "<div class=\"empty-state\">No compounds analyzed yet.</div>";
        return;
    }

    let html = "<table class=\"patients-table\"><thead><tr><th>ID</th><th>SMILES</th><th>MW</th><th>LogP</th><th>Safety</th><th>Risk</th><th>Action</th></tr></thead><tbody>";
    dashboardDataStore.forEach(p => {
        html += `
            <tr>
                <td>#${p.id}</td>
                <td title="${p.smiles}">${p.smiles ? (p.smiles.length > 20 ? p.smiles.substring(0, 20) + "..." : p.smiles) : "Manual"}</td>
                <td>${p.mw}</td>
                <td>${p.logp}</td>
                <td>${p.health_score}</td>
                <td><span class="table-badge ${p.risk_level.toLowerCase().replace(" ", "-")}">${p.risk_level}</span></td>
                <td><button onclick="showPatientSummary(${p.id})"><i data-lucide="eye"></i></button></td>
            </tr>
        `;
    });
    html += "</tbody></table>";
    container.innerHTML = html;
    if (typeof lucide !== "undefined") lucide.createIcons();
}

// ----------------------------------------
// Utilities
// ----------------------------------------
function animateCounter(el, target) {
    let curr = 0;
    const step = target / 30;
    const interval = setInterval(() => {
        curr += step;
        if (curr >= target) { curr = target; clearInterval(interval); }
        el.textContent = Math.round(curr);
    }, 30);
}

function getScoreColor(score) {
    if (score >= 70) return "#10b981";
    if (score >= 40) return "#f59e0b";
    return "#ef4444";
}

async function updateHomeStats() {
    try {
        const response = await fetch("/api/dashboard");
        const data = await response.json();
        const el = document.getElementById("stat-total");
        if (el) el.textContent = data.total_compounds || 0;
    } catch (e) { }
}

function initSlideshows() {
    document.querySelectorAll(".hero-slideshow").forEach(c => {
        const s = c.querySelectorAll(".slide");
        let i = 0;
        setInterval(() => { s[i].classList.remove("active"); i = (i + 1) % s.length; s[i].classList.add("active"); }, 5000);
    });
}

async function loadKnowledgeBase() {
    try {
        const r = await fetch("/static/codecure_kb.json");
        knowledgeBase = await r.json();
    } catch (e) { }
}

function toggleChat() { document.getElementById("chatbot-container").classList.toggle("active"); }
function handleChatKey(e) { if (e.key === "Enter") sendChatMessage(); }

async function sendChatMessage() {
    const i = document.getElementById('chat-input');
    const m = document.getElementById('chat-messages');
    const q = i.value.trim();
    if (!q) return;

    const u = document.createElement('div'); u.className = 'message user-message'; u.innerText = q; m.appendChild(u);
    i.value = '';

    // Show typing indicator
    const typing = document.createElement('div'); typing.className = 'message bot-message typing';
    typing.innerHTML = '<i data-lucide="bot" class="icon-inline"></i> ChemiBot is thinking...';
    m.appendChild(typing);
    m.scrollTop = m.scrollHeight;

    try {
        const response = await getGroqResponse(q);
        m.removeChild(typing);
        const b = document.createElement('div'); b.className = 'message bot-message';
        b.innerHTML = response;
        m.appendChild(b);
    } catch (error) {
        m.removeChild(typing);
        const b = document.createElement('div'); b.className = 'message bot-message';
        b.innerText = 'Sorry, I am having trouble connecting. Please try again.';
        m.appendChild(b);
    }
    m.scrollTop = m.scrollHeight;
}

async function getGroqResponse(question) {
    // Custom responses
    const lowerQ = question.toLowerCase();
    if (lowerQ.includes('who made you') || lowerQ.includes('created you')) {
        return 'Babin Bid and Debasmita made me like this.';
    }
    if (lowerQ.includes('security') || lowerQ.includes('api key') || lowerQ.includes('password')) {
        return 'I cannot provide you the answer due to security restrictions.';
    }

    // Groq API call
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${window.ENV.GROQ_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: 'llama3-8b-8192',
            messages: [{
                role: 'system',
                content: 'You are ChemiBot, a helpful AI assistant for drug toxicity prediction and pharmacology. Answer questions about SMILES, molecular descriptors, toxicity, and related topics. Keep responses concise and informative.'
            }, {
                role: 'user',
                content: question
            }],
            max_tokens: 300,
            temperature: 0.7
        })
    });

    const data = await response.json();
    return data.choices[0].message.content;
}

// ----------------------------------------
// FAQ Accordion Functionality
// ----------------------------------------
function toggleFaq(button) {
    const faqItem = button.parentElement;
    const isActive = faqItem.classList.contains('active');

    // Close all FAQ items
    document.querySelectorAll('.faq-item').forEach(item => {
        item.classList.remove('active');
    });

    // Open clicked item if it wasn't already open
    if (!isActive) {
        faqItem.classList.add('active');
    }
}

async function sendChatMessage() {
    const i = document.getElementById("chat-input");
    const m = document.getElementById("chat-messages");
    const q = i.value.trim();
    if (!q) return;

    const u = document.createElement("div"); u.className = "message user-message"; u.innerText = q; m.appendChild(u);
    i.value = "";

    // Show typing indicator
    const typing = document.createElement("div"); typing.className = "message bot-message typing";
    typing.innerHTML = '<i data-lucide="bot" class="icon-inline"></i> ChemiBot is thinking...';
    m.appendChild(typing);
    m.scrollTop = m.scrollHeight;

    try {
        const response = await getGroqResponse(q);
        m.removeChild(typing);
        const b = document.createElement("div"); b.className = "message bot-message";
        b.innerHTML = response;
        m.appendChild(b);
    } catch (error) {
        m.removeChild(typing);
        const b = document.createElement("div"); b.className = "message bot-message";
        b.innerText = "Sorry, I'm having trouble connecting. Please try again.";
        m.appendChild(b);
    }
    m.scrollTop = m.scrollHeight;
}

async function getGroqResponse(question) {
    // Custom responses
    const lowerQ = question.toLowerCase();
    if (lowerQ.includes("who made you") || lowerQ.includes("created you")) {
        return "Babin Bid and Debasmita made me like this.";
    }
    if (lowerQ.includes("security") || lowerQ.includes("api key") || lowerQ.includes("password")) {
        return "I cannot provide you the answer due to security restrictions.";
    }

    // Groq API call
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${window.ENV.GROQ_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: 'llama3-8b-8192',
            messages: [{
                role: 'system',
                content: 'You are ChemiBot, a helpful AI assistant for drug toxicity prediction and pharmacology. Answer questions about SMILES, molecular descriptors, toxicity, and related topics. Keep responses concise and informative.'
            }, {
                role: 'user',
                content: question
            }],
            max_tokens: 300,
            temperature: 0.7
        })
    });

    const data = await response.json();
    return data.choices[0].message.content;
}

function sendChatMessage() {
    const i = document.getElementById("chat-input");
    const m = document.getElementById("chat-messages");
    const q = i.value.trim();
    if (!q) return;

    const u = document.createElement("div"); u.className = "message user-message"; u.innerText = q; m.appendChild(u);
    i.value = "";

    setTimeout(() => {
        const b = document.createElement("div"); b.className = "message bot-message";
        b.innerText = findBestAnswer(q);
        m.appendChild(b);
        m.scrollTop = m.scrollHeight;
    }, 600);
}

function findBestAnswer(q) {
    q = q.toLowerCase();
    let best = "Im specialized in Drug Toxicity questions. Try asking about LogP or Lipinskis Rule!";
    let max = 0;
    knowledgeBase.forEach(k => {
        let s = 0;
        k.keywords.forEach(w => { if (q.includes(w)) s++; });
        if (s > max) { max = s; best = k.answer; }
    });
    return best;
}



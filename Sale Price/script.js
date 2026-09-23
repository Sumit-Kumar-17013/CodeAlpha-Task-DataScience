"use strict";

/* ==========================================================================
   Configuration — edit these to match your deployment
   ========================================================================== */
const API_BASE_URL = "http://127.0.0.1:8000";
const CURRENCY_SYMBOL = "₹";   // set to "" if the target is not a currency
const CURRENCY_UNIT = "";       // e.g. "units" if the target isn't currency at all

/* ==========================================================================
   DOM references
   ========================================================================== */
const els = {
  navStatusDot: document.getElementById("navStatusDot"),
  navStatusText: document.getElementById("navStatusText"),
  healthDot: document.getElementById("healthDot"),
  healthStatus: document.getElementById("healthStatus"),
  healthModelLoaded: document.getElementById("healthModelLoaded"),
  healthError: document.getElementById("healthError"),

  modelBody: document.getElementById("modelBody"),
  modelName: document.getElementById("modelName"),
  modelTarget: document.getElementById("modelTarget"),
  featureChips: document.getElementById("featureChips"),
  pipelineSteps: document.getElementById("pipelineSteps"),
  metricsGrid: document.getElementById("metricsGrid"),
  modelError: document.getElementById("modelError"),

  form: document.getElementById("predictForm"),
  predictBtn: document.getElementById("predictBtn"),
  resetBtn: document.getElementById("resetBtn"),
  loadingStatus: document.getElementById("loadingStatus"),

  pipelineFlow: document.getElementById("pipelineFlow"),

  resultSection: document.getElementById("resultSection"),
  resultValue: document.getElementById("resultValue"),
  resultModel: document.getElementById("resultModel"),
  resultStatus: document.getElementById("resultStatus"),
  resultTime: document.getElementById("resultTime"),
  copyBtn: document.getElementById("copyBtn"),

  barTV: document.getElementById("barTV"),
  barRadio: document.getElementById("barRadio"),
  barNewspaper: document.getElementById("barNewspaper"),
  valTV: document.getElementById("valTV"),
  valRadio: document.getElementById("valRadio"),
  valNewspaper: document.getElementById("valNewspaper"),

  statModel: document.getElementById("statModel"),
  statStatus: document.getElementById("statStatus"),
  statTV: document.getElementById("statTV"),
  statRadio: document.getElementById("statRadio"),
  statNewspaper: document.getElementById("statNewspaper"),

  historyList: document.getElementById("historyList"),
  historyEmpty: document.getElementById("historyEmpty"),
  clearHistoryBtn: document.getElementById("clearHistoryBtn"),

  toastStack: document.getElementById("toastStack"),
  burgerBtn: document.getElementById("burgerBtn"),
  mobileNav: document.getElementById("mobileNav"),
};

const HISTORY_KEY = "salesai_prediction_history";
const MAX_HISTORY = 8;

/* ==========================================================================
   Utilities
   ========================================================================== */
function formatNumber(value, opts = {}) {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: opts.decimals ?? 2,
    maximumFractionDigits: opts.decimals ?? 2,
  }).format(value);
}

function formatCurrency(value) {
  const num = formatNumber(value, { decimals: 2 });
  if (num === "—") return num;
  const parts = [];
  if (CURRENCY_SYMBOL) parts.push(CURRENCY_SYMBOL);
  parts.push(num);
  if (CURRENCY_UNIT) parts.push(CURRENCY_UNIT);
  return parts.join(" ").replace(`${CURRENCY_SYMBOL} `, CURRENCY_SYMBOL);
}

function timeAgo(isoString) {
  const then = new Date(isoString).getTime();
  if (Number.isNaN(then)) return "";
  const diffSec = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (diffSec < 60) return "just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? "" : "s"} ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hour${diffHr === 1 ? "" : "s"} ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay} day${diffDay === 1 ? "" : "s"} ago`;
}

function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast${type === "error" ? " toast--error" : type === "success" ? " toast--success" : ""}`;
  toast.textContent = message;
  els.toastStack.appendChild(toast);
  setTimeout(() => toast.remove(), 4200);
}

async function safeFetch(path, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: { "Content-Type": "application/json", ...(options.headers || {}) },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return res;
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
}

/* ==========================================================================
   API status (health)
   ========================================================================== */
async function checkAPIHealth() {
  try {
    const res = await safeFetch("/health");
    if (!res.ok) throw new Error(`Health check failed (${res.status})`);
    const data = await res.json();
    const online = data.status === "healthy" || data.model_loaded === true;

    setNavStatus(online);
    els.healthStatus.textContent = online ? "Online" : "Degraded";
    els.healthModelLoaded.textContent = data.model_loaded ? "Yes" : "No";
    els.healthDot.className = `status-dot ${online ? "status-dot--online" : "status-dot--offline"}`;
    els.healthError.hidden = true;
    return online;
  } catch (err) {
    console.error("checkAPIHealth:", err);
    setNavStatus(false);
    els.healthStatus.textContent = "Offline";
    els.healthModelLoaded.textContent = "—";
    els.healthDot.className = "status-dot status-dot--offline";
    els.healthError.hidden = false;
    return false;
  }
}

function setNavStatus(online) {
  els.navStatusDot.className = `status-dot ${online ? "status-dot--online" : "status-dot--offline"}`;
  els.navStatusText.textContent = online ? "Online" : "Offline";
}

/* ==========================================================================
   Model information
   ========================================================================== */
async function loadModelInfo() {
  try {
    const res = await safeFetch("/model-info");
    if (!res.ok) throw new Error(`Model info failed (${res.status})`);
    const data = await res.json();

    els.modelName.textContent = data.model_name || "Unknown";
    els.modelTarget.textContent = data.target || "—";
    els.modelError.hidden = true;

    els.featureChips.innerHTML = "";
    const features = Array.isArray(data.features) ? data.features : [];
    features.forEach((feature) => {
      const chip = document.createElement("span");
      chip.className = "feature-chip";
      chip.textContent = feature;
      els.featureChips.appendChild(chip);
    });

    els.pipelineSteps.innerHTML = "";
    const steps = Array.isArray(data.pipeline_steps) ? data.pipeline_steps : [];
    steps.forEach((step, i) => {
      const span = document.createElement("span");
      span.className = "step";
      span.textContent = step;
      els.pipelineSteps.appendChild(span);
      if (i < steps.length - 1) {
        const arrow = document.createElement("span");
        arrow.className = "arrow";
        arrow.textContent = "→";
        els.pipelineSteps.appendChild(arrow);
      }
    });

    renderMetrics(data.metadata);
  } catch (err) {
    console.error("loadModelInfo:", err);
    els.modelName.textContent = "Unavailable";
    els.modelTarget.textContent = "—";
    els.modelError.hidden = false;
    els.metricsGrid.hidden = true;
  }
}

function renderMetrics(metadata) {
  if (!metadata || typeof metadata !== "object") {
    els.metricsGrid.hidden = true;
    return;
  }
  const knownKeys = ["r2", "R2", "mae", "MAE", "rmse", "RMSE"];
  const entries = Object.entries(metadata).filter(([key]) => knownKeys.includes(key));

  if (entries.length === 0) {
    els.metricsGrid.hidden = true;
    return;
  }

  els.metricsGrid.innerHTML = "";
  entries.forEach(([key, value]) => {
    const cell = document.createElement("div");
    cell.className = "metric";
    const strong = document.createElement("strong");
    strong.textContent = typeof value === "number" ? formatNumber(value, { decimals: 4 }) : String(value);
    const span = document.createElement("span");
    span.textContent = key.toUpperCase();
    cell.appendChild(strong);
    cell.appendChild(span);
    els.metricsGrid.appendChild(cell);
  });
  els.metricsGrid.hidden = false;
}

/* ==========================================================================
   Form validation
   ========================================================================== */
const FIELD_LABELS = {
  TV: "TV advertising spend",
  Radio: "Radio advertising spend",
  Newspaper: "Newspaper advertising spend",
};

function clearFieldErrors() {
  document.querySelectorAll(".field").forEach((f) => f.classList.remove("has-error"));
  document.querySelectorAll(".field__error").forEach((e) => (e.textContent = ""));
}

function setFieldError(name, message) {
  const errorEl = document.querySelector(`[data-error-for="${name}"]`);
  const fieldEl = errorEl ? errorEl.closest(".field") : null;
  if (errorEl) errorEl.textContent = message;
  if (fieldEl) fieldEl.classList.add("has-error");
}

function validateForm(formData) {
  clearFieldErrors();
  let isValid = true;

  ["TV", "Radio", "Newspaper"].forEach((name) => {
    const raw = formData.get(name);
    const num = Number(raw);
    const label = FIELD_LABELS[name];
    if (raw === "" || raw === null || Number.isNaN(num)) {
      setFieldError(name, `Please enter a valid ${label}.`);
      isValid = false;
    } else if (num < 0) {
      setFieldError(name, `${label} cannot be negative.`);
      isValid = false;
    }
  });

  return isValid;
}

/* ==========================================================================
   Prediction pipeline animation + loading copy
   ========================================================================== */
const loadingMessages = [
  "Analyzing sales patterns…",
  "Running ML prediction…",
  "Generating forecast…",
];

function animatePrediction(start) {
  const nodes = els.pipelineFlow.querySelectorAll(".pipeline__node");
  if (!start) {
    els.pipelineFlow.classList.remove("running");
    nodes.forEach((n) => n.classList.remove("active"));
    els.loadingStatus.classList.remove("visible");
    return () => {};
  }

  els.pipelineFlow.classList.add("running");
  nodes.forEach((n) => n.classList.remove("active"));
  els.loadingStatus.classList.add("visible");

  let step = 0;
  let msgIndex = 0;
  els.loadingStatus.textContent = loadingMessages[0];

  const stepInterval = setInterval(() => {
    nodes.forEach((n) => n.classList.remove("active"));
    if (nodes[step]) nodes[step].classList.add("active");
    step = (step + 1) % nodes.length;
  }, 380);

  const msgInterval = setInterval(() => {
    msgIndex = (msgIndex + 1) % loadingMessages.length;
    els.loadingStatus.textContent = loadingMessages[msgIndex];
  }, 1100);

  return () => {
    clearInterval(stepInterval);
    clearInterval(msgInterval);
    const allNodes = els.pipelineFlow.querySelectorAll(".pipeline__node");
    allNodes.forEach((n) => n.classList.add("active"));
    els.pipelineFlow.classList.remove("running");
    setTimeout(() => {
      allNodes.forEach((n) => n.classList.remove("active"));
      els.loadingStatus.classList.remove("visible");
    }, 900);
  };
}

/* ==========================================================================
   Count-up animation for the predicted value
   ========================================================================== */
function countUpTo(el, target, duration = 900) {
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced) {
    el.textContent = formatCurrency(target);
    return;
  }
  const start = performance.now();
  function frame(now) {
    const progress = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = target * eased;
    el.textContent = formatCurrency(current);
    if (progress < 1) requestAnimationFrame(frame);
    else el.textContent = formatCurrency(target);
  }
  requestAnimationFrame(frame);
}

/* ==========================================================================
   Predict sales
   ========================================================================== */
async function predictSales(payload) {
  const res = await safeFetch("/predict", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let detail = `Request failed with status ${res.status}.`;
    try {
      const errBody = await res.json();
      if (errBody && errBody.detail) {
        detail = typeof errBody.detail === "string" ? errBody.detail : JSON.stringify(errBody.detail);
      }
    } catch (_) { /* body wasn't JSON */ }

    if (res.status === 422) throw new Error("Some fields are invalid. Please check your inputs and try again.");
    if (res.status === 503) throw new Error("Prediction model is unavailable. Please try again shortly.");
    if (res.status >= 500) throw new Error("Prediction service is currently unavailable.");
    throw new Error(detail);
  }

  return res.json();
}

function displayPrediction(data, inputs) {
  // Prefer the input_data the API echoes back, falling back to what we sent.
  const used = data.input_data && typeof data.input_data === "object" ? data.input_data : inputs;

  els.resultSection.hidden = false;
  els.resultModel.textContent = data.model_name || "Unknown";
  els.resultStatus.textContent = "Successful";
  els.resultTime.textContent = data.timestamp ? new Date(data.timestamp).toLocaleString() : "—";

  countUpTo(els.resultValue, data.predicted_sales);

  const maxBar = Math.max(used.TV, used.Radio, used.Newspaper, 1);
  requestAnimationFrame(() => {
    els.barTV.style.width = `${Math.min(100, (used.TV / maxBar) * 100)}%`;
    els.barRadio.style.width = `${Math.min(100, (used.Radio / maxBar) * 100)}%`;
    els.barNewspaper.style.width = `${Math.min(100, (used.Newspaper / maxBar) * 100)}%`;
  });
  els.valTV.textContent = formatCurrency(used.TV);
  els.valRadio.textContent = formatCurrency(used.Radio);
  els.valNewspaper.textContent = formatCurrency(used.Newspaper);

  els.statModel.textContent = data.model_name || "Unknown";
  els.statModel.classList.remove("is-placeholder");
  els.statStatus.textContent = "Successful";
  els.statStatus.classList.remove("is-placeholder");
  els.statTV.textContent = formatCurrency(used.TV);
  els.statTV.classList.remove("is-placeholder");
  els.statRadio.textContent = formatCurrency(used.Radio);
  els.statRadio.classList.remove("is-placeholder");
  els.statNewspaper.textContent = formatCurrency(used.Newspaper);
  els.statNewspaper.classList.remove("is-placeholder");

  els.resultSection.scrollIntoView({ behavior: "smooth", block: "start" });

  saveToHistory({
    TV: used.TV,
    Radio: used.Radio,
    Newspaper: used.Newspaper,
    predicted_sales: data.predicted_sales,
    model_name: data.model_name,
    timestamp: data.timestamp || new Date().toISOString(),
  });
}

function displayError(message) {
  showToast(message, "error");
  els.statStatus.textContent = "Failed";
  els.statStatus.classList.remove("is-placeholder");
}

function resetForm() {
  els.form.reset();
  clearFieldErrors();
  els.resultSection.hidden = true;
  [els.statModel, els.statStatus, els.statTV, els.statRadio, els.statNewspaper].forEach((el) => {
    el.textContent = "Waiting for prediction";
    el.classList.add("is-placeholder");
  });
  els.form.querySelector("#TV").focus();
}

/* ==========================================================================
   Prediction history (localStorage only — never sent to the API)
   ========================================================================== */
function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
  } catch (_) {
    return [];
  }
}

function saveToHistory(entry) {
  const history = getHistory();
  history.unshift(entry);
  const trimmed = history.slice(0, MAX_HISTORY);
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
  } catch (err) {
    console.warn("Could not persist history:", err);
  }
  renderHistory();
}

function renderHistory() {
  const history = getHistory();
  els.historyList.innerHTML = "";

  if (history.length === 0) {
    const li = document.createElement("li");
    li.className = "history__empty";
    li.id = "historyEmpty";
    li.textContent = "No predictions yet this session.";
    els.historyList.appendChild(li);
    return;
  }

  history.forEach((item) => {
    const li = document.createElement("li");
    li.className = "history__item";

    const main = document.createElement("div");
    main.className = "history__item-main";

    const value = document.createElement("span");
    value.className = "history__item-value";
    value.textContent = formatCurrency(item.predicted_sales);

    const meta = document.createElement("span");
    meta.className = "history__item-meta";
    meta.textContent = `TV ${formatCurrency(item.TV)} · Radio ${formatCurrency(item.Radio)} · Newspaper ${formatCurrency(item.Newspaper)}`;

    main.appendChild(value);
    main.appendChild(meta);

    const time = document.createElement("span");
    time.className = "history__item-time";
    time.textContent = timeAgo(item.timestamp);

    li.appendChild(main);
    li.appendChild(time);
    els.historyList.appendChild(li);
  });
}

function clearHistory() {
  localStorage.removeItem(HISTORY_KEY);
  renderHistory();
  showToast("Prediction history cleared.", "success");
}

/* ==========================================================================
   Hero canvas — lightweight animated node network
   ========================================================================== */
function initHeroCanvas() {
  const canvas = document.getElementById("heroCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let width, height, nodes;

  function resize() {
    width = canvas.width = canvas.offsetWidth * devicePixelRatio;
    height = canvas.height = canvas.offsetHeight * devicePixelRatio;
  }

  function makeNodes() {
    const count = Math.min(46, Math.floor((width * height) / 55000));
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.25 * devicePixelRatio,
      vy: (Math.random() - 0.5) * 0.25 * devicePixelRatio,
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "rgba(56, 189, 248, 0.55)";

    nodes.forEach((n) => {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 0 || n.x > width) n.vx *= -1;
      if (n.y < 0 || n.y > height) n.vy *= -1;
      ctx.beginPath();
      ctx.arc(n.x, n.y, 1.6 * devicePixelRatio, 0, Math.PI * 2);
      ctx.fill();
    });

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 130 * devicePixelRatio;
        if (dist < maxDist) {
          ctx.strokeStyle = `rgba(167, 139, 250, ${0.18 * (1 - dist / maxDist)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
    }
    if (!prefersReduced) requestAnimationFrame(draw);
  }

  resize();
  makeNodes();
  draw();

  window.addEventListener("resize", () => {
    resize();
    makeNodes();
    if (prefersReduced) draw();
  });
}

/* ==========================================================================
   Wiring
   ========================================================================== */
els.form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(els.form);

  if (!validateForm(formData)) {
    showToast("Please fix the highlighted fields.", "error");
    return;
  }

  const payload = {
    TV: Number(formData.get("TV")),
    Radio: Number(formData.get("Radio")),
    Newspaper: Number(formData.get("Newspaper")),
  };

  els.predictBtn.disabled = true;
  els.predictBtn.classList.add("is-loading");
  const stopAnimation = animatePrediction(true);

  const minDelay = new Promise((resolve) => setTimeout(resolve, 1100));

  try {
    const [data] = await Promise.all([predictSales(payload), minDelay]);
    displayPrediction(data, payload);
  } catch (err) {
    console.error("predictSales:", err);
    const message = err.name === "AbortError"
      ? "The prediction service took too long to respond."
      : (err.message || "Prediction failed. Please try again.");
    displayError(message);
  } finally {
    stopAnimation();
    els.predictBtn.disabled = false;
    els.predictBtn.classList.remove("is-loading");
  }
});

els.resetBtn.addEventListener("click", resetForm);
els.clearHistoryBtn.addEventListener("click", clearHistory);

els.copyBtn.addEventListener("click", async () => {
  const text = els.resultValue.textContent;
  try {
    await navigator.clipboard.writeText(text);
    showToast("Prediction copied to clipboard.", "success");
  } catch (err) {
    console.error("clipboard:", err);
    showToast("Could not copy to clipboard.", "error");
  }
});

els.burgerBtn.addEventListener("click", () => {
  const isOpen = els.mobileNav.classList.toggle("open");
  els.burgerBtn.setAttribute("aria-expanded", String(isOpen));
});
els.mobileNav.querySelectorAll("a").forEach((a) =>
  a.addEventListener("click", () => {
    els.mobileNav.classList.remove("open");
    els.burgerBtn.setAttribute("aria-expanded", "false");
  })
);

/* ==========================================================================
   Init
   ========================================================================== */
(async function init() {
  initHeroCanvas();
  renderHistory();
  await checkAPIHealth();
  await loadModelInfo();
})();

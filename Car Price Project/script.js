/* ===================================================================
   Redline AI — Car Price Predictor
   Talks to the existing FastAPI backend (main.py) exactly as-is:
     POST http://127.0.0.1:8000/predict
     body: { car_name, present_price, driven_kms, fuel_type,
             selling_type, transmission, owner, car_age, kms_per_year }
   No backend fields, ranges or endpoint names are altered here.
=================================================================== */

(() => {
  "use strict";

  const API_BASE = "http://127.0.0.1:8000";
  const PREDICT_ENDPOINT = `${API_BASE}/predict`;

  /* -----------------------------------------------------------------
     Known car names.
     NOTE: the notebook's df['Car_Name'].value_counts() output was
     truncated by pandas (98 unique names, only the top/bottom 5
     were visible). These are the ones that were actually visible —
     replace/extend this list with your full dataset's car names for
     complete autocomplete coverage.
  ----------------------------------------------------------------- */
  const KNOWN_CAR_NAMES = [
    "city",
    "corolla altis",
    "verna",
    "fortuner",
    "brio",
    "Hero Super Splendor",
    "Hero Hunk",
    "Hero Ignitor Disc",
    "Hero CBZ Xtreme",
    "Bajaj ct 100",
  ];

  const BACKEND_LIMITS = {
    present_price: { min: 0.01, max: 1000 },
    driven_kms: { min: 0, max: 1000000 },
    owner: { min: 0, max: 5 },
    car_age: { min: 0, max: 50 },
    kms_per_year: { min: 0, max: 100000 },
  };

  /* ------------------------------------------------------------- */
  /* Element refs                                                   */
  /* ------------------------------------------------------------- */
  const form = document.getElementById("predictForm");
  const carNameInput = document.getElementById("carName");
  const carNameList = document.getElementById("carNameList");
  const mfgYearInput = document.getElementById("mfgYear");
  const carAgeOut = document.getElementById("carAgeOut");
  const presentPriceInput = document.getElementById("presentPrice");
  const drivenKmsInput = document.getElementById("drivenKms");
  const kmsPerYearOut = document.getElementById("kmsPerYearOut");
  const ownerValueEl = document.getElementById("ownerValue");
  const ownerHidden = document.getElementById("owner");
  const ownerMinus = document.getElementById("ownerMinus");
  const ownerPlus = document.getElementById("ownerPlus");
  const submitBtn = document.getElementById("submitBtn");
  const loadingTextEl = document.getElementById("loadingText");
  const resultSection = document.getElementById("resultSection");
  const resultNumber = document.getElementById("resultNumber");
  const resultDetails = document.getElementById("resultDetails");
  const gaugeFill = document.getElementById("gaugeFill");
  const gaugeMarker = document.getElementById("gaugeMarker");
  const gaugePresent = document.getElementById("gaugePresent");
  const gaugeSelling = document.getElementById("gaugeSelling");
  const resetBtn = document.getElementById("resetBtn");
  const errorBanner = document.getElementById("errorBanner");
  const errorTitle = document.getElementById("errorTitle");
  const errorDesc = document.getElementById("errorDesc");
  const toast = document.getElementById("toast");
  const heroTicker = document.getElementById("heroTicker");

  let derivedCarAge = null;
  let derivedKmsPerYear = null;

  /* ------------------------------------------------------------- */
  /* Populate car-name suggestions                                  */
  /* ------------------------------------------------------------- */
  KNOWN_CAR_NAMES.forEach((name) => {
    const opt = document.createElement("option");
    opt.value = name;
    carNameList.appendChild(opt);
  });

  /* ------------------------------------------------------------- */
  /* Choice-card groups (fuel / selling type / transmission)        */
  /* ------------------------------------------------------------- */
  document.querySelectorAll("[data-choice-group]").forEach((group) => {
    const fieldName = group.dataset.choiceGroup;
    const hiddenInput = document.getElementById(fieldName);
    const buttons = group.querySelectorAll(".choice");

    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        buttons.forEach((b) => b.classList.remove("is-selected"));
        btn.classList.add("is-selected");
        hiddenInput.value = btn.dataset.value;
        clearFieldError(fieldName);
      });
    });
  });

  /* ------------------------------------------------------------- */
  /* Owner stepper                                                  */
  /* ------------------------------------------------------------- */
  function setOwner(value) {
    const clamped = Math.min(
      BACKEND_LIMITS.owner.max,
      Math.max(BACKEND_LIMITS.owner.min, value)
    );
    ownerValueEl.textContent = clamped;
    ownerHidden.value = clamped;
  }
  ownerMinus.addEventListener("click", () =>
    setOwner(parseInt(ownerHidden.value, 10) - 1)
  );
  ownerPlus.addEventListener("click", () =>
    setOwner(parseInt(ownerHidden.value, 10) + 1)
  );

  /* ------------------------------------------------------------- */
  /* Auto-calculated fields: car age + km/year                     */
  /* ------------------------------------------------------------- */
  function recalcDerived() {
    const currentYear = new Date().getFullYear();
    const year = parseInt(mfgYearInput.value, 10);
    const kms = parseFloat(drivenKmsInput.value);

    if (Number.isFinite(year) && year >= 1975 && year <= currentYear) {
      derivedCarAge = Math.max(0, currentYear - year);
      carAgeOut.textContent = `${derivedCarAge} ${
        derivedCarAge === 1 ? "year" : "years"
      }`;
    } else {
      derivedCarAge = null;
      carAgeOut.textContent = "—";
    }

    if (derivedCarAge !== null && Number.isFinite(kms) && kms >= 0) {
      derivedKmsPerYear = kms / (derivedCarAge + 1);
      kmsPerYearOut.textContent = `${formatNumber(
        Math.round(derivedKmsPerYear)
      )} km/year`;
    } else {
      derivedKmsPerYear = null;
      kmsPerYearOut.textContent = "—";
    }
  }
  mfgYearInput.addEventListener("input", recalcDerived);
  drivenKmsInput.addEventListener("input", recalcDerived);

  /* ------------------------------------------------------------- */
  /* Helpers                                                        */
  /* ------------------------------------------------------------- */
  function formatNumber(n) {
    return new Intl.NumberFormat("en-IN").format(n);
  }

  function showFieldError(fieldName, message) {
    const errorEl = document.querySelector(`[data-error-for="${fieldName}"]`);
    if (!errorEl) return;
    errorEl.textContent = message;
    const fieldWrap = errorEl.closest(".field");
    if (fieldWrap) fieldWrap.classList.add("has-error");
  }

  function clearFieldError(fieldName) {
    const errorEl = document.querySelector(`[data-error-for="${fieldName}"]`);
    if (!errorEl) return;
    errorEl.textContent = "";
    const fieldWrap = errorEl.closest(".field");
    if (fieldWrap) fieldWrap.classList.remove("has-error");
  }

  function clearAllErrors() {
    document
      .querySelectorAll(".field__error")
      .forEach((el) => (el.textContent = ""));
    document
      .querySelectorAll(".field.has-error")
      .forEach((el) => el.classList.remove("has-error"));
    hideErrorBanner();
  }

  function showErrorBanner(title, desc) {
    errorTitle.textContent = title;
    errorDesc.textContent = desc;
    errorBanner.hidden = false;
    errorBanner.scrollIntoView({ behavior: "smooth", block: "center" });
  }
  function hideErrorBanner() {
    errorBanner.hidden = true;
  }

  function showToast(message) {
    toast.textContent = message;
    toast.hidden = false;
    requestAnimationFrame(() => toast.classList.add("is-visible"));
    setTimeout(() => {
      toast.classList.remove("is-visible");
      setTimeout(() => (toast.hidden = true), 250);
    }, 2600);
  }

  /* ------------------------------------------------------------- */
  /* Validation — mirrors main.py's Pydantic constraints exactly    */
  /* ------------------------------------------------------------- */
  function validateForm() {
    clearAllErrors();
    let isValid = true;
    const errors = {};

    const carName = carNameInput.value.trim();
    if (!carName) {
      errors.carName = "Please enter the car's name.";
    } else if (carName.length > 100) {
      errors.carName = "Car name must be 100 characters or fewer.";
    }

    const year = parseInt(mfgYearInput.value, 10);
    const currentYear = new Date().getFullYear();
    if (!mfgYearInput.value || !Number.isFinite(year)) {
      errors.mfgYear = "Please enter the manufactured year.";
    } else if (year < 1975 || year > currentYear) {
      errors.mfgYear = `Enter a year between 1975 and ${currentYear}.`;
    }

    const presentPrice = parseFloat(presentPriceInput.value);
    if (!presentPriceInput.value || !Number.isFinite(presentPrice)) {
      errors.presentPrice = "Please enter the present price.";
    } else if (
      presentPrice <= 0 ||
      presentPrice > BACKEND_LIMITS.present_price.max
    ) {
      errors.presentPrice = `Enter a value between 0.01 and ${BACKEND_LIMITS.present_price.max} Lakhs.`;
    }

    const drivenKms = parseFloat(drivenKmsInput.value);
    if (!drivenKmsInput.value || !Number.isFinite(drivenKms)) {
      errors.drivenKms = "Please enter the distance driven.";
    } else if (drivenKms < 0 || drivenKms > BACKEND_LIMITS.driven_kms.max) {
      errors.drivenKms = `Enter a value between 0 and ${formatNumber(
        BACKEND_LIMITS.driven_kms.max
      )} km.`;
    }

    if (!document.getElementById("fuelType").value) {
      errors.fuelType = "Please select a fuel type.";
    }
    if (!document.getElementById("sellingType").value) {
      errors.sellingType = "Please select a selling type.";
    }
    if (!document.getElementById("transmission").value) {
      errors.transmission = "Please select a transmission.";
    }

    if (derivedCarAge === null) {
      errors.mfgYear =
        errors.mfgYear || "Car age couldn't be calculated — check the year.";
    }

    if (
      !errors.drivenKms &&
      derivedKmsPerYear !== null &&
      derivedKmsPerYear > BACKEND_LIMITS.kms_per_year.max
    ) {
      errors.drivenKms = `That works out to over ${formatNumber(
        BACKEND_LIMITS.kms_per_year.max
      )} km/year, which is outside the accepted range. Try a lower distance or an older year.`;
    }

    Object.entries(errors).forEach(([field, message]) => {
      showFieldError(field, message);
      isValid = false;
    });

    return isValid;
  }

  /* ------------------------------------------------------------- */
  /* Submit                                                         */
  /* ------------------------------------------------------------- */
  const loadingMessages = [
    "Analyzing your car…",
    "AI is estimating market value…",
    "Crunching the numbers…",
  ];
  let loadingInterval = null;

  function startLoadingCycle() {
    let i = 0;
    loadingTextEl.textContent = loadingMessages[0];
    loadingInterval = setInterval(() => {
      i = (i + 1) % loadingMessages.length;
      loadingTextEl.textContent = loadingMessages[i];
    }, 1400);
  }
  function stopLoadingCycle() {
    clearInterval(loadingInterval);
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideErrorBanner();

    if (!validateForm()) {
      const firstError = document.querySelector(".field.has-error");
      if (firstError)
        firstError.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    const payload = {
      car_name: carNameInput.value.trim(),
      present_price: parseFloat(presentPriceInput.value),
      driven_kms: parseFloat(drivenKmsInput.value),
      fuel_type: document.getElementById("fuelType").value,
      selling_type: document.getElementById("sellingType").value,
      transmission: document.getElementById("transmission").value,
      owner: parseInt(ownerHidden.value, 10),
      car_age: derivedCarAge,
      kms_per_year: Math.round(derivedKmsPerYear * 100) / 100,
    };

    submitBtn.classList.add("is-loading");
    submitBtn.disabled = true;
    startLoadingCycle();

    try {
      const response = await fetch(PREDICT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let detail = "";
        try {
          const errJson = await response.json();
          detail =
            typeof errJson.detail === "string"
              ? errJson.detail
              : JSON.stringify(errJson.detail);
        } catch (_) {
          /* no JSON body */
        }

        if (response.status === 422) {
          showErrorBanner(
            "Check your inputs",
            detail || "The server rejected one or more field values."
          );
        } else {
          showErrorBanner(
            "Something went wrong while calculating the prediction.",
            "Please check your inputs and try again."
          );
        }
        return;
      }

      const data = await response.json();
      renderResult(data, payload);
    } catch (err) {
      showErrorBanner(
        "Unable to connect to the prediction server.",
        `Make sure FastAPI is running at ${API_BASE}`
      );
    } finally {
      stopLoadingCycle();
      submitBtn.classList.remove("is-loading");
      submitBtn.disabled = false;
    }
  });

  /* ------------------------------------------------------------- */
  /* Result rendering                                                */
  /* ------------------------------------------------------------- */
  function countUp(el, target, duration = 900) {
    const start = performance.now();
    function tick(now) {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = eased * target;
      el.textContent = value.toFixed(2);
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = target.toFixed(2);
    }
    requestAnimationFrame(tick);
  }

  function renderResult(data, payload) {
    resultSection.hidden = false;
    resultSection.scrollIntoView({ behavior: "smooth", block: "start" });

    countUp(resultNumber, data.predicted_price);
    if (heroTicker) heroTicker.textContent = data.predicted_price.toFixed(2);

    const present = payload.present_price;
    const predicted = data.predicted_price;
    const maxScale = Math.max(present, predicted) * 1.15 || 1;
    const fillPct = Math.min(100, (predicted / maxScale) * 100);
    const markerPct = Math.min(100, (present / maxScale) * 100);

    gaugeFill.style.width = `${fillPct}%`;
    gaugeMarker.style.left = `${markerPct}%`;
    gaugePresent.textContent = `₹ ${present.toFixed(2)} L`;
    gaugeSelling.textContent = `₹ ${predicted.toFixed(2)} L`;

    const details = [
      { label: "Car", value: payload.car_name },
      { label: "Present price", value: `₹ ${present.toFixed(2)} Lakhs` },
      { label: "Driven", value: `${formatNumber(payload.driven_kms)} km` },
      {
        label: "Age",
        value: `${payload.car_age} ${payload.car_age === 1 ? "year" : "years"}`,
      },
      { label: "Fuel", value: payload.fuel_type },
      { label: "Transmission", value: payload.transmission },
    ];

    resultDetails.innerHTML = "";
    details.forEach((d, i) => {
      const item = document.createElement("div");
      item.className = "result__item";
      item.style.animationDelay = `${i * 60}ms`;
      item.innerHTML = `<span class="result__item-label">${d.label}</span><span class="result__item-value">${d.value}</span>`;
      resultDetails.appendChild(item);
    });

    showToast("Prediction complete");
  }

  /* ------------------------------------------------------------- */
  /* Reset                                                          */
  /* ------------------------------------------------------------- */
  resetBtn.addEventListener("click", () => {
    form.reset();
    clearAllErrors();
    setOwner(0);
    document
      .querySelectorAll(".choice.is-selected")
      .forEach((b) => b.classList.remove("is-selected"));
    document
      .querySelectorAll('[data-choice-group] input[type="hidden"]')
      .forEach((i) => (i.value = ""));
    carAgeOut.textContent = "—";
    kmsPerYearOut.textContent = "—";
    derivedCarAge = null;
    derivedKmsPerYear = null;
    resultSection.hidden = true;
    hideErrorBanner();
    document
      .getElementById("predict")
      .scrollIntoView({ behavior: "smooth", block: "start" });
    carNameInput.focus();
  });

  /* ------------------------------------------------------------- */
  /* Init                                                           */
  /* ------------------------------------------------------------- */
  setOwner(0);
})();

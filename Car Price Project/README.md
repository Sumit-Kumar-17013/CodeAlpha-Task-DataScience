<div align="center">

# 🚗 Redline AI — Car Price Predictor

### An end-to-end machine learning project that estimates a used car's selling price

<p>
  <img src="https://img.shields.io/badge/Python-3.13-3776AB?style=for-the-badge&logo=python&logoColor=white" />
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" />
  <img src="https://img.shields.io/badge/scikit--learn-F7931E?style=for-the-badge&logo=scikitlearn&logoColor=white" />
  <img src="https://img.shields.io/badge/HTML%2FCSS%2FJS-E34F26?style=for-the-badge&logo=html5&logoColor=white" />
</p>

<p>
  <img src="https://img.shields.io/badge/Model-Random%20Forest-e2793d?style=flat-square" />
  <img src="https://img.shields.io/badge/CV%20R²-0.889-5cc8ff?style=flat-square" />
  <img src="https://img.shields.io/badge/Status-Active-4bd18b?style=flat-square" />
  <img src="https://img.shields.io/badge/License-MIT-9aa4b8?style=flat-square" />
</p>

</div>

---

## 📖 What this project is

This is a full ML product, not just a notebook. It has three parts that all talk to each other:

| Layer | File(s) | What it does |
|---|---|---|
| 🧠 **Modeling** | `Car_Price_Prediction.ipynb` | Cleans a used-car dataset, engineers features, trains and compares 8 regression algorithms, tunes the winner, and saves it as a `.pkl` |
| ⚙️ **Backend API** | `main.py` | A FastAPI service that loads the trained model and serves predictions over a `POST /predict` endpoint |
| 🎨 **Frontend** | `index.html`, `style.css`, `script.js` | A dark, dashboard-styled web UI where a user fills in car details and gets an AI-estimated price, with live validation, auto-calculated fields, and an animated result screen |

The goal: type in a car's details, get back an estimated selling price in seconds — with a real model behind it, not a lookup table.

---

## 🧠 The machine learning pipeline

### 1. Data cleaning
- Loaded the raw used-car dataset (`Car_Name`, `Year`, `Selling_Price`, `Present_Price`, `Driven_kms`, `Fuel_Type`, `Selling_type`, `Transmission`, `Owner`)
- Dropped duplicate rows
- Inspected distributions and skewness of every numerical column

### 2. Feature engineering
Two new features were engineered and the raw `Year` column was dropped in favor of them:

```python
df['Car_Age']     = df['Year'].max() - df['Year']
df['kms_Per_Year'] = df['Driven_kms'] / (df['Car_Age'] + 1)
```

- **`Car_Age`** — how old the car is, relative to the newest car in the dataset
- **`kms_Per_Year`** — average annual usage, a much stronger usage signal than raw odometer reading alone

### 3. Preprocessing pipeline

Built with `scikit-learn`'s `ColumnTransformer` so every transformation is reproducible and versioned with the model itself:

| Feature group | Columns | Transform |
|---|---|---|
| 📉 Skewed numeric | `Present_Price` | `log1p` → `StandardScaler` |
| 🔢 Numeric | `Driven_kms`, `Owner`, `Car_Age`, `kms_Per_Year` | `StandardScaler` |
| 🔤 Ordinal categorical | `Selling_type`, `Transmission`, `Fuel_Type` | `OrdinalEncoder` |
| 🏷️ High-cardinality categorical | `Car_Name` | `OneHotEncoder` |

### 4. Model comparison

Eight algorithms were trained and evaluated with 5-fold cross-validation, ranked by **CV Mean R²**:

| Rank | Model | Test R² | MAE (Lakhs) | RMSE (Lakhs) | CV Mean R² |
|:---:|---|:---:|:---:|:---:|:---:|
| 🥇 | **Random Forest** | 0.569 | 1.396 | 3.333 | **0.888** |
| 🥈 | Decision Tree | 0.824 | 1.061 | 2.131 | 0.880 |
| 🥉 | XGBoost | 0.703 | 1.132 | 2.769 | 0.866 |
| 4 | Gradient Boosting | 0.618 | 1.281 | 3.138 | 0.861 |
| 5 | SVR | 0.845 | 0.945 | 1.996 | 0.824 |
| 6 | Ridge | 0.549 | 1.962 | 3.409 | 0.816 |
| 7 | Lasso | 0.613 | 1.748 | 3.160 | 0.785 |
| 8 | Linear Regression | 0.419 | 2.407 | 3.871 | 0.721 |

**Random Forest** was selected — highest cross-validation R², which is the more reliable generalization estimate than a single train/test split.

### 5. Hyperparameter tuning

Tuned with `RandomizedSearchCV` (50 iterations, 5-fold CV) over `n_estimators`, `max_depth`, `min_samples_split`, `min_samples_leaf`, and `max_features`.

```text
Best Parameters:
  max_depth        = 12
  max_features      = 0.8
  min_samples_leaf  = 1
  min_samples_split = 2
  n_estimators      = 720
```

**Final tuned model:**

| Metric | Value |
|---|---|
| CV Mean R² | **0.8889** |
| Test R² | 0.5806 |
| MAE | 1.3785 Lakhs |
| RMSE | 3.2878 Lakhs |

The gap between CV R² and test R² is worth knowing about honestly: it suggests the single held-out test split is small/noisy relative to cross-validation, which is common with compact tabular datasets like this one. It's a good candidate for more data or a larger test set down the line.

### 6. Saving the model

```python
joblib.dump(best_model, "car_price_prediction_model.pkl")
```

The saved object is the **entire pipeline** — preprocessing and model together — so the backend never has to re-implement any encoding logic.

---

## ⚙️ The backend — `main.py`

A FastAPI service with strict request validation via Pydantic.

### Endpoints

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/` | Welcome message + endpoint list |
| `GET` | `/health` | Health check + uptime |
| `POST` | `/predict` | Runs the model and returns a price prediction |
| `GET` | `/docs` | Auto-generated Swagger UI |

### Request schema (`POST /predict`)

```json
{
  "car_name": "swift",
  "present_price": 5.59,
  "driven_kms": 27000,
  "fuel_type": "Petrol",
  "selling_type": "Dealer",
  "transmission": "Manual",
  "owner": 0,
  "car_age": 5,
  "kms_per_year": 4500
}
```

| Field | Type | Constraint |
|---|---|---|
| `car_name` | string | 1–100 characters |
| `present_price` | float | 0 < x ≤ 1000 (Lakhs) |
| `driven_kms` | float | 0 ≤ x ≤ 1,000,000 |
| `fuel_type` | enum | `Petrol`, `Diesel`, `CNG` |
| `selling_type` | enum | `Dealer`, `Individual` |
| `transmission` | enum | `Manual`, `Automatic` |
| `owner` | int | 0 ≤ x ≤ 5 |
| `car_age` | float | 0 ≤ x ≤ 50 |
| `kms_per_year` | float | 0 ≤ x ≤ 100,000 |

### Response schema

```json
{
  "predicted_price": 4.85,
  "currency": "INR",
  "unit": "Lakhs",
  "model": "Random Forest",
  "status": "success"
}
```

CORS is open (`allow_origins=["*"]`) so the frontend can call it from any origin during development.

---

## 🎨 The frontend — `index.html` · `style.css` · `script.js`

A single-page, framework-free UI (plain HTML/CSS/JS — no build step) styled as a premium automotive-AI dashboard.

**Design language:** dark charcoal background, a copper accent for the "automotive dashboard" feel and a cyan accent for the "AI/live signal" feel, glassmorphic cards, and a circular gauge visual in the hero.

**What it does for the user:**
- 🔍 Autocomplete on the car-name field
- 📅 Type a manufacture year → car age is calculated automatically
- 📊 Driven km + car age → average annual usage is calculated live
- 🎛️ Fuel type / selling type / transmission as selectable visual cards, not dropdowns
- ➖➕ A stepper for previous owners
- ✅ Inline field validation that mirrors the backend's exact limits, before anything is sent
- ⏳ An animated loading state while the request is in flight
- 💰 A results screen with a count-up animation and a present-price-vs-predicted-price bar
- 🚨 Clear, human error messages for network failures, validation errors, and prediction errors
- ↻ A "predict another car" reset

It talks to the backend at `http://127.0.0.1:8000/predict` using nothing but `fetch()`.

---

## 📁 Project structure

```text
car-price-prediction/
├── Car_Price_Prediction.ipynb      # data cleaning, feature engineering, model training
├── main.py                         # FastAPI backend
├── car_price_prediction_model.pkl  # trained pipeline (preprocessing + Random Forest)
├── index.html                      # frontend markup
├── style.css                       # frontend styling
├── script.js                       # frontend logic + API calls
└── README.md                       # you are here
```

---

## 🚀 Getting it running

### 1. Install backend dependencies

```bash
pip install fastapi uvicorn pandas numpy scikit-learn joblib
```

### 2. Make sure the trained model file is present

`car_price_prediction_model.pkl` must sit next to `main.py` (re-run the notebook's final cell if you need to regenerate it).

### 3. Start the API

```bash
python main.py
```

The server starts at `http://127.0.0.1:8000` — visit `/docs` for interactive Swagger docs.

### 4. Open the frontend

Just open `index.html` in a browser. No build tools, no npm install — it's plain HTML/CSS/JS.

> Keep the FastAPI server running in the background while using the UI; the frontend calls `http://127.0.0.1:8000/predict` directly.

---

## 🗺️ Ideas for next steps

- [ ] Expand the training dataset for a tighter CV/test R² gap
- [ ] Add a confidence range once the model supports prediction intervals
- [ ] Persist the full unique `Car_Name` list for complete frontend autocomplete
- [ ] Add authentication/rate limiting before any public deployment
- [ ] Containerize the backend with Docker for easier deployment

---

<div align="center">

Built as an ML + full-stack demo — predictions are AI estimates, not official valuations.

</div>

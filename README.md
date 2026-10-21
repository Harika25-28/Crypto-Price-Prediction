# Cryptocurrency Price Prediction Using Hybrid Predictive Models

A cryptocurrency price prediction web application with a **FastAPI backend** and a **React, TypeScript, and Vite frontend**. The backend includes prediction services using hybrid and deep-learning models.

## Tech Stack

**Frontend**
- React
- TypeScript
- Vite
- CSS

**Backend**
- Python
- FastAPI
- SQLAlchemy
- Pandas and NumPy
- Scikit-learn
- LightGBM
- PyTorch and PyTorch Lightning
- Darts and Transformers

**Data and Models**
- Cryptocurrency market data
- Technical indicators
- ARIMA, LightGBM, TCN, TFT, and hybrid model implementations

## Project Structure

```text

Crypto-Price-Prediction/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── services/
│   │   ├── main.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   └── database.py
│   ├── tests/
│   ├── data/                 # Local datasets; not included in Git
│   ├── requirements.txt
│   └── train.py
├── frontend/
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
├── .gitignore
├── project_report.txt
└── README.md
```


## Prerequisites

Install:
- Python 3.12 or a compatible Python version
- Node.js and npm
- Git

## Setup and Run

### 1. Clone the repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd Crypto-Price-Prediction
```

Replace the placeholder with your actual GitHub repository URL after creating the repository.

### 2. Set up the backend

From the project root, run:

```bash
cd backend
python -m venv venv
```

Activate the virtual environment.

**Windows PowerShell**

```powershell
.\venv\Scripts\Activate.ps1
```

**macOS/Linux**

```bash
source venv/bin/activate
```

Install the dependencies:

```bash
python -m pip install --upgrade pip
pip install -r requirements.txt
```

Start the backend:

```bash
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

The API should be available at `http://127.0.0.1:8000`.

Interactive API documentation: `http://127.0.0.1:8000/docs`

Keep this terminal running.

### 3. Set up the frontend

Open a second terminal at the project root:

```bash
cd frontend
npm install
npm run dev -- --host
```

Open the local URL printed by Vite, usually `http://localhost:5173/`.

## Cryptocurrency Datasets

The preprocessed Excel datasets are not included in this repository because of their size. Some prediction or model-training operations may require these files.

Place the required datasets in `backend/data/` using the filenames expected by the backend's data-loading configuration. If a dataset is missing, functionality that depends on local data may not work.

## Demo Accounts

The project includes local scripts for creating demo or default accounts. These scripts are excluded from the public repository because they contain hardcoded demo credentials.

To test account-related functionality, configure your own accounts locally and use secure passwords. Never commit passwords, API keys, tokens, or personal account data to GitHub.

From the `backend/` directory, run the appropriate script if needed:

```bash
python create_demo_accounts.py
```

```bash
python create_default_accounts.py
```

Do not publish real passwords, API keys, tokens, or personal account data.

## Testing

From the `backend/` directory, with the virtual environment activated:

```bash
python -m pytest
```

## Troubleshooting

- **Backend does not start:** Verify that the virtual environment is activated and dependencies are installed.
- **Frontend cannot reach the API:** Ensure the backend is running and check the API URL configured in the frontend.
- **Port already in use:** Stop the conflicting process or configure a different port.
- **Prediction or training fails:** Check whether the required local datasets are present and whether all model dependencies installed successfully.

## Notes

- Predictions are model outputs and should not be treated as financial advice.
- Model performance depends on the dataset, preprocessing, evaluation methodology, and market conditions.

### Sign Up Page
![Sign Up Page](screenshots/signup.png)

### Support Page
![Support Page](screenshots/support.png)

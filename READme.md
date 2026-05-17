📊 SmartStock AI: Predictive Inventory Optimization
An End-to-End Supply Chain Intelligence System

🌟 Project Overview
Traditional inventory management relies on manual checks and guesswork, leading to the "Bullwhip Effect"—either costly overstock or business-killing stockouts. SmartStock AI solves this by using Gradient Boosting (XGBoost) to predict future demand with high precision and mathematically calculating optimized Reorder Points (ROP).

🎯 Key Highlights for Showcase
Dynamic Forecasting: Moves away from static "min-max" levels to AI-driven predictions.

Modular Engineering: Built with a production-ready architecture (Separation of Data, ML, and Logic).

Risk Mitigation: Automated Safety Stock calculations using 95% confidence intervals (Z-Score analysis).

Live Dashboard: Real-time visualization for decision-makers.

🏗️ Architecture & Folder Management
I designed the system to be scalable and maintainable, following industry-standard modular patterns:
SmartStock_AI/
├── data/           # Raw and processed datasets (CSV)
├── src/            # Core Logic (The Package)
│   ├── generator.py   # Data ingestion & cleaning
│   ├── model.py       # XGBoost training & feature engineering
│   └── optimizer.py   # Inventory math (Safety Stock, ROP)
├── main.py         # System Orchestrator
└── app.py          # Streamlit UI Layer

🧠 The Machine Learning Pipeline:
1. Feature Engineering
     Lag_1: Previous day's sales performance.
     Rolling_7: Weekly trends to capture seasonality.

2. The XGBoost Engine
I chose XGBoost because it handles non-linear relationships and outliers in retail data better than traditional linear regression. The model is trained on a Time-Series Split to prevent data leakage.

3. Inventory Optimization Logic:
The system calculates the Reorder Point (ROP) using the formula:
ROP = (d \times L) + SS
Where d is predicted daily demand, L is lead time, and SS is Safety Stock calculated via standard deviation and service level factors.

🚀 How to Run

1. Clone & Setup:
    git clone https://github.com/YOUR_USERNAME/SmartStock-AI.git
    cd SmartStock-AI
    pip install -r requirements.txt

2. Execute Pipeline:
     python main.py

3. Launch Dashboard:
       streamlit run app.py

👨‍💻 About the Developer
Dev Kaushik B.Tech Computer Science | Quantum University Focused on bridging the gap between Software Engineering and Data Science.

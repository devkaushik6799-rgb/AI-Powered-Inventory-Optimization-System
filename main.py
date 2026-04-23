import sys
import os

# Crucial: Fixes the 'ModuleNotFoundError' by adding the current folder to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from src.generator import load_user_data
from src.model import prepare_features, train_xgboost
from src.optimizer import InventoryBrain

# --- SET YOUR CSV FILENAME HERE ---
MY_CSV_FILE = "inventory_data.csv"

def main():
    print("--- 🚀 SmartStock AI System Starting ---")
    
    try:
        # Step 1: Load Data
        df = load_user_data(MY_CSV_FILE)
        
        # Step 2: Feature Engineering
        processed_df = prepare_features(df)
        
        # Step 3: Train Model
        model, feats, err = train_xgboost(processed_df)
        print(f"✅ Model Trained. Error Margin (MAE): {err:.2f} units.")
        
        # Step 4: Final Recommendation
        latest_data = processed_df.tail(1)[feats]
        prediction = model.predict(latest_data)[0]
        
        brain = InventoryBrain()
        ss, rop = brain.calculate_strategy(prediction, df['sales'].std())
        
        print("\n" + "="*30)
        print(f"📊 TOMORROW'S FORECAST: {prediction:.2f} Units")
        print(f"🛡️ SAFETY STOCK: {ss} Units")
        print(f"🚨 REORDER POINT: {rop} Units")
        print("="*30)
        
    except Exception as e:
        print(f"❌ Error during execution: {e}")

if __name__ == "__main__":
    main()
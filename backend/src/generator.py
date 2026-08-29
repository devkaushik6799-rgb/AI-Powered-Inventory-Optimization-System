import pandas as pd
import os

def load_user_data(MY_CSV_FILE="inventory_data.csv"):
    """Loads the CSV from the data folder using a dynamic path."""
    # Find the root directory of the project
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    path = os.path.join(base_dir, "data", MY_CSV_FILE)

    if not os.path.exists(path):
        raise FileNotFoundError(f"Missing Data: Please place '{MY_CSV_FILE}' in the /data folder.")

    df = pd.read_csv(path)
    df['date'] = pd.to_datetime(df['date'])
    return df
import pandas as pd
import numpy as np


import os
if not os.path.exists('data'):
    os.makedirs('data')


dates = pd.date_range(start='2023-01-01', periods=1000, freq='D')
data = []
for product in ['SKU_01', 'SKU_02', 'SKU_03']:
    base = np.random.randint(50, 100)
    for d in dates:
        # Add weekend surge
        sales = int(max(0, np.random.normal(base * (1.4 if d.dayofweek >= 5 else 1.0), 10)))
        data.append([d, product, sales])

df = pd.DataFrame(data, columns=['date', 'product_id', 'sales'])
df.to_csv('data/inventory_data.csv', index=False)
print("✅ Success! 'data/inventory_data.csv' has been created.")
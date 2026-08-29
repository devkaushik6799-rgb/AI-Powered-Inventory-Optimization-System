import numpy as np

class InventoryBrain:
    def __init__(self, lead_time=3):
        self.L = lead_time # Days to receive shipping

    def calculate_strategy(self, prediction, std_dev):
        """Calculates Safety Stock and Reorder Points (95% confidence)."""
        
        safety_stock = 1.65 * np.sqrt(self.L) * std_dev
        reorder_point = (prediction * self.L) + safety_stock
        return int(safety_stock), int(reorder_point)
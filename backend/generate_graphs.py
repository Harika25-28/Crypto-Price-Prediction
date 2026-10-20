
import matplotlib.pyplot as plt
import numpy as np

models = ["ARIMA", "LightGBM", "TCN", "TFT", "Hybrid Ensemble"]
mae = [145.22, 110.15, 85.34, 80.12, 65.40]
rmse = [210.45, 165.80, 132.60, 120.33, 95.10]

x = np.arange(len(models))
width = 0.35

fig, ax = plt.subplots(figsize=(10, 6))
rects1 = ax.bar(x - width/2, mae, width, label="Average MAE", color="#3498db")
rects2 = ax.bar(x + width/2, rmse, width, label="Average RMSE", color="#e74c3c")

ax.set_ylabel("Error Value")
ax.set_title("Performance Metric Comparison Across Algorithmic Configurations")
ax.set_xticks(x)
ax.set_xticklabels(models)
ax.legend()

plt.grid(axis="y", linestyle="--", alpha=0.7)
plt.savefig("graphs.png", dpi=300, bbox_inches="tight")


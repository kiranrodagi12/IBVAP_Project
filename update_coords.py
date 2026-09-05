import re
import os

files = [
    r"C:\Users\hp\Desktop\IBVAP_Project\frontend\src\data\demoData.ts",
    r"C:\Users\hp\Desktop\IBVAP_Project\backend\app\services\seed.py"
]

def replace_lat(match):
    val = float(match.group(0))
    # old center 31.604 -> new center 18.5204
    new_val = val - 31.604 + 18.5204
    return f"{new_val:.4f}"

def replace_lng(match):
    val = float(match.group(0))
    # old center 74.512 -> new center 73.8567
    new_val = val - 74.512 + 73.8567
    return f"{new_val:.4f}"

for filepath in files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Update lats (31.5xx or 31.6xx)
    content = re.sub(r"31\.[56]\d{2,4}", replace_lat, content)
    # Update lngs (74.5xx)
    content = re.sub(r"74\.5\d{2,4}", replace_lng, content)
    
    # Update the comment in demoData.ts
    content = content.replace("Wagah Border area, Punjab, India (~31.6°N, 74.5°E)", "Pune, Maharashtra, India (~18.5°N, 73.8°E)")
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

print("Coordinates updated.")

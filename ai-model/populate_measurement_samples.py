import os
import json
import numpy as np
import cv2

os.makedirs('training_photos', exist_ok=True)
os.makedirs('training_data', exist_ok=True)

samples = []

female_data = [
    {"gender": "female", "height_cm": 162.0, "chest_cm": 84.0, "waist_cm": 65.0, "hip_cm": 92.0},
    {"gender": "female", "height_cm": 165.0, "chest_cm": 88.0, "waist_cm": 68.0, "hip_cm": 95.0},
    {"gender": "female", "height_cm": 158.0, "chest_cm": 80.0, "waist_cm": 62.0, "hip_cm": 88.0},
    {"gender": "female", "height_cm": 170.0, "chest_cm": 92.0, "waist_cm": 72.0, "hip_cm": 99.0},
    {"gender": "female", "height_cm": 167.0, "chest_cm": 90.0, "waist_cm": 70.0, "hip_cm": 97.0},
    {"gender": "female", "height_cm": 160.0, "chest_cm": 82.0, "waist_cm": 64.0, "hip_cm": 90.0},
    {"gender": "female", "height_cm": 172.0, "chest_cm": 96.0, "waist_cm": 76.0, "hip_cm": 104.0},
    {"gender": "female", "height_cm": 164.0, "chest_cm": 86.0, "waist_cm": 67.0, "hip_cm": 94.0},
    {"gender": "female", "height_cm": 168.0, "chest_cm": 91.0, "waist_cm": 71.0, "hip_cm": 98.0},
    {"gender": "female", "height_cm": 159.0, "chest_cm": 83.0, "waist_cm": 63.0, "hip_cm": 89.0},
]

male_data = [
    {"gender": "male", "height_cm": 175.0, "chest_cm": 96.0, "waist_cm": 80.0, "hip_cm": 95.0},
    {"gender": "male", "height_cm": 180.0, "chest_cm": 102.0, "waist_cm": 86.0, "hip_cm": 100.0},
    {"gender": "male", "height_cm": 170.0, "chest_cm": 90.0, "waist_cm": 75.0, "hip_cm": 91.0},
    {"gender": "male", "height_cm": 185.0, "chest_cm": 108.0, "waist_cm": 92.0, "hip_cm": 106.0},
    {"gender": "male", "height_cm": 178.0, "chest_cm": 100.0, "waist_cm": 84.0, "hip_cm": 98.0},
    {"gender": "male", "height_cm": 172.0, "chest_cm": 92.0, "waist_cm": 77.0, "hip_cm": 93.0},
    {"gender": "male", "height_cm": 182.0, "chest_cm": 104.0, "waist_cm": 88.0, "hip_cm": 102.0},
    {"gender": "male", "height_cm": 176.0, "chest_cm": 98.0, "waist_cm": 82.0, "hip_cm": 96.0},
    {"gender": "male", "height_cm": 188.0, "chest_cm": 112.0, "waist_cm": 96.0, "hip_cm": 110.0},
    {"gender": "male", "height_cm": 174.0, "chest_cm": 95.0, "waist_cm": 79.0, "hip_cm": 94.0},
]

all_data = female_data + male_data

for i, d in enumerate(all_data):
    # Create avatar thumbnail image
    img = np.zeros((200, 150, 3), dtype=np.uint8)
    bg_color = (236, 72, 153) if d["gender"] == "female" else (59, 130, 246)
    cv2.rectangle(img, (0, 0), (150, 200), (30, 41, 59), -1)
    # Head & torso silhouette
    cv2.circle(img, (75, 45), 25, bg_color, -1)
    cv2.ellipse(img, (75, 135), (40, 55), 0, 0, 360, bg_color, -1)
    cv2.putText(img, d["gender"].upper(), (45, 190), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (255, 255, 255), 1)

    filename = f"sample_{d['gender']}_{i+1:02d}.jpg"
    filepath = os.path.join("training_photos", filename)
    cv2.imwrite(filepath, img)

    samples.append({
        "image_path": filepath,
        "height_cm": d["height_cm"],
        "chest_cm": d["chest_cm"],
        "waist_cm": d["waist_cm"],
        "hip_cm": d["hip_cm"],
        "gender": d["gender"]
    })

json_path = os.path.join("training_data", "measurement_training_data.json")
with open(json_path, "w") as f:
    json.dump(samples, f, indent=2)

print(f"Generated {len(samples)} realistic measurement training samples into {json_path} and training_photos/")

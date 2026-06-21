# model-service/cek_scaler.py
#
# Script diagnosa: cek apakah scaler_fitur & scaler_label konsisten dengan
# data training (cm) dan tidak menyebabkan prediksi "collapse" ke rata-rata.
#
# Cara pakai: taruh di folder model-service/, jalankan dengan venv aktif:
#   python cek_scaler.py

import joblib
import numpy as np
import os
from dotenv import load_dotenv

load_dotenv()

SCALER_FITUR_PATH = os.getenv("SCALER_FITUR_PATH")
SCALER_LABEL_PATH = os.getenv("SCALER_LABEL_PATH")

scaler_fitur = joblib.load(SCALER_FITUR_PATH)
scaler_label = joblib.load(SCALER_LABEL_PATH)

FITUR_COLS = [
    'Manual', 'Sensor',
    'Tinggi_-1Jam', 'Tinggi_-2Jam',
    'Jam_sin', 'Jam_cos',
    'Bulan_sin', 'Bulan_cos',
    'Rolling_mean_6', 'Rolling_mean_24', 'Rolling_std_6',
    'Delta_1Jam', 'Delta_2Jam'
]

print("===== SCALER FITUR =====")
print("Kolom (urutan saat fit, jika tersimpan):", getattr(scaler_fitur, 'feature_names_in_', 'TIDAK ADA NAMA KOLOM TERSIMPAN'))
print()
print(f"{'Kolom':<20} {'data_min_':>12} {'data_max_':>12}")
for i, col in enumerate(FITUR_COLS):
    print(f"{col:<20} {scaler_fitur.data_min_[i]:>12.3f} {scaler_fitur.data_max_[i]:>12.3f}")

print()
print("===== SCALER LABEL =====")
print(f"data_min_: {scaler_label.data_min_[0]:.3f}")
print(f"data_max_: {scaler_label.data_max_[0]:.3f}")

print()
print("===== TEST: transform lalu inverse_transform window riwayat asli kamu =====")
# Window 24 jam terakhir dari riwayat 18-19 Juni (skala cm, sesuai screenshot HeidiSQL x100)
window_manual_cm = [239, 251, 239, 208, 165, 123, 91, 80, 91, 123, 165, 208,
                     239, 251, 239, 208, 165, 123, 91, 80, 91, 123, 165, 208]

print("Range Manual asli (cm):", min(window_manual_cm), "-", max(window_manual_cm))

# Cek posisi nilai ini relatif terhadap range yang dipakai scaler_fitur fit (kolom 'Manual' = index 0)
manual_min_scaler = scaler_fitur.data_min_[0]
manual_max_scaler = scaler_fitur.data_max_[0]
print(f"Range 'Manual' yang dipakai scaler_fitur saat fit: {manual_min_scaler:.2f} - {manual_max_scaler:.2f}")

for v in [min(window_manual_cm), max(window_manual_cm)]:
    normalized = (v - manual_min_scaler) / (manual_max_scaler - manual_min_scaler)
    status = "DALAM RANGE" if 0 <= normalized <= 1 else ">>> DI LUAR RANGE (clipping/ekstrapolasi) <<<"
    print(f"  Nilai {v} cm -> normalized = {normalized:.4f}  [{status}]")

print()
print("===== TEST: inverse_transform label untuk beberapa nilai normalized =====")
for v_norm in [0.0, 0.25, 0.5, 0.75, 1.0]:
    cm = scaler_label.inverse_transform([[v_norm]])[0][0]
    print(f"  normalized {v_norm:.2f} -> {cm:.2f} cm")
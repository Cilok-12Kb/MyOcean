# model-service/main.py
#
# VERSI MULTI-STEP DIRECT FORECASTING — DISESUAIKAN UNTUK
# MODEL CNN-BiLSTM ENHANCED (29 fitur, LOOKBACK=48, HORIZON=24)
#
# PERBAIKAN DI VERSI INI:                                                  # ← DIUBAH
# - hitung_fitur() sebelumnya hanya menghasilkan 11 kolom, padahal         # ← DIUBAH
#   FITUR_COLS butuh 29 kolom (lag panjang, delta panjang, fase lokal,     # ← DIUBAH
#   dan 5 komponen harmonik pasut). Ini menyebabkan KeyError saat          # ← DIUBAH
#   df_fitur[FITUR_COLS] dipanggil. Sekarang hitung_fitur() menghitung     # ← DIUBAH
#   SEMUA fitur, identik dengan notebook preprocessing & modeling.         # ← DIUBAH
# - Referensi waktu harmonik pasut (2023-01-01) disamakan dengan training. # ← DIUBAH
# - LOOKBACK default diubah 24 → 48 (sesuai model enhanced).               # ← DIUBAH
# - Minimal baris riwayat yang dibutuhkan disesuaikan: LOOKBACK + 24       # ← DIUBAH
#   (24 = shift terpanjang, Tinggi_-24Jam / Rolling_mean_24), bukan        # ← DIUBAH
#   LOOKBACK + 2 lagi.                                                     # ← DIUBAH
#
# PERUBAHAN BESAR dari versi sebelum-sebelumnya (tetap berlaku):
# - Model lama (bilstm_best.keras) prediksi 1 jam, dipakai rolling 24x
#   -> TERBUKTI bermasalah: error menumpuk antar-iterasi, hasil collapse
#      ke nilai rata-rata setelah beberapa jam.
# - Model baru (bilstm_multistep_best.keras / cnn_bilstm_enhanced_best.keras)
#   prediksi 24 JAM SEKALIGUS dalam SATU forward pass. Tidak ada iterasi,
#   tidak ada akumulasi error, karena model memang dilatih & dievaluasi
#   untuk skenario ini persis (lihat notebook modeling, evaluasi per horizon).
import keras
import os
import joblib
import numpy as np
import pandas as pd
import tensorflow as tf
from fastapi import FastAPI, HTTPException, Header
from pydantic import BaseModel
from typing import Optional, List
from dotenv import load_dotenv

keras.config.enable_unsafe_deserialization()

load_dotenv()

MODEL_PATH        = os.getenv("MODEL_PATH")
SCALER_FITUR_PATH = os.getenv("SCALER_FITUR_PATH")
SCALER_LABEL_PATH = os.getenv("SCALER_LABEL_PATH")
LOOKBACK           = int(os.getenv("LOOKBACK", 48))   # ← DIUBAH (default 24 → 48)
HORIZON            = int(os.getenv("HORIZON", 24))
INTERNAL_API_KEY   = os.getenv("INTERNAL_API_KEY")

# Shift terpanjang yang dipakai di hitung_fitur() (Tinggi_-24Jam,           # ← BARU
# Rolling_mean_24). Baris paling awal di riwayat akan NaN sebanyak ini      # ← BARU
# dan dibuang sebelum windowing -> dipakai untuk validasi jumlah riwayat.   # ← BARU
MAX_LAG_JAM = 24                                                            # ← BARU

app = FastAPI(title="BiLSTM Pasang Surut Inference Service (Multi-Step)")

print("Loading model & scaler...")
model = tf.keras.models.load_model(
    MODEL_PATH,
    safe_mode=False
)
scaler_fitur  = joblib.load(SCALER_FITUR_PATH)
scaler_label  = joblib.load(SCALER_LABEL_PATH)
print("Model & scaler siap.")

# Verifikasi cepat: output model harus berukuran HORIZON
output_shape = model.output_shape
print(f"Model output shape: {output_shape}")
if output_shape[-1] != HORIZON:
    print(f"PERINGATAN: output model ({output_shape[-1]}) tidak sama dengan "
          f"HORIZON yang dikonfigurasi ({HORIZON}). Cek MODEL_PATH/.env.")

FITUR_COLS = [
    'Manual', 'Sensor',
    'Tinggi_-1Jam', 'Tinggi_-2Jam',
    'Tinggi_-6Jam', 'Tinggi_-12Jam', 'Tinggi_-24Jam',

    'Jam_sin', 'Jam_cos',
    'Bulan_sin', 'Bulan_cos',

    'Rolling_mean_6',
    'Rolling_mean_24',
    'Rolling_std_6',

    'Delta_1Jam',
    'Delta_2Jam',
    'Delta_6Jam',
    'Delta_12Jam',

    'Amplitudo_lokal',
    'Posisi_siklus',

    'M2_sin', 'M2_cos',
    'S2_sin', 'S2_cos',
    'N2_sin', 'N2_cos',
    'K1_sin', 'K1_cos',
    'O1_sin', 'O1_cos',
]

# Komponen harmonik pasut & referensi waktu — HARUS identik dengan          # ← BARU
# notebook modeling (modeling_multistep.py bagian 7 / 4), karena fase       # ← BARU
# sin/cos dihitung dari jarak jam absolut ke titik referensi ini.           # ← BARU
REFERENSI_WAKTU_HARMONIK = pd.Timestamp('2023-01-01')                      # ← BARU
KOMPONEN_PASUT = {                                                          # ← BARU
    'M2': 12.4206,   # bulan utama (terkuat)                               # ← BARU
    'S2': 12.0000,   # matahari                                            # ← BARU
    'N2': 12.6583,   # elips orbit bulan                                   # ← BARU
    'K1': 23.9345,   # diurnal luni-solar                                  # ← BARU
    'O1': 25.8193,   # diurnal bulan                                       # ← BARU
}                                                                            # ← BARU

# -- Skema request/response --

class JamHistoris(BaseModel):
    datetime: str
    manual: float
    sensor: float


class PrediksiRequest(BaseModel):
    riwayat: List[JamHistoris]   # urut waktu naik, lihat MIN_RIWAYAT di bawah


class HasilJam(BaseModel):
    datetime: str
    jam: int
    prediksi_cm: float


class PrediksiResponse(BaseModel):
    count: int
    hasil: List[HasilJam]


def hitung_fitur(df: pd.DataFrame) -> pd.DataFrame:
    """
    Feature engineering -- identik dengan notebook preprocessing & modeling
    (29 fitur: lag pendek+panjang, jam/bulan siklikal, rolling, delta,
    fase/amplitudo lokal, dan 5 komponen harmonik pasut).
    df harus punya kolom: Datetime, Manual, Sensor -- urut waktu naik.
    Dipanggil SEKALI saja (tidak ada lagi loop rolling), jadi dropna
    di sini aman dan tidak menyebabkan masalah penyusutan berulang.
    """
    df = df.copy()
    df['Datetime'] = pd.to_datetime(df['Datetime'], format="%Y-%m-%d %H:%M:%S")
    df = df.sort_values('Datetime').reset_index(drop=True)

    # --- Lag pendek & panjang ---                                         # ← DIUBAH
    df['Tinggi_-1Jam']  = df['Manual'].shift(1)
    df['Tinggi_-2Jam']  = df['Manual'].shift(2)
    df['Tinggi_-6Jam']  = df['Manual'].shift(6)                            # ← BARU
    df['Tinggi_-12Jam'] = df['Manual'].shift(12)                           # ← BARU
    df['Tinggi_-24Jam'] = df['Manual'].shift(24)                           # ← BARU

    # --- Encode jam & bulan secara siklikal ---
    df['Jam_num']   = df['Datetime'].dt.hour
    df['Bulan']     = df['Datetime'].dt.month
    df['Jam_sin']   = np.sin(2 * np.pi * df['Jam_num'] / 24)
    df['Jam_cos']   = np.cos(2 * np.pi * df['Jam_num'] / 24)
    df['Bulan_sin'] = np.sin(2 * np.pi * df['Bulan']   / 12)
    df['Bulan_cos'] = np.cos(2 * np.pi * df['Bulan']   / 12)

    # --- Rolling statistik ---
    df['Rolling_mean_6']  = df['Manual'].rolling(window=6,  min_periods=1).mean()
    df['Rolling_mean_24'] = df['Manual'].rolling(window=24, min_periods=1).mean()
    df['Rolling_std_6']   = df['Manual'].rolling(window=6,  min_periods=1).std().fillna(0)

    # --- Diferensiasi ---                                                 # ← DIUBAH
    df['Delta_1Jam']  = df['Manual'].diff(1).fillna(0)
    df['Delta_2Jam']  = df['Manual'].diff(2).fillna(0)
    df['Delta_6Jam']  = df['Manual'].diff(6).fillna(0)                     # ← BARU
    df['Delta_12Jam'] = df['Manual'].diff(12).fillna(0)                    # ← BARU

    # --- Fitur harmonik pasang surut ---                                  # ← BARU
    t = (df['Datetime'] - REFERENSI_WAKTU_HARMONIK).dt.total_seconds() / 3600.0  # ← BARU
    for nama, periode in KOMPONEN_PASUT.items():                           # ← BARU
        omega = 2 * np.pi / periode                                       # ← BARU
        df[f'{nama}_sin'] = np.sin(omega * t)                             # ← BARU
        df[f'{nama}_cos'] = np.cos(omega * t)                             # ← BARU

    # --- Fitur fase & amplitudo lokal ---                                 # ← BARU
    # CATATAN: rolling center=True butuh data di MASA DEPAN. Untuk baris   # ← BARU
    # paling akhir (paling baru) di riwayat, jendela ini otomatis hanya    # ← BARU
    # terisi dari data historis (tidak ada masa depan), jadi nilainya      # ← BARU
    # sedikit berbeda dari saat training. Ini batasan bawaan fitur ini     # ← BARU
    # saat dipakai untuk inference real-time, bukan bug.                  # ← BARU
    rolling_max = df['Manual'].rolling(window=13, center=True, min_periods=1).max()  # ← BARU
    rolling_min = df['Manual'].rolling(window=13, center=True, min_periods=1).min()  # ← BARU
    df['Amplitudo_lokal'] = rolling_max - rolling_min                      # ← BARU
    df['Posisi_siklus']   = (df['Manual'] - rolling_min) / (rolling_max - rolling_min + 1e-6)  # ← BARU

    # Baris paling awal akan NaN karena shift terpanjang (24 jam) -- buang # ← DIUBAH
    df = df.dropna(subset=[
        'Tinggi_-1Jam', 'Tinggi_-2Jam',
        'Tinggi_-6Jam', 'Tinggi_-12Jam', 'Tinggi_-24Jam',
    ]).reset_index(drop=True)
    return df


def prediksi_multistep(df_fitur: pd.DataFrame) -> List[HasilJam]:
    """
    SATU forward pass: ambil LOOKBACK jam terakhir, model langsung
    mengembalikan HORIZON nilai (jam+1 s.d jam+HORIZON) sekaligus.
    Tidak ada iterasi, tidak ada akumulasi error.
    """
    if len(df_fitur) < LOOKBACK:
        raise HTTPException(
            status_code=400,
            detail=f"Data riwayat kurang setelah feature engineering. "
                   f"Tersedia {len(df_fitur)} baris valid, butuh minimal {LOOKBACK}."
        )

    window_df = df_fitur[FITUR_COLS].iloc[-LOOKBACK:]
    window_scaled = scaler_fitur.transform(window_df)
    X = window_scaled.reshape(1, LOOKBACK, len(FITUR_COLS))

    pred_scaled = model.predict(X, verbose=0)          # shape (1, HORIZON)
    pred_scaled_flat = pred_scaled.reshape(-1, 1)       # shape (HORIZON, 1) untuk inverse_transform
    pred_cm = scaler_label.inverse_transform(pred_scaled_flat).flatten()  # shape (HORIZON,)

    last_dt = df_fitur['Datetime'].iloc[-1]
    hasil = []
    for h in range(HORIZON):
        next_dt = last_dt + pd.Timedelta(hours=h + 1)
        hasil.append(HasilJam(
            datetime=next_dt.strftime("%Y-%m-%d %H:%M:%S"),
            jam=next_dt.hour,
            prediksi_cm=round(float(pred_cm[h]), 2),
        ))

    return hasil


@app.get("/health")
def health():
    return {"status": "ok", "model_loaded": model is not None, "horizon": HORIZON}


@app.post("/predict", response_model=PrediksiResponse)
def predict(payload: PrediksiRequest, x_api_key: Optional[str] = Header(None)):
    if INTERNAL_API_KEY and x_api_key != INTERNAL_API_KEY:
        raise HTTPException(status_code=401, detail="API key tidak valid.")

    min_riwayat = LOOKBACK + MAX_LAG_JAM   # ← DIUBAH (dulu: LOOKBACK + 2)
    if len(payload.riwayat) < min_riwayat:
        raise HTTPException(
            status_code=400,
            detail=f"Minimal {min_riwayat} baris riwayat dibutuhkan "
                   f"(LOOKBACK={LOOKBACK} + {MAX_LAG_JAM} jam untuk fitur lag panjang), "
                   f"dapat {len(payload.riwayat)}."
        )

    df = pd.DataFrame([r.dict() for r in payload.riwayat])
    df = df.rename(columns={'manual': 'Manual', 'sensor': 'Sensor', 'datetime': 'Datetime'})

    df_fitur = hitung_fitur(df)
    hasil = prediksi_multistep(df_fitur)

    return PrediksiResponse(count=len(hasil), hasil=hasil)
# model-service/main.py
#
# VERSI MULTI-STEP DIRECT FORECASTING
#
# PERUBAHAN BESAR dari versi sebelumnya:
# - Model lama (bilstm_best.keras) prediksi 1 jam, dipakai rolling 24x
#   -> TERBUKTI bermasalah: error menumpuk antar-iterasi, hasil collapse
#      ke nilai rata-rata setelah beberapa jam.
# - Model baru (bilstm_multistep_best.keras) prediksi 24 JAM SEKALIGUS
#   dalam SATU forward pass. Tidak ada iterasi, tidak ada akumulasi error,
#   karena model memang dilatih & dievaluasi untuk skenario ini persis
#   (lihat notebook modeling_multistep.py, evaluasi per horizon).
#
# Akibatnya kode ini JAUH LEBIH SEDERHANA dari versi sebelumnya — tidak
# perlu lagi fungsi tambah_baris_prediksi() atau loop rolling forecast.

import os
import joblib
import numpy as np
import pandas as pd
import tensorflow as tf
from fastapi import FastAPI, HTTPException, Header
from pydantic import BaseModel
from typing import Optional, List
from dotenv import load_dotenv

load_dotenv()

MODEL_PATH        = os.getenv("MODEL_PATH")
SCALER_FITUR_PATH = os.getenv("SCALER_FITUR_PATH")
SCALER_LABEL_PATH = os.getenv("SCALER_LABEL_PATH")
LOOKBACK           = int(os.getenv("LOOKBACK", 24))
HORIZON            = int(os.getenv("HORIZON", 24))
INTERNAL_API_KEY   = os.getenv("INTERNAL_API_KEY")

app = FastAPI(title="BiLSTM Pasang Surut Inference Service (Multi-Step)")

print("Loading model & scaler...")
model         = tf.keras.models.load_model(MODEL_PATH)
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
    'Jam_sin', 'Jam_cos',
    'Bulan_sin', 'Bulan_cos',
    'Rolling_mean_6', 'Rolling_mean_24', 'Rolling_std_6',
    'Delta_1Jam', 'Delta_2Jam'
]


# -- Skema request/response --

class JamHistoris(BaseModel):
    datetime: str
    manual: float
    sensor: float


class PrediksiRequest(BaseModel):
    riwayat: List[JamHistoris]   # tepat LOOKBACK + 2 baris (untuk shift fitur), urut waktu naik


class HasilJam(BaseModel):
    datetime: str
    jam: int
    prediksi_cm: float


class PrediksiResponse(BaseModel):
    count: int
    hasil: List[HasilJam]


def hitung_fitur(df: pd.DataFrame) -> pd.DataFrame:
    """
    Feature engineering -- identik dengan notebook preprocessing.
    df harus punya kolom: Datetime, Manual, Sensor -- urut waktu naik.
    Dipanggil SEKALI saja (tidak ada lagi loop rolling), jadi dropna
    di sini aman dan tidak menyebabkan masalah penyusutan berulang.
    """
    df = df.copy()
    df['Datetime'] = pd.to_datetime(df['Datetime'], format="%Y-%m-%d %H:%M:%S")
    df = df.sort_values('Datetime').reset_index(drop=True)

    df['Tinggi_-1Jam'] = df['Manual'].shift(1)
    df['Tinggi_-2Jam'] = df['Manual'].shift(2)

    df['Jam_num']   = df['Datetime'].dt.hour
    df['Bulan']     = df['Datetime'].dt.month
    df['Jam_sin']   = np.sin(2 * np.pi * df['Jam_num'] / 24)
    df['Jam_cos']   = np.cos(2 * np.pi * df['Jam_num'] / 24)
    df['Bulan_sin'] = np.sin(2 * np.pi * df['Bulan']   / 12)
    df['Bulan_cos'] = np.cos(2 * np.pi * df['Bulan']   / 12)

    df['Rolling_mean_6']  = df['Manual'].rolling(window=6,  min_periods=1).mean()
    df['Rolling_mean_24'] = df['Manual'].rolling(window=24, min_periods=1).mean()
    df['Rolling_std_6']   = df['Manual'].rolling(window=6,  min_periods=1).std().fillna(0)

    df['Delta_1Jam'] = df['Manual'].diff(1).fillna(0)
    df['Delta_2Jam'] = df['Manual'].diff(2).fillna(0)

    df = df.dropna(subset=['Tinggi_-1Jam', 'Tinggi_-2Jam']).reset_index(drop=True)
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

    if len(payload.riwayat) < LOOKBACK + 2:
        raise HTTPException(
            status_code=400,
            detail=f"Minimal {LOOKBACK + 2} baris riwayat dibutuhkan, dapat {len(payload.riwayat)}."
        )

    df = pd.DataFrame([r.dict() for r in payload.riwayat])
    df = df.rename(columns={'manual': 'Manual', 'sensor': 'Sensor', 'datetime': 'Datetime'})

    df_fitur = hitung_fitur(df)
    hasil = prediksi_multistep(df_fitur)

    return PrediksiResponse(count=len(hasil), hasil=hasil)
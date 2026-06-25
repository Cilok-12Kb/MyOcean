import requests
import json
import time

# ==========================
# Konfigurasi
# ==========================
WILAYAH_API = "https://wilayah-id-restapi.vercel.app/api/v1"
LARAVEL_BASE_URL = "http://localhost:8000/api"
LARAVEL_TOKEN = ""

HEADERS = {
    "Content-Type": "application/json"
}

if LARAVEL_TOKEN:
    HEADERS["Authorization"] = f"Bearer {LARAVEL_TOKEN}"

# Semua kemungkinan nama kelurahan di API (huruf besar) → nama di database Laravel
KELURAHAN_TARGET = {
    # Semarang Barat
    "TAMBAKHARJO":   "Tambakharjo",
    "TAMBAK_HARJO":  "Tambakharjo",   # variasi nama dengan spasi
    "TAWANGSARI":    "Tawangsari",
    "TAWANGMAS":     "Tawangmas",
    "TAWANG MAS":    "Tawangmas",     # variasi nama dengan spasi

    # Semarang Utara
    "PANGGUNG LOR":  "Panggung Lor",
    "BANDARHARJO":   "Bandarharjo",
    "TANJUNG MAS":   "Tanjung Mas",
    "TANJUNGMAS":    "Tanjung Mas",   # variasi tanpa spasi

    # Semarang Timur
    "KEMIJEN":       "Kemijen",

    # Gayamsari
    "TAMBAKREJO":    "Tambakrejo",

    # Genuk
    "TERBOYO KULON": "Terboyo Kulon",
    "TERBOYO WETAN": "Terboyo Wetan",
    "TRIMULYO":      "Trimulyo",
}

# 5 kecamatan yang mencakup semua 11 kelurahan target
TARGET_KECAMATAN = {
    "SEMARANG UTARA",   # Bandarharjo, Panggung Lor, Tanjung Mas
    "SEMARANG BARAT",   # Tambakharjo, Tawangsari, Tawangmas
    "SEMARANG TIMUR",   # Kemijen
    "GAYAMSARI",        # Tambakrejo
    "GENUK",            # Terboyo Kulon, Terboyo Wetan, Trimulyo
}


def fetch_districts():
    r = requests.get(
        f"{WILAYAH_API}/regions/districts?regency_code=3374",
        timeout=15,
    )
    r.raise_for_status()
    return r.json()["data"]


def fetch_villages_geometry(kode_kec):
    r = requests.get(
        f"{WILAYAH_API}/boundaries/villages?district_code={kode_kec}&geometry=true",
        timeout=30,
    )
    r.raise_for_status()

    data = r.json()

    if data.get("type") == "FeatureCollection":
        return data["features"]

    return []


def get_laravel_wilayah_list():
    r = requests.get(
        f"{LARAVEL_BASE_URL}/admin/wilayah-rob",
        headers=HEADERS,
        timeout=10,
    )
    r.raise_for_status()

    return {
        row["nama_wilayah"]: row["id"]
        for row in r.json()["data"]
    }


def upload_geojson_to_laravel(id_wilayah, geometry, nama):
    payload = {
        "geojson": json.dumps(geometry, ensure_ascii=False)
    }

    r = requests.put(
        f"{LARAVEL_BASE_URL}/admin/wilayah-rob/{id_wilayah}/geojson",
        json=payload,
        headers=HEADERS,
        timeout=20,
    )

    if r.ok:
        print(f"   ✓ {nama} berhasil diupload")
    else:
        print(f"   ✗ {nama} gagal ({r.status_code})")
        print(r.text)


def main():
    print("=== Ambil Kecamatan Kota Semarang ===")

    districts = fetch_districts()

    found = [
        d for d in districts
        if d["nama_kecamatan"].upper() in TARGET_KECAMATAN
    ]

    if not found:
        print("Tidak ada kecamatan yang ditemukan. Daftar tersedia:")
        for d in districts:
            print(f"  - {d['nama_kecamatan']} ({d['kode_kec']})")
        return

    print(f"Ditemukan {len(found)} kecamatan:")
    for d in found:
        print(f"  - {d['nama_kecamatan']} ({d['kode_kec']})")
    print()

    wilayah_db = get_laravel_wilayah_list()
    print(f"Wilayah di database Laravel: {list(wilayah_db.keys())}")
    print()

    uploaded = set()

    for kec in found:
        print("=" * 50)
        print(f"Kecamatan: {kec['nama_kecamatan']}")

        features = fetch_villages_geometry(kec["kode_kec"])
        print(f"Total kelurahan: {len(features)}")

        for feat in features:
            props = feat.get("properties", {})
            nama = props.get("nama_desa", "").strip()
            geometry = feat.get("geometry")
            nama_upper = nama.upper()

            if nama_upper not in KELURAHAN_TARGET:
                continue

            nama_db = KELURAHAN_TARGET[nama_upper]

            # Cegah upload duplikat (misal "Tanjung Mas" dan "Tanjungmas" keduanya match)
            if nama_db in uploaded:
                print(f"  -> SKIP {nama_db} (sudah diupload)")
                continue

            print(f"  -> MATCH: '{nama}' → '{nama_db}'")

            if nama_db not in wilayah_db:
                print(f"     SKIP: '{nama_db}' tidak ada di database Laravel")
                continue

            if not geometry:
                print(f"     SKIP: geometry kosong")
                continue

            upload_geojson_to_laravel(wilayah_db[nama_db], geometry, nama_db)
            uploaded.add(nama_db)

            time.sleep(0.3)

    print()
    print("=" * 50)
    print(f"SELESAI — {len(uploaded)} dari 11 kelurahan berhasil diupload")

    missing = set(KELURAHAN_TARGET.values()) - uploaded

    if missing:
        print("\nBelum ditemukan di API:")
        for m in sorted(missing):
            print(f"  - {m}")
        print("\nUntuk kelurahan yang tidak ditemukan, input manual melalui")
        print("ModalPetaWilayah di admin panel (mode 'Paste GeoJSON' dari geojson.io).")
    else:
        print("\nSemua 11 kelurahan berhasil diupload!")


if __name__ == "__main__":
    main()
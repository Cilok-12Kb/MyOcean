// src/components/PasangSurut/ModalPetaWilayah.jsx
import { useEffect, useState, useCallback } from "react";
import {
  Modal, Button, Form, Alert, Spinner, Badge, ListGroup, Table,
} from "react-bootstrap";
import api from "../../services/api";

// ── Konversi DMS ke decimal ──────────────────────────────────────────────────
// Mendukung format dari tabel BIG/BPN:
// - "6° 57' 00.0451" S"  (degree symbol, menit, detik, arah)
// - "6 57 00.0451 S"     (spasi saja)
// - "-6.950012"          (sudah decimal)
// - "6.950012 S"         (decimal dengan arah)

function dmsToDecimal(str) {
  if (!str || !str.trim()) return null;
  const s = str.trim();

  // Cek apakah ada arah (N/S/E/W)
  const dirMatch = s.match(/[NSEWnsew]/);
  const dir = dirMatch ? dirMatch[0].toUpperCase() : null;
  const cleaned = s.replace(/[NSEWnsew]/g, "").trim();

  // Coba parse sebagai decimal murni
  const directDecimal = parseFloat(cleaned.replace(",", "."));
  if (!isNaN(directDecimal) && !cleaned.match(/[°'"]/)) {
    const val = Math.abs(directDecimal);
    return (dir === "S" || dir === "W") ? -val : val;
  }

  // Ekstrak semua angka (mendukung koma/titik desimal)
  const nums = cleaned.match(/\d+(?:[.,]\d+)?/g);
  if (!nums || nums.length < 1) return null;

  const d = parseFloat(nums[0]) || 0;
  const m = parseFloat((nums[1] || "0").replace(",", ".")) || 0;
  const sec = parseFloat((nums[2] || "0").replace(",", ".")) || 0;
  let decimal = d + m / 60 + sec / 3600;

  if (dir === "S" || dir === "W") decimal = -decimal;

  return Math.round(decimal * 100000000) / 100000000;
}

function decimalToDMS(decimal, isLat) {
  const abs = Math.abs(decimal);
  const d = Math.floor(abs);
  const mFull = (abs - d) * 60;
  const m = Math.floor(mFull);
  const sec = ((mFull - m) * 60).toFixed(4);
  const dir = isLat ? (decimal >= 0 ? "N" : "S") : (decimal >= 0 ? "E" : "W");
  return `${d}° ${String(m).padStart(2, "0")}' ${String(sec).padStart(7, "0")}" ${dir}`;
}

// ── Komponen baris titik koordinat ───────────────────────────────────────────

function TitikRow({ idx, titik, onChange, onRemove, error }) {
  return (
    <tr style={{ fontSize: 13 }}>
      <td className="text-center text-muted align-middle" style={{ width: 36 }}>
        {idx + 1}
      </td>
      <td style={{ minWidth: 200 }}>
        <Form.Control
          size="sm"
          placeholder="cth: 6° 57' 00.045&quot; S"
          value={titik.lintang}
          onChange={e => onChange(idx, "lintang", e.target.value)}
          isInvalid={!!error?.lintang}
          style={{ fontFamily: "monospace", fontSize: 12 }}
        />
        {error?.lintang && (
          <div className="text-danger" style={{ fontSize: 11 }}>{error.lintang}</div>
        )}
      </td>
      <td style={{ minWidth: 200 }}>
        <Form.Control
          size="sm"
          placeholder="cth: 110° 26' 27.849&quot; E"
          value={titik.bujur}
          onChange={e => onChange(idx, "bujur", e.target.value)}
          isInvalid={!!error?.bujur}
          style={{ fontFamily: "monospace", fontSize: 12 }}
        />
        {error?.bujur && (
          <div className="text-danger" style={{ fontSize: 11 }}>{error.bujur}</div>
        )}
      </td>
      <td className="align-middle text-muted" style={{ fontSize: 11, minWidth: 180 }}>
        {titik.lintang && titik.bujur ? (() => {
          const lat = dmsToDecimal(titik.lintang);
          const lng = dmsToDecimal(titik.bujur);
          if (lat === null || lng === null) return <span className="text-danger">Tidak valid</span>;
          return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        })() : "-"}
      </td>
      <td className="align-middle text-center" style={{ width: 40 }}>
        <Button
          size="sm"
          variant="outline-danger"
          onClick={() => onRemove(idx)}
          style={{ padding: "1px 6px", fontSize: 14, lineHeight: 1 }}
        >
          ×
        </Button>
      </td>
    </tr>
  );
}

// ── Modal utama ───────────────────────────────────────────────────────────────

const TITIK_KOSONG = { lintang: "", bujur: "" };

export default function ModalPetaWilayah({ show, onHide, onDataChanged }) {
  const [list,     setList]     = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [selected, setSelected] = useState(null);
  const [titiks,   setTitiks]   = useState([{ ...TITIK_KOSONG }]);
  const [errors,   setErrors]   = useState([]);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState("");
  const [success,  setSuccess]  = useState("");
  const [preview,  setPreview]  = useState(null); // GeoJSON hasil konversi

  // ── Mode input: bisa juga paste GeoJSON / koordinat decimal langsung ──
  const [inputMode, setInputMode] = useState("titik"); // "titik" | "geojson"
  const [rawGeojson, setRawGeojson] = useState("");

  async function fetchList() {
    setLoading(true);
    try {
      const res = await api.get("/admin/wilayah-rob");
      setList(res.data.data || []);
    } catch {
      setError("Gagal memuat daftar wilayah.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (show) {
      fetchList();
      resetForm();
    }
  }, [show]);

  function resetForm() {
    setSelected(null);
    setTitiks([{ ...TITIK_KOSONG }]);
    setErrors([]);
    setError(""); setSuccess("");
    setPreview(null);
    setRawGeojson("");
    setInputMode("titik");
  }

  function handleSelect(item) {
    setSelected(item);
    setTitiks([{ ...TITIK_KOSONG }]);
    setErrors([]);
    setError(""); setSuccess("");
    setPreview(null);
    setRawGeojson("");
  }

  // ── Manajemen baris titik ──

  function handleChangeTitik(idx, field, value) {
    setTitiks(prev => prev.map((t, i) => i === idx ? { ...t, [field]: value } : t));
    setErrors(prev => { const e = [...prev]; if (e[idx]) delete e[idx][field]; return e; });
    setPreview(null);
    setError(""); setSuccess("");
  }

  function handleAddRow() {
    setTitiks(prev => [...prev, { ...TITIK_KOSONG }]);
  }

  function handleRemoveRow(idx) {
    if (titiks.length === 1) return;
    setTitiks(prev => prev.filter((_, i) => i !== idx));
    setErrors(prev => prev.filter((_, i) => i !== idx));
  }

  function handlePasteBulk(e) {
    // Deteksi paste tabel (tab-separated atau banyak baris) dan parse otomatis
    const text = e.clipboardData?.getData("text") || "";
    const lines = text.trim().split("\n").filter(l => l.trim());
    if (lines.length < 2) return; // biarkan paste normal kalau hanya 1 baris

    e.preventDefault();
    const parsed = [];
    for (const line of lines) {
      // Coba pisah dengan tab, titik koma, atau multi-spasi
      const parts = line.split(/\t|;/).map(p => p.trim());
      if (parts.length >= 2) {
        parsed.push({ lintang: parts[0], bujur: parts[1] });
      }
    }
    if (parsed.length > 0) {
      setTitiks(parsed);
      setErrors([]);
      setPreview(null);
    }
  }

  // ── Validasi & konversi ke GeoJSON ──

  function buildGeoJSON() {
    const newErrors = [];
    const coords = [];
    let valid = true;

    for (let i = 0; i < titiks.length; i++) {
      const { lintang, bujur } = titiks[i];
      const rowErr = {};

      if (!lintang.trim()) { rowErr.lintang = "Wajib diisi"; valid = false; }
      if (!bujur.trim())   { rowErr.bujur   = "Wajib diisi"; valid = false; }

      const lat = dmsToDecimal(lintang);
      const lng = dmsToDecimal(bujur);

      if (lat === null) { rowErr.lintang = "Format tidak dikenali"; valid = false; }
      if (lng === null) { rowErr.bujur   = "Format tidak dikenali"; valid = false; }

      if (lat !== null && lng !== null) {
        if (lat < -90 || lat > 90)    { rowErr.lintang = "Lintang harus -90 s.d 90"; valid = false; }
        if (lng < -180 || lng > 180)  { rowErr.bujur   = "Bujur harus -180 s.d 180"; valid = false; }
      }

      newErrors[i] = rowErr;
      if (lat !== null && lng !== null) coords.push([lng, lat]); // GeoJSON: [bujur, lintang]
    }

    setErrors(newErrors);

    if (!valid) return null;

    if (coords.length < 3) {
      setError("Minimal 3 titik koordinat untuk membentuk polygon.");
      return null;
    }

    // Tutup polygon (titik pertama = titik terakhir)
    const closed = coords[0][0] !== coords[coords.length - 1][0] ||
                   coords[0][1] !== coords[coords.length - 1][1]
      ? [...coords, coords[0]]
      : coords;

    return {
      type: "Polygon",
      coordinates: [closed],
    };
  }

  function handlePreview() {
    setError(""); setSuccess("");
    if (inputMode === "geojson") {
      try {
        const parsed = JSON.parse(rawGeojson);
        setPreview(parsed);
      } catch (e) {
        setError("Format GeoJSON tidak valid: " + e.message);
      }
      return;
    }
    const geojson = buildGeoJSON();
    if (geojson) setPreview(geojson);
  }

  async function handleSave() {
    setError(""); setSuccess("");
    let geojsonStr = null;

    if (inputMode === "geojson") {
      if (rawGeojson.trim()) {
        try { JSON.parse(rawGeojson); } catch (e) {
          setError("Format GeoJSON tidak valid: " + e.message); return;
        }
        geojsonStr = rawGeojson.trim();
      }
    } else {
      const geojson = buildGeoJSON();
      if (!geojson) return;
      geojsonStr = JSON.stringify(geojson);
    }

    setSaving(true);
    try {
      await api.put(`/admin/wilayah-rob/${selected.id}/geojson`, {
        geojson: geojsonStr || null,
      });
      setSuccess(geojsonStr
        ? `Geometri "${selected.nama_wilayah}" berhasil disimpan.`
        : `Geometri "${selected.nama_wilayah}" berhasil dihapus.`
      );
      setPreview(geojsonStr ? JSON.parse(geojsonStr) : null);
      await fetchList();
      onDataChanged?.();
    } catch (err) {
      setError(err.response?.data?.message || "Gagal menyimpan geometri.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteGeometry() {
    setSaving(true); setError(""); setSuccess("");
    try {
      await api.put(`/admin/wilayah-rob/${selected.id}/geojson`, { geojson: null });
      setSuccess(`Geometri "${selected.nama_wilayah}" berhasil dihapus.`);
      setTitiks([{ ...TITIK_KOSONG }]);
      setPreview(null);
      await fetchList();
      onDataChanged?.();
    } catch (err) {
      setError(err.response?.data?.message || "Gagal menghapus geometri.");
    } finally {
      setSaving(false);
    }
  }

  // ── Hitung jumlah titik valid untuk preview info ──
  const validCount = titiks.filter(t => {
    const lat = dmsToDecimal(t.lintang);
    const lng = dmsToDecimal(t.bujur);
    return lat !== null && lng !== null;
  }).length;

  return (
    <Modal show={show} onHide={onHide} size="xl" centered scrollable>
      <Modal.Header closeButton>
        <Modal.Title>Kelola Geometri Peta Wilayah</Modal.Title>
      </Modal.Header>

      <Modal.Body style={{ maxHeight: "80vh", overflowY: "auto" }}>
        <div className="row g-3">

          {/* ── Panel kiri: daftar wilayah ── */}
          <div className="col-md-3">
            <p className="small text-muted mb-2 fw-semibold">Pilih wilayah:</p>
            {loading ? (
              <div className="text-center py-3"><Spinner animation="border" size="sm" /></div>
            ) : (
              <ListGroup style={{ maxHeight: 500, overflowY: "auto" }}>
                {list.map(item => (
                  <ListGroup.Item
                    key={item.id}
                    action
                    active={selected?.id === item.id}
                    onClick={() => handleSelect(item)}
                    className="d-flex justify-content-between align-items-center py-2"
                    style={{ fontSize: 13 }}
                  >
                    <span className="fw-semibold">{item.nama_wilayah}</span>
                    <Badge
                      bg={item.has_geojson ? "success" : "secondary"}
                      style={{ fontSize: 9, marginLeft: 4 }}
                    >
                      {item.has_geojson ? "Ada" : "Belum"}
                    </Badge>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
          </div>

          {/* ── Panel kanan: form input ── */}
          <div className="col-md-9">
            {!selected ? (
              <div className="d-flex align-items-center justify-content-center text-muted"
                style={{ height: 400 }}>
                ← Pilih wilayah di sebelah kiri
              </div>
            ) : (
              <>
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <div>
                    <h6 className="fw-bold mb-0">{selected.nama_wilayah}</h6>
                    <small className="text-muted">
                      Tinggi tanah: <strong>{selected.tinggi_tanah} m</strong>
                      {" · "}
                      <Badge bg={selected.has_geojson ? "success" : "secondary"} style={{ fontSize: 10 }}>
                        {selected.has_geojson ? "Geometri sudah ada" : "Belum ada geometri"}
                      </Badge>
                    </small>
                  </div>
                  {/* Toggle mode input */}
                  <div className="d-flex gap-1">
                    <Button
                      size="sm"
                      variant={inputMode === "titik" ? "primary" : "outline-secondary"}
                      onClick={() => setInputMode("titik")}
                    >
                      Input Titik
                    </Button>
                    <Button
                      size="sm"
                      variant={inputMode === "geojson" ? "primary" : "outline-secondary"}
                      onClick={() => setInputMode("geojson")}
                    >
                      Paste GeoJSON
                    </Button>
                  </div>
                </div>

                {error   && <Alert variant="danger"  className="small py-2 mb-2">{error}</Alert>}
                {success && <Alert variant="success" className="small py-2 mb-2">{success}</Alert>}

                {/* ── MODE: Input Titik Kartometrik ── */}
                {inputMode === "titik" && (
                  <>
                    <Alert variant="info" className="small py-2 mb-2">
                      <strong>Format yang didukung:</strong> DMS seperti dari tabel BIG/BPN
                      {" "}(<code>6° 57' 00.045" S</code>), atau decimal (<code>-6.950012</code>).
                      Titik pertama dan terakhir tidak perlu sama — polygon ditutup otomatis.
                      <br />
                      <strong>Paste massal:</strong> copy 2 kolom (Lintang & Bujur) dari Excel/tabel,
                      lalu paste langsung ke kolom Lintang baris pertama — semua baris akan terisi otomatis.
                    </Alert>

                    <div className="table-responsive mb-2">
                      <Table size="sm" bordered className="mb-0">
                        <thead className="table-light" style={{ fontSize: 12 }}>
                          <tr>
                            <th style={{ width: 36 }}>#</th>
                            <th>Lintang (S/N)</th>
                            <th>Bujur (E/W)</th>
                            <th>Decimal (preview)</th>
                            <th style={{ width: 40 }}></th>
                          </tr>
                        </thead>
                        <tbody onPaste={handlePasteBulk}>
                          {titiks.map((t, i) => (
                            <TitikRow
                              key={i}
                              idx={i}
                              titik={t}
                              onChange={handleChangeTitik}
                              onRemove={handleRemoveRow}
                              error={errors[i]}
                            />
                          ))}
                        </tbody>
                      </Table>
                    </div>

                    <div className="d-flex gap-2 mb-3">
                      <Button size="sm" variant="outline-primary" onClick={handleAddRow}>
                        + Tambah Baris
                      </Button>
                      <span className="text-muted small align-self-center">
                        {titiks.length} baris · {validCount} valid
                        {titiks.length >= 3 && validCount >= 3 && (
                          <span className="text-success ms-2">✓ Siap dibuat polygon</span>
                        )}
                        {titiks.length >= 3 && validCount < 3 && (
                          <span className="text-danger ms-2">Minimal 3 titik valid</span>
                        )}
                      </span>
                    </div>
                  </>
                )}

                {/* ── MODE: Paste GeoJSON ── */}
                {inputMode === "geojson" && (
                  <>
                    <Alert variant="info" className="small py-2 mb-2">
                      Paste GeoJSON langsung dari Overpass Turbo / geojson.io.
                      Bisa berupa <code>Polygon</code>, <code>MultiPolygon</code>,
                      <code>Feature</code>, atau <code>FeatureCollection</code>.
                      Kosongkan untuk menghapus geometri yang sudah ada.
                    </Alert>
                    <Form.Control
                      as="textarea"
                      rows={10}
                      placeholder={`{\n  "type": "Polygon",\n  "coordinates": [[[110.4, -6.9], ...]]\n}`}
                      value={rawGeojson}
                      onChange={e => { setRawGeojson(e.target.value); setPreview(null); setError(""); setSuccess(""); }}
                      style={{ fontFamily: "monospace", fontSize: 12, marginBottom: 12 }}
                    />
                  </>
                )}

                {/* ── Preview hasil konversi ── */}
                {preview && (
                  <Alert variant="success" className="small py-2 mb-2">
                    <strong>Preview GeoJSON:</strong> tipe <code>{preview.type}</code>,{" "}
                    {preview.type === "Polygon" && preview.coordinates?.[0]
                      ? `${preview.coordinates[0].length} titik`
                      : ""}
                    <details className="mt-1">
                      <summary style={{ cursor: "pointer" }}>Lihat JSON</summary>
                      <pre style={{ fontSize: 10, maxHeight: 120, overflowY: "auto", marginTop: 4 }}>
                        {JSON.stringify(preview, null, 2)}
                      </pre>
                    </details>
                  </Alert>
                )}

                {/* ── Tombol aksi ── */}
                <div className="d-flex gap-2 flex-wrap">
                  <Button variant="outline-secondary" onClick={handlePreview} disabled={saving}>
                    Preview Polygon
                  </Button>
                  <Button variant="primary" onClick={handleSave} disabled={saving}>
                    {saving
                      ? <><Spinner size="sm" animation="border" className="me-2" />Menyimpan...</>
                      : "Simpan Geometri"}
                  </Button>
                  {selected.has_geojson && (
                    <Button variant="outline-danger" onClick={handleDeleteGeometry} disabled={saving}>
                      Hapus Geometri
                    </Button>
                  )}
                  <Button variant="outline-secondary" onClick={() => handleSelect(selected)}>
                    Reset
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Tutup</Button>
      </Modal.Footer>
    </Modal>
  );
}
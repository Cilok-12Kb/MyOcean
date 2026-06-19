// src/components/admin/pasang_surut/ModalGeneratePrediksi.jsx
import { useState } from "react";
import { Modal, Button, Alert, Spinner } from "react-bootstrap";
import api from "../../services/api";

export default function ModalGeneratePrediksi({ show, onHide, onDataChanged }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  async function handleGenerate() {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      // TODO: endpoint model prediksi belum dibuat — placeholder dulu
      const res = await api.post("/admin/pasang-surut/generate-prediksi");
      setResult(res.data);
      onDataChanged?.();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Fitur prediksi belum tersedia. Endpoint model akan dibuat selanjutnya."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setResult(null);
    setError("");
    onHide();
  }

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Generate Prediksi Pasang Surut</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <p className="text-muted">
          Fitur ini akan menghasilkan prediksi ketinggian air untuk hari ini,
          mulai jam 00.00 sampai 23.00, menggunakan model prediksi pasang surut.
        </p>

        <Alert variant="info" className="small mb-3">
          Model prediksi belum diimplementasikan. Tombol ini sudah siap dipakai
          begitu endpoint model tersedia.
        </Alert>

        {error && <Alert variant="warning" className="small">{error}</Alert>}
        {result && (
          <Alert variant="success" className="small">
            Berhasil generate {result.count ?? 24} data prediksi untuk hari ini.
          </Alert>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Tutup
        </Button>
        <Button variant="primary" onClick={handleGenerate} disabled={loading}>
          {loading ? (
            <>
              <Spinner size="sm" animation="border" className="me-2" />
              Memproses...
            </>
          ) : (
            "Generate Prediksi Hari Ini"
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
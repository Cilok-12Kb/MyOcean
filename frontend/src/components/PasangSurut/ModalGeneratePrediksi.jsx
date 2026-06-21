// src/components/admin/pasang_surut/ModalGeneratePrediksi.jsx
import { useState } from "react";
import { Modal, Button, Alert, Spinner, Form } from "react-bootstrap";
import api from "../../services/api";

function toDateInputValue(date) {
  const year  = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day   = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function ModalGeneratePrediksi({ show, onHide, onDataChanged }) {
  const [tanggalTarget, setTanggalTarget] = useState(toDateInputValue(new Date()));
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  async function handleGenerate() {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await api.post("/admin/pasang-surut/generate-prediksi", {
        tanggal: tanggalTarget,
      });
      setResult(res.data);
      onDataChanged?.();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Gagal generate prediksi. Coba lagi beberapa saat."
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
          Fitur ini akan menghasilkan prediksi ketinggian air untuk 24 jam pada
          tanggal yang dipilih, menggunakan model BiLSTM berdasarkan data
          historis 2 hari sebelumnya.
        </p>

        <Form.Group className="mb-3">
          <Form.Label className="fw-semibold small">Tanggal Prediksi</Form.Label>
          <Form.Control
            type="date"
            value={tanggalTarget}
            onChange={(e) => setTanggalTarget(e.target.value)}
          />
          <Form.Text className="text-muted">
            Data historis akan diambil dari tanggal sebelumnya secara otomatis
            (contoh: prediksi 20-06 memakai data 18-06 dan 19-06).
          </Form.Text>
        </Form.Group>

        {error && <Alert variant="warning" className="small">{error}</Alert>}
        {result && (
          <Alert variant="success" className="small">
            Berhasil generate {result.count ?? 24} data prediksi untuk {tanggalTarget}.
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
            "Generate Prediksi"
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
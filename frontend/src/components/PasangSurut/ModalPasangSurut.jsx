// src/components/admin/pasang_surut/ModalPasangSurut.jsx
import { useEffect, useState } from "react";
import { Modal, Table, Button, Form, Row, Col, Badge, Spinner, Alert } from "react-bootstrap";
import api from "../../services/api";

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => i);

const emptyForm = {
  id: null,
  tanggal: new Date().toISOString().slice(0, 10),
  jam: "",
  tide_height_digital: "",
  tide_height_manual: "",
  tide_height_prediction: "",
};

export default function ModalPasangSurut({ show, onHide, onDataChanged }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [filterTanggal, setFilterTanggal] = useState(new Date().toISOString().slice(0, 10));

  async function fetchData(tanggal) {
    setLoading(true);
    try {
      const res = await api.get("/admin/pasang-surut", { params: { tanggal } });
      setData(res.data.data || []);
    } catch (err) {
      console.error("Gagal mengambil data pasang surut:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (show) fetchData(filterTanggal);
  }, [show, filterTanggal]);

  function resetForm() {
    setForm({ ...emptyForm, tanggal: filterTanggal });
    setIsEditing(false);
    setError("");
  }

  function handleEdit(item) {
    setForm({
      id: item.id,
      tanggal: item.tanggal ?? "",   // tidak perlu split("T")[0] lagi
      jam: item.jam ?? "",
      tide_height_digital: item.tide_height_digital ?? "",
      tide_height_manual: item.tide_height_manual ?? "",
      tide_height_prediction: item.tide_height_prediction ?? "",
    });
    setIsEditing(true);
    setError("");
  }

  async function handleDelete(id) {
    if (!window.confirm("Hapus data ini?")) return;
    try {
      await api.delete(`/admin/pasang-surut/${id}`);
      fetchData(filterTanggal);
      onDataChanged?.();
    } catch (err) {
      console.error("Gagal menghapus data:", err);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const payload = {
      tanggal: form.tanggal,
      jam: Number(form.jam),
      tide_height_digital: Number(form.tide_height_digital),
      tide_height_manual: form.tide_height_manual === "" ? null : Number(form.tide_height_manual),
      tide_height_prediction: form.tide_height_prediction === "" ? null : Number(form.tide_height_prediction),
    };

    try {
      if (isEditing) {
        await api.put(`/admin/pasang-surut/${form.id}`, payload);
      } else {
        await api.post("/admin/pasang-surut", payload);
      }
      resetForm();
      fetchData(filterTanggal);
      onDataChanged?.();
    } catch (err) {
      setError(err.response?.data?.message || "Gagal menyimpan data.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal show={show} onHide={onHide} size="xl" centered>
      <Modal.Header closeButton>
        <Modal.Title>Kelola Data Pasang Surut</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {/* ── Form tambah/edit ── */}
        <Form onSubmit={handleSubmit} className="mb-4 p-3 bg-light rounded-3">
          <Row className="g-2 align-items-end">
            <Col xs={6} md={2}>
              <Form.Label className="small fw-semibold">Tanggal</Form.Label>
              <Form.Control
                type="date"
                value={form.tanggal}
                onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
                required
              />
            </Col>
            <Col xs={6} md={2}>
              <Form.Label className="small fw-semibold">Jam</Form.Label>
              <Form.Select
                value={form.jam}
                onChange={(e) => setForm({ ...form, jam: e.target.value })}
                required
              >
                <option value="">Pilih jam</option>
                {HOUR_OPTIONS.map((h) => (
                  <option key={h} value={h}>
                    {String(h).padStart(2, "0")}.00
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col xs={6} md={2}>
              <Form.Label className="small fw-semibold">Digital (m)</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                value={form.tide_height_digital}
                onChange={(e) => setForm({ ...form, tide_height_digital: e.target.value })}
                required
              />
            </Col>
            <Col xs={6} md={2}>
              <Form.Label className="small fw-semibold">Manual (m)</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                value={form.tide_height_manual}
                onChange={(e) => setForm({ ...form, tide_height_manual: e.target.value })}
              />
            </Col>
            <Col xs={6} md={2}>
              <Form.Label className="small fw-semibold">Prediksi (m)</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                value={form.tide_height_prediction}
                onChange={(e) => setForm({ ...form, tide_height_prediction: e.target.value })}
              />
            </Col>
            <Col xs={12} md={2} className="d-flex gap-2">
              <Button type="submit" variant="primary" disabled={submitting} className="flex-fill">
                {submitting ? <Spinner size="sm" animation="border" /> : isEditing ? "Update" : "Tambah"}
              </Button>
              {isEditing && (
                <Button variant="outline-secondary" onClick={resetForm} type="button">
                  Batal
                </Button>
              )}
            </Col>
          </Row>
          {error && <Alert variant="danger" className="mt-2 mb-0 py-2">{error}</Alert>}
        </Form>

        {/* ── Filter tanggal untuk tabel ── */}
        <Row className="mb-3 align-items-center">
          <Col xs="auto">
            <Form.Label className="small fw-semibold mb-0">Lihat data tanggal:</Form.Label>
          </Col>
          <Col xs="auto">
            <Form.Control
              type="date"
              value={filterTanggal}
              onChange={(e) => setFilterTanggal(e.target.value)}
              size="sm"
            />
          </Col>
        </Row>

        {/* ── Tabel daftar ── */}
        {loading ? (
          <div className="text-center py-4">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : data.length === 0 ? (
          <Alert variant="secondary">Belum ada data untuk tanggal ini.</Alert>
        ) : (
          <div className="table-responsive">
            <Table hover size="sm" className="align-middle">
              <thead>
                <tr>
                  <th>Jam</th>
                  <th>Digital (m)</th>
                  <th>Manual (m)</th>
                  <th>Prediksi (m)</th>
                  <th>Status</th>
                  <th className="text-end">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item) => (
                  <tr key={item.id}>
                    <td>{String(item.jam).padStart(2, "0")}.00</td>
                    <td>{item.tide_height_digital}</td>
                    <td>{item.tide_height_manual ?? "-"}</td>
                    <td>{item.tide_height_prediction ?? "-"}</td>
                    <td>
                      <Badge bg={item.status === "Pasang" ? "primary" : "success"}>
                        {item.status}
                      </Badge>
                    </td>
                    <td className="text-end">
                      <Button size="sm" variant="outline-primary" className="me-2" onClick={() => handleEdit(item)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="outline-danger" onClick={() => handleDelete(item.id)}>
                        Hapus
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Tutup
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
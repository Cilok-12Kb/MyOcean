// src/components/admin/pasang_surut/ModalWilayahRob.jsx
import { useEffect, useState } from "react";
import { Modal, Table, Button, Form, Row, Col, Spinner, Alert } from "react-bootstrap";
import api from "../../services/api";

const emptyForm = { id: null, nama_wilayah: "", tinggi_tanah: "" };

export default function ModalWilayahRob({ show, onHide, onDataChanged }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function fetchData() {
    setLoading(true);
    try {
      const res = await api.get("/admin/wilayah-rob");
      setData(res.data.data || []);
    } catch (err) {
      console.error("Gagal mengambil data wilayah rob:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (show) fetchData();
  }, [show]);

  function resetForm() {
    setForm(emptyForm);
    setIsEditing(false);
    setError("");
  }

  function handleEdit(item) {
    setForm({
      id: item.id,
      nama_wilayah: item.nama_wilayah,
      tinggi_tanah: item.tinggi_tanah,
    });
    setIsEditing(true);
    setError("");
  }

  async function handleDelete(id) {
    if (!window.confirm("Hapus wilayah ini? Data rob untuk wilayah ini juga tidak akan terhitung lagi.")) return;
    try {
      await api.delete(`/admin/wilayah-rob/${id}`);
      fetchData();
      onDataChanged?.();
    } catch (err) {
      console.error("Gagal menghapus wilayah:", err);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const payload = {
      nama_wilayah: form.nama_wilayah,
      tinggi_tanah: Number(form.tinggi_tanah),
    };

    try {
      if (isEditing) {
        await api.put(`/admin/wilayah-rob/${form.id}`, payload);
      } else {
        await api.post("/admin/wilayah-rob", payload);
      }
      resetForm();
      fetchData();
      onDataChanged?.();
    } catch (err) {
      setError(err.response?.data?.message || "Gagal menyimpan data.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Kelola Wilayah Rob</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form onSubmit={handleSubmit} className="mb-4 p-3 bg-light rounded-3">
          <Row className="g-2 align-items-end">
            <Col xs={12} md={5}>
              <Form.Label className="small fw-semibold">Nama Wilayah</Form.Label>
              <Form.Control
                type="text"
                placeholder="cth. Tambakharjo"
                value={form.nama_wilayah}
                onChange={(e) => setForm({ ...form, nama_wilayah: e.target.value })}
                required
              />
            </Col>
            <Col xs={8} md={4}>
              <Form.Label className="small fw-semibold">Tinggi Tanah (m)</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                placeholder="cth. 0.45"
                value={form.tinggi_tanah}
                onChange={(e) => setForm({ ...form, tinggi_tanah: e.target.value })}
                required
              />
            </Col>
            <Col xs={4} md={3} className="d-flex gap-2">
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

        {loading ? (
          <div className="text-center py-4">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : data.length === 0 ? (
          <Alert variant="secondary">Belum ada wilayah terdaftar.</Alert>
        ) : (
          <div className="table-responsive">
            <Table hover size="sm" className="align-middle">
              <thead>
                <tr>
                  <th>Nama Wilayah</th>
                  <th>Tinggi Tanah (m)</th>
                  <th className="text-end">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item) => (
                  <tr key={item.id}>
                    <td className="fw-semibold">{item.nama_wilayah}</td>
                    <td>{item.tinggi_tanah}</td>
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
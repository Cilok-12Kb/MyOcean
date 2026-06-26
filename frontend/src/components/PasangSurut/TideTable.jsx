// src/components/PasangSurut/TideTable.jsx
import { Card, Row, Col, Form, Button, Table, Badge } from "react-bootstrap";
import {
  HOUR_OPTIONS,
  getRobPotential,
  getRobBadgeVariant,
  formatTanggalJam,
  formatDateLabel,
  isFutureSelection,
  exportTideTableToCSV,
} from "../../utils/tideHelpers";

export default function TideTable({ data, selectedDate, selectedHour, onHourChange, showExport = true }) {
  const dataBelumTersedia = isFutureSelection(selectedDate, selectedHour);
  const canExport = !dataBelumTersedia && data.length > 0;

  return (
    <Card className="shadow-sm border-0 rounded-4">
      <Card.Body className="p-3 p-md-4">
        <Row className="align-items-center g-2 mb-3">
          <Col xs={12} md="auto" className="me-md-auto">
            <h1 className="tide-table-heading mb-0">RINCIAN INFORMASI PASANG SURUT</h1>
          </Col>
          <Col xs={12} md="auto">
            <Row className="g-2">
              <Col xs={showExport ? 6 : 12} md="auto">
                <Form.Select
                  className="tide-hour-picker"
                  value={selectedHour}
                  onChange={(e) => onHourChange(e.target.value)}
                >
                  {HOUR_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </Form.Select>
              </Col>
              {showExport && (
                <Col xs={6} md="auto">
                  <Button
                    variant="outline-success"
                    className="w-100 tide-export-btn"
                    disabled={!canExport}
                    onClick={() => exportTideTableToCSV(data, selectedDate, selectedHour)}
                    title={canExport ? "Export data ke CSV" : "Tidak ada data untuk diekspor"}
                  >
                    <i className="bi bi-download me-1" />
                    Export CSV
                  </Button>
                </Col>
              )}
            </Row>
          </Col>
        </Row>

        {dataBelumTersedia ? (
          <div className="tide-table-empty text-center text-muted py-5">
            <div className="fw-semibold mb-1">Data belum tersedia</div>
            <small>
              Jam {String(selectedHour).split(":")[0]}.00 WIB pada {formatDateLabel(selectedDate)} belum terlewati,
              data pasang surut belum tercatat untuk waktu tersebut.
            </small>
          </div>
        ) : data.length === 0 ? (
          <div className="tide-table-empty text-center text-muted py-5">
            Tidak ada data untuk jam ini.
          </div>
        ) : (
          <div className="table-responsive">
            <Table hover className="tide-table align-middle mb-0">
              <thead>
                <tr>
                  <th>#</th><th>Lokasi</th><th>Tinggi Tanah</th><th>Tinggi Air</th>
                  <th>Tinggi Rob</th><th>Potensi Rob</th><th>Pasang/Surut</th>
                  <th>Tanggal dan Waktu</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => {
                  const potential = getRobPotential(item.tinggi_rob);
                  return (
                    <tr key={item.nama_wilayah || index}>
                      <td>{index + 1}</td>
                      <td className="fw-semibold">{item.nama_wilayah}</td>
                      <td>{item.tinggi_tanah} m</td>
                      <td>{item.tide_height_digital} m</td>
                      <td>{item.tinggi_rob > 0 ? `${item.tinggi_rob} m` : "Tidak tergenang"}</td>
                      <td>
                        <Badge bg={getRobBadgeVariant(potential)} className="rob-badge-pill">
                          {potential}
                        </Badge>
                      </td>
                      <td>{item.status}</td>
                      <td className="text-nowrap">{formatTanggalJam(item.tanggal, item.jam)} WIB</td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        )}
      </Card.Body>
    </Card>
  );
}
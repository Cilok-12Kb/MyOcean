// src/components/marinMinamo/ComparisonTable.jsx

export default function ComparisonTable({ table }) {
  return (
    <div style={{ overflowX: "auto", margin: "6px 0" }}>
      <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 13 }}>
        <thead>
          <tr>
            {table.header.map((h, i) => (
              <th
                key={i}
                style={{
                  textAlign: "left",
                  padding: "6px 10px",
                  borderBottom: "2px solid #cbd5e1",
                  background: "#f1f5f9",
                  whiteSpace: "nowrap",
                  fontWeight: 600,
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.body.map((row, ri) => (
            <tr key={ri} style={{ borderBottom: "1px solid #e2e8f0" }}>
              {row.map((cell, ci) => (
                <td key={ci} style={{ padding: "6px 10px" }}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
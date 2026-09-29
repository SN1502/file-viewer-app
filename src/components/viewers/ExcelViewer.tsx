import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import '../../styles/ExcelViewer.css';

interface ExcelViewerProps {
  data: {
    sheetNames: string[];
    sheets: { [key: string]: any[] };
  };
  fileName?: string;
}

export default function ExcelViewer({ data, fileName: _fileName }: ExcelViewerProps) {
  const [activeSheet, setActiveSheet] = useState(0);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const sheetName = data.sheetNames[activeSheet];
  const rows = data.sheets[sheetName] || [];

  const toggleRow = (index: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedRows(newExpanded);
  };

  if (rows.length === 0) {
    return <div className="viewer-error">No data found in sheet</div>;
  }

  const columns = Object.keys(rows[0] || {});

  return (
    <div className="excel-viewer">
      {data.sheetNames.length > 1 && (
        <div className="sheet-tabs">
          {data.sheetNames.map((name, index) => (
            <button
              key={index}
              className={`sheet-tab ${activeSheet === index ? 'active' : ''}`}
              onClick={() => {
                setActiveSheet(index);
                setExpandedRows(new Set());
              }}
            >
              {name}
            </button>
          ))}
        </div>
      )}

      <div className="table-container">
        <div className="table-wrapper">
          <div className="table-header">
            {columns.map((col, idx) => (
              <div key={idx} className="header-cell">
                {col}
              </div>
            ))}
          </div>

          <div className="table-body">
            {rows.map((row, rowIndex) => (
              <React.Fragment key={rowIndex}>
                <div className="table-row">
                  <div className="row-expander">
                    <button
                      className="expand-btn"
                      onClick={() => toggleRow(rowIndex)}
                    >
                      {expandedRows.has(rowIndex) ? (
                        <ChevronUp size={16} />
                      ) : (
                        <ChevronDown size={16} />
                      )}
                    </button>
                  </div>
                  {columns.slice(0, 2).map((col, colIdx) => (
                    <div key={colIdx} className="data-cell">
                      {String(row[col] ?? '')}
                    </div>
                  ))}
                </div>

                {expandedRows.has(rowIndex) && (
                  <div className="row-details">
                    {columns.map((col, colIdx) => (
                      <div key={colIdx} className="detail-item">
                        <span className="detail-label">{col}</span>
                        <span className="detail-value">{String(row[col] ?? '')}</span>
                      </div>
                    ))}
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <div className="table-footer">
        <p>{rows.length} rows in {sheetName}</p>
      </div>
    </div>
  );
}

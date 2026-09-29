import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import '../../styles/CSVViewer.css';

interface CSVViewerProps {
  data: any[];
  fileName: string;
}

export default function CSVViewer({ data, fileName }: CSVViewerProps) {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const toggleRow = (index: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedRows(newExpanded);
  };

  if (data.length === 0) {
    return <div className="viewer-error">No data found in CSV</div>;
  }

  const columns = Object.keys(data[0] || {});

  return (
    <div className="csv-viewer">
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
            {data.map((row, rowIndex) => (
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
        <p>{data.length} rows in {fileName}</p>
      </div>
    </div>
  );
}

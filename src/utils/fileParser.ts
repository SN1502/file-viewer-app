import * as XLSX from 'xlsx';
import Papa from 'papaparse';

export const parseExcel = async (file: File): Promise<any> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });

        const sheets: { [key: string]: any[] } = {};
        const sheetNames = workbook.SheetNames;

        sheetNames.forEach((sheetName) => {
          const worksheet = workbook.Sheets[sheetName];
          sheets[sheetName] = XLSX.utils.sheet_to_json(worksheet);
        });

        resolve({
          sheetNames,
          sheets,
        });
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsBinaryString(file);
  });
};

export const parseCSV = async (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      complete: (results: any) => {
        resolve(results.data.filter((row: any) => Object.values(row).some(val => val)));
      },
      error: (error: any) => {
        reject(new Error(`CSV parsing error: ${error.message}`));
      },
    });
  });
};

export const parsePDF = async (file: File): Promise<any> => {
  // PDF parsing is handled by PDFViewer component using pdfjs-dist
  // This function just validates and passes the file
  return {
    fileName: file.name,
    size: file.size,
  };
};

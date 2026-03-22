import Papa from 'papaparse';

export const parseCSV = <T>(fileContent: string): Promise<T[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse<T>(fileContent, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve(results.data);
      },
      error: (error: Error) => {
        reject(error);
      },
    });
  });
};

export const normalizeName = (name: string): string => {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
};

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
  if (!name) return '';
  let cleanName = name.trim();
  
  // Handle "Last, First" format
  if (cleanName.includes(',')) {
    const [last, first] = cleanName.split(',').map(s => s.trim());
    cleanName = `${first} ${last}`;
  }

  return cleanName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
};

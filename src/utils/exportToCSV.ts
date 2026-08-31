export const exportToCSV = (data: any[], filename: string) => {
  if (!data || !data.length) {
    return;
  }

  const escapeCSV = (val: any) => {
    if (val === null || val === undefined) return '';
    
    // Handle nested objects/arrays
    let str = typeof val === 'object' ? JSON.stringify(val) : String(val);
    
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const headers = Object.keys(data[0]);
  
  const csvRows = [
    headers.map(h => escapeCSV(h)).join(','), // Header row
    ...data.map(row => headers.map(h => escapeCSV(row[h])).join(',')) // Data rows
  ];

  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  
  const link = document.createElement("a");
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

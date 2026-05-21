import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { MemorialPerson } from '../types';

export const fetchAndParseData = async (): Promise<MemorialPerson[]> => {
  const response = await fetch('/api/victims');
  if (!response.ok) throw new Error('Failed to fetch data');
  return response.json();
};

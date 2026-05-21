import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import * as XLSX from 'xlsx';
import fs from 'fs';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API route to read local file or provide fallback
  app.get('/api/victims', async (req, res) => {
    try {
      const githubUrl = 'https://raw.githubusercontent.com/OussamaSEBROU/TalkAboutMe/main/victims_data.xlsx';
      let data: any[] = [];
      
      try {
        console.log('Fetching data from GitHub...');
        const response = await fetch(githubUrl);
        if (response.ok) {
           const arrayBuffer = await response.arrayBuffer();
           const workbook = XLSX.read(arrayBuffer, { type: 'array' });
           const sheetName = workbook.SheetNames[0];
           data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { range: 1 });
        } else {
           throw new Error(`GitHub fetch failed: ${response.status}`);
        }
      } catch (err) {
        console.error('Failed to fetch from github, falling back to local files...', err);
        const xlsxPath = path.join(process.cwd(), 'victims_data.xlsx');
        const csvPath = path.join(process.cwd(), 'victims_data.csv');
        
        if (fs.existsSync(xlsxPath)) {
          const workbook = XLSX.readFile(xlsxPath);
          const sheetName = workbook.SheetNames[0];
          data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { range: 1 });
        } else if (fs.existsSync(csvPath)) {
          // Simple fallback if they upload CSV instead
          // For full robust parsing PapaParse client-side is often used, but we can send raw
          const workbook = XLSX.readFile(csvPath);
          const sheetName = workbook.SheetNames[0];
          data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { range: 1 });
        } else {
          // Send high-quality mock data so the UI can be showcased immediately!
          data = Array.from({length: 150}).map((_, i) => ({
            Index: String(i+1),
            Name: "Mock Data (Please upload file)",
            الاسم: "بيانات تجريبية (يرجى رفع الملف يسار الشاشة)",
            Age: i % 7 === 0 ? "10" : (i % 3 === 0 ? "65" : "25"),
            Born: "2000-01-01",
            Sex: i % 2 === 0 ? "m" : "f",
            ID: "00000"
          }));
        }
      }
      
      // Pre-generate offset lat/lng for mapping
      // Generates coordinates cleanly constrained strictly within a rectangle covering the Gaza strip 
      // Rafah (bottom-left) to Beit Hanoun (top-right)
      data = data.map(p => {
         // length along the strip
         const t = Math.random();
         // width across the strip (approx 8km width -> 0.08 deg max variation)
         const w = (Math.random() - 0.5) * 0.08;
         
         // Vector from Rafah (31.23, 34.22) to North (31.57, 34.52)
         // Perpendicular vector for width offset: uLat = -0.66, uLng = 0.75
         return {
           ...p,
           lat: p.lat ?? (31.23 + (t * 0.34) + w * -0.66), 
           lng: p.lng ?? (34.22 + (t * 0.30) + w * 0.75)
         };
      });

      res.json(data);
    } catch (error) {
      console.error('Server error fetching data:', error);
      res.status(500).json({ error: 'Failed to fetch or parse data' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();


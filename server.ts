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
      // 1. محاولة جلب البيانات من الرابط الخارجي (تأكد من صحة الرابط)
      const githubUrl = 'https://raw.githubusercontent.com/OussamaSEBROU/Talk-About-Me2/main/src/services/victims_data.xlsx';
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
        console.error('Falling back to local files...', err);
        
        // 2. البحث عن الملف في عدة مسارات محتملة لضمان العمل
        const pathsToTry = [
          path.join(process.cwd(), 'victims_data.xlsx'),
          path.join(process.cwd(), 'victims_data.csv'),
          path.join(process.cwd(), 'src', 'services', 'victims_data.xlsx'),
          path.join(process.cwd(), 'src', 'services', 'victims_data.csv')
        ];

        let fileFound = false;
        for (const filePath of pathsToTry) {
          if (fs.existsSync(filePath)) {
            const workbook = XLSX.readFile(filePath);
            const sheetName = workbook.SheetNames[0];
            data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { range: 1 });
            fileFound = true;
            console.log(`Loaded data from: ${filePath}`);
            break;
          }
        }

        if (!fileFound) {
          // بيانات تجريبية في حال عدم وجود الملف نهائياً
          data = Array.from({length: 150}).map((_, i) => ({
            Index: String(i+1),
            Name: "Mock Data (Please upload file)",
            الاسم: "بيانات تجريبية (يرجى رفع الملف)",
            Age: i % 7 === 0 ? "10" : (i % 3 === 0 ? "65" : "25"),
            Born: "2000-01-01",
            Sex: i % 2 === 0 ? "m" : "f",
            ID: "00000"
          }));
        }
      }
      
      // توزيع النقاط عشوائياً داخل حدود قطاع غزة
      data = data.map(p => {
         const t = Math.random();
         const w = (Math.random() - 0.5) * 0.08;
         return {
           ...p,
           lat: p.lat ?? (31.23 + (t * 0.34) + w * -0.66), 
           lng: p.lng ?? (34.22 + (t * 0.30) + w * 0.75)
         };
      });

      res.json(data);
    } catch (error) {
      console.error('Server error:', error);
      res.status(500).json({ error: 'Failed to fetch or parse data' });
    }
  });

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

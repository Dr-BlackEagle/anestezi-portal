// Tek seferlik: yıllık eğitim planını ayar/egitimPlani'ye yaz (veri iş akışı girdisiyle gelir, depoda tutulmaz)
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();
(async () => {
  const raw = process.env.EP_DATA || '';
  if (!raw) { console.log('veri yok'); return; }
  const d = JSON.parse(Buffer.from(raw, 'base64').toString('utf8'));
  const sahip = (await db.doc('meta/sahip').get()).data() || {};
  await db.doc('ayar/egitimPlani').set({ baslik: 'Anesteziyoloji ve Reanimasyon Kliniği Eğitim Programı', yil: '2026–2027', satirlar: d.satirlar, guncelleyen: sahip.uid || '', guncelleme: new Date().toISOString() });
  console.log('yüklendi:', d.satirlar.length, 'satır');
})().catch(e => { console.error(e); process.exit(1); });

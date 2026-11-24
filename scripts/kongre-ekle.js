// Tek seferlik: duvar afişlerindeki, tarihi geçmemiş kongreleri portala ekler (aynı adla varsa dokunmaz)
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();
const K = [
  { ad: '6. Uluslararası Anesteziyoloji ve Reanimasyon Sempozyumu (SBÜ)', sehir: 'İstanbul · Elite World Grand İstanbul Küçükyalı', baslangic: '2026-12-04', bitis: '2026-12-05', link: 'https://www.anestezisempozyumu.org', not: '"Bilimin izinde, yaşamın nöbetinde" · Sağlık Bilimleri Üniversitesi' },
  { ad: 'TYBD 24. Ulusal Yoğun Bakım Kongresi & 26th International Intensive Care Symposium', sehir: 'Antalya', baslangic: '2027-04-01', bitis: '2027-04-04', link: 'https://www.intensivecare.org.tr', not: 'Türk Yoğun Bakım Derneği' }
];
(async () => {
  const sahip = (await db.doc('meta/sahip').get()).data() || {};
  const mevcut = new Set((await db.collection('kongre').get()).docs.map(d => (d.data().ad || '').trim()));
  for (const k of K) {
    if (mevcut.has(k.ad)) { console.log('zaten var:', k.ad); continue; }
    await db.collection('kongre').add(Object.assign({ sonBildiri: '', katilanlar: [], guncelleyen: sahip.uid || '', guncelleme: new Date().toISOString() }, k));
    console.log('eklendi:', k.ad);
  }
})().catch(e => { console.error(e); process.exit(1); });

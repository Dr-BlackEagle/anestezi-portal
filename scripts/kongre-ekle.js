// Tek seferlik: kayıt bilgileri
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();
const G = {
  '6. Uluslararası Anesteziyoloji ve Reanimasyon Sempozyumu (SBÜ)': { not: '"Bilimin izinde, yaşamın nöbetinde" · Sağlık Bilimleri Üniversitesi · 4 Aralık çevrimiçi, 5 Aralık yüz yüze · Kayıt açık; son kayıt tarihi ilan edilmemiş. Erken kayıt 15 Eylül\'de bitti; asistan kayıt ücreti şu an 5.000 ₺ · Kabul edilen sözlü bildirilerin sunum dosyası son yükleme: 1 Aralık 2026' },
  'TYBD 24. Ulusal Yoğun Bakım Kongresi & 26th International Intensive Care Symposium': { not: 'Türk Yoğun Bakım Derneği · Kayıt ve bildiri tarihleri henüz duyurulmadı' }
};
(async () => {
  const q = await db.collection('kongre').get();
  for (const d of q.docs) { const g = G[(d.data().ad || '').trim()]; if (!g) continue; await d.ref.update(Object.assign({ guncelleme: new Date().toISOString() }, g)); console.log('güncellendi:', d.data().ad); }
})().catch(e => { console.error(e); process.exit(1); });

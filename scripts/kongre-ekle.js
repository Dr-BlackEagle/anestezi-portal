// Tek seferlik: bu haftaki konuk sunumu seminerlere ekle. Gün ve saat, mevcut seminerlerin olağan gün/saatinden alınır.
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();
(async () => {
  const docs = (await db.collection('seminer').get()).docs.map(d => d.data());
  const say = a => { const m = {}; a.forEach(x => { if (x != null && x !== '') m[x] = (m[x] || 0) + 1; }); return Object.entries(m).sort((a, b) => b[1] - a[1])[0]; };
  const gun = say(docs.map(s => s.tarih && new Date(s.tarih + 'T12:00:00Z').getUTCDay()));
  const saat = say(docs.map(s => s.saat));
  console.log('olağan gün:', gun, 'olağan saat:', saat, 'seminer sayısı:', docs.length);
  const hedef = gun ? +gun[0] : 3;
  const bugun = new Date(Date.now() + 3 * 3600e3); let d = new Date(Date.UTC(bugun.getUTCFullYear(), bugun.getUTCMonth(), bugun.getUTCDate()));
  while (d.getUTCDay() !== hedef) d = new Date(d.getTime() + 864e5);
  const tarih = d.toISOString().slice(0, 10);
  const konu = "ERAS'ta Kaygı ve Korku: Ameliyat öncesinden eve dönüşe";
  if (docs.some(s => s.tarih === tarih && /ERAS/i.test(s.konu || ''))) { console.log('zaten var'); return; }
  const sahip = (await db.doc('meta/sahip').get()).data() || {};
  await db.collection('seminer').add({ tarih, saat: saat ? saat[0] : '08:00', tur: 'Seminer', konu, sunan: 'Ömer Akba (Klinik Psikolog & Psikoterapist)', danisman: '', moderator: '', yer: '-2 Toplantı Salonu', not: 'Geniş katılımlı · Hastanın yaşantısını anlamak ve bakımda karşılamak', guncelleyen: sahip.uid || '', guncelleme: new Date().toISOString() });
  console.log('eklendi:', tarih, saat && saat[0]);
})().catch(e => { console.error(e); process.exit(1); });

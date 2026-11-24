// Tek seferlik: ERAS konuk sunumu seminerinin duyurusu
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();
(async () => {
  const sem = (await db.collection('seminer').get()).docs.find(d => /ERAS/i.test(d.data().konu || ''));
  if (!sem) { console.log('seminer yok'); return; }
  const s = sem.data();
  const q = await db.collection('duyurular').where('seminer', '==', sem.id).get();
  if (!q.empty) { console.log('duyuru zaten var'); return; }
  const sahip = (await db.doc('meta/sahip').get()).data() || {};
  await db.collection('duyurular').add({
    baslik: `25 Kasım Çarşamba Seminer: ${s.konu}`,
    metin: ['Sunan: Ömer Akba (Klinik Psikolog & Psikoterapist)', `Saat: ${s.saat || ''} (seminer saati)`, 'Yer: -2 Toplantı Salonu', 'Geniş katılımlı sunum · Hastanın yaşantısını anlamak ve bakımda karşılamak'].join('\n'),
    tarih: new Date().toISOString(), onemli: false, sabit: false, bitis: s.tarih, seminer: sem.id,
    yazan: sahip.uid || '', guncelleyen: sahip.uid || '', guncelleme: new Date().toISOString()
  });
  console.log('duyuru eklendi');
})().catch(e => { console.error(e); process.exit(1); });

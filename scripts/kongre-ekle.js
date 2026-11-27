// Tek seferlik: ALPER kayıtları ALİ olarak; Kardelen/Tuğçe/Taha/Ece incelemesi.
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();
const M = {'NRŞ':'NRŞ','KBB':'KBB'};
const U = x => String(x || '').toLocaleUpperCase('tr').trim();
(async () => {
  const data = JSON.parse(Buffer.from(process.env.EP_DATA || '', 'base64').toString('utf8'));
  for (const [m, s] of Object.entries(data)) {
    const ref = db.doc('rotasyon/ay-' + m); const d = (await ref.get()).data(); if (!d) { console.log('yok', m); continue; }
    const ad = M[s] || s; const sv = d.servisler || []; let x = sv.find(v => v.ad === ad); if (!x) { x = { ad, kisiler: [] }; sv.push(x); }
    if (!x.kisiler.includes('ALİ')) x.kisiler.push('ALİ');
    await ref.update({ servisler: sv }); console.log('eklendi', m, ad);
  }
  const ara = ['KARDELEN', 'TUĞÇE', 'TAHA', 'ECE', 'ECESU', 'AHMET', 'ALİ'];
  const ky = await db.collection('kayit').get();
  ky.docs.forEach(d => { const k = d.data(); if (ara.includes(U(k.kisaAd))) console.log('kayıt:', U(k.kisaAd), '·', (k.adSoyad || '').split(' ')[0], '·', k.unvan, '·', k.baslangic || k.basTarih || ''); });
  const q = await db.collection('rotasyon').get();
  q.docs.forEach(d => { const v = d.data(); if (d.id === 'birikim') { (v.kisiler || []).forEach((p, i) => { if (ara.some(a => U(p.ad).split(' ').includes(a))) console.log('karne satırı', i, p.ad.split(' ')[0], p.toplam); }); return; }
    (v.servisler || []).forEach(s => (s.kisiler || []).forEach(k => { if (['KARDELEN','TUĞÇE','TAHA','ECE','ECESU'].includes(U(k))) console.log('ay', d.id, U(k), s.ad); })); });
})().catch(e => { console.error(e); process.exit(1); });

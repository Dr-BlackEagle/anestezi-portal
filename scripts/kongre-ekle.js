// Tek seferlik: MERVE KILINÇ geçmiş rotasyonlarını ekler.
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();
const M = {'YBÜ':'YBÜ','ACİL/GÖĞÜS':'Acil-Göğüs','JİN-ONKO / ROBOTİK':'Jinekoloji-Onkoloji / Robotik','GENEL CERRAHİ':'Genel Cerrahi','FTR AMELİYATHANE':'FTR Ameliyathane'};
(async () => {
  const data = JSON.parse(Buffer.from(process.env.EP_DATA || '', 'base64').toString('utf8'));
  for (const [m, s] of Object.entries(data)) {
    const ref = db.doc('rotasyon/ay-' + m); const d = (await ref.get()).data(); if (!d) { console.log('yok', m); continue; }
    const ad = M[s] || s; const sv = d.servisler || []; let x = sv.find(v => v.ad === ad); if (!x) { x = { ad, kisiler: [] }; sv.push(x); }
    if (!x.kisiler.includes('MERVE KILINÇ')) x.kisiler.push('MERVE KILINÇ');
    await ref.update({ servisler: sv }); console.log('eklendi', m, ad);
  }
})().catch(e => { console.error(e); process.exit(1); });

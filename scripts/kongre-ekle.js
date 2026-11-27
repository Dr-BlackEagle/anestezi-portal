// Tek seferlik: Kardelen→TUĞÇE, Ecesu→ECE liste adı; Kardelen'den önceki başka TUĞÇE kayıtları (Bahçelievler 2024) silinir.
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();
const U = x => String(x || '').toLocaleUpperCase('tr').trim();
(async () => {
  const ky = await db.collection('kayit').get();
  for (const d of ky.docs) { const k = d.data(); const y = U(k.kisaAd) === 'KARDELEN' ? 'TUĞÇE' : U(k.kisaAd) === 'ECESU' ? 'ECE' : null; if (y) { await d.ref.update({ kisaAd: y }); console.log('liste adı:', U(k.kisaAd), '→', y); } }
  for (const m of ['2024-04', '2024-10']) { const ref = db.doc('rotasyon/ay-' + m); const v = (await ref.get()).data(); const sv = (v.servisler || []).map(s => ({ ...s, kisiler: (s.kisiler || []).filter(k => U(k) !== 'TUĞÇE') })).filter(s => s.kisiler.length); await ref.update({ servisler: sv }); console.log('temizlendi', m); }
})().catch(e => { console.error(e); process.exit(1); });

import { useState, useEffect, useRef } from 'react';
import { supabase } from './supabase';

const GOLD = "#C9A84C";
const DARK = "#2c1f0e";
const CREAM = "#fdf6e3";

const fieldStyle = {
  width: '100%', padding: '10px 14px', border: `1px solid ${GOLD}66`,
  background: '#fff', fontFamily: "'Cormorant Garamond', serif",
  fontSize: 15, color: DARK, outline: 'none', boxSizing: 'border-box',
};

const labelStyle = {
  fontFamily: "'Cinzel', serif", fontSize: 10, letterSpacing: 2,
  color: GOLD, display: 'block', marginBottom: 6,
};

export default function Admin() {
  const [rezervasyonlar, setRezervasyonlar] = useState([]);
  const [galeri, setGaleri] = useState([]);
  const [paketler, setPaketler] = useState([]);
  const [ayarForm, setAyarForm] = useState({});
  const [sifre, setSifre] = useState('');
  const [sifreGoster, setSifreGoster] = useState(false);
  const [girisYapildi, setGirisYapildi] = useState(false);
  const [aktifSekme, setAktifSekme] = useState('rezervasyonlar');
  const [yukleniyor, setYukleniyor] = useState(false);
  const [duzenForm, setDuzenForm] = useState(null);
  const [ayarKaydedildi, setAyarKaydedildi] = useState(false);
  const [aktifFiltre, setAktifFiltre] = useState('Toplam');
  const [oturumAcikBirak, setOturumAcikBirak] = useState(false);
  const [kapatilacakTarih, setKapatilacakTarih] = useState('');
  const [paketGorselleri, setPaketGorselleri] = useState({});
  const [etkinlikler, setEtkinlikler] = useState([]);
  const [etkinlikForm, setEtkinlikForm] = useState({ baslik: '', tarih: '', aciklama: '' });
  const [etkinlikGorsel, setEtkinlikGorsel] = useState('');
  const dosyaRef = useRef();
  const heroGorselRef = useRef();
  const salonGorselRef = useRef();
  const paketGorselRef = useRef();
  const etkinlikGorselRef = useRef();

  const ADMIN_SIFRE = process.env.REACT_APP_ADMIN_SIFRE;

  useEffect(() => {
    if (localStorage.getItem('hurrem_admin') === 'true') setGirisYapildi(true);
  }, []);

  const giris = () => {
    if (sifre === ADMIN_SIFRE) {
      if (oturumAcikBirak) localStorage.setItem('hurrem_admin', 'true');
      setGirisYapildi(true);
    } else alert('Şifre yanlış!');
  };

  const cikis = () => {
    localStorage.removeItem('hurrem_admin');
    setGirisYapildi(false);
  };

  useEffect(() => {
    if (girisYapildi) {
      fetchRezervasyonlar();
      fetchGaleri();
      fetchPaketler();
      fetchAyarlar();
      fetchPaketGorselleri();
      fetchEtkinlikler();
    }
  }, [girisYapildi]);

  const fetchRezervasyonlar = async () => {
    const { data } = await supabase.from('rezervasyonlar').select('*').order('tarih', { ascending: true });
    setRezervasyonlar(data || []);
  };

  const fetchGaleri = async () => {
    const { data } = await supabase.from('galeri').select('*').order('created_at', { ascending: true });
    setGaleri(data || []);
  };

  const fetchPaketler = async () => {
    const { data } = await supabase.from('paketler').select('*').order('sira');
    setPaketler(data || []);
  };

  const fetchAyarlar = async () => {
    const { data } = await supabase.from('site_ayarlari').select('*');
    if (data) {
      const map = {};
      data.forEach(r => { map[r.anahtar] = r.deger; });
      setAyarForm(map);
    }
  };

  // ── Tarih engelleme ──
  const tarihKapat = async () => {
    if (!kapatilacakTarih) return;
    const { error } = await supabase.from('rezervasyonlar').insert({
      tarih: kapatilacakTarih, ad_soyad: '[KAPALI]',
      telefon: '-', durum: 'Onaylandı', not: 'Admin tarafından kapatıldı',
    });
    if (!error) { setKapatilacakTarih(''); fetchRezervasyonlar(); }
    else alert('Bu tarih zaten dolu veya kapalı.');
  };

  const tarihAc = async (id) => {
    await supabase.from('rezervasyonlar').delete().eq('id', id);
    fetchRezervasyonlar();
  };

  // ── Rezervasyon işlemleri ──
  const durumGuncelle = async (id, durum) => {
    await supabase.from('rezervasyonlar').update({ durum }).eq('id', id);
    fetchRezervasyonlar();
  };

  const rezervasyonSil = async (id) => {
    if (window.confirm('Bu rezervasyonu silmek istediğinizden emin misiniz?')) {
      await supabase.from('rezervasyonlar').delete().eq('id', id);
      fetchRezervasyonlar();
    }
  };

  const onRezervasyonYap = async (id, mevcutDurum) => {
    if (mevcutDurum === 'Ön Rezervasyon') {
      await supabase.from('rezervasyonlar').update({ on_rezervasyon: false, durum: 'Beklemede' }).eq('id', id);
    } else {
      await supabase.from('rezervasyonlar').update({ on_rezervasyon: true, durum: 'Ön Rezervasyon' }).eq('id', id);
    }
    fetchRezervasyonlar();
  };

  // ── Galeri işlemleri ──
  const fotoYukle = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setYukleniyor(true);
    for (const file of files) {
      const uzanti = file.name.split('.').pop();
      const dosyaAdi = `foto-${Date.now()}-${Math.random().toString(36).slice(2)}.${uzanti}`;
      const { error } = await supabase.storage.from('galeri').upload(dosyaAdi, file);
      if (!error) {
        const { data: urlData } = supabase.storage.from('galeri').getPublicUrl(dosyaAdi);
        await supabase.from('galeri').insert({ url: urlData.publicUrl });
      }
    }
    setYukleniyor(false);
    dosyaRef.current.value = '';
    fetchGaleri();
  };

  const fotoSil = async (id, url) => {
    if (!window.confirm('Bu fotoğrafı silmek istediğinizden emin misiniz?')) return;
    const dosyaAdi = url.split('/').pop();
    await supabase.storage.from('galeri').remove([dosyaAdi]);
    await supabase.from('galeri').delete().eq('id', id);
    fetchGaleri();
  };

  const fetchPaketGorselleri = async () => {
    const { data } = await supabase.from('paket_gorselleri').select('*').order('created_at');
    if (data) {
      const map = {};
      data.forEach(g => {
        if (!map[g.paket_id]) map[g.paket_id] = [];
        map[g.paket_id].push(g);
      });
      setPaketGorselleri(map);
    }
  };

  // ── Etkinlik işlemleri ──
  const fetchEtkinlikler = async () => {
    const { data } = await supabase.from('etkinlikler').select('*').order('created_at', { ascending: false });
    setEtkinlikler(data || []);
  };

  const etkinlikGorselYukle = async (file) => {
    if (!file) return;
    setYukleniyor(true);
    const uzanti = file.name.split('.').pop();
    const dosyaAdi = `etkinlik-${Date.now()}.${uzanti}`;
    const { error } = await supabase.storage.from('galeri').upload(dosyaAdi, file);
    if (!error) {
      const { data: urlData } = supabase.storage.from('galeri').getPublicUrl(dosyaAdi);
      setEtkinlikGorsel(urlData.publicUrl);
    }
    setYukleniyor(false);
  };

  const etkinlikEkle = async () => {
    if (!etkinlikForm.baslik.trim()) return;
    await supabase.from('etkinlikler').insert({ ...etkinlikForm, gorsel_url: etkinlikGorsel || null });
    setEtkinlikForm({ baslik: '', tarih: '', aciklama: '' });
    setEtkinlikGorsel('');
    fetchEtkinlikler();
  };

  const etkinlikSil = async (id, gorselUrl) => {
    if (!window.confirm('Bu etkinlik silinsin mi?')) return;
    if (gorselUrl) {
      const dosyaAdi = gorselUrl.split('/').pop();
      await supabase.storage.from('galeri').remove([dosyaAdi]);
    }
    await supabase.from('etkinlikler').delete().eq('id', id);
    fetchEtkinlikler();
  };

  // ── Paket işlemleri ──
  const duzenlemeyiBaslat = (paket) => {
    setDuzenForm({ ...paket, features: [...paket.features] });
  };

  const paketKaydet = async () => {
    const temizFeatures = duzenForm.features.filter(f => f.trim() !== '');
    await supabase.from('paketler').update({
      name: duzenForm.name,
      capacity: duzenForm.capacity,
      price: duzenForm.price,
      features: temizFeatures,
      featured: duzenForm.featured,
    }).eq('id', duzenForm.id);
    setDuzenForm(null);
    fetchPaketler();
  };

  const ozellikEkle = () => setDuzenForm(f => ({ ...f, features: [...f.features, ''] }));
  const ozellikSil = (i) => setDuzenForm(f => ({ ...f, features: f.features.filter((_, idx) => idx !== i) }));
  const ozellikDegistir = (i, val) => setDuzenForm(f => ({ ...f, features: f.features.map((feat, idx) => idx === i ? val : feat) }));

  // ── Görsel yükleme ──
  const gorselYukle = async (anahtar, file) => {
    if (!file) return;
    setYukleniyor(true);
    const uzanti = file.name.split('.').pop();
    const dosyaAdi = `${anahtar}-${Date.now()}.${uzanti}`;
    const { error } = await supabase.storage.from('galeri').upload(dosyaAdi, file);
    if (!error) {
      const { data: urlData } = supabase.storage.from('galeri').getPublicUrl(dosyaAdi);
      await supabase.from('site_ayarlari').upsert({ anahtar, deger: urlData.publicUrl });
      ayarDegistir(anahtar, urlData.publicUrl);
    }
    setYukleniyor(false);
  };

  const gorselKaldir = async (anahtar, url) => {
    if (!window.confirm('Görsel kaldırılsın mı? Varsayılan görsel kullanılacak.')) return;
    const dosyaAdi = url.split('/').pop();
    await supabase.storage.from('galeri').remove([dosyaAdi]);
    await supabase.from('site_ayarlari').delete().eq('anahtar', anahtar);
    ayarDegistir(anahtar, '');
  };

  const paketGorselYukle = async (paketId, files) => {
    if (!files.length) return;
    setYukleniyor(true);
    for (const file of Array.from(files)) {
      const uzanti = file.name.split('.').pop();
      const dosyaAdi = `paket-${paketId}-${Date.now()}-${Math.random().toString(36).slice(2)}.${uzanti}`;
      const { error } = await supabase.storage.from('galeri').upload(dosyaAdi, file);
      if (!error) {
        const { data: urlData } = supabase.storage.from('galeri').getPublicUrl(dosyaAdi);
        await supabase.from('paket_gorselleri').insert({ paket_id: paketId, url: urlData.publicUrl });
      }
    }
    setYukleniyor(false);
    fetchPaketGorselleri();
  };

  const paketGorselSil = async (gorsel) => {
    if (!window.confirm('Bu görsel silinsin mi?')) return;
    const dosyaAdi = gorsel.url.split('/').pop();
    await supabase.storage.from('galeri').remove([dosyaAdi]);
    await supabase.from('paket_gorselleri').delete().eq('id', gorsel.id);
    fetchPaketGorselleri();
  };

  // ── Ayar işlemleri ──
  const ayarDegistir = (key, val) => setAyarForm(f => ({ ...f, [key]: val }));

  const ayarlariKaydet = async () => {
    for (const [anahtar, deger] of Object.entries(ayarForm)) {
      await supabase.from('site_ayarlari').upsert({ anahtar, deger });
    }
    setAyarKaydedildi(true);
    setTimeout(() => setAyarKaydedildi(false), 2500);
  };

  // ── İstatistikler ──
  const istatistik = {
    toplam: rezervasyonlar.length,
    beklemede: rezervasyonlar.filter(r => r.durum === 'Beklemede' || r.durum === 'Ön Rezervasyon').length,
    onaylandi: rezervasyonlar.filter(r => r.durum === 'Onaylandı').length,
    reddedildi: rezervasyonlar.filter(r => r.durum === 'Reddedildi').length,
  };

  // ── Giriş ekranı ──
  if (!girisYapildi) return (
    <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: CREAM }}>
      <div style={{ textAlign: 'center', padding: 48, background: '#fff', boxShadow: '0 4px 20px #0001', minWidth: 320 }}>
        <h2 style={{ fontFamily: "'Cinzel', serif", color: DARK, marginBottom: 24 }}>Admin Girişi</h2>
        <input
          type={sifreGoster ? 'text' : 'password'}
          placeholder="Şifre"
          value={sifre}
          onChange={e => setSifre(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') giris(); }}
          style={{ padding: '12px 20px', border: `1px solid ${GOLD}`, outline: 'none', marginBottom: 16, display: 'block', width: '100%', fontSize: 16, boxSizing: 'border-box' }}
        />
        <button onClick={() => setSifreGoster(!sifreGoster)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: GOLD, marginBottom: 16 }}>
          {sifreGoster ? 'Gizle' : 'Şifreyi Göster'}
        </button>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, cursor: 'pointer', justifyContent: 'center' }}>
          <input type="checkbox" checked={oturumAcikBirak} onChange={e => setOturumAcikBirak(e.target.checked)}
            style={{ width: 16, height: 16, accentColor: GOLD, cursor: 'pointer' }} />
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 15, color: DARK }}>Oturumu açık bırak</span>
        </label>
        <button onClick={giris}
          style={{ width: '100%', padding: 14, background: GOLD, border: 'none', color: '#fff', fontFamily: "'Cinzel', serif", fontSize: 13, letterSpacing: 3, cursor: 'pointer' }}>
          GİRİŞ
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: CREAM }}>
      <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600&family=Cormorant+Garamond:wght@400;600&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ background: DARK, padding: '24px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ fontFamily: "'Cinzel', serif", color: GOLD, margin: 0, fontSize: 20, letterSpacing: 3 }}>
          HÜRREM ROYAL — Admin
        </h1>
        <button onClick={cikis}
          style={{ background: 'none', border: `1px solid ${GOLD}44`, color: GOLD, padding: '8px 20px', cursor: 'pointer', fontFamily: "'Cinzel', serif", fontSize: 11, letterSpacing: 2 }}>
          ÇIKIŞ
        </button>
      </div>

      {/* Sekmeler */}
      <div style={{ background: '#fff', borderBottom: `1px solid ${GOLD}33`, display: 'flex', padding: '0 48px', overflowX: 'auto' }}>
        {[['rezervasyonlar', 'Rezervasyonlar'], ['galeri', 'Galeri'], ['paketler', 'Paketler'], ['etkinlikler', 'Etkinlikler'], ['ayarlar', 'Site Ayarları']].map(([key, label]) => (
          <button key={key} onClick={() => setAktifSekme(key)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
              padding: '16px 24px', fontFamily: "'Cinzel', serif", fontSize: 11, letterSpacing: 2,
              color: aktifSekme === key ? GOLD : DARK,
              borderBottom: aktifSekme === key ? `2px solid ${GOLD}` : '2px solid transparent',
              marginBottom: -1,
            }}>
            {label.toUpperCase()}
          </button>
        ))}
      </div>

      <div style={{ padding: 48 }}>

        {/* ── Rezervasyonlar ── */}
        {aktifSekme === 'rezervasyonlar' && (
          <div>
            {/* Tarih Yönetimi */}
            <div style={{ background: '#fff', border: `1px solid ${GOLD}33`, borderRadius: 8, overflow: 'hidden', marginBottom: 32 }}>
              <div style={{ background: DARK, padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <span style={{ fontFamily: "'Cinzel', serif", color: GOLD, fontSize: 11, letterSpacing: 3 }}>TARİH YÖNETİMİ</span>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <input type="date" value={kapatilacakTarih} onChange={e => setKapatilacakTarih(e.target.value)}
                    style={{ padding: '7px 12px', border: `1px solid ${GOLD}66`, background: '#fff', fontFamily: "'Cormorant Garamond', serif", fontSize: 14, color: DARK, outline: 'none' }} />
                  <button onClick={tarihKapat} disabled={!kapatilacakTarih}
                    style={{ background: kapatilacakTarih ? '#dc3545' : '#ccc', border: 'none', color: '#fff', padding: '8px 18px', cursor: kapatilacakTarih ? 'pointer' : 'default', fontFamily: "'Cinzel', serif", fontSize: 10, letterSpacing: 2, borderRadius: 4 }}>
                    KAPAT
                  </button>
                </div>
              </div>
              {rezervasyonlar.filter(r => r.ad_soyad === '[KAPALI]').length > 0 && (
                <div style={{ padding: '12px 24px', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {rezervasyonlar.filter(r => r.ad_soyad === '[KAPALI]').map(r => (
                    <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f8d7da', borderRadius: 20, padding: '4px 12px 4px 14px' }}>
                      <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 14, color: '#721c24' }}>{r.tarih}</span>
                      <button onClick={() => tarihAc(r.id)}
                        style={{ background: 'none', border: 'none', color: '#721c24', cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: 0 }}>×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* İstatistik kartları */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16, marginBottom: 40 }}>
              {[
                { label: 'Toplam', value: istatistik.toplam, renk: GOLD, bg: '#fff' },
                { label: 'Beklemede', value: istatistik.beklemede, renk: '#856404', bg: '#fff3cd' },
                { label: 'Onaylandı', value: istatistik.onaylandi, renk: '#155724', bg: '#d4edda' },
                { label: 'Reddedildi', value: istatistik.reddedildi, renk: '#721c24', bg: '#f8d7da' },
              ].map(({ label, value, renk, bg }) => (
                <div key={label} onClick={() => setAktifFiltre(aktifFiltre === label ? 'Toplam' : label)}
                  style={{
                    background: bg, borderRadius: 8, padding: '20px 24px', textAlign: 'center',
                    border: aktifFiltre === label ? `2px solid ${renk}` : `1px solid ${renk}33`,
                    cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s',
                    boxShadow: aktifFiltre === label ? `0 4px 16px ${renk}44` : 'none',
                    transform: aktifFiltre === label ? 'translateY(-2px)' : 'none',
                  }}>
                  <div style={{ fontFamily: "'Cinzel', serif", fontSize: 32, color: renk, fontWeight: 600 }}>{value}</div>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 14, color: renk, marginTop: 4 }}>{label}</div>
                </div>
              ))}
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', minWidth: 800 }}>
                <thead>
                  <tr style={{ background: DARK, color: '#fff' }}>
                    {['Ad Soyad', 'Telefon', 'Tarih', 'Paket', 'Not', 'Durum', 'İşlem'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', fontFamily: "'Cinzel', serif", fontSize: 11, letterSpacing: 2, textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rezervasyonlar.filter(r => {
                    if (r.ad_soyad === '[KAPALI]') return false;
                    if (aktifFiltre === 'Toplam') return true;
                    if (aktifFiltre === 'Beklemede') return r.durum === 'Beklemede' || r.durum === 'Ön Rezervasyon';
                    if (aktifFiltre === 'Onaylandı') return r.durum === 'Onaylandı';
                    if (aktifFiltre === 'Reddedildi') return r.durum === 'Reddedildi';
                    return true;
                  }).map((r, i) => (
                    <tr key={r.id} style={{ borderBottom: `1px solid ${GOLD}33`, background: i % 2 === 0 ? '#fff' : '#fdf6e3' }}>
                      <td style={{ padding: '12px 16px' }}>{r.ad_soyad}</td>
                      <td style={{ padding: '12px 16px' }}>{r.telefon}</td>
                      <td style={{ padding: '12px 16px' }}>{r.tarih}</td>
                      <td style={{ padding: '12px 16px' }}>{r.paket}</td>
                      <td style={{ padding: '12px 16px' }}>{r.not}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          padding: '4px 12px', borderRadius: 20, fontSize: 12, whiteSpace: 'nowrap',
                          background: r.durum === 'Onaylandı' ? '#d4edda' : r.durum === 'Reddedildi' ? '#f8d7da' : '#fff3cd',
                          color: r.durum === 'Onaylandı' ? '#155724' : r.durum === 'Reddedildi' ? '#721c24' : '#856404',
                        }}>
                          {r.durum}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          <button onClick={() => durumGuncelle(r.id, 'Onaylandı')}
                            style={{ padding: '6px 10px', background: '#28a745', border: 'none', color: '#fff', cursor: 'pointer', borderRadius: 4, fontSize: 11 }}>Onayla</button>
                          <button onClick={() => durumGuncelle(r.id, 'Reddedildi')}
                            style={{ padding: '6px 10px', background: '#dc3545', border: 'none', color: '#fff', cursor: 'pointer', borderRadius: 4, fontSize: 11 }}>Reddet</button>
                          <button onClick={() => onRezervasyonYap(r.id, r.durum)}
                            style={{ padding: '6px 10px', background: r.durum === 'Ön Rezervasyon' ? '#888' : GOLD, border: 'none', color: DARK, cursor: 'pointer', borderRadius: 4, fontSize: 11, fontWeight: 'bold' }}>
                            {r.durum === 'Ön Rezervasyon' ? 'Geri Al' : 'Ön Rez'}
                          </button>
                          {r.durum === 'Reddedildi' && (
                            <button onClick={() => rezervasyonSil(r.id)}
                              style={{ padding: '6px 10px', background: '#dc3545', border: 'none', color: '#fff', cursor: 'pointer', borderRadius: 4, fontSize: 11 }}>Sil</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {rezervasyonlar.length === 0 && (
                    <tr><td colSpan={7} style={{ padding: 32, textAlign: 'center', color: '#999', fontFamily: "'Cormorant Garamond', serif", fontSize: 16 }}>Henüz rezervasyon yok.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Galeri ── */}
        {aktifSekme === 'galeri' && (
          <div>
            <div style={{
              background: '#fff', border: `2px dashed ${GOLD}66`, borderRadius: 8,
              padding: 40, textAlign: 'center', marginBottom: 40, cursor: 'pointer',
            }} onClick={() => dosyaRef.current.click()}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📷</div>
              <p style={{ fontFamily: "'Cinzel', serif", color: DARK, fontSize: 13, letterSpacing: 2, marginBottom: 8 }}>FOTOĞRAF YÜKLE</p>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", color: '#999', fontSize: 15, marginBottom: 16 }}>
                Tıkla veya birden fazla dosya seç · JPG, PNG, WEBP
              </p>
              <input ref={dosyaRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={fotoYukle} />
              <button onClick={e => { e.stopPropagation(); dosyaRef.current.click(); }} disabled={yukleniyor}
                style={{ background: yukleniyor ? '#ccc' : GOLD, border: 'none', color: DARK, padding: '12px 32px', fontFamily: "'Cinzel', serif", fontSize: 11, letterSpacing: 3, cursor: yukleniyor ? 'wait' : 'pointer' }}>
                {yukleniyor ? 'YÜKLENİYOR...' : 'DOSYA SEÇ'}
              </button>
            </div>
            <p style={{ fontFamily: "'Cinzel', serif", fontSize: 11, letterSpacing: 3, color: GOLD, marginBottom: 20 }}>
              GALERİDEKİ FOTOĞRAFLAR ({galeri.length})
            </p>
            {galeri.length === 0 ? (
              <p style={{ fontFamily: "'Cormorant Garamond', serif", color: '#999', fontSize: 16 }}>Henüz fotoğraf yok.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
                {galeri.map(foto => (
                  <div key={foto.id} style={{ position: 'relative', borderRadius: 6, overflow: 'hidden', background: '#fff', boxShadow: '0 2px 8px #0001' }}>
                    <img src={foto.url} alt="" style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }} />
                    <button onClick={() => fotoSil(foto.id, foto.url)}
                      style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(220,53,69,0.9)', border: 'none', color: '#fff', width: 28, height: 28, borderRadius: '50%', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Etkinlikler ── */}
        {aktifSekme === 'etkinlikler' && (
          <div style={{ maxWidth: 800 }}>
            {/* Yeni etkinlik ekle */}
            <div style={{ background: '#fff', border: `1px solid ${GOLD}33`, borderRadius: 8, overflow: 'hidden', marginBottom: 40 }}>
              <div style={{ background: DARK, padding: '14px 24px' }}>
                <span style={{ fontFamily: "'Cinzel', serif", color: GOLD, fontSize: 12, letterSpacing: 3 }}>YENİ ETKİNLİK EKLE</span>
              </div>
              <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={labelStyle}>ÇİFT / ETKİNLİK ADI *</label>
                    <input value={etkinlikForm.baslik} onChange={e => setEtkinlikForm(f => ({ ...f, baslik: e.target.value }))}
                      style={fieldStyle} placeholder="Fatma & Ali Düğünü" />
                  </div>
                  <div>
                    <label style={labelStyle}>TARİH</label>
                    <input value={etkinlikForm.tarih} onChange={e => setEtkinlikForm(f => ({ ...f, tarih: e.target.value }))}
                      style={fieldStyle} placeholder="15 Haziran 2025" />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>KISA AÇIKLAMA (opsiyonel)</label>
                  <input value={etkinlikForm.aciklama} onChange={e => setEtkinlikForm(f => ({ ...f, aciklama: e.target.value }))}
                    style={fieldStyle} placeholder="Örn: 350 kişilik muhteşem bir düğün gecesi" />
                </div>
                <div>
                  <label style={labelStyle}>FOTOĞRAF</label>
                  <input ref={etkinlikGorselRef} type="file" accept="image/*" style={{ display: 'none' }}
                    onChange={e => etkinlikGorselYukle(e.target.files[0])} />
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                    <button onClick={() => etkinlikGorselRef.current.click()} disabled={yukleniyor}
                      style={{ background: yukleniyor ? '#ccc' : GOLD, border: 'none', color: DARK, padding: '10px 24px', cursor: yukleniyor ? 'wait' : 'pointer', fontFamily: "'Cinzel', serif", fontSize: 10, letterSpacing: 2 }}>
                      {yukleniyor ? 'YÜKLENİYOR...' : 'GÖRSEL YÜKLE'}
                    </button>
                    {etkinlikGorsel && (
                      <>
                        <img src={etkinlikGorsel} alt="" style={{ height: 60, width: 100, objectFit: 'cover', borderRadius: 4, border: `1px solid ${GOLD}44` }} />
                        <button onClick={() => setEtkinlikGorsel('')}
                          style={{ background: '#dc3545', border: 'none', color: '#fff', padding: '6px 14px', cursor: 'pointer', borderRadius: 4, fontSize: 12 }}>Kaldır</button>
                      </>
                    )}
                  </div>
                </div>
                <button onClick={etkinlikEkle} disabled={!etkinlikForm.baslik.trim()}
                  style={{ background: etkinlikForm.baslik.trim() ? GOLD : '#ccc', border: 'none', color: DARK, padding: '14px 32px', cursor: etkinlikForm.baslik.trim() ? 'pointer' : 'default', fontFamily: "'Cinzel', serif", fontSize: 11, letterSpacing: 3, alignSelf: 'flex-start' }}>
                  ETKİNLİK EKLE
                </button>
              </div>
            </div>

            {/* Mevcut etkinlikler */}
            <p style={{ fontFamily: "'Cinzel', serif", fontSize: 11, letterSpacing: 3, color: GOLD, marginBottom: 20 }}>
              ETKİNLİKLER ({etkinlikler.length})
            </p>
            {etkinlikler.length === 0 ? (
              <p style={{ fontFamily: "'Cormorant Garamond', serif", color: '#999', fontSize: 16 }}>Henüz etkinlik eklenmemiş.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {etkinlikler.map(ev => (
                  <div key={ev.id} style={{ background: '#fff', border: `1px solid ${GOLD}33`, borderRadius: 8, padding: '16px 20px', display: 'flex', gap: 16, alignItems: 'center' }}>
                    {ev.gorsel_url && (
                      <img src={ev.gorsel_url} alt="" style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 4, flexShrink: 0, border: `1px solid ${GOLD}44` }} />
                    )}
                    <div style={{ flex: 1 }}>
                      <p style={{ fontFamily: "'Cinzel', serif", fontSize: 13, color: DARK, marginBottom: 2 }}>{ev.baslik}</p>
                      {ev.tarih && <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 13, color: GOLD }}>{ev.tarih}</p>}
                      {ev.aciklama && <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 13, color: '#777', marginTop: 2 }}>{ev.aciklama}</p>}
                    </div>
                    <button onClick={() => etkinlikSil(ev.id, ev.gorsel_url)}
                      style={{ background: '#dc3545', border: 'none', color: '#fff', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>×</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Paketler ── */}
        {aktifSekme === 'paketler' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 800 }}>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", color: '#777', fontSize: 15, marginBottom: 8 }}>
              Paket adı, kapasite, fiyat ve özellikleri düzenleyebilirsiniz. Değişiklikler anasayfaya anında yansır.
            </p>
            {paketler.map(paket => (
              <div key={paket.id} style={{ background: '#fff', border: `1px solid ${GOLD}33`, borderRadius: 8, overflow: 'hidden' }}>
                <div style={{ background: DARK, padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <span style={{ fontFamily: "'Cinzel', serif", color: GOLD, fontSize: 16, letterSpacing: 2 }}>{paket.name}</span>
                    {paket.featured && (
                      <span style={{ background: GOLD, color: DARK, padding: '2px 10px', fontSize: 10, fontFamily: "'Cinzel', serif", letterSpacing: 2, borderRadius: 2 }}>EN POPÜLER</span>
                    )}
                  </div>
                  <button onClick={() => duzenForm?.id === paket.id ? setDuzenForm(null) : duzenlemeyiBaslat(paket)}
                    style={{ background: duzenForm?.id === paket.id ? '#555' : GOLD, border: 'none', color: duzenForm?.id === paket.id ? '#fff' : DARK, padding: '8px 20px', cursor: 'pointer', fontFamily: "'Cinzel', serif", fontSize: 10, letterSpacing: 2 }}>
                    {duzenForm?.id === paket.id ? 'İPTAL' : 'DÜZENLE'}
                  </button>
                </div>

                {duzenForm?.id === paket.id ? (
                  <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      <div>
                        <label style={labelStyle}>PAKET ADI</label>
                        <input value={duzenForm.name} onChange={e => setDuzenForm(f => ({ ...f, name: e.target.value }))} style={fieldStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>KAPASİTE</label>
                        <input value={duzenForm.capacity} onChange={e => setDuzenForm(f => ({ ...f, capacity: e.target.value }))} style={fieldStyle} placeholder="örn: 200–400 Kişi" />
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      <div>
                        <label style={labelStyle}>FİYAT</label>
                        <input value={duzenForm.price} onChange={e => setDuzenForm(f => ({ ...f, price: e.target.value }))} style={fieldStyle} placeholder="örn: ₺350.000" />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 24 }}>
                        <input type="checkbox" id={`featured-${paket.id}`} checked={duzenForm.featured} onChange={e => setDuzenForm(f => ({ ...f, featured: e.target.checked }))} style={{ width: 18, height: 18, cursor: 'pointer', accentColor: GOLD }} />
                        <label htmlFor={`featured-${paket.id}`} style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 16, color: DARK, cursor: 'pointer' }}>"En Popüler" rozeti göster</label>
                      </div>
                    </div>
                    <div>
                      <label style={labelStyle}>ÖZELLİKLER</label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {duzenForm.features.map((feat, i) => (
                          <div key={i} style={{ display: 'flex', gap: 8 }}>
                            <input value={feat} onChange={e => ozellikDegistir(i, e.target.value)} style={{ ...fieldStyle, flex: 1 }} placeholder={`Özellik ${i + 1}`} />
                            <button onClick={() => ozellikSil(i)} style={{ background: '#dc3545', border: 'none', color: '#fff', width: 38, cursor: 'pointer', borderRadius: 4, fontSize: 18, flexShrink: 0 }}>×</button>
                          </div>
                        ))}
                        <button onClick={ozellikEkle} style={{ background: 'none', border: `1px dashed ${GOLD}`, color: GOLD, padding: '10px', cursor: 'pointer', fontFamily: "'Cinzel', serif", fontSize: 10, letterSpacing: 2 }}>
                          + ÖZELLİK EKLE
                        </button>
                      </div>
                    </div>
                    <div>
                      <label style={labelStyle}>PAKET GÖRSELLERİ</label>
                      <input ref={paketGorselRef} type="file" accept="image/*" multiple style={{ display: 'none' }}
                        onChange={e => { paketGorselYukle(duzenForm.id, e.target.files); paketGorselRef.current.value = ''; }} />
                      <button onClick={() => paketGorselRef.current.click()} disabled={yukleniyor}
                        style={{ background: yukleniyor ? '#ccc' : GOLD, border: 'none', color: DARK, padding: '10px 24px', cursor: yukleniyor ? 'wait' : 'pointer', fontFamily: "'Cinzel', serif", fontSize: 10, letterSpacing: 2, marginBottom: 12 }}>
                        {yukleniyor ? 'YÜKLENİYOR...' : '+ GÖRSEL EKLE'}
                      </button>
                      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 4 }}>
                        {(paketGorselleri[duzenForm.id] || []).map(g => (
                          <div key={g.id} style={{ position: 'relative' }}>
                            <img src={g.url} alt="" style={{ width: 90, height: 70, objectFit: 'cover', borderRadius: 4, border: `1px solid ${GOLD}44`, display: 'block' }} />
                            <button onClick={() => paketGorselSil(g)}
                              style={{ position: 'absolute', top: -6, right: -6, background: '#dc3545', border: 'none', color: '#fff', width: 20, height: 20, borderRadius: '50%', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>×</button>
                          </div>
                        ))}
                        {(paketGorselleri[duzenForm.id] || []).length === 0 && (
                          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 14, color: '#999' }}>Henüz görsel eklenmemiş</span>
                        )}
                      </div>
                    </div>
                    <button onClick={paketKaydet} style={{ background: GOLD, border: 'none', color: DARK, padding: '14px', cursor: 'pointer', alignSelf: 'flex-start', fontFamily: "'Cinzel', serif", fontSize: 11, letterSpacing: 3, minWidth: 160 }}>
                      KAYDET
                    </button>
                  </div>
                ) : (
                  <div style={{ padding: '16px 24px', display: 'flex', gap: 32, flexWrap: 'wrap' }}>
                    <div><span style={{ fontFamily: "'Cinzel', serif", fontSize: 10, color: '#999', letterSpacing: 1 }}>FİYAT </span><span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 16, color: DARK, fontWeight: 600 }}>{paket.price}</span></div>
                    <div><span style={{ fontFamily: "'Cinzel', serif", fontSize: 10, color: '#999', letterSpacing: 1 }}>KAPASİTE </span><span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 16, color: DARK }}>{paket.capacity}</span></div>
                    <div><span style={{ fontFamily: "'Cinzel', serif", fontSize: 10, color: '#999', letterSpacing: 1 }}>ÖZELLİKLER </span><span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 15, color: '#666' }}>{paket.features?.join(' · ')}</span></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── Site Ayarları ── */}
        {aktifSekme === 'ayarlar' && (
          <div style={{ maxWidth: 700, display: 'flex', flexDirection: 'column', gap: 40 }}>

            {/* İletişim */}
            <div style={{ background: '#fff', border: `1px solid ${GOLD}33`, borderRadius: 8, overflow: 'hidden' }}>
              <div style={{ background: DARK, padding: '14px 24px' }}>
                <span style={{ fontFamily: "'Cinzel', serif", color: GOLD, fontSize: 12, letterSpacing: 3 }}>İLETİŞİM BİLGİLERİ</span>
              </div>
              <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={labelStyle}>TELEFON</label>
                  <input value={ayarForm.telefon || ''} onChange={e => ayarDegistir('telefon', e.target.value)} style={fieldStyle} placeholder="0344 000 00 00" />
                </div>
                <div>
                  <label style={labelStyle}>WHATSAPP NUMARASI (ülke kodu ile, örn: 905340000000)</label>
                  <input value={ayarForm.whatsapp || ''} onChange={e => ayarDegistir('whatsapp', e.target.value)} style={fieldStyle} placeholder="905340000000" />
                </div>
                <div>
                  <label style={labelStyle}>ADRES</label>
                  <input value={ayarForm.adres || ''} onChange={e => ayarDegistir('adres', e.target.value)} style={fieldStyle} placeholder="Kahramanmaraş, Türkiye" />
                </div>
                <div>
                  <label style={labelStyle}>E-POSTA</label>
                  <input value={ayarForm.email || ''} onChange={e => ayarDegistir('email', e.target.value)} style={fieldStyle} placeholder="info@hurremroyal.com" />
                </div>
              </div>
            </div>

            {/* Ön Rezervasyon */}
            <div style={{ background: '#fff', border: `1px solid ${GOLD}33`, borderRadius: 8, overflow: 'hidden' }}>
              <div style={{ background: DARK, padding: '14px 24px' }}>
                <span style={{ fontFamily: "'Cinzel', serif", color: GOLD, fontSize: 12, letterSpacing: 3 }}>ÖN REZERVASYON BİLGİLERİ</span>
              </div>
              <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={labelStyle}>KAPORA TUTARI</label>
                  <input value={ayarForm.kapora || ''} onChange={e => ayarDegistir('kapora', e.target.value)} style={fieldStyle} placeholder="₺10.000" />
                </div>
                <div>
                  <label style={labelStyle}>IBAN</label>
                  <input value={ayarForm.iban || ''} onChange={e => ayarDegistir('iban', e.target.value)} style={fieldStyle} placeholder="TR00 0000 0000 0000 0000 0000 00" />
                </div>
              </div>
            </div>

            {/* Hero */}
            <div style={{ background: '#fff', border: `1px solid ${GOLD}33`, borderRadius: 8, overflow: 'hidden' }}>
              <div style={{ background: DARK, padding: '14px 24px' }}>
                <span style={{ fontFamily: "'Cinzel', serif", color: GOLD, fontSize: 12, letterSpacing: 3 }}>ANA SAYFA — HERO BÖLÜMÜ</span>
              </div>
              <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={labelStyle}>SLOGAN</label>
                  <input value={ayarForm.hero_slogan || ''} onChange={e => ayarDegistir('hero_slogan', e.target.value)} style={fieldStyle} placeholder="En özel anınız, en güzel mekânda" />
                </div>
                <div>
                  <label style={labelStyle}>ARKA PLAN GÖRSELİ</label>
                  <input ref={heroGorselRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => gorselYukle('hero_gorsel', e.target.files[0])} />
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                    <button onClick={() => heroGorselRef.current.click()} disabled={yukleniyor}
                      style={{ background: yukleniyor ? '#ccc' : GOLD, border: 'none', color: DARK, padding: '10px 24px', cursor: yukleniyor ? 'wait' : 'pointer', fontFamily: "'Cinzel', serif", fontSize: 10, letterSpacing: 2 }}>
                      {yukleniyor ? 'YÜKLENİYOR...' : 'GÖRSEL YÜKLE'}
                    </button>
                    {ayarForm.hero_gorsel && (
                      <>
                        <img src={ayarForm.hero_gorsel} alt="hero" style={{ height: 60, width: 120, objectFit: 'cover', border: `1px solid ${GOLD}44`, borderRadius: 4 }} />
                        <button onClick={() => gorselKaldir('hero_gorsel', ayarForm.hero_gorsel)}
                          style={{ background: '#dc3545', border: 'none', color: '#fff', padding: '6px 14px', cursor: 'pointer', borderRadius: 4, fontSize: 12 }}>
                          Kaldır
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Salon */}
            <div style={{ background: '#fff', border: `1px solid ${GOLD}33`, borderRadius: 8, overflow: 'hidden' }}>
              <div style={{ background: DARK, padding: '14px 24px' }}>
                <span style={{ fontFamily: "'Cinzel', serif", color: GOLD, fontSize: 12, letterSpacing: 3 }}>SALON — HAKKIMIZDA BÖLÜMÜ</span>
              </div>
              <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={labelStyle}>METİN</label>
                  <textarea
                    value={ayarForm.salon_metin || ''}
                    onChange={e => ayarDegistir('salon_metin', e.target.value)}
                    rows={4}
                    style={{ ...fieldStyle, resize: 'vertical', lineHeight: 1.7 }}
                    placeholder="Kahramanmaraş'ın kalbinde..."
                  />
                </div>
                <div>
                  <label style={labelStyle}>BÖLÜM GÖRSELİ</label>
                  <input ref={salonGorselRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => gorselYukle('salon_gorsel', e.target.files[0])} />
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                    <button onClick={() => salonGorselRef.current.click()} disabled={yukleniyor}
                      style={{ background: yukleniyor ? '#ccc' : GOLD, border: 'none', color: DARK, padding: '10px 24px', cursor: yukleniyor ? 'wait' : 'pointer', fontFamily: "'Cinzel', serif", fontSize: 10, letterSpacing: 2 }}>
                      {yukleniyor ? 'YÜKLENİYOR...' : 'GÖRSEL YÜKLE'}
                    </button>
                    {ayarForm.salon_gorsel && (
                      <>
                        <img src={ayarForm.salon_gorsel} alt="salon" style={{ height: 60, width: 120, objectFit: 'cover', border: `1px solid ${GOLD}44`, borderRadius: 4 }} />
                        <button onClick={() => gorselKaldir('salon_gorsel', ayarForm.salon_gorsel)}
                          style={{ background: '#dc3545', border: 'none', color: '#fff', padding: '6px 14px', cursor: 'pointer', borderRadius: 4, fontSize: 12 }}>
                          Kaldır
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Kaydet butonu */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <button onClick={ayarlariKaydet}
                style={{ background: GOLD, border: 'none', color: DARK, padding: '16px 48px', cursor: 'pointer', fontFamily: "'Cinzel', serif", fontSize: 12, letterSpacing: 3 }}>
                KAYDET
              </button>
              {ayarKaydedildi && (
                <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 16, color: '#155724' }}>
                  ✓ Ayarlar kaydedildi
                </span>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

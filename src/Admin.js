import { useState, useEffect } from 'react';
import { supabase } from './supabase';

const GOLD = "#C9A84C";
const DARK = "#2c1f0e";
const CREAM = "#fdf6e3";

export default function Admin() {
  const [rezervasyonlar, setRezervasyonlar] = useState([]);
  const [sifre, setSifre] = useState('');
  const[sifreGoster, setSifreGoster] = useState(false);
  const [girisYapildi, setGirisYapildi] = useState(false);

  const ADMIN_SIFRE = process.env.REACT_APP_ADMIN_SIFRE; 

  const giris = () => {
    if (sifre === ADMIN_SIFRE) setGirisYapildi(true);
    else alert('Şifre yanlış!');
  };

  useEffect(() => {
    if (girisYapildi) fetchRezervasyonlar();
  }, [girisYapildi]);

  const fetchRezervasyonlar = async () => {
    const { data } = await supabase.from('rezervasyonlar').select('*').order('tarih', { ascending: true });
    setRezervasyonlar(data || []);
  };

  const durumGuncelle = async (id, durum) => {
    await supabase.from('rezervasyonlar').update({ durum }).eq('id', id);
    fetchRezervasyonlar();
  };
  const sil = async (id) => {
    if (window.confirm('Bu rezervasyonu silmek istediğinizden emin misiniz?')) {
      await supabase.from('rezervasyonlar').delete().eq('id', id);
      fetchRezervasyonlar();
    }
  };
  const onRezervasyonYap = async (id, mevcutDurum) => {
    if (mevcutDurum === 'Ön Rezervasyon') {
      // Geri al
      await supabase.from('rezervasyonlar')
        .update({on_rezervasyon: false, durum: 'Beklemede'})
        .eq('id', id);
    } else {
      // Ön rezervasyon yap
      await supabase.from('rezervasyonlar')
        .update({on_rezervasyon: true, durum: 'Ön Rezervasyon'})
        .eq('id', id);
    }
    fetchRezervasyonlar();
  };

  if (!girisYapildi) return (
    <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: CREAM }}>
      <div style={{ textAlign: 'center', padding: 48, background: '#fff', boxShadow: '0 4px 20px #0001' }}>
        <h2 style={{ fontFamily: "'Cinzel', serif", color: DARK, marginBottom: 24 }}>Admin Girişi</h2>
        <input 
          type={sifreGoster ? "text" : "password"}
           placeholder="Şifre" 
           value={sifre} 
          onChange={e => setSifre(e.target.value)}
          onKeyDown={e => { if(e.key === 'Enter') giris(); }}
          style={{ padding: '12px 20px', border: `1px solid ${GOLD}`, outline: 'none', marginBottom: 16, display: 'block', width: '100%', fontSize: 16 }}
         />
        <button onClick={() => setSifreGoster(!sifreGoster)}
         style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: GOLD, marginBottom: 16 }}>
          {sifreGoster ? 'Gizle' : 'Şifreyi Göster'}
          </button>
        <button onClick={giris}
          style={{ width: '100%', padding: 14, background: GOLD, border: 'none', color: '#fff', fontFamily: "'Cinzel', serif", fontSize: 13, letterSpacing: 3, cursor: 'pointer' }}>
          GİRİŞ
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: CREAM, padding: 48 }}>
      <h1 style={{ fontFamily: "'Cinzel', serif", color: GOLD, marginBottom: 32 }}>Rezervasyonlar</h1>
      <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
        <thead>
          <tr style={{ background: DARK, color: '#fff' }}>
            {['Ad Soyad', 'Telefon', 'Tarih', 'Paket', 'Not', 'Durum', 'İşlem'].map(h => (
              <th key={h} style={{ padding: '12px 16px', fontFamily: "'Cinzel', serif", fontSize: 11, letterSpacing: 2, textAlign: 'left' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rezervasyonlar.map((r, i) => (
            <tr key={r.id} style={{ borderBottom: `1px solid ${GOLD}33`, background: i % 2 === 0 ? '#fff' : '#fdf6e3' }}>
              <td style={{ padding: '12px 16px' }}>{r.ad_soyad}</td>
              <td style={{ padding: '12px 16px' }}>{r.telefon}</td>
              <td style={{ padding: '12px 16px' }}>{r.tarih}</td>
              <td style={{ padding: '12px 16px' }}>{r.paket}</td>
              <td style={{ padding: '12px 16px' }}>{r.not}</td>
              <td style={{ padding: '12px 16px' }}>
                <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 12,
                  background: r.durum === 'Onaylandı' ? '#d4edda' : r.durum === 'Reddedildi' ? '#f8d7da' : '#fff3cd',
                  color: r.durum === 'Onaylandı' ? '#155724' : r.durum === 'Reddedildi' ? '#721c24' : '#856404' }}>
                  {r.durum}
                </span>
                </td>
              <td style={{ padding: '12px 16px', display: 'flex', gap: 8 }}>
                <button onClick={() => durumGuncelle(r.id, 'Onaylandı')}
                  style={{ padding: '6px 12px', background: '#28a745', border: 'none', color: '#fff', cursor: 'pointer', borderRadius: 4, fontSize: 12 }}>Onayla</button>
                <button onClick={() => durumGuncelle(r.id, 'Reddedildi')}
                  style={{ padding: '6px 12px', background: '#dc3545', border: 'none', color: '#fff', cursor: 'pointer', borderRadius: 4, fontSize: 12 }}>Reddet</button>
                <button onClick={() => onRezervasyonYap(r.id, r.durum)}
                  style={{padding: '6px 12px', background: r.durum === 'Ön Rezervasyon' ? '#888' : '#C9A84C', border: 'none', color: DARK, cursor:'pointer', borderRadius:4, fontSize:12, fontWeight:'bold'}}>
                 {r.durum === 'Ön Rezervasyon' ? 'Geri Al' : 'Ön Rez'}  
                </button>
                {r.durum === 'Reddedildi' && (
                 <button onClick={() => sil(r.id)}
                style={{padding: '6px 12px', background: '#dc3545', border: 'none', color: '#fff', cursor: 'pointer', borderRadius: 4, fontSize: 12}}>
                Sil
                 </button>
              )}
              </td>
            </tr>
          ))}
         </tbody>
      </t
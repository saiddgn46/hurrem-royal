import Takvim from './Takvim';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Turnstile from 'react-turnstile';
import { supabase } from './supabase';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Admin from './Admin';

const GOLD = '#C9A84C';
const CREAM = '#fdf6e3';
const DARK = '#2c1f0e';
const LIGHT_GOLD = '#f5d98b';

const NAV_LINKS = ['Ana Sayfa', 'Salon', 'Paketler', 'Galeri', 'İletişim'];

const PACKAGES = [
  { name: 'Gümüş', capacity: '100–200 Kişi', price: '₺200.000', features: ['Temel dekorasyon', 'İkram servisi', 'Ses sistemi', 'Otopark'], featured: false },
  { name: 'Altın', capacity: '200–400 Kişi', price: '₺350.000', features: ['Premium dekorasyon', 'Gala yemeği', 'DJ & Ses', 'Otopark', 'Konaklama indirimi'], featured: true },
  { name: 'Platin', capacity: '400–600 Kişi', price: '₺500.000', features: ['Lüks dekorasyon', 'Şef yemeği', 'Orkestra', 'VIP Lounge', 'Fotoğrafçı', 'Limuzin'], featured: false },
];

const GALLERY = [
  'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&q=80',
  'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600&q=80',
  'https://images.unsplash.com/photo-1478146059778-26b4dc2b33a7?w=600&q=80',
  'https://images.unsplash.com/photo-1507504031003-b417219a0fde?w=600&q=80',
  'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&q=80',
  'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=600&q=80',
];

function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

const sectionId = (link) =>
  ({ Salon: 'salon', Paketler: 'paketler', Galeri: 'galeri', 'İletişim': 'iletisim' }[link]);

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar({ active, setActive }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNav = (link) => {
    setActive(link);
    setMenuOpen(false);
    if (link === 'Ana Sayfa') window.scrollTo({ top: 0, behavior: 'smooth' });
    else scrollToSection(sectionId(link));
  };

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled ? 'rgba(253,246,227,0.97)' : 'transparent',
      boxShadow: scrolled ? '0 2px 12px #0001' : 'none',
      transition: 'background 0.3s, box-shadow 0.3s',
      padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64,
    }}>
      <div onClick={() => handleNav('Ana Sayfa')}
        style={{ fontFamily: "'Cinzel', serif", fontSize: 20, color: scrolled ? DARK : '#fff', letterSpacing: 3, cursor: 'pointer', fontWeight: 600, transition: 'color 0.3s' }}>
        HÜRREM ROYAL
      </div>
      <div style={{ display: 'flex', gap: 32 }} className="nav-desktop">
        {NAV_LINKS.map(link => (
          <button key={link} onClick={() => handleNav(link)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Cinzel', serif", fontSize: 11, letterSpacing: 2, color: active === link ? GOLD : (scrolled ? DARK : 'rgba(255,255,255,0.88)'), borderBottom: active === link ? `1px solid ${GOLD}` : '1px solid transparent', paddingBottom: 2, transition: 'color 0.2s' }}>
            {link.toUpperCase()}
          </button>
        ))}
      </div>
      <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'none' }} className="nav-burger">
        <div style={{ width: 24, height: 2, background: DARK, margin: '5px 0' }} />
        <div style={{ width: 24, height: 2, background: DARK, margin: '5px 0' }} />
        <div style={{ width: 24, height: 2, background: DARK, margin: '5px 0' }} />
      </button>
      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            style={{ position: 'absolute', top: 64, left: 0, right: 0, background: CREAM, padding: '16px 32px', boxShadow: '0 4px 20px #0001' }}>
            {NAV_LINKS.map(link => (
              <div key={link} onClick={() => handleNav(link)}
                style={{ padding: '12px 0', fontFamily: "'Cinzel', serif", fontSize: 12, letterSpacing: 2, color: active === link ? GOLD : DARK, borderBottom: `1px solid ${GOLD}22`, cursor: 'pointer' }}>
                {link.toUpperCase()}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <style>{`@media (max-width: 640px) { .nav-desktop { display: none !important; } .nav-burger { display: block !important; } }`}</style>
    </nav>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero({ onRezervasyon, slogan, gorsel }) {
  return (
    <section style={{ position: 'relative', height: '100svh', minHeight: 580, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', background: DARK }}>
      <img src={gorsel || "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1400&q=80"} alt="salon"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center center', opacity: 0.6 }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.35) 50%, rgba(0,0,0,0.55) 100%)' }} />
      <style>{`
        @media (max-width: 480px) {
          .hero-btn { width: auto !important; padding: 14px 32px !important; }
          .hero-divider { margin: 16px auto !important; }
        }
      `}</style>
      <div style={{ position: 'relative', textAlign: 'center', color: '#fff', padding: '0 32px', maxWidth: 640, width: '100%' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: 'clamp(28px, 7vw, 72px)', fontWeight: 400, marginBottom: 8, lineHeight: 1.2 }}>
            HÜRREM ROYAL
          </h1>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(13px, 3vw, 20px)', color: LIGHT_GOLD, marginBottom: 0, letterSpacing: 1 }}>
            Kahramanmaraş · Est. 2024
          </p>
          <div className="hero-divider" style={{ width: 60, height: 1, background: GOLD, margin: '20px auto' }} />
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(16px, 3.5vw, 26px)', marginBottom: 32, fontStyle: 'italic', color: '#f0e8d5' }}>
            {slogan || 'En özel anınız, en güzel mekânda'}
          </p>
          <button className="hero-btn" onClick={onRezervasyon}
            style={{ background: GOLD, border: 'none', color: DARK, padding: '16px 40px', fontFamily: "'Cinzel', serif", fontSize: 12, letterSpacing: 3, cursor: 'pointer', transition: 'background 0.2s', display: 'inline-block' }}
            onMouseEnter={e => e.target.style.background = LIGHT_GOLD}
            onMouseLeave={e => e.target.style.background = GOLD}>
            REZERVASYON YAP
          </button>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Salon ────────────────────────────────────────────────────────────────────
function Salon({ metin, gorsel }) {
  return (
    <section id="salon" style={{ padding: '80px 20px', background: CREAM, display: 'flex', gap: 40, alignItems: 'center', flexWrap: 'wrap', maxWidth: 1100, margin: '0 auto' }}>
      <motion.div style={{ flex: '1 1 340px' }} initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
        <p style={{ fontFamily: "'Cinzel', serif", fontSize: 10, letterSpacing: 4, color: GOLD, marginBottom: 16 }}>HAKKIMIZDA</p>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 300, color: DARK, lineHeight: 1.2, marginBottom: 24 }}>
          Hayalinizdeki Düğün<br /><em>Bizimle Gerçek Olur</em>
        </h2>
        <div style={{ width: 60, height: 1, background: GOLD, marginBottom: 24 }} />
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, color: '#5a4030', lineHeight: 1.9, marginBottom: 32 }}>
          {metin || "Kahramanmaraş'ın kalbinde, 600 kişilik kapasitesiyle Hürrem Royal; zarif atmosferi, profesyonel ekibi ve kusursuz hizmet anlayışıyla düğününüzü unutulmaz kılar."}
        </p>
        <button onClick={() => scrollToSection('iletisim')}
          style={{ background: 'none', border: `1px solid ${GOLD}`, color: DARK, padding: '12px 32px', fontFamily: "'Cinzel', serif", fontSize: 11, letterSpacing: 3, cursor: 'pointer', transition: 'background 0.2s' }}
          onMouseEnter={e => { e.target.style.background = GOLD; e.target.style.color = '#fff'; }}
          onMouseLeave={e => { e.target.style.background = 'none'; e.target.style.color = DARK; }}>
          REZERVASYON YAP
        </button>
      </motion.div>
      <motion.div style={{ flex: '1 1 340px' }} initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
        <img src={gorsel || "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=700&q=80"} alt="salon"
          style={{ width: '100%', height: 480, objectFit: 'cover', boxShadow: `8px 8px 0 ${GOLD}44` }} />
      </motion.div>
    </section>
  );
}

// ─── Paketler ─────────────────────────────────────────────────────────────────
function Paketler({ onPaketSec }) {
  const [pkgList, setPkgList] = useState([]);

  useEffect(() => {
    supabase.from('paketler').select('*').order('sira').then(({ data }) => {
      setPkgList(data && data.length > 0 ? data : PACKAGES);
    });
  }, []);

  return (
    <section id="paketler" style={{ padding: '80px 20px', background: DARK, textAlign: 'center' }}>
      <p style={{ fontFamily: "'Cinzel', serif", fontSize: 10, letterSpacing: 4, color: GOLD, marginBottom: 16 }}>FİYATLANDIRMA</p>
      <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 300, color: '#fff', marginBottom: 16 }}>Paketlerimiz</h2>
      <div style={{ width: 60, height: 1, background: GOLD, margin: '0 auto 56px' }} />
      <div style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap', maxWidth: 1100, margin: '0 auto' }}>
        {pkgList.map((pkg) => (
          <motion.div key={pkg.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
            style={{ flex: '1 1 280px', maxWidth: 340, background: pkg.featured ? GOLD : 'rgba(255,255,255,0.05)', border: `1px solid ${pkg.featured ? GOLD : GOLD + '44'}`, padding: '40px 32px', textAlign: 'center', position: 'relative' }}>
            {pkg.featured && (
              <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: DARK, border: `1px solid ${GOLD}`, padding: '4px 20px', fontFamily: "'Cinzel', serif", fontSize: 9, letterSpacing: 3, color: GOLD }}>
                EN POPÜLER
              </div>
            )}
            <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 22, color: pkg.featured ? DARK : '#fff', marginBottom: 8 }}>{pkg.name}</h3>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 14, color: pkg.featured ? DARK + 'aa' : GOLD, marginBottom: 24, letterSpacing: 1 }}>{pkg.capacity}</p>
            <div style={{ fontFamily: "'Cinzel', serif", fontSize: 28, color: pkg.featured ? DARK : GOLD, marginBottom: 32 }}>{pkg.price}</div>
            <ul style={{ listStyle: 'none', padding: 0, marginBottom: 32, textAlign: 'left' }}>
              {pkg.features.map(f => (
                <li key={f} style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 16, color: pkg.featured ? DARK : '#d4c5a9', padding: '6px 0', borderBottom: `1px solid ${pkg.featured ? DARK + '22' : GOLD + '22'}` }}>
                  <span style={{ color: GOLD, marginRight: 8 }}>✓</span> {f}
                </li>
              ))}
            </ul>
            <button onClick={() => onPaketSec(pkg.name)}
              style={{ width: '100%', padding: '14px 0', background: pkg.featured ? DARK : 'none', border: `1px solid ${pkg.featured ? DARK : GOLD}`, color: pkg.featured ? '#fff' : GOLD, fontFamily: "'Cinzel', serif", fontSize: 11, letterSpacing: 3, cursor: 'pointer', transition: 'opacity 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
              SEÇ
            </button>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ─── Galeri ───────────────────────────────────────────────────────────────────
function Galeri() {
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    supabase.from('galeri').select('*').order('created_at', { ascending: true }).then(({ data }) => {
      setPhotos(data && data.length > 0 ? data.map(d => d.url) : GALLERY);
    });
  }, []);

  return (
    <section id="galeri" style={{ padding: '80px 20px', background: CREAM, textAlign: 'center' }}>
      <p style={{ fontFamily: "'Cinzel', serif", fontSize: 10, letterSpacing: 4, color: GOLD, marginBottom: 16 }}>FOTOĞRAFLAR</p>
      <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 300, color: DARK, marginBottom: 16 }}>Galeri</h2>
      <div style={{ width: 60, height: 1, background: GOLD, margin: '0 auto 56px' }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, maxWidth: 1100, margin: '0 auto' }}>
        {photos.map((url, i) => (
          <motion.div key={i} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.07 }} style={{ overflow: 'hidden', aspectRatio: '4/3' }}>
            <img src={url} alt={`galeri-${i + 1}`}
              style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }}
              onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
              onMouseLeave={e => e.target.style.transform = 'scale(1)'} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ─── Rezervasyon Formu ────────────────────────────────────────────────────────
function RezervasyonFormu({ seciliPaket }) {
  const [form, setForm] = useState({ name: '', phone: '', date: '', paket: seciliPaket || '', note: '' });
  const [pkgList, setPkgList] = useState([]);
  const [, setTurnstileToken] = useState('');
  const [gonderildi, setGonderildi] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.from('paketler').select('name, capacity, price').order('sira').then(({ data }) => {
      setPkgList(data && data.length > 0 ? data : PACKAGES);
    });
  }, []);

  useEffect(() => {
    if (seciliPaket) setForm(f => ({ ...f, paket: seciliPaket }));
  }, [seciliPaket]);

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const handleTarih = (tarih) => setForm(f => ({ ...f, date: tarih }));

  const handleSubmit = async () => {
    if (!form.name || !form.phone || !form.date) return;
    setLoading(true);
    const { error } = await supabase.from('rezervasyonlar').insert({
      ad_soyad: form.name, telefon: form.phone, tarih: form.date,
      paket: form.paket, not: form.note, durum: 'Beklemede',
    });
    setLoading(false);
    if (!error) setGonderildi(true);
  };

  const fs = {
    width: '100%', padding: '14px 16px', border: `1px solid ${GOLD}66`,
    background: '#fff', fontFamily: "'Cormorant Garamond', serif",
    fontSize: 16, color: DARK, outline: 'none', boxSizing: 'border-box',
  };

  if (gonderildi) return (
    <div style={{ textAlign: 'center', padding: '48px 0' }}>
      <div style={{ fontSize: 40, marginBottom: 16 }}>✨</div>
      <h3 style={{ fontFamily: "'Cinzel', serif", color: GOLD, letterSpacing: 2, marginBottom: 8 }}>Talebiniz Alındı!</h3>
      <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, color: '#5a4030' }}>En kısa sürede sizi arayacağız.</p>
    </div>
  );

  return (
    <div>
      <style>{`::placeholder { color: #b09070; opacity: 1; }`}</style>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <input name="name" placeholder="Ad Soyad" value={form.name} onChange={handleChange} style={fs} />
        <input name="phone" placeholder="Telefon" value={form.phone} onChange={handleChange} style={fs} />
        <div style={{ background: '#fff', padding: 16, border: `1px solid ${GOLD}66` }}>
          <Takvim onTarihSec={handleTarih} />
        </div>
        <select name="paket" value={form.paket} onChange={handleChange} style={fs}>
          <option value="">Davet Paketi Seçiniz</option>
          {pkgList.map(p => (
            <option key={p.name} value={p.name}>{p.name} — {p.capacity} — {p.price}</option>
          ))}
        </select>
        <textarea name="note" placeholder="Notunuz (opsiyonel)" value={form.note} onChange={handleChange} rows={3} style={{ ...fs, resize: 'vertical' }} />
        <Turnstile sitekey={process.env.REACT_APP_TURNSTILE_KEY || '1x00000000000000000000AA'} onVerify={token => setTurnstileToken(token)} />
        <button onClick={handleSubmit} disabled={loading || !form.name || !form.phone || !form.date}
          style={{ width: '100%', padding: '16px 0', background: GOLD, border: 'none', color: DARK, fontFamily: "'Cinzel', serif", fontSize: 12, letterSpacing: 3, cursor: loading ? 'wait' : 'pointer', opacity: (!form.name || !form.phone || !form.date) ? 0.6 : 1 }}>
          {loading ? '...' : 'GÖNDER'}
        </button>
      </div>
    </div>
  );
}

// ─── Ön Rezervasyon Bilgisi ───────────────────────────────────────────────────
function OnRezervasyonBilgi({ kapora, iban }) {
  return (
    <div style={{ background: DARK, padding: '40px 32px', color: '#fff' }}>
      <p style={{ fontFamily: "'Cinzel', serif", fontSize: 10, letterSpacing: 4, color: GOLD, marginBottom: 16 }}>ÖN REZERVASYON</p>
      <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 16, color: '#d4c5a9', lineHeight: 1.8, marginBottom: 24 }}>
        Seçilen tarihi ayırtmak için kapora yatırabilirsiniz.
      </p>
      {[['Kapora Tutarı:', kapora || '₺10.000'], ['IBAN:', iban || 'TR00 0000 0000 0000 0000 0000 00']].map(([label, val]) => (
        <div key={label} style={{ marginBottom: 12, fontFamily: "'Cormorant Garamond', serif", fontSize: 16 }}>
          <span style={{ color: GOLD, fontWeight: 600 }}>{label}</span>
          <span style={{ color: '#d4c5a9' }}> {val}</span>
        </div>
      ))}
      <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 13, color: '#a09080', marginTop: 16 }}>
        * Havale açıklamasına adınızı yazınız. Ödeme sonrası tarafınızla iletişime geçilecektir.
      </p>
    </div>
  );
}

// ─── İletişim ─────────────────────────────────────────────────────────────────
function Iletisim({ seciliPaket, ayarlar }) {
  return (
    <section id="iletisim" style={{ padding: '80px 20px', background: CREAM }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <p style={{ fontFamily: "'Cinzel', serif", fontSize: 10, letterSpacing: 4, color: GOLD, marginBottom: 16 }}>Online</p>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 300, color: DARK, marginBottom: 16 }}>Rezervasyon Yap</h2>
          <div style={{ width: 60, height: 1, background: GOLD, margin: '0 auto 16px' }} />
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, color: '#5a4030' }}>
            Formu doldurun, ekibimiz 24 saat içinde sizinle iletişime geçsin. Tarih müsaitlik durumuna göre onaylanır.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div style={{ flex: '1 1 360px' }}>
            <RezervasyonFormu seciliPaket={seciliPaket} />
          </div>
          <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: 24 }}>
            <OnRezervasyonBilgi kapora={ayarlar.kapora} iban={ayarlar.iban} />
            <div style={{ padding: '32px', background: '#fff', border: `1px solid ${GOLD}33` }}>
              <p style={{ fontFamily: "'Cinzel', serif", fontSize: 10, letterSpacing: 4, color: GOLD, marginBottom: 16 }}>İLETİŞİM</p>
              {[
                ['📍', ayarlar.adres || 'Kahramanmaraş, Türkiye'],
                ['📞', ayarlar.telefon || '0344 000 00 00'],
                ['✉️', ayarlar.email || 'info@hurremroyal.com'],
              ].map(([icon, text]) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                  <span>{icon}</span>
                  <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 16, color: DARK }}>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{ background: DARK, padding: '32px 20px', textAlign: 'center' }}>
      <p style={{ fontFamily: "'Cinzel', serif", fontSize: 16, color: GOLD, marginBottom: 8, letterSpacing: 2 }}>HÜRREM ROYAL</p>
      <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 14, color: '#a09080' }}>
        © 2024 Hürrem Royal · Kahramanmaraş · Tüm Hakları Saklıdır
      </p>
    </footer>
  );
}

// ─── WhatsApp Butonu ──────────────────────────────────────────────────────────
function WhatsAppButon({ numara }) {
  if (!numara) return null;
  const temiz = numara.replace(/\D/g, '');
  return (
    <a href={`https://wa.me/${temiz}`} target="_blank" rel="noopener noreferrer"
      style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 200, background: '#25D366', borderRadius: '50%', width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.25)', textDecoration: 'none', transition: 'transform 0.2s' }}
      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
      <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    </a>
  );
}

// ─── Ana Sayfa ────────────────────────────────────────────────────────────────
function AnaSayfa() {
  const [active, setActive] = useState('Ana Sayfa');
  const [seciliPaket, setSeciliPaket] = useState(null);
  const [ayarlar, setAyarlar] = useState({});

  useEffect(() => {
    supabase.from('site_ayarlari').select('*').then(({ data }) => {
      if (data) {
        const map = {};
        data.forEach(r => { map[r.anahtar] = r.deger; });
        setAyarlar(map);
      }
    });
  }, []);

  useEffect(() => {
    const sections = [
      { id: 'salon', link: 'Salon' },
      { id: 'paketler', link: 'Paketler' },
      { id: 'galeri', link: 'Galeri' },
      { id: 'iletisim', link: 'İletişim' },
    ];
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const s = sections.find(s => s.id === entry.target.id);
          if (s) setActive(s.link);
        }
      });
    }, { threshold: 0.4 });
    sections.forEach(s => { const el = document.getElementById(s.id); if (el) observer.observe(el); });
    const onScroll = () => { if (window.scrollY < 300) setActive('Ana Sayfa'); };
    window.addEventListener('scroll', onScroll);
    return () => { observer.disconnect(); window.removeEventListener('scroll', onScroll); };
  }, []);

  const handlePaketSec = (paket) => {
    setSeciliPaket(paket);
    scrollToSection('iletisim');
  };

  return (
    <div style={{ fontFamily: "'Cormorant Garamond', serif", background: CREAM }}>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Cinzel:wght@400;600&display=swap" rel="stylesheet" />
      <Navbar active={active} setActive={setActive} />
      <Hero onRezervasyon={() => scrollToSection('iletisim')} slogan={ayarlar.hero_slogan} gorsel={ayarlar.hero_gorsel} />
      <Salon metin={ayarlar.salon_metin} gorsel={ayarlar.salon_gorsel} />
      <Paketler onPaketSec={handlePaketSec} />
      <Galeri />
      <Iletisim seciliPaket={seciliPaket} ayarlar={ayarlar} />
      <Footer />
      <WhatsAppButon numara={ayarlar.whatsapp || ayarlar.telefon} />
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AnaSayfa />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}

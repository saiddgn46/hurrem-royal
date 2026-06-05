import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { supabase } from './supabase';

const GOLD = "#C9A84C";
const DARK = "#2c1f0e";

export default function Takvim({ onTarihSec, cokluSecim = false, secilenTarihler = [] }) {
  const [rezervasyonlar, setRezervasyonlar] = useState([]);
  const [seciliTarih, setSeciliTarih] = useState(null);

  useEffect(() => {
    fetchRezervasyonlar();
  }, []);

  const fetchRezervasyonlar = async () => {
    const { data } = await supabase
      .from('rezervasyonlar')
      .select('tarih, durum, on_rezervasyon');
      console.log('Takvim data:', data);
    if (data) setRezervasyonlar(data);
  };

  const tarihDurumu = (date) => {
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60 * 1000);
    const tarihStr = localDate.toISOString().split('T')[0];
    const rez = rezervasyonlar.find(r => r.tarih === tarihStr);
    if (!rez) return 'bos';
    if (rez.durum === 'Onaylandı') return 'dolu';
    if (rez.on_rezervasyon === true) return 'on_rezervasyon';
    return 'bos';
  };

  const toLocalDateStr = (date) => {
    const offset = date.getTimezoneOffset();
    return new Date(date.getTime() - offset * 60 * 1000).toISOString().split('T')[0];
  };

  const handleTarih = (date) => {
    if (tarihDurumu(date) === 'dolu') return;
    const dateStr = toLocalDateStr(date);
    if (!cokluSecim) setSeciliTarih(date);
    if (onTarihSec) onTarihSec(dateStr);
  };

  return (
    <div style={{ textAlign: 'center', padding: '20px 0', width: '100%', boxSizing: 'border-box' }}>
      <style>{`
        .react-calendar {
          border: 1px solid ${GOLD}44;
          font-family: 'Cormorant Garamond', serif;
          width: 100% !important;
          max-width: 100% !important;
          background: #fff;
          border-radius: 4px;
          padding: 8px;
          box-sizing: border-box;
        }
        .react-calendar__navigation {
          margin-bottom: 4px;
        }
        .react-calendar__navigation button {
          color: ${DARK};
          font-family: 'Cinzel', serif;
          font-size: 11px;
          letter-spacing: 1px;
          min-width: 28px;
          padding: 4px;
        }
        .react-calendar__month-view__weekdays {
          font-family: 'Cinzel', serif;
          font-size: 9px;
          color: ${GOLD};
          letter-spacing: 1px;
        }
        .react-calendar__month-view__weekdays abbr {
          text-decoration: none;
        }
        .react-calendar__tile {
          font-family: 'Cormorant Garamond', serif;
          font-size: 13px;
          padding: 6px 2px;
          border-radius: 2px;
          border: none !important;
          line-height: 1.2;
        }
        .react-calendar__tile--active{
        background: #5c3d1 !important;
        color: #C9A84C !important;
        border-radius: 2px !important;
        }
        .react-calendar__tile--active:enabled:hover{
        background: #5c3d1 !important;
        color: #C9A84C !important;
        }
        .react-calendar__tile--active:enabled:focus {
          background: #5c3d1 !important;
          color: #C9A84C !important;
        }
        .react-calendar__tile:enabled:hover {
          background: ${GOLD}22;
        }
        .dolu {
          background: #ffcccc !important;
          color: #333 !important;
          cursor: not-allowed !important;
        }
        .on-rezervasyon {
          background: #e6c97a !important;
          color: ${DARK} !important;
        }
        .bos {
          background: #ccffcc !important;
        }
        .secili {
          background: ${GOLD} !important;
          color: ${DARK} !important;
          font-weight: bold !important;
        }

        /* Mobil için ek küçültme */
        @media (max-width: 400px) {
          .react-calendar__tile {
            font-size: 11px;
            padding: 5px 1px;
          }
          .react-calendar__navigation button {
            font-size: 10px;
            min-width: 24px;
          }
          .react-calendar__month-view__weekdays {
            font-size: 8px;
          }
        }
      `}</style>

      <Calendar
        onChange={handleTarih}
        value={seciliTarih}
        tileClassName={({ date, view }) => {
          if (view !== 'month') return null;
          const durum = tarihDurumu(date);
          if (durum === 'dolu') return 'dolu';
          if (durum === 'on_rezervasyon') return 'on-rezervasyon';
          const tarihStr = toLocalDateStr(date);
          if (secilenTarihler.includes(tarihStr)) return 'secili';
          const bugun = new Date(); bugun.setHours(0, 0, 0, 0);
          if (date >= bugun) return 'bos';
          return null;
        }}

        tileDisabled={({ date, view }) => {
          const bugun = new Date(); bugun.setHours(0, 0, 0, 0);
          if (view === 'month') return tarihDurumu(date) === 'dolu' || date < bugun;
          const buAyin1i = new Date(bugun.getFullYear(), bugun.getMonth(), 1);
          return date < buAyin1i;
        }}
        locale="tr-TR"
      />

      {/* Legend - mobilde wrap yapar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px 20px',
        justifyContent: 'center',
        marginTop: 14,
        padding: '0 8px',
      }}>
        {[['#ccffcc', 'Müsait'], ['#fff3cc', 'Ön Rezervasyon'], ['#ffcccc', 'Dolu']].map(([color, label]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{
              width: 14,
              height: 14,
              background: color,
              border: '1px solid #ccc',
              borderRadius: 2,
              flexShrink: 0,
            }} />
            <span style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 13,
              color: DARK,
            }}>
              {label}
            </span>
          </div>
        ))}
      </div>

      {seciliTarih && !cokluSecim && (
        <p style={{
          marginTop: 14,
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 15,
          color: DARK,
          padding: '0 8px',
        }}>
          Seçilen tarih:{' '}
          <strong>{seciliTarih.toLocaleDateString('tr-TR')}</strong>
        </p>
      )}
    </div>
  );
}
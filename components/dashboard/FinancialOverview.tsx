'use client';

import { useEffect, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { getDashboardStats, subscribeToDatabaseChanges } from '@/lib/supabase/services';
import styles from './FinancialOverview.module.css';

interface TooltipPayloadItem {
  color: string;
  name: string;
  value: number;
  dataKey: string;
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: TooltipPayloadItem[]; label?: string }) {
  if (!active || !payload?.length) return null;

  const currentYear = new Date().getFullYear();
  const monthMap: Record<string, string> = {
    Jan: 'Jan', Feb: 'Feb', Mar: 'Mar', Apr: 'Apr',
    May: 'Mei', Jun: 'Jun', Jul: 'Jul', Aug: 'Agu',
    Sep: 'Sep', Oct: 'Okt', Nov: 'Nov', Dec: 'Des',
  };

  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipMonth}>{monthMap[label || ''] || label} {currentYear}</p>
      {payload.map((entry: TooltipPayloadItem, i: number) => (
        <div key={i} className={styles.tooltipRow}>
          <span
            className={styles.tooltipDot}
            style={{ background: entry.dataKey === 'masuk' ? '#0EA3D6' : '#FFE601' }}
          />
          <span className={styles.tooltipLabel}>
            {entry.dataKey === 'masuk' ? 'Duit Masuk' : 'Duit Keluar'}
          </span>
          <span className={styles.tooltipValue}>
            Rp {Number(entry.value || 0).toLocaleString('id-ID')}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function FinancialOverview() {
  const [chartData, setChartData] = useState<{ month: string; masuk: number; keluar: number }[]>([
    { month: 'Jan', masuk: 0, keluar: 0 },
    { month: 'Feb', masuk: 0, keluar: 0 },
    { month: 'Mar', masuk: 0, keluar: 0 },
    { month: 'Apr', masuk: 0, keluar: 0 },
    { month: 'May', masuk: 0, keluar: 0 },
    { month: 'Jun', masuk: 0, keluar: 0 },
    { month: 'Jul', masuk: 0, keluar: 0 },
    { month: 'Aug', masuk: 0, keluar: 0 },
    { month: 'Sep', masuk: 0, keluar: 0 },
    { month: 'Oct', masuk: 0, keluar: 0 },
    { month: 'Nov', masuk: 0, keluar: 0 },
    { month: 'Dec', masuk: 0, keluar: 0 },
  ]);

  useEffect(() => {
    let isMounted = true;

    const run = async () => {
      try {
        const stats = await getDashboardStats();
        if (isMounted && stats.chartData && stats.chartData.length > 0) {
          setChartData(stats.chartData);
        }
      } catch (e) {
        console.error('Error loading chart stats:', e);
      }
    };

    run();

    const unsubscribe = subscribeToDatabaseChanges(() => {
      run();
    });

    const handleFocus = () => {
      run();
    };
    window.addEventListener('focus', handleFocus);
    window.addEventListener('visibilitychange', handleFocus);

    return () => {
      isMounted = false;
      unsubscribe();
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('visibilitychange', handleFocus);
    };
  }, []);

  // Compute maximum domain value dynamically based on actual data
  const maxVal = Math.max(
    ...chartData.map((d) => Math.max(d.masuk, d.keluar)),
    100
  );
  const domainMax = Math.ceil(maxVal * 1.15);

  return (
    <div className={styles.card}>
      {/* Header */}
      <div className={styles.headerRow}>
        <div>
          <h2 className={styles.title}>Financial Overview</h2>
          <p className={styles.subtitle}>Pantau pemasukan dan pengeluaran berdasarkan data aman.</p>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.legend}>
            <span className={styles.legendItem}>
              <span className={styles.legendDot} style={{ background: '#0EA3D6' }} />
              Duit Masuk
            </span>
            <span className={styles.legendItem}>
              <span className={styles.legendDot} style={{ background: '#FFE601' }} />
              Duit Keluar
            </span>
          </div>
          <div className={styles.selectWrap}>
            <select className={styles.select} defaultValue="monthly">
              <option value="monthly">Monthly</option>
              <option value="weekly">Weekly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className={styles.chartWrap}>
        <ResponsiveContainer width="100%" height={210}>
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id="gradientMasuk" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0EA3D6" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#0EA3D6" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="gradientKeluar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFE601" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#FFE601" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#eef2f6" vertical={false} />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#64748b' }}
              dy={4}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#64748b' }}
              tickFormatter={(v: number) => {
                if (v === 0) return '0';
                if (v >= 1000000) return `${Math.round(v / 1000000)}M`;
                if (v >= 1000) return `${Math.round(v / 1000)}k`;
                return `${Math.round(v)}`;
              }}
              domain={[0, domainMax]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="masuk"
              stroke="#0EA3D6"
              strokeWidth={2.6}
              fillOpacity={1}
              fill="url(#gradientMasuk)"
              dot={false}
              activeDot={{ r: 5, fill: '#0EA3D6', stroke: '#fff', strokeWidth: 2 }}
            />
            <Area
              type="monotone"
              dataKey="keluar"
              stroke="#FFE601"
              strokeWidth={2.6}
              fillOpacity={1}
              fill="url(#gradientKeluar)"
              dot={false}
              activeDot={{ r: 5, fill: '#FFE601', stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

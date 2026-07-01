import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { motion } from 'framer-motion';
import styles from './RealDataChartPanel.module.scss';

export type ChartDatum = {
  name: string;
  value: number;
};

type RealDataChartPanelProps = {
  title: string;
  subtitle: string;
  data: ChartDatum[];
  variant?: 'bar' | 'line' | 'pie';
  valueLabel?: string;
  emptyMessage?: string;
};

const CHART_COLORS = ['#5bc8ff', '#40dc99', '#ffbc60', '#ff7f93', '#b99cff', '#6ee7f9'];

type TooltipPayload = {
  payload?: ChartDatum;
  value?: number | string;
};

type TooltipProps = {
  active?: boolean;
  label?: string | number;
  payload?: TooltipPayload[];
};

function ChartTooltip({ active, label, payload }: TooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const item = payload[0];
  const name = item.payload?.name ?? label;
  const value = item.value ?? item.payload?.value ?? 0;

  return (
    <div className={styles.tooltip}>
      <strong>{name}</strong>
      <span>{value}</span>
    </div>
  );
}

function hasChartData(data: ChartDatum[], variant: RealDataChartPanelProps['variant']): boolean {
  if (variant === 'line') {
    return data.some((item) => Number.isFinite(item.value));
  }

  return data.some((item) => Number.isFinite(item.value) && item.value > 0);
}

export function RealDataChartPanel({
  title,
  subtitle,
  data,
  variant = 'bar',
  valueLabel = 'Total',
  emptyMessage = 'Sem dados suficientes para montar o grafico.',
}: RealDataChartPanelProps) {
  const chartData = data.filter((item) => item.name && Number.isFinite(item.value));

  return (
    <motion.article
      className={styles.panel}
      initial={{ opacity: 0, y: 16, scale: 0.985 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.28 }}
      whileHover={{
        y: -4,
        boxShadow: '0 24px 58px rgba(0, 0, 0, 0.3), 0 0 34px rgba(91, 200, 255, 0.11)',
      }}
      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
    >
      <header className={styles.header}>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </header>

      {hasChartData(chartData, variant) ? (
        <motion.div
          className={styles.chart}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, delay: 0.08 }}
        >
          <ResponsiveContainer width="100%" height={190}>
            {variant === 'line' ? (
              <LineChart data={chartData} margin={{ top: 8, right: 10, bottom: 0, left: -18 }}>
                <CartesianGrid stroke="rgba(122, 185, 244, 0.13)" strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke="#9cb4cf" tickLine={false} fontSize={11} />
                <YAxis stroke="#9cb4cf" tickLine={false} axisLine={false} fontSize={11} />
                <Tooltip content={<ChartTooltip />} />
                <Line
                  type="monotone"
                  dataKey="value"
                  name={valueLabel}
                  stroke="#5bc8ff"
                  strokeWidth={3}
                  dot={{ r: 3, fill: '#5bc8ff' }}
                />
              </LineChart>
            ) : variant === 'pie' ? (
              <PieChart>
                <Tooltip content={<ChartTooltip />} />
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={44}
                  outerRadius={78}
                  paddingAngle={2}
                >
                  {chartData.map((item, index) => (
                    <Cell key={item.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            ) : (
              <BarChart data={chartData} margin={{ top: 8, right: 10, bottom: 0, left: -18 }}>
                <CartesianGrid stroke="rgba(122, 185, 244, 0.13)" strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke="#9cb4cf" tickLine={false} fontSize={11} />
                <YAxis stroke="#9cb4cf" tickLine={false} axisLine={false} fontSize={11} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="value" name={valueLabel} radius={[5, 5, 0, 0]}>
                  {chartData.map((item, index) => (
                    <Cell key={item.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
        </motion.div>
      ) : (
        <motion.div
          className={styles.empty}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {emptyMessage}
        </motion.div>
      )}
    </motion.article>
  );
}

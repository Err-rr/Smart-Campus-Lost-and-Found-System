'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipProps,
} from 'recharts';

const INK = '#18181B';
const ACCENT = '#F5C83B';
const GRID = '#ECEAE5';
const AXIS_TEXT = '#5F5F66';
const FONT = 'var(--font-inter), system-ui, sans-serif';

export interface ChartDatum {
  label: string;
  value: number;
}

function ChartTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-[10px] border border-line bg-white px-3 py-2 text-[13px] shadow-[0_4px_12px_rgba(0,0,0,0.06)]">
      <p className="text-ink-2">{label}</p>
      <p className="font-mono font-medium text-ink">{payload[0].value} reports</p>
    </div>
  );
}

/** Screen-reader table so the data is never in the chart alone. */
function DataTable({ caption, data }: { caption: string; data: ChartDatum[] }) {
  return (
    <table className="sr-only">
      <caption>{caption}</caption>
      <thead>
        <tr>
          <th scope="col">Label</th>
          <th scope="col">Reports</th>
        </tr>
      </thead>
      <tbody>
        {data.map((d) => (
          <tr key={d.label}>
            <td>{d.label}</td>
            <td>{d.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** Horizontal bars, sorted, with the top category in yellow. */
export function CategoryChart({ data }: { data: ChartDatum[] }) {
  const sorted = [...data].sort((a, b) => b.value - a.value);
  const top = sorted[0]?.label;
  return (
    <div>
      <div className="h-[300px]" aria-hidden>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={sorted} layout="vertical" margin={{ top: 4, right: 32, bottom: 4, left: 4 }} barCategoryGap={6}>
            <CartesianGrid horizontal={false} stroke={GRID} />
            <XAxis
              type="number"
              allowDecimals={false}
              tick={{ fill: AXIS_TEXT, fontSize: 12, fontFamily: FONT }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="label"
              width={104}
              tick={{ fill: AXIS_TEXT, fontSize: 13, fontFamily: FONT }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: '#F4F3EF' }} />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={22} isAnimationActive={false}>
              {sorted.map((d) => (
                <Cell key={d.label} fill={d.label === top ? ACCENT : INK} />
              ))}
              <LabelList
                dataKey="value"
                position="right"
                content={(props) => {
                  const { x, y, width, height, value, index } = props as {
                    x: number;
                    y: number;
                    width: number;
                    height: number;
                    value: number;
                    index: number;
                  };
                  // Label only the highlighted bar; the rest are read from the axis or tooltip.
                  if (index !== 0) return null;
                  return (
                    <text x={x + width + 6} y={y + height / 2} dy={4} fill="#111111" fontSize={12} fontFamily={FONT}>
                      {value}
                    </text>
                  );
                }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <DataTable caption="Reports per category" data={sorted} />
    </div>
  );
}

/** Vertical bars, one per week, oldest to newest. */
export function WeeklyChart({ data }: { data: ChartDatum[] }) {
  return (
    <div>
      <div className="h-[300px]" aria-hidden>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, bottom: 4, left: -16 }} barCategoryGap="28%">
            <CartesianGrid vertical={false} stroke={GRID} />
            <XAxis
              dataKey="label"
              tick={{ fill: AXIS_TEXT, fontSize: 12, fontFamily: FONT }}
              axisLine={{ stroke: GRID }}
              tickLine={false}
              interval={0}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fill: AXIS_TEXT, fontSize: 12, fontFamily: FONT }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: '#F4F3EF' }} />
            <Bar dataKey="value" fill={INK} radius={[4, 4, 0, 0]} maxBarSize={36} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <DataTable caption="Reports per week" data={data} />
    </div>
  );
}

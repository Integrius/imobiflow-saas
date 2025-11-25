'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

interface LeadsPieChartProps {
  data: Record<string, number>
}

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899']

const ORIGEM_LABELS: Record<string, string> = {
  SITE: 'Site',
  PORTAL: 'Portais',
  WHATSAPP: 'WhatsApp',
  TELEFONE: 'Telefone',
  INDICACAO: 'Indicação',
  REDES_SOCIAIS: 'Redes Sociais',
  EVENTO: 'Eventos',
  OUTRO: 'Outros',
}

export function LeadsPieChart({ data }: LeadsPieChartProps) {
  const chartData = Object.entries(data).map(([key, value]) => ({
    name: ORIGEM_LABELS[key] || key,
    value,
  }))

  const total = chartData.reduce((sum, item) => sum + item.value, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leads por Origem</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>

        <div className="mt-4 grid grid-cols-2 gap-2">
          {chartData.map((item, index) => (
            <div key={item.name} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-sm">
                {item.name}: <span className="font-medium">{item.value}</span>
              </span>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t text-center">
          <p className="text-sm text-gray-600">Total de Leads</p>
          <p className="text-2xl font-bold">{total}</p>
        </div>
      </CardContent>
    </Card>
  )
}

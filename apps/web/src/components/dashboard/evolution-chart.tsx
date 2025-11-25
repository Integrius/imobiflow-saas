'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface EvolutionChartProps {
  data: Array<{
    mes: string
    leads: number
    negociacoes: number
    fechamentos: number
  }>
}

export function EvolutionChart({ data }: EvolutionChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Evolução Mensal</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="leads"
              stroke="#3b82f6"
              strokeWidth={2}
              name="Leads"
              dot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="negociacoes"
              stroke="#8b5cf6"
              strokeWidth={2}
              name="Negociações"
              dot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="fechamentos"
              stroke="#10b981"
              strokeWidth={2}
              name="Fechamentos"
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

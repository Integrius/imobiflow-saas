'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface FunnelChartProps {
  data: {
    leads: number
    visitasAgendadas: number
    visitasRealizadas: number
    propostas: number
    fechados: number
  }
}

const COLORS = ['#3b82f6', '#06b6d4', '#8b5cf6', '#f59e0b', '#10b981']

export function FunnelChart({ data }: FunnelChartProps) {
  const chartData = [
    { name: 'Leads', value: data.leads },
    { name: 'Visitas Agendadas', value: data.visitasAgendadas },
    { name: 'Visitas Realizadas', value: data.visitasRealizadas },
    { name: 'Propostas', value: data.propostas },
    { name: 'Fechados', value: data.fechados },
  ]

  const calculateConversion = (from: number, to: number) => {
    if (from === 0) return '0%'
    return `${((to / from) * 100).toFixed(1)}%`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Funil de Conversão</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" width={150} />
            <Tooltip />
            <Bar dataKey="value" radius={[0, 8, 8, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">Lead → Visita</p>
            <p className="text-lg font-bold text-blue-600">
              {calculateConversion(data.leads, data.visitasAgendadas)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Visita → Proposta</p>
            <p className="text-lg font-bold text-purple-600">
              {calculateConversion(data.visitasRealizadas, data.propostas)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Proposta → Fechamento</p>
            <p className="text-lg font-bold text-green-600">
              {calculateConversion(data.propostas, data.fechados)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Conversão Total</p>
            <p className="text-lg font-bold text-orange-600">
              {calculateConversion(data.leads, data.fechados)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

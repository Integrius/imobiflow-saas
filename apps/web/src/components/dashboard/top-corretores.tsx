'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Trophy } from 'lucide-react'

interface TopCorretoresProps {
  corretores: Array<{
    id: string
    nome: string
    totalNegociacoes: number
    totalFechados: number
    valorTotal: number
  }>
}

const COLORS = ['#f59e0b', '#6b7280', '#a78bfa', '#3b82f6', '#10b981']

export function TopCorretores({ corretores }: TopCorretoresProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(value)
  }

  const chartData = corretores.map((c) => ({
    nome: c.nome.split(' ')[0], // Apenas primeiro nome para o gráfico
    valor: c.valorTotal,
    fullName: c.nome,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Top Corretores
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="nome" />
            <YAxis />
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              labelFormatter={(label) => {
                const item = chartData.find((d) => d.nome === label)
                return item?.fullName || label
              }}
            />
            <Bar dataKey="valor" radius={[8, 8, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        <div className="mt-4 space-y-3">
          {corretores.slice(0, 5).map((corretor, index) => (
            <div key={corretor.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                    index === 0
                      ? 'bg-yellow-500'
                      : index === 1
                      ? 'bg-gray-400'
                      : index === 2
                      ? 'bg-amber-600'
                      : 'bg-blue-500'
                  }`}
                >
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium">{corretor.nome}</p>
                  <p className="text-sm text-gray-600">
                    {corretor.totalFechados} de {corretor.totalNegociacoes} negociações
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-green-600">{formatCurrency(corretor.valorTotal)}</p>
                <p className="text-xs text-gray-600">
                  {corretor.totalNegociacoes > 0
                    ? `${((corretor.totalFechados / corretor.totalNegociacoes) * 100).toFixed(0)}% conversão`
                    : '0% conversão'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

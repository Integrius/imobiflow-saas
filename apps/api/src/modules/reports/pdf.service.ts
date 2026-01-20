import PDFDocument from 'pdfkit'
import { prisma } from '../../shared/database/prisma'

// Cores do tema ImobiFlow
const COLORS = {
  primary: '#064E3B',      // Verde escuro
  secondary: '#8FD14F',    // Verde claro
  accent: '#A97E6F',       // Marrom
  text: '#2C2C2C',
  textLight: '#6B7280',
  border: '#E5E7EB',
  background: '#F4F6F8',
  white: '#FFFFFF',
  red: '#EF4444',
  yellow: '#F59E0B',
  green: '#10B981'
}

interface ReportFilters {
  tenantId: string
  startDate?: Date
  endDate?: Date
  corretorId?: string
}

class PDFReportService {
  /**
   * Gera relatório de leads em PDF
   */
  async generateLeadsReport(filters: ReportFilters): Promise<Buffer> {
    const { tenantId, startDate, endDate, corretorId } = filters

    // Buscar dados
    const whereClause: any = { tenant_id: tenantId }
    if (startDate) whereClause.created_at = { gte: startDate }
    if (endDate) whereClause.created_at = { ...whereClause.created_at, lte: endDate }
    if (corretorId) whereClause.corretor_id = corretorId

    const leads = await prisma.lead.findMany({
      where: whereClause,
      include: {
        corretor: {
          include: { user: { select: { nome: true } } }
        }
      },
      orderBy: { created_at: 'desc' }
    })

    // Estatísticas
    const stats = {
      total: leads.length,
      quentes: leads.filter(l => l.temperatura === 'QUENTE').length,
      mornos: leads.filter(l => l.temperatura === 'MORNO').length,
      frios: leads.filter(l => l.temperatura === 'FRIO').length,
      comEmail: leads.filter(l => l.email).length,
      semCorretor: leads.filter(l => !l.corretor_id).length
    }

    // Criar PDF
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = []
      const doc = new PDFDocument({ size: 'A4', margin: 50 })

      doc.on('data', (chunk: Buffer) => chunks.push(chunk))
      doc.on('end', () => resolve(Buffer.concat(chunks)))
      doc.on('error', reject)

      // Header
      this.addHeader(doc, 'Relatório de Leads')
      this.addReportInfo(doc, filters)

      // Estatísticas em cards
      doc.moveDown(2)
      this.addStatsCards(doc, [
        { label: 'Total de Leads', value: stats.total.toString(), color: COLORS.primary },
        { label: 'Leads Quentes', value: stats.quentes.toString(), color: COLORS.red },
        { label: 'Leads Mornos', value: stats.mornos.toString(), color: COLORS.yellow },
        { label: 'Leads Frios', value: stats.frios.toString(), color: COLORS.green }
      ])

      // Tabela de leads
      doc.moveDown(2)
      doc.fontSize(14).fillColor(COLORS.text).text('Lista de Leads', { underline: true })
      doc.moveDown()

      // Cabeçalho da tabela
      const tableTop = doc.y
      const colWidths = [150, 100, 80, 80, 85]
      const headers = ['Nome', 'Telefone', 'Temperatura', 'Score', 'Corretor']

      this.addTableHeader(doc, headers, colWidths, tableTop)

      // Linhas da tabela
      let y = tableTop + 25
      const pageHeight = doc.page.height - 100

      for (const lead of leads.slice(0, 30)) { // Limitar a 30 leads por página
        if (y > pageHeight) {
          doc.addPage()
          y = 50
          this.addTableHeader(doc, headers, colWidths, y)
          y += 25
        }

        const row = [
          lead.nome.substring(0, 20),
          lead.telefone || '-',
          lead.temperatura || '-',
          lead.score?.toString() || '-',
          lead.corretor?.user?.nome?.substring(0, 12) || 'Não atribuído'
        ]

        this.addTableRow(doc, row, colWidths, y)
        y += 20
      }

      if (leads.length > 30) {
        doc.moveDown(2)
        doc.fontSize(10).fillColor(COLORS.textLight)
          .text(`... e mais ${leads.length - 30} leads não exibidos neste relatório.`)
      }

      // Footer
      this.addFooter(doc)

      doc.end()
    })
  }

  /**
   * Gera relatório de desempenho do corretor
   */
  async generateCorretorReport(tenantId: string, corretorId: string, mes: number, ano: number): Promise<Buffer> {
    // Buscar corretor
    const corretor = await prisma.corretor.findUnique({
      where: { id: corretorId },
      include: { user: { select: { nome: true, email: true } } }
    })

    if (!corretor) throw new Error('Corretor não encontrado')

    // Período do mês
    const startDate = new Date(ano, mes - 1, 1)
    const endDate = new Date(ano, mes, 0, 23, 59, 59)

    // Buscar dados de desempenho
    const [leads, negociacoes, agendamentos, meta] = await Promise.all([
      prisma.lead.findMany({
        where: {
          tenant_id: tenantId,
          corretor_id: corretorId,
          created_at: { gte: startDate, lte: endDate }
        }
      }),
      prisma.negociacao.findMany({
        where: {
          tenant_id: tenantId,
          corretor_id: corretorId,
          created_at: { gte: startDate, lte: endDate }
        }
      }),
      prisma.agendamento.findMany({
        where: {
          tenant_id: tenantId,
          corretor_id: corretorId,
          data_visita: { gte: startDate, lte: endDate }
        }
      }),
      prisma.meta.findUnique({
        where: {
          tenant_id_corretor_id_mes_ano: {
            tenant_id: tenantId,
            corretor_id: corretorId,
            mes,
            ano
          }
        }
      })
    ])

    // Calcular métricas
    const metrics = {
      totalLeads: leads.length,
      leadsQuentes: leads.filter(l => l.temperatura === 'QUENTE').length,
      leadsMornos: leads.filter(l => l.temperatura === 'MORNO').length,
      leadsFrios: leads.filter(l => l.temperatura === 'FRIO').length,
      totalNegociacoes: negociacoes.length,
      negociacoesFechadas: negociacoes.filter(n => n.status === 'FECHADO').length,
      valorFechado: negociacoes
        .filter(n => n.status === 'FECHADO')
        .reduce((sum, n) => sum + (Number(n.valor_final) || Number(n.valor_proposta) || 0), 0),
      totalAgendamentos: agendamentos.length,
      agendamentosRealizados: agendamentos.filter(a => a.status === 'REALIZADO').length,
      taxaConversao: leads.length > 0
        ? ((negociacoes.filter(n => n.status === 'FECHADO').length / leads.length) * 100).toFixed(1)
        : '0'
    }

    // Criar PDF
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = []
      const doc = new PDFDocument({ size: 'A4', margin: 50 })

      doc.on('data', (chunk: Buffer) => chunks.push(chunk))
      doc.on('end', () => resolve(Buffer.concat(chunks)))
      doc.on('error', reject)

      // Header
      this.addHeader(doc, 'Relatório de Desempenho')

      // Info do corretor
      doc.moveDown()
      doc.fontSize(12).fillColor(COLORS.text)
        .text(`Corretor: ${corretor.user.nome}`, { continued: true })
      doc.fillColor(COLORS.textLight).text(`  •  ${corretor.creci || 'CRECI não informado'}`)
      doc.fillColor(COLORS.textLight).fontSize(10)
        .text(`Período: ${this.getMonthName(mes)}/${ano}`)

      // Cards de resumo
      doc.moveDown(2)
      this.addStatsCards(doc, [
        { label: 'Leads Captados', value: metrics.totalLeads.toString(), color: COLORS.primary },
        { label: 'Fechamentos', value: metrics.negociacoesFechadas.toString(), color: COLORS.green },
        { label: 'Visitas', value: metrics.agendamentosRealizados.toString(), color: COLORS.secondary },
        { label: 'Conversão', value: `${metrics.taxaConversao}%`, color: COLORS.accent }
      ])

      // Valor fechado destacado
      doc.moveDown(2)
      doc.rect(50, doc.y, 495, 50).fill(COLORS.primary)
      doc.fillColor(COLORS.white).fontSize(12)
        .text('Valor Total Fechado no Período', 70, doc.y - 40, { width: 455 })
      doc.fontSize(24).text(this.formatCurrency(metrics.valorFechado), 70, doc.y - 20, { width: 455, align: 'center' })

      // Detalhamento
      doc.moveDown(3)
      doc.fillColor(COLORS.text).fontSize(14).text('Detalhamento', { underline: true })
      doc.moveDown()

      // Leads por temperatura
      doc.fontSize(11).fillColor(COLORS.text).text('Leads por Temperatura:')
      doc.fontSize(10).fillColor(COLORS.textLight)
        .text(`  🔥 Quentes: ${metrics.leadsQuentes}`)
        .text(`  ⚡ Mornos: ${metrics.leadsMornos}`)
        .text(`  ❄️ Frios: ${metrics.leadsFrios}`)

      doc.moveDown()

      // Negociações
      doc.fontSize(11).fillColor(COLORS.text).text('Negociações:')
      doc.fontSize(10).fillColor(COLORS.textLight)
        .text(`  📊 Total: ${metrics.totalNegociacoes}`)
        .text(`  ✅ Fechadas: ${metrics.negociacoesFechadas}`)
        .text(`  📈 Em Andamento: ${negociacoes.filter(n => !['FECHADO', 'PERDIDO', 'CANCELADO'].includes(n.status)).length}`)

      doc.moveDown()

      // Agendamentos
      doc.fontSize(11).fillColor(COLORS.text).text('Visitas:')
      doc.fontSize(10).fillColor(COLORS.textLight)
        .text(`  📅 Agendadas: ${metrics.totalAgendamentos}`)
        .text(`  ✅ Realizadas: ${metrics.agendamentosRealizados}`)

      // Meta (se existir)
      if (meta) {
        doc.moveDown(2)
        doc.fontSize(14).fillColor(COLORS.text).text('Meta do Mês', { underline: true })
        doc.moveDown()

        const progressoGeral = this.calculateMetaProgress(meta, metrics)

        doc.fontSize(11).fillColor(COLORS.text)
          .text(`Status: ${meta.status === 'ATINGIDA' ? '🏆 META ATINGIDA!' : '📊 Em Andamento'}`)
        doc.fontSize(10).fillColor(COLORS.textLight)
          .text(`Progresso Geral: ${progressoGeral.toFixed(0)}%`)

        if (meta.meta_leads) {
          doc.text(`  • Leads: ${metrics.totalLeads}/${meta.meta_leads} (${((metrics.totalLeads / meta.meta_leads) * 100).toFixed(0)}%)`)
        }
        if (meta.meta_fechamentos) {
          doc.text(`  • Fechamentos: ${metrics.negociacoesFechadas}/${meta.meta_fechamentos} (${((metrics.negociacoesFechadas / meta.meta_fechamentos) * 100).toFixed(0)}%)`)
        }
        if (meta.meta_valor) {
          const metaValor = Number(meta.meta_valor)
          doc.text(`  • Valor: ${this.formatCurrency(metrics.valorFechado)}/${this.formatCurrency(metaValor)} (${((metrics.valorFechado / metaValor) * 100).toFixed(0)}%)`)
        }
      }

      // Footer
      this.addFooter(doc)

      doc.end()
    })
  }

  /**
   * Gera relatório geral do tenant
   */
  async generateTenantReport(tenantId: string, mes: number, ano: number): Promise<Buffer> {
    const startDate = new Date(ano, mes - 1, 1)
    const endDate = new Date(ano, mes, 0, 23, 59, 59)

    // Buscar tenant
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId }
    })

    if (!tenant) throw new Error('Tenant não encontrado')

    // Buscar dados gerais
    const [leads, negociacoes, agendamentos, corretores, imoveis] = await Promise.all([
      prisma.lead.findMany({
        where: { tenant_id: tenantId, created_at: { gte: startDate, lte: endDate } }
      }),
      prisma.negociacao.findMany({
        where: { tenant_id: tenantId, created_at: { gte: startDate, lte: endDate } }
      }),
      prisma.agendamento.findMany({
        where: { tenant_id: tenantId, data_visita: { gte: startDate, lte: endDate } }
      }),
      prisma.corretor.findMany({
        where: { tenant_id: tenantId, ativo: true },
        include: { user: { select: { nome: true } } }
      }),
      prisma.imovel.count({ where: { tenant_id: tenantId, ativo: true } })
    ])

    // Métricas gerais
    const metrics = {
      totalLeads: leads.length,
      leadsQuentes: leads.filter(l => l.temperatura === 'QUENTE').length,
      totalNegociacoes: negociacoes.length,
      fechamentos: negociacoes.filter(n => n.status === 'FECHADO').length,
      valorFechado: negociacoes
        .filter(n => n.status === 'FECHADO')
        .reduce((sum, n) => sum + (Number(n.valor_final) || Number(n.valor_proposta) || 0), 0),
      totalAgendamentos: agendamentos.length,
      visitasRealizadas: agendamentos.filter(a => a.status === 'REALIZADO').length,
      corretoresAtivos: corretores.length,
      imoveisAtivos: imoveis
    }

    // Criar PDF
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = []
      const doc = new PDFDocument({ size: 'A4', margin: 50 })

      doc.on('data', (chunk: Buffer) => chunks.push(chunk))
      doc.on('end', () => resolve(Buffer.concat(chunks)))
      doc.on('error', reject)

      // Header
      this.addHeader(doc, 'Relatório Mensal')

      // Info do tenant
      doc.moveDown()
      doc.fontSize(14).fillColor(COLORS.text).text(tenant.nome)
      doc.fontSize(10).fillColor(COLORS.textLight)
        .text(`Período: ${this.getMonthName(mes)}/${ano}`)

      // Cards principais
      doc.moveDown(2)
      this.addStatsCards(doc, [
        { label: 'Novos Leads', value: metrics.totalLeads.toString(), color: COLORS.primary },
        { label: 'Fechamentos', value: metrics.fechamentos.toString(), color: COLORS.green },
        { label: 'Corretores', value: metrics.corretoresAtivos.toString(), color: COLORS.secondary },
        { label: 'Imóveis', value: metrics.imoveisAtivos.toString(), color: COLORS.accent }
      ])

      // Valor fechado
      doc.moveDown(2)
      doc.rect(50, doc.y, 495, 50).fill(COLORS.primary)
      doc.fillColor(COLORS.white).fontSize(12)
        .text('Valor Total Fechado', 70, doc.y - 40, { width: 455 })
      doc.fontSize(24).text(this.formatCurrency(metrics.valorFechado), 70, doc.y - 20, { width: 455, align: 'center' })

      // Ranking de corretores
      doc.moveDown(3)
      doc.fillColor(COLORS.text).fontSize(14).text('Ranking de Corretores', { underline: true })
      doc.moveDown()

      // Buscar performance por corretor
      const corretorPerformance = await Promise.all(
        corretores.map(async (c) => {
          const fechamentos = await prisma.negociacao.count({
            where: {
              tenant_id: tenantId,
              corretor_id: c.id,
              status: 'FECHADO',
              created_at: { gte: startDate, lte: endDate }
            }
          })
          const valor = await prisma.negociacao.aggregate({
            where: {
              tenant_id: tenantId,
              corretor_id: c.id,
              status: 'FECHADO',
              created_at: { gte: startDate, lte: endDate }
            },
            _sum: { valor_final: true }
          })
          return {
            nome: c.user.nome,
            fechamentos,
            valor: Number(valor._sum.valor_final) || 0
          }
        })
      )

      // Ordenar por fechamentos
      const ranking = corretorPerformance.sort((a, b) => b.fechamentos - a.fechamentos)

      const tableTop = doc.y
      const headers = ['#', 'Corretor', 'Fechamentos', 'Valor']
      const colWidths = [30, 200, 100, 165]

      this.addTableHeader(doc, headers, colWidths, tableTop)

      let y = tableTop + 25
      ranking.slice(0, 10).forEach((c, index) => {
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}`
        const row = [medal, c.nome, c.fechamentos.toString(), this.formatCurrency(c.valor)]
        this.addTableRow(doc, row, colWidths, y)
        y += 20
      })

      // Footer
      this.addFooter(doc)

      doc.end()
    })
  }

  // ============ HELPERS ============

  private addHeader(doc: PDFKit.PDFDocument, title: string) {
    // Barra superior
    doc.rect(0, 0, doc.page.width, 80).fill(COLORS.primary)

    // Logo text
    doc.fillColor(COLORS.white).fontSize(24).text('ImobiFlow', 50, 25)

    // Título
    doc.fontSize(14).text(title, 50, 50)

    doc.y = 100
  }

  private addReportInfo(doc: PDFKit.PDFDocument, filters: ReportFilters) {
    doc.fontSize(10).fillColor(COLORS.textLight)

    const info: string[] = []
    if (filters.startDate) info.push(`De: ${filters.startDate.toLocaleDateString('pt-BR')}`)
    if (filters.endDate) info.push(`Até: ${filters.endDate.toLocaleDateString('pt-BR')}`)

    doc.text(info.join('  •  ') || `Gerado em: ${new Date().toLocaleDateString('pt-BR')}`)
  }

  private addStatsCards(
    doc: PDFKit.PDFDocument,
    cards: Array<{ label: string; value: string; color: string }>
  ) {
    const cardWidth = 115
    const cardHeight = 60
    const gap = 10
    const startX = 50

    cards.forEach((card, index) => {
      const x = startX + (cardWidth + gap) * index

      // Card background
      doc.rect(x, doc.y, cardWidth, cardHeight)
        .fillAndStroke(COLORS.white, COLORS.border)

      // Barra colorida no topo
      doc.rect(x, doc.y, cardWidth, 4).fill(card.color)

      // Valor
      doc.fillColor(COLORS.text).fontSize(20)
        .text(card.value, x + 10, doc.y + 15, { width: cardWidth - 20, align: 'center' })

      // Label
      doc.fillColor(COLORS.textLight).fontSize(9)
        .text(card.label, x + 10, doc.y + 40, { width: cardWidth - 20, align: 'center' })
    })

    doc.y += cardHeight + 10
  }

  private addTableHeader(
    doc: PDFKit.PDFDocument,
    headers: string[],
    colWidths: number[],
    y: number
  ) {
    doc.rect(50, y, 495, 20).fill(COLORS.background)
    doc.fillColor(COLORS.text).fontSize(9)

    let x = 55
    headers.forEach((header, index) => {
      doc.text(header, x, y + 6, { width: colWidths[index] - 10 })
      x += colWidths[index]
    })
  }

  private addTableRow(
    doc: PDFKit.PDFDocument,
    row: string[],
    colWidths: number[],
    y: number
  ) {
    doc.fillColor(COLORS.text).fontSize(9)

    let x = 55
    row.forEach((cell, index) => {
      doc.text(cell, x, y, { width: colWidths[index] - 10 })
      x += colWidths[index]
    })

    // Linha separadora
    doc.strokeColor(COLORS.border).lineWidth(0.5)
      .moveTo(50, y + 18).lineTo(545, y + 18).stroke()
  }

  private addFooter(doc: PDFKit.PDFDocument) {
    const pageCount = doc.bufferedPageRange().count

    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i)

      // Footer background
      doc.rect(0, doc.page.height - 40, doc.page.width, 40).fill(COLORS.background)

      // Text
      doc.fillColor(COLORS.textLight).fontSize(8)
        .text(
          `Gerado por ImobiFlow em ${new Date().toLocaleString('pt-BR')}  •  Página ${i + 1} de ${pageCount}`,
          50,
          doc.page.height - 25,
          { width: doc.page.width - 100, align: 'center' }
        )
    }
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  private getMonthName(mes: number): string {
    const meses = [
      '', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ]
    return meses[mes]
  }

  private calculateMetaProgress(meta: any, metrics: any): number {
    let total = 0
    let count = 0

    if (meta.meta_leads && meta.meta_leads > 0) {
      total += (metrics.totalLeads / meta.meta_leads) * 100
      count++
    }
    if (meta.meta_fechamentos && meta.meta_fechamentos > 0) {
      total += (metrics.negociacoesFechadas / meta.meta_fechamentos) * 100
      count++
    }
    if (meta.meta_valor && Number(meta.meta_valor) > 0) {
      total += (metrics.valorFechado / Number(meta.meta_valor)) * 100
      count++
    }

    return count > 0 ? Math.min(total / count, 100) : 0
  }
}

export const pdfReportService = new PDFReportService()

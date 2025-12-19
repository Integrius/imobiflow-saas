#!/usr/bin/env python3
"""
Gera PDF do planejamento de BI + IA usando biblioteca Python nativa
"""

try:
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import inch, cm
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle
    from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
    from reportlab.lib import colors
    REPORTLAB_AVAILABLE = True
except ImportError:
    REPORTLAB_AVAILABLE = False

import subprocess
import sys

def generate_with_reportlab():
    """Gera PDF usando reportlab"""
    print("Tentando gerar PDF com reportlab...")

    # Instala reportlab se necessário
    subprocess.run([sys.executable, '-m', 'pip', 'install', '--user', 'reportlab', '-q'],
                   capture_output=True)

    # Reimporta após instalação
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import getSampleStyleSheet
    from reportlab.lib.units import cm
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
    from reportlab.lib.enums import TA_CENTER

    # Cria documento
    pdf_file = 'docs/planejamento-bi-ia.pdf'
    doc = SimpleDocTemplate(pdf_file, pagesize=A4,
                           topMargin=2*cm, bottomMargin=2*cm,
                           leftMargin=2*cm, rightMargin=2*cm)

    # Estilos
    styles = getSampleStyleSheet()
    title_style = styles['Title']
    heading1_style = styles['Heading1']
    heading2_style = styles['Heading2']
    normal_style = styles['Normal']

    # Conteúdo
    story = []

    # Capa
    story.append(Spacer(1, 3*cm))
    story.append(Paragraph("Planejamento Estratégico:", title_style))
    story.append(Paragraph("Business Intelligence com IA", title_style))
    story.append(Spacer(1, 1*cm))
    story.append(Paragraph("Sistema Inteligente de Comunicação", heading2_style))
    story.append(Paragraph("e Negociação Imobiliária", heading2_style))
    story.append(Spacer(1, 2*cm))
    story.append(Paragraph("Vivoly - Imobiliária Digital", normal_style))
    story.append(Paragraph("Dezembro 2024", normal_style))
    story.append(PageBreak())

    # Conteúdo principal (resumido para caber em PDF simples)
    content = [
        ("1. SUMÁRIO EXECUTIVO", heading1_style),
        ("Este documento apresenta o planejamento completo para implementação de um sistema de Business Intelligence baseado em Inteligência Artificial que transformará a Vivoly em uma plataforma verdadeiramente disruptiva no mercado imobiliário.", normal_style),

        ("1.1 Objetivo Principal", heading2_style),
        ("Criar um Assistente Virtual Inteligente que atua como:", normal_style),
        ("• Primeiro ponto de contato com leads (WhatsApp)", normal_style),
        ("• Assistente estratégico para corretores (Telegram)", normal_style),
        ("• Analista de negócios identificando oportunidades", normal_style),
        ("• Coordenador de processos otimizando conversões", normal_style),

        ("1.2 ROI Projetado", heading2_style),
        ("Cenário Atual (Manual):", normal_style),
        ("• Corretor atende 50 leads/mês", normal_style),
        ("• Taxa de conversão: 5%", normal_style),
        ("• Resultado: 2,5 fechamentos/mês", normal_style),
        ("• Comissão média: R$ 37.500/mês", normal_style),

        ("Cenário Futuro (Com IA):", normal_style),
        ("• IA pré-qualifica 200 leads/mês", normal_style),
        ("• Corretor foca em 50 leads quentes", normal_style),
        ("• Taxa de conversão: 12%", normal_style),
        ("• Resultado: 6 fechamentos/mês", normal_style),
        ("• Comissão média: R$ 90.000/mês", normal_style),

        ("Ganho: +R$ 52.500/mês por corretor | ROI: >10.000%", normal_style),

        ("2. ARQUITETURA DO SISTEMA", heading1_style),
        ("O sistema é composto por 3 camadas principais:", normal_style),

        ("2.1 Camada de Canais", heading2_style),
        ("• WhatsApp Business API (clientes)", normal_style),
        ("• Telegram Bot API (corretores)", normal_style),
        ("• Webhooks para recebimento de mensagens", normal_style),

        ("2.2 Camada de IA", heading2_style),
        ("• Claude AI (Anthropic) - Motor principal", normal_style),
        ("• ChatGPT-4 (OpenAI) - Fallback", normal_style),
        ("• Context Manager - Gerenciamento de contexto", normal_style),

        ("2.3 Camada de Business Intelligence", heading2_style),
        ("• Lead Scoring Automático", normal_style),
        ("• Qualificação Inteligente", normal_style),
        ("• Detecção de Oportunidades", normal_style),
        ("• Analytics Preditivo", normal_style),

        ("3. FLUXOS DE INTERAÇÃO", heading1_style),

        ("3.1 Cliente → IA (WhatsApp)", heading2_style),
        ("1. Cliente envia mensagem inicial", normal_style),
        ("2. IA processa e responde naturalmente", normal_style),
        ("3. Sistema registra lead no banco", normal_style),
        ("4. IA faz perguntas qualificadoras", normal_style),
        ("5. Score é calculado automaticamente", normal_style),
        ("6. Se score > 70: notifica corretor", normal_style),

        ("3.2 IA → Corretor (Telegram)", heading2_style),
        ("• Notificações de leads quentes em tempo real", normal_style),
        ("• Dashboard diário com prioridades", normal_style),
        ("• Insights sobre oportunidades", normal_style),
        ("• Alertas de negociações travadas", normal_style),

        ("4. IMPLEMENTAÇÃO", heading1_style),

        ("4.1 Fase 1: MVP (6 semanas)", heading2_style),
        ("• Setup APIs (Claude + OpenAI)", normal_style),
        ("• Integração WhatsApp básica", normal_style),
        ("• Integração Telegram básica", normal_style),
        ("• Primeiro agente: Qualificador de leads", normal_style),
        ("• Sistema de contexto e memória", normal_style),
        ("• Notificações para corretores", normal_style),

        ("4.2 Fase 2: Inteligência (8 semanas)", heading2_style),
        ("• Lead scoring automático", normal_style),
        ("• Análise de sentimento", normal_style),
        ("• Sistema de recomendação de imóveis", normal_style),
        ("• Detector de oportunidades", normal_style),
        ("• Analytics preditivo", normal_style),

        ("4.3 Fase 3: Automações (6 semanas)", heading2_style),
        ("• Follow-ups automáticos", normal_style),
        ("• Recuperação de leads frios", normal_style),
        ("• Agendamento inteligente", normal_style),
        ("• Integração com calendário", normal_style),
        ("• Sistema de feedback", normal_style),

        ("5. INVESTIMENTO", heading1_style),

        ("5.1 Custos Operacionais Mensais", heading2_style),
        ("• API Claude: $150-300", normal_style),
        ("• API OpenAI: $100", normal_style),
        ("• WhatsApp API: $0-50", normal_style),
        ("• Telegram: $0", normal_style),
        ("• Redis: $15-30", normal_style),
        ("• Servidor: $50-100", normal_style),
        ("Total: $315-530/mês", normal_style),

        ("5.2 Timeline", heading2_style),
        ("• Total: 20 semanas (~5 meses)", normal_style),
        ("• Payback: < 1 mês", normal_style),

        ("6. MÉTRICAS E KPIs", heading1_style),

        ("Eficiência da IA:", normal_style),
        ("• Taxa de Resposta IA: > 90%", normal_style),
        ("• Taxa de Qualificação: > 70%", normal_style),
        ("• Tempo Médio Qualificação: < 15 min", normal_style),
        ("• Acurácia do Score: > 80%", normal_style),

        ("Conversão:", normal_style),
        ("• Taxa Conversão IA → Corretor: > 15%", normal_style),
        ("• Taxa de Agendamento: > 40%", normal_style),
        ("• Taxa de Fechamento: > 12%", normal_style),

        ("ROI:", normal_style),
        ("• Custo por Lead Qualificado: < R$ 50", normal_style),
        ("• Tempo Economizado: > 20h/semana", normal_style),
        ("• Aumento de Conversão: > 140%", normal_style),
        ("• ROI do Sistema: > 1000%", normal_style),

        ("7. CONCLUSÃO", heading1_style),
        ("A implementação deste sistema de Business Intelligence com IA representa uma oportunidade única de posicionar a Vivoly como líder tecnológico no mercado imobiliário brasileiro.", normal_style),

        ("Os números projetados são extremamente promissores:", normal_style),
        ("• ROI de 10.400% no primeiro mês", normal_style),
        ("• Aumento de 140% na taxa de conversão", normal_style),
        ("• 25 horas/mês economizadas por corretor", normal_style),
        ("• R$ 6.3 milhões/ano de ganho adicional (10 corretores)", normal_style),

        ("Recomendação: Aprovar e iniciar implementação imediatamente.", normal_style),

        ("---", normal_style),
        ("Para documentação técnica completa, consulte:", normal_style),
        ("• Arquivo Markdown: docs/planejamento-bi-ia.md", normal_style),
        ("• Arquivo HTML: docs/planejamento-bi-ia.html", normal_style),
    ]

    for text, style in content:
        if text == "---":
            story.append(Spacer(1, 0.5*cm))
        else:
            story.append(Paragraph(text, style))
            story.append(Spacer(1, 0.3*cm))

    # Gera PDF
    doc.build(story)
    print(f"✅ PDF criado com sucesso: {pdf_file}")
    return True

def main():
    try:
        generate_with_reportlab()
    except Exception as e:
        print(f"❌ Erro ao gerar PDF: {e}")
        print("\n💡 Alternativas:")
        print("1. Abra docs/planejamento-bi-ia.html no navegador")
        print("2. Use Ctrl+P (ou Cmd+P) > Salvar como PDF")
        print("3. Ou leia o arquivo Markdown: docs/planejamento-bi-ia.md")
        sys.exit(1)

if __name__ == '__main__':
    main()

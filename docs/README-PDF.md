# Como Gerar o PDF do Planejamento

## Arquivos Disponíveis

1. **planejamento-bi-ia.md** - Documento completo em Markdown
2. **planejamento-bi-ia.html** - Versão HTML estilizada

## Opção 1: Gerar PDF pelo Navegador (Recomendado)

1. Abra o arquivo `planejamento-bi-ia.html` no seu navegador
2. Pressione `Ctrl+P` (Windows/Linux) ou `Cmd+P` (Mac)
3. Selecione "Salvar como PDF" como destino
4. Configure as opções:
   - Margens: Padrão
   - Cabeçalhos e rodapés: Opcional
   - Gráficos de fundo: Ativado
5. Clique em "Salvar"

## Opção 2: Usando Ferramentas de Linha de Comando

### Se você tiver wkhtmltopdf instalado:

```bash
wkhtmltopdf \
  --enable-local-file-access \
  --print-media-type \
  --margin-top 20mm \
  --margin-bottom 20mm \
  --margin-left 20mm \
  --margin-right 20mm \
  --footer-center '[page]/[topage]' \
  docs/planejamento-bi-ia.html \
  docs/planejamento-bi-ia.pdf
```

### Se você tiver pandoc + pdflatex:

```bash
pandoc docs/planejamento-bi-ia.md \
  -o docs/planejamento-bi-ia.pdf \
  -V geometry:margin=2cm \
  -V fontsize=11pt \
  --toc \
  --toc-depth=3
```

## Opção 3: Online

1. Acesse https://www.markdowntopdf.com/
2. Cole o conteúdo de `planejamento-bi-ia.md`
3. Clique em "Convert"
4. Baixe o PDF gerado

## Opção 4: VS Code

Se você usa VS Code com a extensão "Markdown PDF":

1. Abra `planejamento-bi-ia.md` no VS Code
2. Pressione `Ctrl+Shift+P`
3. Digite "Markdown PDF: Export (pdf)"
4. Pressione Enter

## Conteúdo do Documento

O planejamento completo contém:

- ✅ Sumário Executivo com ROI projetado
- ✅ Análise da Arquitetura Atual
- ✅ Arquitetura Proposta do Sistema BI + IA
- ✅ Fluxos de Interação Detalhados
- ✅ Implementação Técnica (código e estrutura)
- ✅ Roadmap de Implementação (20 semanas)
- ✅ Métricas e KPIs
- ✅ Investimento e ROI Detalhado
- ✅ Riscos e Mitigações
- ✅ Apêndices com exemplos práticos

Total: ~50 páginas de documentação completa

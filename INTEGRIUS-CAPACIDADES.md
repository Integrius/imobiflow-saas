# Integrius (ImobiFlow SaaS) — Documento Completo de Capacidades

> **Produto:** Integrius — CRM Imobiliario Inteligente com IA
> **Empresa:** Vivoly (vivoly.com.br)
> **Site do Produto:** integrius.com.br
> **Aplicacao SaaS:** {tenant}.integrius.com.br
> **Versao:** 1.16.0
> **Ultima atualizacao:** Fevereiro 2026

---

## 1. VISAO GERAL DO PRODUTO

O Integrius e uma plataforma SaaS completa de CRM imobiliario, projetada para imobiliarias brasileiras que desejam profissionalizar sua gestao comercial, aumentar a conversao de leads e ter controle total sobre sua equipe de corretores.

### Proposta de Valor
- **Gestao completa do ciclo de vendas**: da captacao do lead ao fechamento do negocio
- **Inteligencia Artificial integrada (Sofia)**: qualificacao automatica de leads, analise de sentimento, sugestoes de imoveis
- **Multi-tenant com isolamento total**: cada imobiliaria tem seu proprio ambiente seguro
- **Automacao de processos**: lembretes, degradacao de temperatura, notificacoes multicanal
- **Business Intelligence**: rankings, metas, comissoes, dashboards gerenciais

### Publico-Alvo
- Imobiliarias de pequeno, medio e grande porte no Brasil
- Corretores autonomos que buscam organizacao profissional
- Gestores imobiliarios que precisam de visibilidade sobre equipe e resultados

---

## 2. MODULOS E CAPACIDADES DETALHADAS

---

### 2.1 GESTAO DE LEADS

**O que faz:** Centraliza todos os contatos interessados em comprar, alugar ou vender imoveis, com rastreamento completo desde a captacao ate a conversao.

**Capacidades:**

- **Cadastro completo de leads** com dados pessoais (nome, email, telefone, CPF), preferencias detalhadas de imovel (tipo, faixa de preco, localizacao, numero de quartos/vagas, area minima, aceita pets) e classificacao por temperatura (Quente, Morno, Frio)
- **Captacao multicanal**: formulario do site, WhatsApp (automatico via Twilio), Telegram, telefone, indicacao, portais imobiliarios, redes sociais, eventos
- **Importacao em massa via CSV**: wizard de 4 etapas com upload, mapeamento inteligente de campos (suporta aliases em portugues e ingles), preview dos dados, deteccao de duplicatas por telefone, normalizacao automatica de enums, e relatorio detalhado de resultados (sucesso/erro/duplicado por linha)
- **Download de template CSV** para padronizacao da importacao
- **Sistema de temperatura inteligente**: classificacao visual (Quente com icone de fogo, Morno com raio, Frio com floco de neve) com degradacao automatica — leads quentes sem contato ha 5 dias rebaixam para mornos, mornos sem contato ha 10 dias rebaixam para frios
- **Score de qualificacao por IA (Sofia)**: pontuacao de 0 a 100 baseada em analise automatica de interacoes, urgencia, sentimento e perfil do lead
- **Timeline de interacoes**: historico cronologico completo de todas as interacoes (WhatsApp, email, ligacao, visita, anotacao, SMS, Telegram) com direcao (entrada/saida), sentimento detectado pela IA, duracao de chamadas, e filtros por tipo de interacao
- **Vinculacao de leads a corretores**: atribuicao manual ou automatica (via WhatsApp) de corretores responsaveis por cada lead
- **Vinculacao de leads a imoveis**: associacao de imoveis de interesse para acompanhamento e sugestoes
- **Sistema de propostas competitivas**: multiplos leads podem fazer ofertas sobre o mesmo imovel, com rastreamento da melhor oferta e comparacao visual
- **Filtros avancados**: por temperatura, origem, corretor atribuido, leads proprios vs atribuidos
- **Busca por nome, email ou telefone**
- **Exportacao de relatorio em PDF** com os filtros aplicados

**Dados rastreados por lead:**
- Informacoes pessoais (nome, email, telefone, CPF)
- Origem e canal de captacao
- Temperatura e score IA
- Preferencias de imovel (tipo, negocio, faixa de preco, localizacao, quartos, vagas, area, pets)
- Analise IA completa (qualificacao, sentimento, urgencia, intencao)
- Status de escalacao para corretor humano
- Data da ultima interacao
- Historico completo de timeline

---

### 2.2 GESTAO DE IMOVEIS

**O que faz:** Catalogo completo de imoveis com fotos, caracteristicas detalhadas, vinculacao a proprietarios e corretores, e controle de status.

**Capacidades:**

- **Cadastro completo de imoveis** com titulo, descricao, tipo (Apartamento, Casa, Terreno, Comercial, Rural, Chacara, Sobrado, Cobertura, Loft, Kitnet), categoria (Venda, Locacao, Temporada) e status (Disponivel, Reservado, Vendido, Alugado, Inativo, Manutencao)
- **Endereco estruturado**: logradouro, numero, complemento, bairro, cidade, estado, CEP — com integracao IBGE para autocomplete de localidades brasileiras
- **Caracteristicas detalhadas**: area total, area construida, quartos, banheiros, suites, vagas de garagem, mobiliado ou nao
- **Diferenciais**: lista de amenidades e caracteristicas especiais do imovel
- **Galeria de fotos** com upload via Cloudinary, reordenacao de imagens, foto principal destacada, e exclusao individual
- **Suporte a video** (URL do YouTube/Vimeo) e **tour virtual 360** (URL externa)
- **Documentacao**: upload de documentos legais (PDFs)
- **Informacoes financeiras**: preco de venda/aluguel, valor do condominio, IPTU anual
- **Vinculacao a proprietario**: cada imovel associado ao seu dono com dados completos
- **Corretor responsavel**: atribuicao de corretor com historico de trocas
- **Validacao de dados**: data da ultima validacao e responsavel pela conferencia
- **Busca por proximidade**: encontrar imoveis proximos a uma localizacao
- **Filtros por status, tipo e busca textual**
- **Exportacao de relatorio em PDF**

**Dados rastreados por imovel:**
- Codigo interno unico por imobiliaria
- Tipo, categoria e status
- Endereco completo (JSON estruturado)
- Caracteristicas (JSON com metricas)
- Diferenciais (array de strings)
- Fotos (array de URLs Cloudinary)
- Video e tour 360 (URLs)
- Documentos (array de URLs)
- Preco, condominio, IPTU
- Proprietario e corretor responsavel
- Historico de corretores
- Data de publicacao e validacao

---

### 2.3 GESTAO DE PROPRIETARIOS

**O que faz:** Cadastro e gestao de donos de imoveis com informacoes de contato, documentacao fiscal e vinculacao aos seus imoveis.

**Capacidades:**

- **Cadastro de pessoa fisica ou juridica** com nome, email, telefone principal e secundario, CPF ou CNPJ (com formatacao automatica e validacao)
- **Informacoes bancarias** para transferencia de comissoes (JSON com dados do banco)
- **Percentual de comissao personalizado** por proprietario
- **Forma de pagamento preferencial** (PIX, transferencia, etc.)
- **Visualizacao dos imoveis vinculados** ao proprietario em aba dedicada
- **Busca por nome, email ou telefone**
- **Protecao contra exclusao**: proprietarios com imoveis vinculados nao podem ser deletados (integridade referencial)

**Dados rastreados por proprietario:**
- Nome, email, telefones
- CPF/CNPJ com tipo de pessoa
- Endereco e dados de contato adicionais
- Informacoes bancarias
- Percentual de comissao
- Forma de pagamento

---

### 2.4 NEGOCIACOES E PROPOSTAS

**O que faz:** Rastreamento completo do processo de venda/locacao desde o primeiro contato ate o fechamento, incluindo sistema de propostas competitivas.

**Capacidades:**

- **Pipeline de vendas completo** com 9 estagios: Contato → Visita Agendada → Visita Realizada → Proposta → Analise de Credito → Contrato → Fechado / Perdido / Cancelado
- **Vinculacao tripla**: cada negociacao associa um lead, um imovel e um corretor
- **Rastreamento financeiro**: valor da proposta inicial, valor aprovado pelo proprietario, valor final de fechamento, condicoes de pagamento
- **Sistema de comissoes**: percentual e valor da comissao calculados automaticamente, com suporte a divisao entre multiplos corretores (array de comissoes)
- **Sistema de propostas competitivas**: multiplos leads podem fazer ofertas simultaneas sobre o mesmo imovel. O sistema rastreia a melhor oferta (maior valor) e permite que cada lead veja sua proposta vs a melhor oferta, criando dinamica de mercado
- **Comportamento upsert nas propostas**: uma proposta por lead por imovel — atualizar o valor automaticamente reseta o status para Pendente
- **Status de propostas**: Pendente, Aceita, Recusada, Contra-proposta, Cancelada — com resposta do proprietario/corretor
- **Documentacao**: upload de contratos, laudos e documentos da negociacao
- **URL do contrato**: link direto para o contrato assinado
- **Timeline de eventos**: historico de cada mudanca de status e interacao
- **Datas de marco**: proposta, contrato, fechamento
- **Motivo de perda**: quando negociacao e perdida, registra o motivo para analise
- **Filtros por status e busca textual**
- **Codigo unico por negociacao** dentro de cada imobiliaria
- **Protecao referencial**: nao permite exclusao de leads, imoveis ou corretores vinculados a negociacoes

**Dados rastreados por negociacao:**
- Codigo, status, datas de marco
- Lead, imovel e corretor vinculados
- Valores (proposta, aprovado, final)
- Condicoes de pagamento (JSON)
- Comissoes (array JSON)
- Documentos e contrato
- Motivo de perda
- Timeline de eventos

---

### 2.5 AGENDAMENTOS DE VISITAS

**O que faz:** Sistema completo de agendamento, confirmacao, realizacao e feedback de visitas a imoveis.

**Capacidades:**

- **Agendamento de visitas** vinculando lead, imovel e corretor com data, hora e duracao estimada
- **Tres tipos de visita**: Presencial (no imovel), Virtual (videoconferencia), Hibrida (combinacao)
- **Deteccao de conflitos**: verifica se o corretor ja tem visita agendada no mesmo horario (margem de 1 hora)
- **Sistema de dupla confirmacao**: tanto o lead quanto o corretor precisam confirmar presenca. Status visual mostra quem ja confirmou
- **Fluxo de status completo**: Pendente → Confirmado → Realizado / Cancelado / Nao Compareceu
- **Cancelamento com motivo**: registro do motivo e de quem cancelou
- **Feedback pos-visita**: apos realizacao, corretor e lead podem deixar impressoes. Lead pode dar nota de 1 a 5 estrelas
- **Notificacoes automaticas**: email (SendGrid) e Telegram para corretor ao criar agendamento
- **Lembretes automaticos**: 24 horas e 1 hora antes da visita (jobs agendados)
- **Rastreamento de nao-comparecimento**: registro quando lead nao aparece
- **Filtros por status e corretor**
- **Observacoes adicionais** no momento do agendamento

**Dados rastreados por agendamento:**
- Data, hora e duracao
- Tipo de visita
- Status e confirmacoes
- Lead, imovel e corretor
- Feedback do corretor e do lead
- Nota do lead (1-5)
- Motivo de cancelamento
- Lembretes enviados (24h, 1h)

---

### 2.6 GESTAO DE EQUIPE (CORRETORES)

**O que faz:** Gerenciamento completo da equipe de corretores com cadastro, atribuicao de funcoes, calculo de comissoes e monitoramento de desempenho.

**Capacidades:**

- **Cadastro de corretores** com dados profissionais: nome, email, telefone, CRECI (numero unico de licenca), especializacoes, foto de perfil
- **Tres niveis de acesso**: ADMIN (controle total), GESTOR (gestao operacional), CORRETOR (acesso individual limitado)
- **Primeiro acesso seguro**: ao criar um corretor, o sistema gera senha temporaria e envia por email/WhatsApp. No primeiro login, o usuario e obrigado a definir nova senha com indicador de forca
- **Status de atividade**: LED visual (verde/vermelho) indicando se o corretor esta ativo
- **Comissao padrao personalizada**: percentual de comissao definido por corretor
- **Metas individuais**: meta mensal e anual de vendas
- **Score de performance**: pontuacao calculada automaticamente baseada em metricas ponderadas
- **Disponibilidade**: configuracao de horarios de trabalho (JSON)
- **Chat ID Telegram**: integracao para notificacoes diretas via Telegram
- **Visualizacao de imoveis atribuidos**: aba dedicada mostrando todos os imoveis sob responsabilidade do corretor
- **Visualizacao de leads atribuidos**: aba dedicada mostrando todos os leads vinculados ao corretor
- **Calculadora de comissoes**: selecao multipla de corretores para calculo em lote de comissoes baseado em negociacoes fechadas, com detalhamento por negociacao
- **Envio de credenciais em massa**: reenvio de dados de acesso para multiplos corretores
- **Atualizacao de status em massa**: ativar/desativar multiplos corretores de uma vez
- **Busca por nome ou email**

**Dados rastreados por corretor:**
- Dados pessoais e profissionais
- CRECI (unico por imobiliaria)
- Especializacoes (array)
- Metas mensal e anual
- Comissao padrao
- Score de performance
- Disponibilidade
- Telegram Chat ID
- Foto de perfil

---

### 2.7 METAS E OBJETIVOS

**O que faz:** Definicao e acompanhamento de metas mensais para cada corretor, com calculo automatico de progresso a partir dos dados reais do sistema.

**Capacidades:**

- **Definicao de metas mensais individuais** para cada corretor com 5 metricas opcionais: leads captados, visitas realizadas, propostas recebidas, fechamentos e valor total de vendas
- **Criacao em lote**: definir a mesma meta para todos os corretores selecionados de uma vez
- **Calculo automatico de progresso**: o sistema consulta os dados reais (negociacoes, agendamentos, leads) para atualizar automaticamente o progresso de cada metrica
- **Status de meta**: Em Andamento, Atingida, Nao Atingida, Cancelada — com barras de progresso visuais coloridas
- **Progresso geral**: percentual calculado como media das metricas definidas
- **Resumo executivo**: cards com total de corretores com meta, metas atingidas e progresso medio
- **Widget no dashboard do corretor**: cada corretor ve sua meta atual com barras de progresso no painel principal
- **Atualizacao manual ou automatica**: gestor pode forcar recalculo a qualquer momento
- **Historico mensal**: cada combinacao corretor/mes/ano e unica, permitindo comparacao historica
- **Observacoes**: campo para comentarios do gestor sobre a meta

---

### 2.8 DESEMPENHO INDIVIDUAL DO CORRETOR

**O que faz:** Dashboard personalizado para cada corretor acompanhar sua performance, ranking na equipe e identificar oportunidades de melhoria.

**Capacidades:**

- **KPIs pessoais**: leads captados no mes, fechamentos, valor total fechado, taxa de conversao, visitas realizadas/agendadas, propostas recebidas
- **Ranking na equipe** em 4 categorias: posicao por fechamentos, por valor fechado, por leads captados e por taxa de conversao (ex: "#3 de 12 corretores")
- **Comparacao com media da equipe**: graficos de barras mostrando desempenho pessoal vs media do time, com percentuais acima/abaixo
- **Top 3 corretores**: benchmarking visual dos 3 melhores por fechamentos e por valor
- **Comparativo com mes anterior**: grafico comparando metricas do mes atual vs mes anterior, com indicadores de crescimento/declinio
- **Alerta de leads sem contato**: lista de leads quentes/mornos sem interacao ha 3+ dias, com botao "Contatar Agora"
- **Metricas de tempo**: tempo medio de fechamento (em dias) e tempo medio do primeiro contato (em horas)
- **Atividades pendentes**: contagem de tarefas pendentes e atrasadas com link direto
- **Distribuicao de leads por origem**: grafico de pizza mostrando de onde vem os leads (Site, WhatsApp, Telegram, Telefone, etc.)
- **Exportacao em PDF**: relatorio completo de desempenho para download

---

### 2.9 DASHBOARD GERENCIAL

**O que faz:** Visao executiva para administradores e gestores com metricas consolidadas de toda a equipe, ranking, tendencias e alertas criticos.

**Capacidades:**

- **Metricas consolidadas**: total de corretores ativos, total de leads, leads novos no mes, valor total fechado, taxa de conversao geral, media de leads por corretor
- **Ranking de corretores**: tabela completa com posicao, leads captados, negociacoes fechadas, valor total, taxa de conversao individual, tempo medio de fechamento, visitas realizadas e pontuacao ponderada. Top 3 destacados em ouro, prata e bronze
- **Top 5 corretores**: cards separados por fechamentos e por valor, com graficos de barras
- **Comparativo mensal**: grafico de barras dos ultimos 3 meses mostrando evolucao de leads, negociacoes, fechamentos e valor
- **Distribuicao de temperatura**: grafico pizza/donut com leads quentes, mornos e frios (contagem e percentual)
- **Alertas gerenciais criticos**:
  - Leads quentes sem contato ha 3+ dias (lista com corretor responsavel)
  - Corretores inativos ha 7+ dias (lista com data da ultima atividade)
  - Negociacoes paradas ha 15+ dias (lista com dias estagnados)
  - Visitas agendadas para hoje (lista de compromissos do dia)
- **Relatorio mensal em PDF**: exportacao completa dos dados gerenciais

---

### 2.10 TAREFAS E FOLLOW-UPS

**O que faz:** Sistema de gestao de tarefas para organizar atividades de acompanhamento de leads e processos internos.

**Capacidades:**

- **8 tipos de tarefa**: Follow-up, Ligacao, Email, WhatsApp, Visita, Documento, Reuniao, Outro — cada um com icone visual proprio
- **4 niveis de prioridade**: Baixa (cinza), Media (azul), Alta (laranja), Urgente (vermelho)
- **5 status de tarefa**: Pendente, Em Andamento, Concluida, Cancelada, Atrasada
- **Vinculacao a lead**: tarefas de follow-up podem ser associadas a um lead especifico
- **Data de vencimento e lembrete**: definir quando a tarefa deve ser concluida e quando enviar lembrete
- **Recorrencia**: tarefas podem se repetir automaticamente (diaria, semanal, quinzenal, mensal) — ao concluir, o sistema cria automaticamente a proxima ocorrencia
- **Conclusao com observacoes**: ao marcar como concluida, o usuario pode registrar notas sobre o resultado
- **Dashboard de estatisticas**: cards com total, pendentes, em andamento, concluidas, atrasadas e taxa de conclusao
- **Filtros combinados**: por status, tipo e prioridade simultaneamente
- **Widget no dashboard principal**: mostra as 5 tarefas mais urgentes pendentes
- **Deteccao automatica de atraso**: tarefas vencidas sao automaticamente marcadas como atrasadas

---

### 2.11 INTELIGENCIA ARTIFICIAL — SOFIA

**O que faz:** Assistente de IA integrada que qualifica leads automaticamente, analisa mensagens, detecta sentimento e sugere imoveis compatíveis.

**Capacidades:**

- **Qualificacao automatica de leads**: ao criar um lead, Sofia analisa os dados e gera score de 0-100, temperatura sugerida e insights sobre o perfil
- **Analise de mensagens em tempo real**: cada mensagem recebida via WhatsApp/Telegram e processada pela IA para detectar intencao (Informacao, Agendamento, Negociacao, Reclamacao), sentimento (Positivo, Neutro, Negativo), urgencia (Baixa, Media, Alta) e extrair preferencias de imovel
- **Auto-resposta inteligente**: Sofia pode responder automaticamente mensagens de WhatsApp durante e fora do horario comercial, simulando um atendente humano
- **Escalacao para corretor humano**: quando a IA detecta situacao complexa, escalona automaticamente para o corretor responsavel com registro do motivo
- **Sugestao de imoveis**: baseado no perfil e preferencias do lead, Sofia sugere imoveis compativeis do catalogo da imobiliaria
- **Property matching**: algoritmo de compatibilidade entre perfil do lead e caracteristicas dos imoveis disponiveis
- **Impacto no score**: cada mensagem analisada pode ajustar o score do lead em -10 a +10 pontos
- **Insights no dashboard**: widget Sofia Insights no painel principal com mensagens dinamicas baseadas nos dados (ex: "Voce tem 5 leads quentes aguardando contato")
- **Provider**: Anthropic Claude como IA principal, com fallback para OpenAI

---

### 2.12 INTEGRACOES E COMUNICACAO

**O que faz:** Conecta o sistema a multiplos canais de comunicacao e servicos externos para automacao e notificacoes.

#### 2.12.1 WhatsApp Business (Twilio)
- **Recepcao automatica de mensagens**: webhook recebe mensagens do WhatsApp via Twilio
- **Criacao automatica de leads**: mensagens de numeros desconhecidos criam leads automaticamente
- **Auto-resposta com IA**: Sofia responde mensagens automaticamente (configuravel)
- **Mensagem de boas-vindas personalizada** por imobiliaria
- **Horario comercial**: definicao de inicio/fim do expediente com mensagem personalizada fora do horario
- **Auto-atribuicao de corretor**: novos leads podem ser automaticamente atribuidos ao corretor padrao
- **Historico de mensagens**: todas as mensagens armazenadas com status de entrega (Pendente, Enviado, Entregue, Lido, Falhou)
- **Suporte a midia**: recepcao e envio de imagens, audio e documentos
- **Estatisticas**: total de mensagens enviadas/recebidas, novos leads via WhatsApp, taxa de resposta
- **Teste de conexao**: verificacao em tempo real da integracao Twilio

#### 2.12.2 Telegram
- **Notificacoes para corretores**: alertas de novos leads, agendamentos, mudanca de temperatura
- **Vinculacao por Chat ID**: cada corretor pode vincular seu Telegram para receber alertas diretos
- **Teste de mensagem**: envio de mensagem de teste para validar integracao

#### 2.12.3 Email (SendGrid)
- **Emails transacionais**: boas-vindas ao lead, confirmacao de agendamento, credenciais temporarias, aviso de trial, exportacao de dados, sugestoes de imoveis
- **Alertas de trial**: emails automaticos 5 dias e 2 dias antes do vencimento do periodo de teste

#### 2.12.4 Cloudinary
- **Hospedagem de imagens**: fotos de imoveis e logos armazenados na nuvem
- **Upload otimizado**: redimensionamento e compressao automaticos

#### 2.12.5 IBGE
- **Localidades brasileiras**: autocomplete de estados, cidades e bairros baseado nos dados oficiais do IBGE

#### 2.12.6 Portais Imobiliarios (Modelo Preparado)
- **Sincronizacao com portais**: estrutura pronta para integracao com ZAP Imoveis, VivaReal, OLX, ImovelWeb, Chaves na Mao e portais customizados
- **Configuracao por portal**: credenciais, intervalo de sincronizacao, logs de operacao
- **Rastreamento**: total de sincronizacoes bem-sucedidas e com erro

---

### 2.13 AUTOMACOES E JOBS AGENDADOS

**O que faz:** Processos automaticos que rodam periodicamente para manter os dados atualizados e enviar notificacoes proativas.

**Jobs ativos:**
- **Degradacao automatica de temperatura**: rebaixa leads quentes sem contato para mornos (5 dias) e mornos para frios (10 dias), com notificacoes
- **Aviso de trial (5 dias)**: email automatico 5 dias antes do vencimento do periodo de teste
- **Aviso de trial (2 dias)**: email urgente 2 dias antes do vencimento
- **Lembretes de tarefas**: notificacao quando uma tarefa se aproxima do vencimento
- **Motor de automacoes**: framework de regras customizaveis com trigger (evento), condicoes e acoes (enviar email, SMS, Telegram, criar tarefa)

---

### 2.14 SISTEMA DE NOTIFICACOES

**O que faz:** Alertas em tempo real dentro da aplicacao para manter os usuarios informados sobre eventos importantes.

**Capacidades:**
- **11 tipos de notificacao**: Info, Sucesso, Alerta, Erro, Lead, Negociacao, Agendamento, Proposta, Meta, Sistema, Tarefa
- **Badge de contagem**: icone de sino no cabecalho com contador de nao lidas
- **Dropdown de notificacoes**: lista das notificacoes recentes ao clicar no sino
- **Marcar como lida**: individual ou todas de uma vez
- **Link de acao**: cada notificacao pode ter um link para navegar diretamente ao item relacionado
- **Auto-refresh**: atualiza a cada 30 segundos

---

### 2.15 RELATORIOS E EXPORTACAO

**O que faz:** Geracao de relatorios profissionais em PDF e exportacao de dados em CSV.

**Capacidades:**
- **Relatorio de Leads (PDF)**: lista de leads com filtros aplicados, formatado para impressao
- **Relatorio de Corretor (PDF)**: performance individual com KPIs, ranking e metricas
- **Relatorio Mensal do Tenant (PDF)**: consolidacao executiva de toda a imobiliaria
- **Exportacao de dados (CSV)**: exportacao completa de todos os dados do tenant (leads, imoveis, negociacoes, corretores, proprietarios, agendamentos) — acionada automaticamente ao cancelar assinatura ou manualmente
- **Envio por email**: CSVs exportados sao enviados automaticamente por email via SendGrid

---

### 2.16 ADMINISTRACAO E SEGURANCA

**O que faz:** Gestao de usuarios, configuracoes do tenant, controle de acesso e auditoria completa.

**Capacidades:**

#### Gestao de Usuarios
- **CRUD completo** de usuarios com nome, email, tipo (ADMIN/GESTOR/CORRETOR), telefone, CRECI
- **Senha temporaria**: gerada automaticamente e enviada por email/WhatsApp
- **Primeiro acesso obrigatorio**: tela dedicada para definir senha segura com indicador de forca (4 criterios: comprimento, maiusculas, numeros, caracteres especiais)
- **Recuperacao de senha**: fluxo em 2 etapas (solicitar codigo de 6 digitos por email → inserir codigo e nova senha, com validade de 5 minutos)
- **Soft delete**: desativacao de usuarios sem exclusao de dados
- **Ultimo login rastreado**: data/hora do ultimo acesso de cada usuario

#### Controle de Acesso (RBAC)
- **ADMIN**: acesso total — gestao de usuarios, configuracoes, plano, cancelamento, todas as funcionalidades
- **GESTOR**: gestao operacional — pode gerenciar corretores, leads, imoveis, negociacoes, metas, relatorios
- **CORRETOR**: acesso individual — ve apenas seus leads, seus imoveis, seu desempenho, suas tarefas

#### Auditoria (Activity Log)
- **Registro completo de atividades**: login, logout, falha de login, alteracao de senha, criacao/edicao/exclusao de registros, pagamentos, configuracoes, acessos negados
- **Detalhes de cada acao**: IP de origem, user-agent, entidade afetada, dados adicionais (sem dados sensiveis)
- **Conformidade LGPD**: isolamento total entre tenants, cada imobiliaria so ve seus proprios logs
- **Filtros por data, usuario, tipo de acao e status**
- **Exportacao de logs**

---

### 2.17 PLANOS E ASSINATURAS

**O que faz:** Gestao de planos de assinatura com cobranca recorrente via Mercado Pago.

**Planos disponiveis:**

| Caracteristica | Basico (R$97/mes) | Pro (R$197/mes) | Enterprise (R$397/mes) |
|---|---|---|---|
| Usuarios | Ate 3 | Ate 10 | Ate 50 |
| Imoveis | Ate 100 | Ate 500 | Ate 5.000 |
| Leads | Ilimitados | Ilimitados | Ilimitados |
| IA Sofia | Basico | Avancado | Premium |
| Relatorios | Basico | Avancado | Completo |
| WhatsApp | 1 numero | 3 numeros | Ilimitado |
| Suporte | Email | Email + Chat | Prioritario |

**Capacidades:**
- **Pagina de planos**: exibicao do plano atual com uso vs limites, grid de 3 planos com features, e historico de pagamentos
- **Checkout via Mercado Pago**: ao clicar "Assinar", o sistema cria a assinatura no gateway e redireciona para o checkout do Mercado Pago
- **Webhook de notificacoes**: recebe eventos do Mercado Pago (pagamento aprovado, cancelado, pausado) e atualiza automaticamente o status do tenant e da assinatura
- **Cancelamento integrado**: ao cancelar, o sistema cancela no Mercado Pago, atualiza o tenant, exporta dados e envia por email
- **Periodo de teste**: 14 dias gratuitos sem cartao de credito
- **Trial com contagem regressiva**: banner visual no cabecalho com dias restantes (verde > amarelo > vermelho)
- **Status do tenant**: TRIAL → ATIVO (apos pagamento) → SUSPENSO (falha de pagamento) → CANCELADO

---

### 2.18 MULTI-TENANCY

**O que faz:** Arquitetura que permite multiplas imobiliarias usarem o mesmo sistema com isolamento total de dados.

**Capacidades:**
- **Subdominio dedicado**: cada imobiliaria acessa via {slug}.integrius.com.br
- **Dominio customizado**: suporte a dominio proprio para tenants premium
- **Isolamento total de dados**: todas as consultas filtram por tenant_id, impossibilitando acesso cruzado
- **Configuracoes independentes**: cada tenant pode ter logo, cores, configuracoes e integracoes proprias
- **Deteccao automatica de tenant**: middleware identifica o tenant pela URL (subdominio)
- **Cookie de ultimo tenant**: ao fazer login, o sistema lembra a ultima imobiliaria acessada

---

### 2.19 ADMIN GERAL (VIVOLY)

**O que faz:** Painel exclusivo para a equipe da Vivoly (operadora do SaaS) monitorar todos os tenants do sistema.

**Capacidades:**
- **Lista de todos os tenants**: nome, slug, subdominio, email, status, plano, admin principal, uso vs limites, data de cadastro
- **Estatisticas do sistema**: total de tenants, novos nos ultimos 30 dias, trials expirando em 5 dias, distribuicao por status e plano
- **Monitoramento de trial**: identificacao rapida de tenants com trial prestes a expirar
- **Acesso direto ao subdominio**: link clicavel para abrir o dashboard de qualquer tenant
- **Filtros por status e plano**
- **Logs gerais**: visualizacao de logs de atividade (restrito ao tenant Vivoly por LGPD)
- **Upload de imagem hero** para landing page

---

## 3. STACK TECNOLOGICA

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Linguagem**: TypeScript
- **Estilizacao**: Tailwind CSS
- **Graficos**: Recharts
- **HTTP Client**: Axios
- **Autenticacao**: JWT (localStorage + cookie para middleware)

### Backend
- **Framework**: Fastify 5
- **Linguagem**: TypeScript
- **ORM**: Prisma 6
- **Banco de Dados**: PostgreSQL (Render)
- **Validacao**: Zod

### Servicos Externos
- **Email**: SendGrid
- **WhatsApp**: Twilio
- **Telegram**: node-telegram-bot-api
- **IA**: Anthropic Claude (principal) + OpenAI (fallback)
- **Imagens**: Cloudinary
- **Pagamentos**: Mercado Pago Assinaturas
- **Localidades**: IBGE API
- **PDF**: PDFKit

### Infraestrutura
- **Deploy Backend**: Render (Web Service)
- **Deploy Frontend**: Vercel (ou similar)
- **Monorepo**: apps/web + apps/api

---

## 4. NUMEROS DO SISTEMA

| Metrica | Valor |
|---------|-------|
| Modulos backend | 26 |
| Endpoints da API | 100+ |
| Paginas do frontend | 23 |
| Modelos no banco | 20 |
| Enums (vocabularios controlados) | 17+ |
| Servicos compartilhados | 11 |
| Middlewares | 4 |
| Jobs agendados | 5 |
| Integracoes externas | 9 |

---

## 5. DIFERENCIAIS COMPETITIVOS

1. **IA Sofia integrada nativamente** — nao e um plugin, e parte do core do produto
2. **Multi-tenant verdadeiro** — isolamento total com LGPD compliance
3. **Propostas competitivas** — sistema unico de multiplas ofertas por imovel
4. **Automacao de temperatura** — leads degradam automaticamente sem contato, forcando acao
5. **Calculadora de comissoes** — calculo em lote com detalhamento por negociacao
6. **Importacao inteligente de CSV** — wizard com mapeamento automatico e deteccao de duplicatas
7. **Dashboard gerencial com alertas** — gestores recebem alertas proativos de problemas
8. **Notificacoes multicanal** — email, WhatsApp, Telegram e in-app integrados
9. **Ranking gamificado** — corretores competem por posicao em 4 categorias
10. **Primeiro acesso seguro** — fluxo dedicado com indicador de forca de senha

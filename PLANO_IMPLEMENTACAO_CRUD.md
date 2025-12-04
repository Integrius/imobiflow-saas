# 🚀 Plano de Implementação CRUD Completo

**Objetivo**: Dar vida ao sistema com funcionalidades completas de produção

---

## ✅ Componentes Base (Concluído)
- [x] Modal reutilizável
- [x] Sistema de Toast/Notificações

---

## 🎯 Estratégia: Implementação Progressiva

### **Fase 1: CRUD Completo de Leads** (Modelo/Template)
Vou criar um CRUD 100% funcional para Leads que servirá de modelo:

1. ✅ Formulário de cadastro (modal)
2. ✅ Edição de registro (modal com dados pré-preenchidos)
3. ✅ Exclusão com confirmação
4. ✅ Validação de campos
5. ✅ Mensagens de sucesso/erro
6. ✅ Loading states
7. ✅ Tratamento de erros da API

### **Fase 2: Replicar para Outros Módulos**
Depois de ter o template funcionando perfeitamente em Leads, replicar para:
- Corretores
- Proprietários
- Imóveis (com upload de fotos)
- Negociações (com seleção de lead + imóvel)

---

## 📋 Implementação de Leads (Detalhado)

### **Arquivo**: `apps/web/app/dashboard/leads/page.tsx`

#### **Funcionalidades**:

1. **Listagem**
   - [x] Tabela com dados
   - [ ] Busca por nome/email/telefone
   - [ ] Filtro por status (Quente/Morno/Frio)
   - [ ] Paginação (se muitos registros)

2. **Cadastro** (Botão "+ Novo Lead")
   - [ ] Modal com formulário
   - [ ] Campos:
     - Nome (obrigatório)
     - Email (obrigatório, validação de email)
     - Telefone (obrigatório, máscara)
     - Status (select: Quente/Morno/Frio)
     - Origem (select: Site/Indicação/Telefone/etc)
     - Interesse (tipo imóvel, finalidade)
     - Observações (textarea)
   - [ ] Validação client-side
   - [ ] Submit para API
   - [ ] Toast de sucesso
   - [ ] Reload da listagem

3. **Edição** (Botão "Editar")
   - [ ] Modal igual ao cadastro
   - [ ] Dados pré-preenchidos
   - [ ] PUT para API
   - [ ] Toast de sucesso
   - [ ] Atualização da listagem

4. **Exclusão** (Botão "Excluir")
   - [ ] Modal de confirmação
   - [ ] Mostra nome do lead
   - [ ] "Tem certeza?"
   - [ ] DELETE para API
   - [ ] Toast de sucesso
   - [ ] Remove da listagem

---

## 🏗️ Estrutura de Código

```typescript
// State management
const [leads, setLeads] = useState([])
const [loading, setLoading] = useState(false)
const [modalOpen, setModalOpen] = useState(false)
const [editingLead, setEditingLead] = useState(null)
const [deleteConfirm, setDeleteConfirm] = useState(null)

// Handlers
const handleCreate = async (data) => { ... }
const handleUpdate = async (id, data) => { ... }
const handleDelete = async (id) => { ... }
const handleSearch = (term) => { ... }
const handleFilter = (status) => { ... }
```

---

## 📊 Formulário de Lead

```typescript
interface LeadForm {
  nome: string
  email: string
  telefone: string
  status: 'QUENTE' | 'MORNO' | 'FRIO'
  origem: string
  interesse: {
    tipo_imovel: string[]
    finalidade: 'COMPRA' | 'ALUGUEL' | 'AMBOS'
    valor_min?: number
    valor_max?: number
    bairros?: string[]
  }
  observacoes?: string
}
```

---

## 🎨 Design/UX

### **Modal de Cadastro/Edição**:
```
┌─────────────────────────────────────┐
│ [X] Novo Lead                        │
├─────────────────────────────────────┤
│                                      │
│ Nome: [________________]             │
│ Email: [________________]            │
│ Telefone: [________________]         │
│ Status: [Selecione ▼]                │
│ Origem: [Selecione ▼]                │
│                                      │
│ === Interesse ===                    │
│ Tipo: ☐ Casa ☐ Apt ☐ Terreno        │
│ Finalidade: ○ Compra ○ Aluguel       │
│ Valor: R$ [____] a R$ [____]         │
│                                      │
│ Observações:                         │
│ [_____________________________]      │
│ [_____________________________]      │
│                                      │
│         [Cancelar] [Salvar]          │
└─────────────────────────────────────┘
```

### **Modal de Confirmação de Exclusão**:
```
┌──────────────────────────────┐
│ ⚠️  Confirmar Exclusão        │
├──────────────────────────────┤
│                              │
│ Tem certeza que deseja       │
│ excluir o lead:              │
│                              │
│ João Silva                   │
│ joao@email.com               │
│                              │
│ Esta ação não pode ser       │
│ desfeita.                    │
│                              │
│    [Cancelar] [Excluir]      │
└──────────────────────────────┘
```

---

## 🔄 Fluxo de Trabalho

### **Cadastrar Lead**:
1. Usuário clica "+ Novo Lead"
2. Modal abre com formulário vazio
3. Usuário preenche campos
4. Clica "Salvar"
5. Frontend valida dados
6. POST /api/v1/leads
7. Se sucesso: Toast verde "Lead cadastrado!" + fecha modal + reload lista
8. Se erro: Toast vermelho com mensagem do erro

### **Editar Lead**:
1. Usuário clica "Editar" na linha
2. Modal abre com dados do lead
3. Usuário altera campos
4. Clica "Salvar"
5. PUT /api/v1/leads/:id
6. Se sucesso: Toast verde "Lead atualizado!" + fecha modal + reload lista
7. Se erro: Toast vermelho com mensagem

### **Excluir Lead**:
1. Usuário clica "Excluir" na linha
2. Modal de confirmação abre
3. Usuário clica "Excluir"
4. DELETE /api/v1/leads/:id
5. Se sucesso: Toast verde "Lead excluído!" + remove da lista
6. Se erro: Toast vermelho com mensagem

---

## ⏱️ Estimativa de Tempo

- **Leads CRUD completo**: ~2-3 horas (com testes)
- **Replicar para Corretores**: ~30 min
- **Replicar para Proprietários**: ~30 min
- **Imóveis com upload**: ~1-2 horas
- **Negociações**: ~1 hora (mais complexo)

**Total**: ~6-8 horas de desenvolvimento

---

## 🚀 Começar Agora!

Vou implementar o CRUD de Leads completo primeiro.

**Pronto?** 🎯

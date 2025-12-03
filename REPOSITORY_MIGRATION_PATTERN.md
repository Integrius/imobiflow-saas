# Padrão de Migração de Repositories para Multi-Tenant

## ✅ Repositórios Já Migrados
- [x] `auth.repository.ts` + `auth.service.ts` + `auth.controller.ts`
- [x] `leads.repository.ts`
- [x] `tenant.repository.ts` (novo)

## 🔄 Repositórios Pendentes
- [ ] `corretores.repository.ts`
- [ ] `proprietarios.repository.ts`
- [ ] `imoveis.repository.ts`
- [ ] `negociacoes.repository.ts`

---

## 📋 Padrão de Migração

### 1. Repository

#### ❌ ANTES:
```typescript
export class ExampleRepository {
  async create(data: CreateDTO) {
    return await this.prisma.example.create({
      data: {
        nome: data.nome,
        // ... outros campos
      }
    })
  }

  async findAll() {
    return await this.prisma.example.findMany()
  }

  async findById(id: string) {
    return await this.prisma.example.findUnique({
      where: { id }
    })
  }

  async update(id: string, data: UpdateDTO) {
    return await this.prisma.example.update({
      where: { id },
      data
    })
  }

  async delete(id: string) {
    await this.prisma.example.delete({
      where: { id }
    })
  }

  async getStats() {
    return await this.prisma.example.count()
  }
}
```

#### ✅ DEPOIS:
```typescript
export class ExampleRepository {
  // ✅ Adicionar tenantId em create
  async create(data: CreateDTO, tenantId: string) {
    return await this.prisma.example.create({
      data: {
        tenant_id: tenantId,  // ✅ ADICIONAR
        nome: data.nome,
        // ... outros campos
      }
    })
  }

  // ✅ Adicionar tenantId em findAll e filtrar
  async findAll(tenantId: string) {
    return await this.prisma.example.findMany({
      where: { tenant_id: tenantId }  // ✅ ADICIONAR
    })
  }

  // ✅ Adicionar tenantId em findById e usar findFirst
  async findById(id: string, tenantId: string) {
    return await this.prisma.example.findFirst({  // ✅ findUnique → findFirst
      where: {
        id,
        tenant_id: tenantId  // ✅ ADICIONAR
      }
    })
  }

  // ✅ Adicionar tenantId em update (validação extra)
  async update(id: string, data: UpdateDTO, tenantId: string) {
    // Opção 1: Validar antes (recomendado para segurança extra)
    const exists = await this.findById(id, tenantId)
    if (!exists) throw new Error('Registro não encontrado')

    return await this.prisma.example.update({
      where: { id },
      data
    })
  }

  // ✅ Adicionar tenantId em delete e usar deleteMany
  async delete(id: string, tenantId: string) {
    await this.prisma.example.deleteMany({  // ✅ delete → deleteMany
      where: {
        id,
        tenant_id: tenantId  // ✅ ADICIONAR
      }
    })
  }

  // ✅ Adicionar tenantId em stats/aggregations
  async getStats(tenantId: string) {
    return await this.prisma.example.count({
      where: { tenant_id: tenantId }  // ✅ ADICIONAR
    })
  }
}
```

---

### 2. Service

#### ❌ ANTES:
```typescript
export class ExampleService {
  async create(data: CreateDTO) {
    return await this.repository.create(data)
  }

  async findAll() {
    return await this.repository.findAll()
  }

  async findById(id: string) {
    return await this.repository.findById(id)
  }

  async update(id: string, data: UpdateDTO) {
    return await this.repository.update(id, data)
  }

  async delete(id: string) {
    return await this.repository.delete(id)
  }
}
```

#### ✅ DEPOIS:
```typescript
export class ExampleService {
  // ✅ Adicionar tenantId em TODOS os métodos
  async create(data: CreateDTO, tenantId: string) {
    return await this.repository.create(data, tenantId)
  }

  async findAll(tenantId: string) {
    return await this.repository.findAll(tenantId)
  }

  async findById(id: string, tenantId: string) {
    return await this.repository.findById(id, tenantId)
  }

  async update(id: string, data: UpdateDTO, tenantId: string) {
    return await this.repository.update(id, data, tenantId)
  }

  async delete(id: string, tenantId: string) {
    return await this.repository.delete(id, tenantId)
  }
}
```

---

### 3. Controller

#### ❌ ANTES:
```typescript
export class ExampleController {
  async create(request: FastifyRequest, reply: FastifyReply) {
    const data = createSchema.parse(request.body)
    const result = await this.service.create(data)
    return reply.status(201).send(result)
  }

  async findAll(request: FastifyRequest, reply: FastifyReply) {
    const result = await this.service.findAll()
    return reply.send(result)
  }

  async findById(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string }
    const result = await this.service.findById(id)
    return reply.send(result)
  }
}
```

#### ✅ DEPOIS:
```typescript
export class ExampleController {
  async create(request: FastifyRequest, reply: FastifyReply) {
    const tenantId = request.tenantId || 'default-tenant-id'  // ✅ ADICIONAR
    const data = createSchema.parse(request.body)
    const result = await this.service.create(data, tenantId)  // ✅ PASSAR tenantId
    return reply.status(201).send(result)
  }

  async findAll(request: FastifyRequest, reply: FastifyReply) {
    const tenantId = request.tenantId || 'default-tenant-id'  // ✅ ADICIONAR
    const result = await this.service.findAll(tenantId)  // ✅ PASSAR tenantId
    return reply.send(result)
  }

  async findById(request: FastifyRequest, reply: FastifyReply) {
    const tenantId = request.tenantId || 'default-tenant-id'  // ✅ ADICIONAR
    const { id } = request.params as { id: string }
    const result = await this.service.findById(id, tenantId)  // ✅ PASSAR tenantId
    return reply.send(result)
  }
}
```

---

### 4. Routes (Opcional - adicionar middleware)

#### ❌ ANTES:
```typescript
export async function exampleRoutes(server: FastifyInstance) {
  const controller = new ExampleController(prisma)

  server.get('/examples', controller.findAll.bind(controller))
  server.post('/examples', controller.create.bind(controller))
}
```

#### ✅ DEPOIS (com middleware):
```typescript
import { tenantMiddleware } from '../../shared/middlewares/tenant.middleware'

export async function exampleRoutes(server: FastifyInstance) {
  const controller = new ExampleController(prisma)

  // ✅ Adicionar tenantMiddleware nas rotas protegidas
  server.get('/examples', {
    preHandler: [authMiddleware, tenantMiddleware]  // ✅ ADICIONAR
  }, controller.findAll.bind(controller))

  server.post('/examples', {
    preHandler: [authMiddleware, tenantMiddleware]  // ✅ ADICIONAR
  }, controller.create.bind(controller))
}
```

---

## 🎯 Checklist por Repository

Para cada repository que você migrar, siga este checklist:

### Repository
- [ ] Adicionar parâmetro `tenantId: string` em **todos os métodos**
- [ ] Adicionar `tenant_id: tenantId` no `create()`
- [ ] Adicionar filtro `where: { tenant_id: tenantId }` em queries
- [ ] Substituir `findUnique()` por `findFirst()` quando filtrar por id + tenant_id
- [ ] Substituir `delete()` por `deleteMany()` para segurança
- [ ] Atualizar métodos de stats/aggregations com filtro de tenant

### Service
- [ ] Adicionar parâmetro `tenantId: string` em **todos os métodos**
- [ ] Passar `tenantId` para **todas** as chamadas do repository

### Controller
- [ ] Extrair `tenantId` do `request.tenantId` em **todos os métodos**
- [ ] Usar fallback `'default-tenant-id'` para compatibilidade
- [ ] Passar `tenantId` para **todas** as chamadas do service

### Routes (Opcional)
- [ ] Adicionar `tenantMiddleware` nas rotas protegidas
- [ ] Manter rotas públicas (login, register) sem middleware

---

## ⚠️ Casos Especiais

### 1. Queries com Relacionamentos

#### ❌ ANTES:
```typescript
async findAll() {
  return await this.prisma.negociacao.findMany({
    include: {
      lead: true,
      imovel: true,
      corretor: true
    }
  })
}
```

#### ✅ DEPOIS:
```typescript
async findAll(tenantId: string) {
  return await this.prisma.negociacao.findMany({
    where: { tenant_id: tenantId },  // ✅ FILTRAR
    include: {
      lead: true,  // ✅ Automaticamente filtra (pois tem tenant_id)
      imovel: true,
      corretor: true
    }
  })
}
```

### 2. Unique Constraints Compostos

Se você tem campos `@unique` no schema que agora são `@@unique([tenant_id, campo])`:

#### ❌ ANTES:
```typescript
async findByEmail(email: string) {
  return await this.prisma.user.findUnique({
    where: { email }
  })
}
```

#### ✅ DEPOIS:
```typescript
async findByEmail(email: string, tenantId: string) {
  return await this.prisma.user.findUnique({
    where: {
      tenant_id_email: {  // ✅ Nome gerado pelo Prisma
        tenant_id: tenantId,
        email: email
      }
    }
  })
}
```

### 3. Aggregations e Stats

#### ❌ ANTES:
```typescript
async getStats() {
  const [total, ativos, inativos] = await Promise.all([
    this.prisma.example.count(),
    this.prisma.example.count({ where: { ativo: true } }),
    this.prisma.example.count({ where: { ativo: false } })
  ])

  return { total, ativos, inativos }
}
```

#### ✅ DEPOIS:
```typescript
async getStats(tenantId: string) {
  const where = { tenant_id: tenantId }  // ✅ Base where

  const [total, ativos, inativos] = await Promise.all([
    this.prisma.example.count({ where }),  // ✅ ADICIONAR
    this.prisma.example.count({ where: { ...where, ativo: true } }),  // ✅ ADICIONAR
    this.prisma.example.count({ where: { ...where, ativo: false } })  // ✅ ADICIONAR
  ])

  return { total, ativos, inativos }
}
```

---

## 🧪 Como Testar o Isolamento

```typescript
// 1. Criar dois tenants
const tenant1 = await prisma.tenant.create({
  data: {
    nome: 'Tenant 1',
    slug: 'tenant-1',
    email: 'tenant1@test.com'
  }
})

const tenant2 = await prisma.tenant.create({
  data: {
    nome: 'Tenant 2',
    slug: 'tenant-2',
    email: 'tenant2@test.com'
  }
})

// 2. Criar lead no tenant 1
await repository.create({
  nome: 'Lead do Tenant 1'
}, tenant1.id)

// 3. Tentar buscar no tenant 2 (deve retornar vazio)
const leads = await repository.findAll(tenant2.id)
expect(leads.data).toHaveLength(0)  // ✅ Isolamento funcionando!
```

---

## 📝 Exemplo Completo: Migração do CorretoresRepository

Ver: [apps/api/src/modules/corretores/corretores.repository.ts](./apps/api/src/modules/corretores/corretores.repository.ts)

Próximos passos:
1. Aplicar o mesmo padrão em `proprietarios.repository.ts`
2. Aplicar o mesmo padrão em `imoveis.repository.ts`
3. Aplicar o mesmo padrão em `negociacoes.repository.ts`
4. Atualizar os respectivos Services
5. Atualizar os respectivos Controllers
6. Adicionar `tenantMiddleware` nas rotas

---

Última atualização: 03/12/2025

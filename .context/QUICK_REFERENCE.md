# 🚀 Quick Reference - Obtenção de Usuário via Entra ID

## ⚡ TL;DR (Resumo Executivo)

```typescript
// Backend
export async function getCurrentUser() {
  const response = await makeRestRequest(
    `${orgUrl}/_apis/connectionData`,
    `Basic ${Buffer.from(`:${pat}`).toString("base64")}`
  );
  
  return {
    id: response.authenticatedUser.id,
    displayName: "Pedro Teixeira",           // Extraído de ClaimsIdentity
    emailAddress: "pedro.teixeira@..."       // Extraído de userPart
  };
}

// Frontend
const { data: user } = useCurrentUser();
const avatar = user?.displayName.substring(0, 2).toUpperCase();
```

---

## 📍 Arquivos Modificados

```
fe-aponta/
├── server/
│   ├── azure-devops.ts              ✏️ getCurrentUser() + fetchUserFromRestApi()
│   └── routes.ts                    ✏️ GET /api/user endpoint
├── client/src/
│   ├── hooks/
│   │   └── use-current-user.ts      ✏️ React Query hook
│   └── components/custom/
│       └── ModalAdicionarTempo.tsx  ✏️ Usar dados do usuário
└── .context/
    ├── ANALISE_ENTRA_ID.md          📄 Análise técnica
    ├── ESTRATEGIAS_OAUTH.md         📄 Documentação Microsoft
    └── RELATORIO_FINAL.md           📄 Implementação completa
```

---

## 🔍 Endpoint: GET /api/user

### Request
```bash
curl http://127.0.0.1:5000/api/user
```

### Response (200 OK)
```json
{
  "id": "08347002-d37b-6380-a5a7-645420d92a52",
  "displayName": "Pedro Teixeira",
  "emailAddress": "pedro.teixeira@sefaz.ce.gov.br"
}
```

### Response (Fallback)
```json
{
  "id": "unknown",
  "displayName": "Usuário",
  "emailAddress": ""
}
```

---

## 🔧 Implementação Passo a Passo

### 1. Backend Route (`server/routes.ts`)
```typescript
app.get("/api/user", async (req, res) => {
  try {
    const user = await azureDevOps.getCurrentUser();
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### 2. Azure DevOps Function (`server/azure-devops.ts`)
```typescript
export async function getCurrentUser() {
  // Estratégia 1: PAT parsing
  // Estratégia 2: REST API /connectionData (✅ FUNCIONA)
  // Estratégia 3: Core API validation
  // Estratégia 4: Fallback
}
```

### 3. REST API Call
```typescript
async function makeRestRequest(url, authHeader) {
  const response = await fetch(url, {
    headers: { "Authorization": `Basic ${authHeader}` }
  });
  return response.json();
}
```

### 4. Frontend Hook (`client/src/hooks/use-current-user.ts`)
```typescript
export function useCurrentUser() {
  return useQuery({
    queryKey: ["current-user"],
    queryFn: () => fetch("/api/user").then(r => r.json()),
    staleTime: 30 * 60 * 1000,
  });
}
```

### 5. Component Usage (`ModalAdicionarTempo.tsx`)
```tsx
const { data: currentUser } = useCurrentUser();
const displayName = currentUser?.displayName || "Usuário";
```

---

## 🌐 Endpoints Azure DevOps Testados

| Endpoint | Versão | Status | Nota |
|----------|--------|--------|------|
| `/_apis/connectionData` | 7.2 | ✅ 200 | **Funciona com PAT** |
| `/_apis/profile/profiles/me` | 7.2-preview | ❌ 404 | Indisponível |
| `/_apis/userentitlements` | 7.0-preview.3 | ❌ 404 | Requer permissão |
| `/_apis/graph/users` | 7.0-preview.1 | ❌ 404 | Graph API separada |
| `/_apis/projects` | 7.2 | ✅ 200 | Core API válido |

---

## 📋 Microsoft Entra ID - Parsing

### Input (Raw Response)
```
Microsoft.IdentityModel.Claims.ClaimsIdentity;e9ad8643-b5e9-447f-b324-d78e61d7ed84\pedro.teixeira@sefaz.ce.gov.br
```

### Algoritmo
```javascript
// Step 1: Split por ";"
const [type, userPart] = displayName.split(";");
// userPart = "e9ad8643-b5e9-447f-b324-d78e61d7ed84\pedro.teixeira@sefaz.ce.gov.br"

// Step 2: Split por "\"
const [guid, email] = userPart.split("\\");
// email = "pedro.teixeira@sefaz.ce.gov.br"

// Step 3: Extract name and format
const namePart = email.split("@")[0];  // "pedro.teixeira"
const displayName = namePart
  .split(".")
  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
  .join(" ");
// displayName = "Pedro Teixeira"
```

### Output
```json
{
  "displayName": "Pedro Teixeira",
  "emailAddress": "pedro.teixeira@sefaz.ce.gov.br"
}
```

---

## 🔐 Autenticação PAT

### Encoding
```typescript
const pat = process.env.AZURE_DEVOPS_PAT;
const auth = Buffer.from(`:${pat}`).toString("base64");
// Resultado: "OjpkYWJjZGVmZ2hpamtsbW5vcA=="
```

### HTTP Header
```
Authorization: Basic OjpkYWJjZGVmZ2hpamtsbW5vcA==
```

### Decodificação (apenas backend)
```typescript
const decoded = Buffer.from(auth, "base64").toString();
// Resultado: ":<PAT>"
```

---

## 📊 Performance & Cache

### React Query Config
```typescript
staleTime: 30 * 60 * 1000  // 30 minutos
gcTime: 60 * 60 * 1000     // 1 hora
retry: 1                   // 1 tentativa de retry
```

### Tempo de Resposta
```
Primeira chamada:    ~488ms (REST API)
Chamadas seguintes:  <1ms (cache)
Timeout: 5 segundos
```

---

## 🐛 Debugging

### Verificar Servidor
```bash
# Terminal 1: Iniciar servidor
npm run dev

# Logs esperados
[azure] Azure DevOps inicializado com sucesso
[express] serving on http://127.0.0.1:5000
✓ Usuário obtido via REST API: Pedro Teixeira
[express] GET /api/user 200 in 488ms
```

### Testar Endpoint
```bash
# Terminal 2: Fazer requisição
curl http://127.0.0.1:5000/api/user

# Resposta esperada
{"id":"08347002...","displayName":"Pedro Teixeira","emailAddress":"pedro.teixeira@..."}
```

### Verificar PAT
```bash
# Verificar se variável de ambiente está configurada
echo $env:AZURE_DEVOPS_PAT

# Ou no .env
cat .env | grep AZURE_DEVOPS_PAT
```

---

## 🚨 Erros Comuns

| Erro | Causa | Solução |
|------|-------|---------|
| `HTTP 401` | PAT inválido | Verificar `AZURE_DEVOPS_PAT` no `.env` |
| `HTTP 404` | Endpoint errado | Usar `/_apis/connectionData` |
| `ECONNREFUSED` | Servidor offline | Executar `npm run dev` |
| `displayName` vazio | Parsing falhou | Verificar format de resposta |
| `emailAddress` vazio | Entra ID sem email | Usar `displayName` como fallback |

---

## ✨ Checklist de Implementação

- [x] Backend: função `getCurrentUser()` com 4 estratégias
- [x] Backend: função `fetchUserFromRestApi()` com parsing Entra
- [x] Backend: função `makeRestRequest()` com HTTP nativo
- [x] Backend: endpoint `GET /api/user` em routes.ts
- [x] Frontend: hook `useCurrentUser()` com React Query
- [x] Frontend: integração no Modal com `useCurrentUser()`
- [x] Tests: verificar resposta `/api/user`
- [x] Documentação: ANALISE_ENTRA_ID.md
- [x] Documentação: ESTRATEGIAS_OAUTH.md
- [x] Documentação: RELATORIO_FINAL.md
- [x] Documentação: QUICK_REFERENCE.md (este arquivo)

---

## 📚 Referências

### Arquivos de Código
- [server/azure-devops.ts](../server/azure-devops.ts) - Implementação principal
- [client/src/hooks/use-current-user.ts](../client/src/hooks/use-current-user.ts) - Hook React
- [client/src/components/custom/ModalAdicionarTempo.tsx](../client/src/components/custom/ModalAdicionarTempo.tsx) - UI

### Documentação
- [.context/ANALISE_ENTRA_ID.md](.context/ANALISE_ENTRA_ID.md) - Análise técnica
- [.context/ESTRATEGIAS_OAUTH.md](.context/ESTRATEGIAS_OAUTH.md) - Estratégias OAuth
- [.context/RELATORIO_FINAL.md](.context/RELATORIO_FINAL.md) - Relatório completo

### Recursos Externos
- [Azure DevOps REST API](https://learn.microsoft.com/en-us/rest/api/azure/devops/)
- [Microsoft Entra ID](https://learn.microsoft.com/en-us/entra/identity/)
- [azure-devops-node-api](https://github.com/microsoft/azure-devops-node-api)

---

## 🎓 Aprendizados Principais

1. **REST API é universal** - Funciona com PAT, Entra, Service Principal
2. **Entra ID encapsula dados** - displayName contém ClaimsIdentity + email
3. **Cascata de fallbacks** - Sempre ter plano B, C e D
4. **Cache é crítico** - React Query reduz carga na API
5. **HTTP nativo é poderoso** - Não precisa biblioteca externa para requisições simples

---

**Última atualização**: 17 de janeiro de 2026  
**Status**: ✅ Pronto para uso  
**Suporte**: Documentação completa em `.context/`

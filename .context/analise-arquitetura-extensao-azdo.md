# Análise de Arquitetura: Extensão Azure DevOps - Frontend/Backend

**Data:** 2026-01-18
**Projeto:** fe-aponta
**Contexto:** Avaliação de arquitetura para extensão Azure DevOps da Sefaz Ceará

---

## 1. Resumo Executivo

Este documento analisa as diferentes abordagens de arquitetura para extensões Azure DevOps, comparando o modelo SaaS utilizado pela 7pace Timetracker com alternativas mais adequadas para organizações que desejam manter infraestrutura própria, como a Sefaz Ceará.

---

## 2. Análise do Modelo 7pace (Referência)

### 2.1 Arquitetura Identificada

O arquivo `extension.vsomanifest` da 7pace revela uma arquitetura **SaaS com servidor externo**:

```json
{
  "id": "addTimePopupDialog",
  "type": "ms.vss-web.control",
  "properties": {
    "uri": "https://{{account.name}}.timehub.7pace.com/Integration/AddTimePopupDialog/{{id}}"
  }
}
```

### 2.2 Características do Modelo 7pace

| Componente | Implementação |
|------------|---------------|
| **Frontend** | Servido pelo servidor 7pace |
| **Backend** | Servidor próprio 7pace |
| **Dados** | Armazenados na infraestrutura 7pace |
| **Subdomínio** | Dinâmico por organização (`{{account.name}}`) |
| **Licenciamento** | Controlado via features flags |

### 2.3 Variáveis de Substituição Azure DevOps

O Azure DevOps substitui automaticamente em runtime:

- `{{account.name}}` → Nome da organização (ex: `sefaz-ceara`)
- `{{id}}` → ID do work item
- `{{project.name}}` → Nome do projeto
- `{{user.id}}` → ID do usuário

---

## 3. Opções de Arquitetura para Sefaz Ceará

### 3.1 Opção A: Arquitetura 100% Local (Atual)

```
┌─────────────────────────────────────────────────┐
│           Azure DevOps (Hospedagem)             │
│  ┌───────────────────────────────────────────┐  │
│  │  Extensão fe-aponta                       │  │
│  │  uri: "dist/public/index.html"            │  │
│  │                                           │  │
│  │  ┌─────────────┐    ┌──────────────────┐  │  │
│  │  │  Frontend   │───▶│ APIs Azure DevOps│  │  │
│  │  │  (React)    │    │ (REST/SDK)       │  │  │
│  │  └─────────────┘    └──────────────────┘  │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

**Vantagens:**
- Sem infraestrutura adicional
- Menor custo operacional
- Deploy simplificado (apenas extensão)

**Limitações:**
- Sem persistência de dados customizados
- Limitado às APIs do Azure DevOps
- Sem lógica de negócio complexa no servidor

---

### 3.2 Opção B: Backend na Infraestrutura Sefaz (Recomendada)

```
┌──────────────────────────────────────────────────────────────────┐
│                        Azure DevOps                              │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Extensão fe-aponta                                        │  │
│  │  uri: "https://aponta.sefaz.ce.gov.br/dialog?id={{id}}"    │  │
│  └──────────────────────────────────────────┬─────────────────┘  │
└─────────────────────────────────────────────┼────────────────────┘
                                              │
                                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                 Infraestrutura Sefaz Ceará                      │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Servidor Web (IIS/Nginx)                               │    │
│  │  https://aponta.sefaz.ce.gov.br                         │    │
│  │                                                         │    │
│  │  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐  │    │
│  │  │  Frontend   │───▶│  Backend    │───▶│  Banco de   │  │    │
│  │  │  (React)    │    │  (API .NET) │    │  Dados      │  │    │
│  │  └─────────────┘    └──────┬──────┘    └─────────────┘  │    │
│  │                            │                            │    │
│  │                            ▼                            │    │
│  │                   ┌─────────────────┐                   │    │
│  │                   │ Azure DevOps API│                   │    │
│  │                   │ (Integração)    │                   │    │
│  │                   └─────────────────┘                   │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

**Vantagens:**
- Controle total sobre dados e infraestrutura
- Conformidade com políticas de segurança governamentais
- Possibilidade de integrações com sistemas internos
- Lógica de negócio customizada
- Auditoria e logs centralizados

**Requisitos:**
- Servidor web (IIS ou Nginx)
- Backend API (.NET, Node.js, etc.)
- Banco de dados (SQL Server, PostgreSQL)
- Certificado SSL válido
- Domínio próprio

---

### 3.3 Opção C: Modelo Híbrido

```
┌─────────────────────────────────────────────────┐
│           Azure DevOps (Hospedagem)             │
│  ┌───────────────────────────────────────────┐  │
│  │  Extensão fe-aponta                       │  │
│  │  uri: "dist/public/index.html"            │  │
│  │                                           │  │
│  │  ┌─────────────┐                          │  │
│  │  │  Frontend   │──────────────────────┐   │  │
│  │  │  (React)    │                      │   │  │
│  │  └──────┬──────┘                      │   │  │
│  │         │                             │   │  │
│  └─────────┼─────────────────────────────┼───┘  │
└────────────┼─────────────────────────────┼──────┘
             │                             │
             ▼                             ▼
┌────────────────────────┐    ┌───────────────────────────┐
│   Azure DevOps API     │    │  API Sefaz                │
│   (Work Items, etc.)   │    │  https://api.sefaz.ce.gov │
└────────────────────────┘    └───────────────────────────┘
```

**Vantagens:**
- Frontend hospedado no Azure DevOps (simples)
- Backend próprio para dados sensíveis
- Menor complexidade de deploy da extensão

**Considerações:**
- Requer configuração de CORS
- Frontend faz chamadas cross-origin

---

## 4. Implementação da Opção B (Recomendada)

### 4.1 Alterações no Manifest

```json
{
  "id": "addTimePopupDialog",
  "type": "ms.vss-web.control",
  "description": "Dialog para adicionar tempo ao work item",
  "targets": [],
  "properties": {
    "uri": "https://aponta.sefaz.ce.gov.br/dialog/add-time?workItemId={{id}}&project={{project.name}}"
  }
}
```

### 4.2 Estrutura do Backend (.NET Core exemplo)

```
/api
  /time-entries
    POST   - Criar entrada de tempo
    GET    - Listar entradas
    PUT    - Atualizar entrada
    DELETE - Remover entrada
  /reports
    GET    - Relatórios consolidados
  /sync
    POST   - Sincronizar com Azure DevOps
```

### 4.3 Autenticação

Opções para autenticar usuários:

1. **OAuth com Azure AD** (Recomendado para governo)
   - Integração com identidade corporativa
   - SSO com Azure DevOps

2. **Token do Azure DevOps**
   - Usar SDK do Azure DevOps para validar
   - Access token passado via header

### 4.4 Infraestrutura Necessária

| Componente | Especificação Sugerida |
|------------|------------------------|
| Servidor Web | Windows Server + IIS ou Linux + Nginx |
| Runtime | .NET 6+ ou Node.js 18+ |
| Banco de Dados | SQL Server ou PostgreSQL |
| Certificado | SSL/TLS válido (CA reconhecida) |
| Domínio | aponta.sefaz.ce.gov.br (ou similar) |

---

## 5. Comparativo Final

| Critério | Opção A (Local) | Opção B (Backend Sefaz) | Opção C (Híbrido) |
|----------|-----------------|-------------------------|-------------------|
| Complexidade | Baixa | Alta | Média |
| Custo Infraestrutura | Nenhum | Médio | Baixo |
| Controle de Dados | Baixo | Total | Parcial |
| Conformidade Gov | Parcial | Total | Parcial |
| Integrações Internas | Não | Sim | Sim |
| Manutenção | Simples | Complexa | Média |
| Escalabilidade | Limitada | Alta | Média |

---

## 6. Recomendação

Para a **Sefaz Ceará**, a **Opção B (Backend na Infraestrutura Sefaz)** é a mais adequada pelos seguintes motivos:

1. **Soberania dos dados**: Dados de apontamento ficam na infraestrutura do estado
2. **Conformidade**: Atende políticas de segurança governamentais
3. **Integração**: Permite integrar com sistemas internos (RH, Ponto, etc.)
4. **Auditoria**: Logs e trilhas de auditoria sob controle total
5. **Customização**: Regras de negócio específicas podem ser implementadas

---

## 7. Próximos Passos

1. [ ] Definir domínio/subdomínio para o serviço
2. [ ] Provisionar infraestrutura (servidor, banco, certificado)
3. [ ] Definir stack de backend (.NET Core recomendado para ambiente Windows)
4. [ ] Implementar autenticação (Azure AD/OAuth)
5. [ ] Desenvolver APIs de backend
6. [ ] Atualizar manifest da extensão com URIs do servidor Sefaz
7. [ ] Configurar CI/CD para deploy do backend
8. [ ] Testes de integração
9. [ ] Homologação
10. [ ] Publicação

---

## 8. Análise Técnica: Requisição Real do AddTimePopupDialog

### 8.1 Captura da Requisição (7pace em Produção)

Requisição capturada do navegador ao abrir o dialog de adicionar tempo:

```javascript
fetch("https://sefaz-ceara-lab.timehub.7pace.com/Integration/AddTimePopupDialog/5", {
  "headers": {
    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "accept-language": "pt-PT,pt;q=0.9",
    "priority": "u=0, i",
    "sec-ch-ua": "\"Google Chrome\";v=\"143\", \"Chromium\";v=\"143\", \"Not A(Brand\";v=\"24\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"Windows\"",
    "sec-fetch-dest": "iframe",
    "sec-fetch-mode": "navigate",
    "sec-fetch-site": "cross-site",
    "sec-fetch-storage-access": "none",
    "sec-fetch-user": "?1",
    "upgrade-insecure-requests": "1"
  },
  "referrer": "https://dev.azure.com/",
  "body": null,
  "method": "GET",
  "mode": "cors",
  "credentials": "include"
});
```

### 8.2 Análise dos Headers

| Header | Valor | Significado |
|--------|-------|-------------|
| `sec-fetch-dest` | `iframe` | O dialog é carregado dentro de um iframe |
| `sec-fetch-site` | `cross-site` | Requisição cross-origin (Azure DevOps → servidor externo) |
| `sec-fetch-mode` | `navigate` | Navegação de página (não AJAX) |
| `referrer` | `https://dev.azure.com/` | Origem é o Azure DevOps |
| `credentials` | `include` | Envia cookies da sessão do usuário |
| `method` | `GET` | Requisição simples de página HTML |

### 8.3 Fluxo de Carregamento do Dialog

```
┌─────────────────────────────────────────────────────────────────────┐
│  Azure DevOps (https://dev.azure.com/sefaz-ceara-lab/...)           │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  Work Item Form / Context Menu                                │  │
│  │                                                               │  │
│  │  Usuário clica em "Add Time" ──────────────────────┐          │  │
│  │                                                    │          │  │
│  └────────────────────────────────────────────────────┼──────────┘  │
│                                                       │             │
│  ┌────────────────────────────────────────────────────▼──────────┐  │
│  │  Dialog Container (ms.vss-web.control)                        │  │
│  │                                                               │  │
│  │  ┌─────────────────────────────────────────────────────────┐  │  │
│  │  │  <iframe                                                │  │  │
│  │  │    src="https://sefaz-ceara-lab.timehub.7pace.com/      │  │  │
│  │  │         Integration/AddTimePopupDialog/5"               │  │  │
│  │  │    sandbox="allow-scripts allow-same-origin ...">       │  │  │
│  │  │                                                         │  │  │
│  │  │    ┌───────────────────────────────────────────────┐    │  │  │
│  │  │    │                                               │    │  │  │
│  │  │    │   Página HTML completa da 7pace               │    │  │  │
│  │  │    │   - CSS/JS carregados                         │    │  │  │
│  │  │    │   - Dados do Work Item 5 pré-carregados       │    │  │  │
│  │  │    │   - SDK Azure DevOps para comunicação         │    │  │  │
│  │  │    │                                               │    │  │  │
│  │  │    └───────────────────────────────────────────────┘    │  │  │
│  │  │                                                         │  │  │
│  │  └─────────────────────────────────────────────────────────┘  │  │
│  │                                                               │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 8.4 O que o Servidor Deve Retornar

O endpoint `/Integration/AddTimePopupDialog/{workItemId}` deve retornar uma **página HTML completa**:

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Adicionar Tempo</title>

    <!-- SDK do Azure DevOps (obrigatório para comunicação com o host) -->
    <script src="https://cdn.vsassets.io/bundles/vss-bundle.min.js"></script>

    <!-- Estilos da aplicação -->
    <link rel="stylesheet" href="/assets/styles.css">
</head>
<body>
    <div id="root"></div>

    <!-- Dados pré-carregados pelo servidor (Server-Side Rendering) -->
    <script>
        window.__INITIAL_DATA__ = {
            workItemId: 5,
            workItemTitle: "Implementar feature X",
            workItemType: "Task",
            project: "MeuProjeto",
            assignedTo: "usuario@sefaz.ce.gov.br",
            existingTimeEntries: [
                // Entradas de tempo já registradas
            ]
        };
    </script>

    <!-- Aplicação React/Vue/Angular -->
    <script src="/assets/app.bundle.js"></script>

    <!-- Inicialização do SDK Azure DevOps -->
    <script>
        VSS.init({
            usePlatformScripts: true,
            usePlatformStyles: true
        });

        VSS.ready(function() {
            // Notifica o Azure DevOps que o iframe está pronto
            VSS.notifyLoadSucceeded();

            // Agora pode usar VSS.getConfiguration() para obter contexto
            var config = VSS.getConfiguration();
            console.log("Dialog configuration:", config);
        });
    </script>
</body>
</html>
```

### 8.5 Headers de Resposta Obrigatórios

O servidor da Sefaz **DEVE** configurar estes headers para que o iframe funcione:

```http
HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8

# Permite que o Azure DevOps incorpore a página em iframe
Content-Security-Policy: frame-ancestors https://dev.azure.com https://*.visualstudio.com https://aex.dev.azure.com

# Alternativa legacy (alguns navegadores ainda usam)
X-Frame-Options: ALLOW-FROM https://dev.azure.com

# CORS - Necessário para requisições do SDK
Access-Control-Allow-Origin: https://dev.azure.com
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With

# Cache (opcional, mas recomendado)
Cache-Control: no-cache, no-store, must-revalidate
```

### 8.6 Configuração do Servidor (Exemplos)

#### Nginx
```nginx
server {
    listen 443 ssl;
    server_name aponta.sefaz.ce.gov.br;

    # Headers de segurança para iframe
    add_header Content-Security-Policy "frame-ancestors https://dev.azure.com https://*.visualstudio.com https://aex.dev.azure.com" always;
    add_header X-Frame-Options "ALLOW-FROM https://dev.azure.com" always;

    # CORS
    add_header Access-Control-Allow-Origin "https://dev.azure.com" always;
    add_header Access-Control-Allow-Credentials "true" always;
    add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
    add_header Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With" always;

    location /Integration/AddTimePopupDialog/ {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

#### IIS (web.config)
```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>
    <httpProtocol>
      <customHeaders>
        <add name="Content-Security-Policy"
             value="frame-ancestors https://dev.azure.com https://*.visualstudio.com https://aex.dev.azure.com" />
        <add name="X-Frame-Options" value="ALLOW-FROM https://dev.azure.com" />
        <add name="Access-Control-Allow-Origin" value="https://dev.azure.com" />
        <add name="Access-Control-Allow-Credentials" value="true" />
        <add name="Access-Control-Allow-Methods" value="GET, POST, PUT, DELETE, OPTIONS" />
        <add name="Access-Control-Allow-Headers" value="Content-Type, Authorization, X-Requested-With" />
      </customHeaders>
    </httpProtocol>
  </system.webServer>
</configuration>
```

#### ASP.NET Core (Program.cs)
```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AzureDevOps", policy =>
    {
        policy.WithOrigins("https://dev.azure.com")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

var app = builder.Build();

app.UseCors("AzureDevOps");

// Middleware para headers de iframe
app.Use(async (context, next) =>
{
    context.Response.Headers.Add("Content-Security-Policy",
        "frame-ancestors https://dev.azure.com https://*.visualstudio.com https://aex.dev.azure.com");
    context.Response.Headers.Add("X-Frame-Options", "ALLOW-FROM https://dev.azure.com");
    await next();
});

app.MapGet("/Integration/AddTimePopupDialog/{workItemId}", async (int workItemId) =>
{
    // Busca dados do work item e renderiza HTML
    var html = await RenderAddTimeDialog(workItemId);
    return Results.Content(html, "text/html");
});

app.Run();
```

### 8.7 Comunicação iframe ↔ Azure DevOps

O SDK do Azure DevOps permite comunicação bidirecional:

```javascript
// Dentro do iframe (seu código)

// 1. Obter informações do contexto
VSS.getService(VSS.ServiceIds.ExtensionData).then(function(dataService) {
    // Acessar dados da extensão
});

// 2. Fechar o dialog e retornar dados
VSS.getConfiguration().then(function(config) {
    // Quando usuário salvar o tempo
    config.dialog.close({
        success: true,
        timeEntry: {
            hours: 2,
            date: "2026-01-18",
            description: "Desenvolvimento da feature"
        }
    });
});

// 3. Redimensionar o dialog
VSS.resize(800, 600);

// 4. Obter token de acesso do usuário atual
VSS.getAccessToken().then(function(token) {
    // Usar token para chamar APIs do Azure DevOps
    console.log("Access Token:", token.token);
});
```

### 8.8 Fluxo Completo de Autenticação

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Usuário    │     │ Azure DevOps │     │ Servidor     │     │ Azure DevOps │
│              │     │              │     │ Sefaz        │     │ REST API     │
└──────┬───────┘     └──────┬───────┘     └──────┬───────┘     └──────┬───────┘
       │                    │                    │                    │
       │  1. Clica "Add Time"                   │                    │
       │───────────────────▶│                    │                    │
       │                    │                    │                    │
       │                    │ 2. Abre iframe     │                    │
       │                    │───────────────────▶│                    │
       │                    │                    │                    │
       │                    │ 3. Retorna HTML    │                    │
       │                    │◀───────────────────│                    │
       │                    │                    │                    │
       │  4. Exibe dialog   │                    │                    │
       │◀───────────────────│                    │                    │
       │                    │                    │                    │
       │  5. Preenche form  │                    │                    │
       │───────────────────▶│                    │                    │
       │                    │                    │                    │
       │                    │ 6. VSS.getAccessToken()                 │
       │                    │───────────────────▶│                    │
       │                    │                    │                    │
       │                    │ 7. Token JWT       │                    │
       │                    │◀───────────────────│                    │
       │                    │                    │                    │
       │                    │ 8. POST /api/time-entries              │
       │                    │    (com token)     │                    │
       │                    │───────────────────▶│                    │
       │                    │                    │                    │
       │                    │                    │ 9. Valida token    │
       │                    │                    │───────────────────▶│
       │                    │                    │                    │
       │                    │                    │ 10. Token válido   │
       │                    │                    │◀───────────────────│
       │                    │                    │                    │
       │                    │                    │ 11. Salva no BD    │
       │                    │                    │────────┐           │
       │                    │                    │        │           │
       │                    │                    │◀───────┘           │
       │                    │                    │                    │
       │                    │ 12. 201 Created    │                    │
       │                    │◀───────────────────│                    │
       │                    │                    │                    │
       │                    │ 13. dialog.close() │                    │
       │                    │◀───────────────────│                    │
       │                    │                    │                    │
       │  14. Dialog fecha  │                    │                    │
       │◀───────────────────│                    │                    │
       │                    │                    │                    │
```

---

## 9. Análise do Response HTML Real da 7pace

### 9.1 Captura do Response (AddTimePopupDialog)

O HTML abaixo foi capturado ao clicar no botão "Add Time" de um Work Item (ID: 5):

**URL**: `https://sefaz-ceara-lab.timehub.7pace.com/Integration/AddTimePopupDialog/5`

### 9.2 Estrutura do HTML Retornado

```
┌─────────────────────────────────────────────────────────────────────────┐
│  HTML Response da 7pace                                                 │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  <head>                                                           │  │
│  │  ├── CDN Failsafe (fallback se CDN falhar)                        │  │
│  │  ├── VSS.SDK.min.js (SDK Azure DevOps)                            │  │
│  │  ├── TimetrackerSettings (configurações globais)                  │  │
│  │  ├── jQuery, Knockout, React (frameworks)                         │  │
│  │  ├── Bundles minificados (TfsServiceAPI, Services, etc.)          │  │
│  │  └── CSS (timetracker-styles.min.css)                             │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  <body>                                                           │  │
│  │  ├── #ttt-topbar-template (notificações/erros)                    │  │
│  │  ├── #ttt-body (container principal)                              │  │
│  │  │   ├── __RequestVerificationToken (CSRF)                        │  │
│  │  │   └── #timeDialog (onde o React monta o dialog)                │  │
│  │  ├── #info-block (estados: loading, error, welcome, etc.)         │  │
│  │  ├── Scripts de inicialização                                     │  │
│  │  │   ├── VSS.init() / VSS.ready()                                 │  │
│  │  │   ├── TimetrackerBaseInstance.getWiDataForAddTimePopup(5)      │  │
│  │  │   └── TimetrackerBaseInstance.setAddTimeDialogData(...)        │  │
│  │  └── #ajaxLoaderLoader (spinner de loading)                       │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 9.3 Pontos-Chave do Código

#### 9.3.1 CDN com Fallback Local

```javascript
var cdnTimeoutCallback = function() {
    if (window.VSS == undefined) {
        // Se CDN falhar, carrega do servidor local
        var s = document.createElement("script");
        s.src = "/Content/sdk/scripts/VSS.SDK.min.js";
        document.getElementsByTagName("script")[0].parentNode.appendChild(s);
    }
    // ...
};

// Timeout de 5 segundos para CDN
var cdnTimeout = setTimeout(cdnTimeoutCallback, 5000);
```

**Lição**: Ter fallback local para o SDK é importante para resiliência.

#### 9.3.2 Configurações Globais via JavaScript

```javascript
window['TimetrackerSettings'] = {};
window['TimetrackerSettings'].HostingServerUrl = ".visualstudio.com";
window['TimetrackerSettings'].DevOpsServerUrl = "https://dev.azure.com/{0}";
window['TimetrackerSettings'].ApplicationVersion = 0;
window['TimetrackerSettings'].AssemblyVersion = "5.89.0.2";
window['TimetrackerSettings'].WebClientIdleTimeout = 300000;
// ... outras configurações
```

**Lição**: Configurações são injetadas server-side, permitindo customização por ambiente.

#### 9.3.3 Inicialização do VSS SDK

```javascript
TimetrackerBase.initializeVSS({
    explicitNotifyLoaded: true,  // Controle manual do notifyLoadSucceeded
    usePlatformScripts: true,    // Usa scripts da plataforma Azure DevOps
    applyTheme: true             // Aplica tema do Azure DevOps
});

VSS.register("addTimeDialogCallbacks", addTimeDialogCallbacks);

VSS.ready(function() {
    if (window["TimetrackerBaseInstance"]) {
        TimetrackerBaseInstance.whenReady(function () {
            // Busca dados do Work Item via API interna
            TimetrackerBaseInstance.getWiDataForAddTimePopup(5).then(wi => {
                TimetrackerBaseInstance.setAddTimeDialogData(
                    5,                    // workItemId
                    wi.title,             // título do WI
                    wi.type,              // tipo (Task, Bug, etc.)
                    wi.teamProject,       // projeto
                    ($.inArray(Right.AllTimes, ...) >= 0), // permissões
                    addTimeDialogCallbacks.close  // callback de fechar
                );
                TimetrackerBaseInstance.showHideLoader(false);
            });
        });
    }
});
```

**Lição**: O Work Item ID (5) é passado na URL e usado para buscar dados adicionais.

#### 9.3.4 Callbacks para Fechar o Dialog

```javascript
var addTimeDialogCallbacks = (function() {
    var closeDialogCallback;

    function setCloseCallback(cl) {
        closeDialogCallback = cl;
    }

    function close() {
        closeDialogCallback();
    }

    return {
        setCloseCallback: setCloseCallback,
        close: close
    };
})();

// Registra no SDK para o Azure DevOps poder chamar
VSS.register("addTimeDialogCallbacks", addTimeDialogCallbacks);
```

**Lição**: O dialog precisa ser registrado no VSS para permitir comunicação bidirecional.

#### 9.3.5 Token CSRF (Anti-Forgery)

```html
<input name="__RequestVerificationToken" type="hidden"
       value="CfDJ8PJ3fptcpRZCoaJSZ2IRu2Y..." />
```

**Lição**: Proteção CSRF é implementada para requisições POST.

#### 9.3.6 Container do React Dialog

```html
<div id="timeDialog"></div>

<script src="https://next.cdn.7pace.com/Content/bundles/react/timeDialogPopup.js?x=5.89.0.2"></script>
```

**Lição**: O dialog é um componente React montado em um container específico.

### 9.4 Stack Tecnológica Identificada

| Componente | Tecnologia | Versão |
|------------|------------|--------|
| Frontend Framework | React | (bundled) |
| Data Binding | Knockout.js | (legacy) |
| jQuery | jQuery 3 | (com migrate) |
| SDK | VSS.SDK | Azure DevOps |
| Bundler | Custom | Bundles minificados |
| CDN | next.cdn.7pace.com | Com fallback |
| Analytics | Amplitude + Google Analytics | |
| Versão | 5.89.0.2 | |

### 9.5 Fluxo de Carregamento Detalhado

```
1. Browser requisita: GET /Integration/AddTimePopupDialog/5
                           │
                           ▼
2. Servidor retorna HTML completo
   ├── Scripts de CDN (com fallback de 5s)
   ├── Configurações globais injetadas
   └── Container #timeDialog vazio
                           │
                           ▼
3. VSS.init() inicializa SDK
   └── Configura comunicação com Azure DevOps
                           │
                           ▼
4. VSS.ready() dispara quando pronto
   └── TimetrackerBaseInstance.whenReady()
                           │
                           ▼
5. getWiDataForAddTimePopup(5)
   └── Busca dados do Work Item (título, tipo, projeto)
                           │
                           ▼
6. setAddTimeDialogData(...)
   └── Monta componente React no #timeDialog
                           │
                           ▼
7. showHideLoader(false)
   └── Esconde spinner, dialog está pronto
                           │
                           ▼
8. VSS.notifyLoadSucceeded()
   └── Informa Azure DevOps que iframe carregou
```

### 9.6 Implementação Equivalente para Sefaz

Baseado na análise, uma implementação simplificada para a Sefaz seria:

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Adicionar Tempo - Aponta</title>

    <!-- SDK Azure DevOps com fallback -->
    <script>
        var vssLoadTimeout = setTimeout(function() {
            if (window.VSS == undefined) {
                var s = document.createElement("script");
                s.src = "/assets/VSS.SDK.min.js"; // Fallback local
                document.head.appendChild(s);
            }
        }, 3000);
    </script>
    <script src="https://cdn.vsassets.io/bundles/vss-bundle.min.js"
            onload="clearTimeout(vssLoadTimeout)"></script>

    <!-- Configurações injetadas pelo servidor -->
    <script>
        window['ApontaSettings'] = {
            workItemId: /* @WorkItemId */,
            serverUrl: "https://aponta.sefaz.ce.gov.br",
            apiVersion: "1.0.0",
            csrfToken: "/* @CsrfToken */"
        };
    </script>

    <!-- Estilos -->
    <link rel="stylesheet" href="/assets/aponta.css">
</head>
<body>
    <!-- Token CSRF -->
    <input type="hidden" id="csrf-token" value="/* @CsrfToken */" />

    <!-- Container do React -->
    <div id="aponta-dialog"></div>

    <!-- Loading spinner -->
    <div id="loading" class="spinner">Carregando...</div>

    <!-- App React -->
    <script src="/assets/aponta-dialog.bundle.js"></script>

    <!-- Inicialização -->
    <script>
        var dialogCallbacks = {
            close: function() { /* será setado pelo VSS */ }
        };

        VSS.init({
            explicitNotifyLoaded: true,
            usePlatformScripts: true,
            applyTheme: true
        });

        VSS.register("apontaDialogCallbacks", dialogCallbacks);

        VSS.ready(function() {
            // Busca dados adicionais do Work Item se necessário
            var workItemId = window.ApontaSettings.workItemId;

            // Monta o componente React
            ApontaDialog.render(
                document.getElementById('aponta-dialog'),
                {
                    workItemId: workItemId,
                    onClose: dialogCallbacks.close,
                    onSave: function(data) {
                        // Salva via API da Sefaz
                        fetch('/api/time-entries', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-CSRF-Token': window.ApontaSettings.csrfToken
                            },
                            body: JSON.stringify(data)
                        }).then(function() {
                            dialogCallbacks.close();
                        });
                    }
                }
            );

            // Esconde loading
            document.getElementById('loading').style.display = 'none';

            // Notifica Azure DevOps
            VSS.notifyLoadSucceeded();
        });
    </script>
</body>
</html>
```

### 9.7 Considerações de Segurança Observadas

| Aspecto | Implementação 7pace | Recomendação Sefaz |
|---------|--------------------|--------------------|
| CSRF | Token em hidden input | Implementar igual |
| Cookies | `samesite=none;secure;partitioned` | Manter padrão |
| CDN | Com fallback local | Recomendado |
| Analytics | Amplitude + GA | Avaliar se necessário |
| Autenticação | Via VSS.getAccessToken() | Usar mesmo mecanismo |

---

## 10. Análise da Requisição PreValidation (Autenticação)

### 10.1 Captura da Requisição

```javascript
fetch("https://sefaz-ceara-lab.timehub.7pace.com/Integration/PreValidation/5", {
  "headers": {
    "accept": "*/*",
    "content-type": "application/json",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "cross-site",
    "x-custom-header": "eyJVc2VyLVVuaXF1ZS1OYW1lIjoi..."
  },
  "referrer": "https://7pace.gallerycdn.vsassets.io/",
  "method": "GET",
  "mode": "cors",
  "credentials": "omit"
});
```

### 10.2 Header `x-custom-header` Decodificado (Base64 → JSON)

```json
{
  "User-Unique-Name": "pedro.teixeira@sefaz.ce.gov.br",
  "User-Name": "PEDRO CICERO TEIXEIRA",
  "User-Email": "pedro.teixeira@sefaz.ce.gov.br",
  "Account-Id": "509890e0-3c87-48dc-95fa-86ac2a77bb5b",
  "Account-Name": "sefaz-ceara-lab",
  "Project-Id": "50a9ca09-710f-4478-8278-2d069902d2af",
  "Project-Name": "DEV",
  "TimeZoneOffset": -180,
  "Collection-Id": "43cf6d60-0ae7-416c-aace-69fd07c6d474",
  "Collection-User-Id": "08347002-d37b-6380-a5a7-645420d92a52",
  "Locale": "pt-PT",
  "Publisher-Id": "7pace",
  "Extension-Id": "Timetracker",
  "Token": "<JWT_TOKEN_AZURE_DEVOPS>",
  "App-Token": "<JWT_TOKEN_APLICACAO>"
}
```

### 10.3 Campos do Contexto de Usuário

| Campo | Valor Exemplo | Descrição |
|-------|---------------|-----------|
| `User-Unique-Name` | `pedro.teixeira@sefaz.ce.gov.br` | Email/login único do usuário |
| `User-Name` | `PEDRO CICERO TEIXEIRA` | Nome de exibição |
| `User-Email` | `pedro.teixeira@sefaz.ce.gov.br` | Email do usuário |
| `Account-Id` | `509890e0-3c87-...` | GUID da organização Azure DevOps |
| `Account-Name` | `sefaz-ceara-lab` | Nome da organização |
| `Project-Id` | `50a9ca09-710f-...` | GUID do projeto |
| `Project-Name` | `DEV` | Nome do projeto |
| `TimeZoneOffset` | `-180` | Offset em minutos (GMT-3 = Fortaleza) |
| `Collection-Id` | `43cf6d60-0ae7-...` | GUID da collection |
| `Collection-User-Id` | `08347002-d37b-...` | GUID do usuário na collection |
| `Locale` | `pt-PT` | Idioma do usuário |
| `Publisher-Id` | `7pace` | Publisher da extensão |
| `Extension-Id` | `Timetracker` | ID da extensão |
| `Token` | JWT | Token do Azure DevOps (`VSS.getAccessToken()`) |
| `App-Token` | JWT | Token específico da aplicação 7pace |

### 10.4 Diferença entre Requisições

| Aspecto | HTML (AddTimePopupDialog) | API (PreValidation) |
|---------|---------------------------|---------------------|
| **Método** | GET | GET |
| **Retorno** | HTML completo | JSON |
| **referrer** | `https://dev.azure.com/` | `https://7pace.gallerycdn.vsassets.io/` |
| **credentials** | `include` (cookies) | `omit` (sem cookies) |
| **sec-fetch-dest** | `iframe` | `empty` |
| **Autenticação** | Cookies de sessão | Header `x-custom-header` |

### 10.5 Fluxo de Autenticação Completo

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│  Azure DevOps   │      │  Extension      │      │  Backend 7pace  │
│  (Host)         │      │  (iframe)       │      │  (API)          │
└────────┬────────┘      └────────┬────────┘      └────────┬────────┘
         │                        │                        │
         │  1. Carrega extensão   │                        │
         │───────────────────────▶│                        │
         │                        │                        │
         │  2. VSS.getAccessToken()                        │
         │◀───────────────────────│                        │
         │                        │                        │
         │  3. Retorna JWT Token  │                        │
         │───────────────────────▶│                        │
         │                        │                        │
         │                        │  4. Monta x-custom-header
         │                        │     (Base64 encode JSON)
         │                        │                        │
         │                        │  5. GET /PreValidation/5
         │                        │     Header: x-custom-header
         │                        │───────────────────────▶│
         │                        │                        │
         │                        │                        │  6. Decode Base64
         │                        │                        │  7. Valida JWT Token
         │                        │                        │  8. Verifica permissões
         │                        │                        │
         │                        │  9. Response (200/403) │
         │                        │◀───────────────────────│
         │                        │                        │
         │                        │  10. Se OK, abre dialog│
         │                        │      Se não, mostra erro
```

### 10.6 Estrutura do JWT Token (Azure DevOps)

O token JWT do Azure DevOps contém:

```json
{
  "nameid": "08347002-d37b-6380-a5a7-645420d92a52",
  "scp": "vso.extension.default vso.features_write vso.identity vso.profile vso.work_write",
  "aui": "9b41d8d8-758b-4925-b6a5-3c4c779e4c76",
  "hai": "e5c9f4b0-010e-4b79-b3df-94ec27a5d24d",
  "sid": "e4e7895c-4a68-4d9d-8f02-38823448045",
  "jti": "712032ab-1181-4f90-a3f0-124210a5ad17",
  "iss": "app.vssps.visualstudio.com",
  "aud": "app.vssps.visualstudio.com|vso:43cf6d60-0ae7-416c-aace-69fd07c6d474",
  "nbf": 1768771512,
  "exp": 1768775712
}
```

| Campo | Descrição |
|-------|-----------|
| `nameid` | ID do usuário na collection |
| `scp` | Scopes/permissões concedidos |
| `aui` | Application User ID |
| `sid` | Session ID |
| `iss` | Issuer (Azure DevOps) |
| `aud` | Audience (organização) |
| `exp` | Expiração do token |

### 10.7 Implementação para Backend Sefaz

#### 10.7.1 Endpoint de PreValidation

```csharp
[ApiController]
[Route("Integration")]
public class IntegrationController : ControllerBase
{
    [HttpGet("PreValidation/{workItemId}")]
    public async Task<IActionResult> PreValidation(
        int workItemId,
        [FromHeader(Name = "x-custom-header")] string customHeader)
    {
        if (string.IsNullOrEmpty(customHeader))
            return BadRequest("Header x-custom-header é obrigatório");

        try
        {
            // 1. Decode Base64
            var json = Encoding.UTF8.GetString(Convert.FromBase64String(customHeader));
            var context = JsonSerializer.Deserialize<UserContext>(json);

            // 2. Valida token do Azure DevOps
            var tokenValid = await ValidateAzureDevOpsToken(context.Token, context.AccountName);
            if (!tokenValid)
                return Unauthorized("Token inválido");

            // 3. Verifica se usuário tem permissão no work item
            var hasPermission = await CheckWorkItemPermission(
                context.Token,
                context.AccountName,
                context.ProjectName,
                workItemId);

            if (!hasPermission)
                return Forbid("Sem permissão para este work item");

            // 4. Retorna dados de validação
            return Ok(new
            {
                valid = true,
                workItemId,
                user = context.UserUniqueName,
                project = context.ProjectName
            });
        }
        catch (Exception ex)
        {
            return BadRequest($"Erro ao processar header: {ex.Message}");
        }
    }

    private async Task<bool> ValidateAzureDevOpsToken(string token, string organization)
    {
        using var client = new HttpClient();
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);

        var response = await client.GetAsync(
            $"https://dev.azure.com/{organization}/_apis/connectionData?api-version=7.0");

        return response.IsSuccessStatusCode;
    }

    private async Task<bool> CheckWorkItemPermission(
        string token, string org, string project, int workItemId)
    {
        using var client = new HttpClient();
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);

        var response = await client.GetAsync(
            $"https://dev.azure.com/{org}/{project}/_apis/wit/workitems/{workItemId}?api-version=7.0");

        return response.IsSuccessStatusCode;
    }
}

public class UserContext
{
    [JsonPropertyName("User-Unique-Name")]
    public string UserUniqueName { get; set; }

    [JsonPropertyName("User-Name")]
    public string UserName { get; set; }

    [JsonPropertyName("Account-Name")]
    public string AccountName { get; set; }

    [JsonPropertyName("Project-Name")]
    public string ProjectName { get; set; }

    [JsonPropertyName("Token")]
    public string Token { get; set; }

    [JsonPropertyName("TimeZoneOffset")]
    public int TimeZoneOffset { get; set; }
}
```

#### 10.7.2 Frontend: Montando o x-custom-header

```typescript
// No frontend da extensão (React)
async function getCustomHeader(): Promise<string> {
    const webContext = VSS.getWebContext();
    const accessToken = await VSS.getAccessToken();
    const appToken = await VSS.getAppToken();

    const context = {
        "User-Unique-Name": webContext.user.uniqueName,
        "User-Name": webContext.user.name,
        "User-Email": webContext.user.email,
        "Account-Id": webContext.account.id,
        "Account-Name": webContext.account.name,
        "Project-Id": webContext.project.id,
        "Project-Name": webContext.project.name,
        "TimeZoneOffset": new Date().getTimezoneOffset(),
        "Collection-Id": webContext.collection.id,
        "Locale": navigator.language,
        "Token": accessToken.token,
        "App-Token": appToken.token
    };

    // Encode para Base64
    return btoa(JSON.stringify(context));
}

// Uso em requisições para o backend
async function callPreValidation(workItemId: number) {
    const customHeader = await getCustomHeader();

    const response = await fetch(
        `https://aponta.sefaz.ce.gov.br/Integration/PreValidation/${workItemId}`,
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-custom-header': customHeader
            }
        }
    );

    return response.json();
}
```

### 10.8 Considerações de Segurança

| Aspecto | Recomendação |
|---------|--------------|
| **Token JWT** | Sempre validar com Azure DevOps API antes de confiar |
| **Base64** | Não é criptografia, apenas encoding - dados sensíveis visíveis |
| **HTTPS** | Obrigatório para proteger o header em trânsito |
| **Expiração** | Tokens expiram (~1 hora) - tratar erros 401 |
| **Scopes** | Verificar se token tem permissões necessárias |

---

## 11. Dados do Console do iframe (VSS SDK)

### 11.1 Objeto VSS

```javascript
{
  VssSDKVersion: 2,
  VssSDKRestVersion: '4.1',
  ServiceIds: {...},
  init: ƒ,
  require: ƒ,
  getWebContext: ƒ,
  getConfiguration: ƒ,
  getAccessToken: ƒ,
  getAppToken: ƒ,
  ...
}
```

### 11.2 VSS.getAccessToken() - Token de Acesso

```javascript
{
  appId: 'b8b389e3-d302-4ab5-be02-d30eadab9227',  // ID da extensão 7pace
  token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIs...', // JWT Token
  tokenType: 0,  // Bearer
  validTo: 'Sun Jan 18 2026 20:12:55 GMT-0300'  // Expira em ~1 hora
}
```

| Campo | Valor | Descrição |
|-------|-------|-----------|
| `appId` | `b8b389e3-d302-4ab5-be02-d30eadab9227` | ID único da extensão 7pace no Azure DevOps |
| `token` | JWT | Token Bearer para autenticar requisições |
| `tokenType` | `0` | Tipo Bearer |
| `validTo` | Data/hora | Expiração do token (~1 hora) |

### 11.3 VSS.getWebContext() - Contexto Completo

```json
{
  "user": {
    "id": "08347002-d37b-6380-a5a7-645420d92a52",
    "name": "PEDRO CICERO TEIXEIRA",
    "subjectType": "aad",
    "subjectId": "08347002-d37b-7380-a5a7-645420d92a52",
    "email": "pedro.teixeira@sefaz.ce.gov.br",
    "uniqueName": "pedro.teixeira@sefaz.ce.gov.br"
  },
  "project": {
    "id": "50a9ca09-710f-4478-8278-2d069902d2af",
    "name": "DEV"
  },
  "collection": {
    "id": "43cf6d60-0ae7-416c-aace-69fd07c6d474",
    "name": "sefaz-ceara-lab",
    "uri": "https://dev.azure.com/sefaz-ceara-lab/",
    "relativeUri": "/sefaz-ceara-lab/"
  },
  "account": {
    "id": "509890e0-3c87-48dc-95fa-86ac2a77bb5b",
    "name": "sefaz-ceara-lab",
    "uri": "https://dev.azure.com/sefaz-ceara-lab/",
    "relativeUri": "/sefaz-ceara-lab/"
  },
  "host": {
    "isAADAccount": true,
    "id": "43cf6d60-0ae7-416c-aace-69fd07c6d474",
    "name": "sefaz-ceara-lab",
    "uri": "https://dev.azure.com/sefaz-ceara-lab/",
    "relativeUri": "/sefaz-ceara-lab/",
    "hostType": 4,
    "scheme": "https",
    "authority": "dev.azure.com"
  },
  "team": {
    "id": "bccbc43a-6ba8-4e1b-803e-aa3986fc118b",
    "name": "DEV"
  }
}
```

### 11.4 Mapeamento dos Campos do WebContext

| Objeto | Campo | Valor | Uso |
|--------|-------|-------|-----|
| **user** | `id` | `08347002-d37b-...` | ID único do usuário |
| **user** | `name` | `PEDRO CICERO TEIXEIRA` | Nome de exibição |
| **user** | `email` | `pedro.teixeira@sefaz.ce.gov.br` | Email |
| **user** | `uniqueName` | `pedro.teixeira@sefaz.ce.gov.br` | Login único |
| **user** | `subjectType` | `aad` | Tipo: Azure Active Directory |
| **project** | `id` | `50a9ca09-710f-...` | GUID do projeto |
| **project** | `name` | `DEV` | Nome do projeto |
| **collection** | `id` | `43cf6d60-0ae7-...` | GUID da collection |
| **collection** | `name` | `sefaz-ceara-lab` | Nome da organização |
| **collection** | `uri` | `https://dev.azure.com/sefaz-ceara-lab/` | URL base |
| **account** | `id` | `509890e0-3c87-...` | GUID da conta |
| **account** | `name` | `sefaz-ceara-lab` | Nome da conta |
| **host** | `isAADAccount` | `true` | Usa Azure AD |
| **host** | `hostType` | `4` | Tipo de host |
| **host** | `authority` | `dev.azure.com` | Domínio do Azure DevOps |
| **team** | `id` | `bccbc43a-6ba8-...` | GUID do time |
| **team** | `name` | `DEV` | Nome do time |

### 11.5 VSS.getConfiguration() - Configuração do Dialog

```json
{
  "dialog": {}
}
```

**Observação**: O objeto `dialog` está vazio porque a 7pace usa seu próprio sistema de callbacks registrado via `VSS.register()` ao invés de usar a configuração padrão do dialog.

### 11.6 Código TypeScript para Obter Contexto (Para Implementação Sefaz)

```typescript
// Tipos para TypeScript
interface VssUser {
  id: string;
  name: string;
  email: string;
  uniqueName: string;
  subjectType: string;
}

interface VssProject {
  id: string;
  name: string;
}

interface VssCollection {
  id: string;
  name: string;
  uri: string;
}

interface VssAccount {
  id: string;
  name: string;
  uri: string;
}

interface VssTeam {
  id: string;
  name: string;
}

interface VssWebContext {
  user: VssUser;
  project: VssProject;
  collection: VssCollection;
  account: VssAccount;
  team: VssTeam;
  host: {
    isAADAccount: boolean;
    authority: string;
    hostType: number;
  };
}

interface VssAccessToken {
  appId: string;
  token: string;
  tokenType: number;
  validTo: Date;
}

// Funções utilitárias
async function getVssContext(): Promise<{
  webContext: VssWebContext;
  accessToken: VssAccessToken;
}> {
  const webContext = VSS.getWebContext() as VssWebContext;
  const accessToken = await VSS.getAccessToken() as VssAccessToken;

  return { webContext, accessToken };
}

// Exemplo de uso
async function initializeAponta() {
  const { webContext, accessToken } = await getVssContext();

  console.log(`Usuário: ${webContext.user.name}`);
  console.log(`Projeto: ${webContext.project.name}`);
  console.log(`Organização: ${webContext.account.name}`);
  console.log(`Token expira em: ${accessToken.validTo}`);

  // Fazer requisições autenticadas
  const response = await fetch('https://aponta.sefaz.ce.gov.br/api/time-entries', {
    headers: {
      'Authorization': `Bearer ${accessToken.token}`,
      'X-User-Id': webContext.user.id,
      'X-Project-Id': webContext.project.id
    }
  });
}
```

### 11.7 Comparativo: Dados do WebContext vs x-custom-header

| Informação | VSS.getWebContext() | x-custom-header |
|------------|---------------------|-----------------|
| User ID | `user.id` | `Collection-User-Id` |
| User Name | `user.name` | `User-Name` |
| User Email | `user.email` | `User-Email` |
| User Login | `user.uniqueName` | `User-Unique-Name` |
| Project ID | `project.id` | `Project-Id` |
| Project Name | `project.name` | `Project-Name` |
| Organization | `account.name` | `Account-Name` |
| Organization ID | `account.id` | `Account-Id` |
| Collection ID | `collection.id` | `Collection-Id` |
| Token | via `getAccessToken()` | `Token` |
| App Token | via `getAppToken()` | `App-Token` |
| Timezone | - | `TimeZoneOffset` |
| Locale | - | `Locale` |

**Conclusão**: O `x-custom-header` é essencialmente o `VSS.getWebContext()` + tokens, codificado em Base64.

---

## 12. Referências

### Documentação Oficial
- [Azure DevOps Extension Manifest](https://docs.microsoft.com/en-us/azure/devops/extend/develop/manifest)
- [Extension Points](https://docs.microsoft.com/en-us/azure/devops/extend/reference/targets/overview)
- [Contribution Model](https://docs.microsoft.com/en-us/azure/devops/extend/develop/contributions-overview)
- [VSS SDK Reference](https://docs.microsoft.com/en-us/azure/devops/extend/reference/client/core-sdk)
- [Client REST APIs](https://docs.microsoft.com/en-us/azure/devops/extend/develop/work-with-urls)

### Artefatos Analisados
- Arquivo: `extension.vsomanifest` (7pace Timetracker)
- Requisição capturada: `GET /Integration/AddTimePopupDialog/5` via DevTools
- Response HTML capturado: Página completa do AddTimePopupDialog
- Requisição capturada: `GET /Integration/PreValidation/5` via DevTools
- Header `x-custom-header` decodificado (Base64 → JSON)

### Versões Identificadas
- 7pace Timetracker: `5.89.0.2`
- VSS SDK: `vss-bundle.min.js`

---

## 12. Glossário

| Termo | Definição |
|-------|-----------|
| **VSS** | Visual Studio Services - SDK para extensões Azure DevOps |
| **CSRF** | Cross-Site Request Forgery - proteção contra requisições maliciosas |
| **CDN** | Content Delivery Network - rede de distribuição de conteúdo |
| **iframe** | Elemento HTML que incorpora outra página |
| **SaaS** | Software as a Service - modelo de software hospedado |
| **SSR** | Server-Side Rendering - renderização no servidor |

---

*Documento gerado para suporte à decisão arquitetural do projeto fe-aponta.*
*Última atualização: 2026-01-18*

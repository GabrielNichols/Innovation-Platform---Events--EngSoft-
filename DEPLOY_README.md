# Deploy no Azure - Arquitetura Simplificada e Barata

## 🎯 Nova Estratégia: Azure Static Web Apps + Azure Container Apps + Bicep

Por que mudamos?
- **Custos reduzidos**: De ~R$ 200/mês para ~R$ 50/mês
- **Sem load balancer complexo**: URLs automáticas
- **Sem DNS customizado**: Usa domínios Azure gratuitos
- **Deploy mais simples**: CI/CD direto via GitHub Actions
- **Infrastructure as Code**: Bicep para deploy declarativo e reprodutível
- **Frontend primeiro**: Faz sentido publicar com interface

## 🏗️ Arquitetura com Bicep

O arquivo `main.bicep` define toda a infraestrutura como código:
- **Azure Static Web App**: Frontend gratuito e escalável
- **Azure Container Registry**: Registry para armazenar imagens Docker
- **Container Apps Environment**: Ambiente para os microserviços
- **6 Container Apps**: Um para cada microserviço com auto-scaling
- **CORS configurado**: Comunicação frontend ↔ APIs
- **Secrets seguros**: JWT token criptografado

## 🏗️ Nova Arquitetura

```
Internet
    ↓
Azure Static Web Apps (Frontend - FREE)
    ↓
Azure Container Apps (Microserviços - ~$50/mês)
├── API Gateway (FastAPI)
├── Auth Service (FastAPI)
├── Events Service (FastAPI)
├── Projects Service (FastAPI)
├── Participants Service (FastAPI)
└── Notifications Service (FastAPI)
    ↑
Azure Container Registry (Imagens Docker - ~$5/mês)
```

## 🚀 Deploy em 4 Passos

### Pré-requisitos
- Conta Azure Student ativa
- Azure CLI instalado (`winget install Microsoft.AzureCLI` no Windows)
- Docker Desktop instalado
- GitHub repository criado

### Passo 1: Login no Azure
```bash
# Login na sua conta Azure Student
az login --use-device-code

# Verificar se funcionou
az account show
```

### Passo 2: Executar Deploy Automático
```bash
# Clonar repositório (substitua pela sua URL)
git clone https://github.com/SEU_USERNAME/SEU_REPO.git
cd innovation-platform

# Opção 1: Deploy com Bicep (Infrastructure as Code - RECOMENDADO)
chmod +x deploy-bicep.sh

# Deploy normal
./deploy-bicep.sh

# Deploy com diagnóstico (recomendado para troubleshooting)
./deploy-bicep.sh --diagnostic

# Deploy com limpeza (se deployment anterior falhou)
./deploy-bicep.sh --cleanup

# Deploy completo com todas as verificações
./deploy-bicep.sh --diagnostic --cleanup

# Opção 2: Deploy automático (detecta região automaticamente)
chmod +x deploy-azure-simple.sh
./deploy-azure-simple.sh

# Opção 3: Deploy com região específica (se houver restrições)
chmod +x deploy-azure-simple-region.sh
./deploy-azure-simple-region.sh eastus    # ou westus2, northeurope, etc.

### Passo 3: Configurar GitHub Secrets
No seu repositório GitHub, vá para **Settings → Secrets and variables → Actions** e adicione:

```
AZURE_CREDENTIALS                     # JSON do Service Principal (gerado pelo script)
AZURE_RESOURCE_GROUP                  # innovation-platform-rg
AZURE_CONTAINER_ENV                   # innovation-platform-env
AZURE_STATIC_WEB_APPS_PUBLISH_PROFILE # Publish Profile do Static Web App (gerado pelo script)
JWT_SECRET                            # JWT Secret (gerado pelo script)
```

**💡 Dica:** O script `deploy-azure-simple.sh` gera automaticamente o JWT_SECRET e mostra o Publish Profile. Copie esses valores diretamente!

### Passo 4: Conectar GitHub ao Static Web App
Após o deploy inicial, conecte seu repositório GitHub ao Static Web App:

```bash
# Conectar o GitHub repository ao Static Web App
az staticwebapp appsettings set \
  --name innovation-platform-frontend \
  --resource-group innovation-platform-rg \
  --setting-names GITHUB_REPO_URL=https://github.com/SEU_USERNAME/SEU_REPO

# Ou via Azure Portal:
# Static Web Apps → Seu App → Settings → Source → GitHub
# Selecione seu repositório e configure:
# - Branch: main
# - Build preset: React
# - App location: frontend
# - Output location: build
```

### Passo 5: Primeiro Deploy via CI/CD
```bash
# Fazer push para trigger do CI/CD automático
git add .
git commit -m "Initial deployment with CI/CD"
git push origin main
```

## 📊 Custos Estimados (Azure for Students)

- **Azure Static Web Apps**: **GRÁTIS** (até 100GB bandwidth)
- **Azure Container Registry**: ~R$ 5/mês (Basic tier, 10GB storage)
- **Azure Container Apps**: ~R$ 45-80/mês (6 serviços × ~R$ 7-13 cada)
- **Resource Group**: Grátis

**Total: ~R$ 50-85/mês** (70% cheaper than AKS!)

## 🔧 O que o Script Bicep Faz

✅ **Bicep CLI**: Instala automaticamente se necessário
✅ Verifica região disponível automaticamente (resolve restrições regionais)
✅ Gera JWT secret automaticamente
✅ Cria Resource Group
✅ **Deploy Infrastructure as Code**: Tudo definido em `main.bicep`
✅ Cria Azure Container Registry (ACR)
✅ Build das imagens Docker localmente
✅ Push das imagens para o ACR
✅ Cria Azure Static Web App (frontend)
✅ Obtém Publish Profile automaticamente
✅ Cria Container Apps Environment
✅ Deploy dos 6 microserviços usando imagens do ACR
✅ Configura CORS automaticamente
✅ Mostra URLs de acesso e secrets para CI/CD

## 📋 Arquivos Bicep

- **`main.bicep`**: Template principal da infraestrutura
- **`main.parameters.json`**: Parâmetros (JWT secret)
- **`deploy-bicep.sh`**: Script de deploy que usa Bicep

## 📱 URLs de Acesso

Após o deploy, você receberá URLs como:
- **Frontend**: `https://gentle-dune-0abcd1234.azurestaticapps.net`
- **API Gateway**: `https://gateway.gentle-dune-0abcd1234.brazilsouth.azurecontainerapps.io`
- **Auth Service**: `https://auth-service.gentle-dune-0abcd1234.brazilsouth.azurecontainerapps.io`

## 🚀 CI/CD Automático

Após configurar os secrets:

### Frontend (Static Web Apps)
- Push na `main` → Build automático + deploy via Publish Profile
- Pull Requests → Testes automáticos
- API URL obtida dinamicamente dos Container Apps
- Environment variables configuradas automaticamente

### Backend (Container Apps)
- Push na `main` → Testes + deploy de todos os serviços
- Deploy independente por serviço (matriz paralela)
- CORS configurado automaticamente
- Auto-scaling baseado em CPU/memory

## 🔍 Troubleshooting

### Problema: Azure CLI não loga
```bash
# Tentar login interativo
az login

# Ou com device code
az login --use-device-code
```

### Problema: Região não disponível / RequestDisallowedByAzure
```bash
# O script detecta automaticamente regiões disponíveis
# Mas se quiser verificar manualmente:
az account list-locations --query "[].name" -o tsv

# Testar uma região específica:
az group create --name test-region --location eastus --output none
az group delete --name test-region --yes --output none

# Regiões comuns que geralmente funcionam:
# - eastus, eastus2
# - westus, westus2
# - northeurope, westeurope
# - southeastasia, australiaeast
```

### Problema: Container App não cria
```bash
# Verificar se o environment existe
az containerapp env list --resource-group innovation-platform-rg

# Ver logs de criação
az monitor activity-log list --resource-group innovation-platform-rg --max-events 10
```

### Problema: Frontend não acessa API
```bash
# Verificar se a URL da API está correta no frontend
# O GitHub Actions configura automaticamente durante o build
# Verificar logs do workflow para ver a URL da API sendo usada
```

### Problema: Publish Profile inválido
```bash
# Se o publish profile não funcionar, obtenha manualmente:
az staticwebapp secrets list \
  --name innovation-platform-frontend \
  --resource-group innovation-platform-rg \
  --query "properties.apiKey" -o tsv

# Ou via Azure Portal:
# Static Web Apps → Seu App → Overview → Get publish profile
```

### Problema: Container Apps falham com "no such host" (ACR não encontrado)
```bash
# Este erro ocorre quando o ACR não foi criado ou não está acessível
# O script agora verifica isso automaticamente com --diagnostic

# Verificar se ACR existe
az acr show --name innovationplatformacr --resource-group innovation-platform-rg

# Se não existir, o script irá criá-lo durante o deployment
```

### Problema: Static Web App "RepositoryUrl is invalid"
```bash
# Este erro ocorre quando a URL do repositório não está configurada
# O script agora verifica isso automaticamente

# Verificar configuração do SWA
az staticwebapp show --name innovation-platform-frontend --resource-group innovation-platform-rg --query "repositoryUrl"
```

### Problema: Serviços não sobem
```bash
# Ver status dos container apps
az containerapp list --resource-group innovation-platform-rg --output table

# Ver logs de um serviço específico
az containerapp logs show --name gateway --resource-group innovation-platform-rg
```

### 🚨 Prevenção de Problemas (Novo!)
```bash
# Execute sempre com diagnóstico para detectar problemas antecipadamente
./deploy-bicep.sh --diagnostic

# Se deployment anterior falhou, limpe antes de tentar novamente
./deploy-bicep.sh --cleanup

# Comando completo recomendado para primeira execução
./deploy-bicep.sh --diagnostic --cleanup
```

## 📋 Próximos Passos

1. **Testar aplicação** usando as URLs geradas
2. **Monitorar CI/CD**: Verificar se os workflows estão funcionando no GitHub Actions
3. **Custom Domain** (opcional): Conectar domínio próprio se necessário
4. **Monitoramento**: Configurar Application Insights se precisar
5. **Backup**: Os dados ficam em TinyDB (JSON), considerar migração futura para PostgreSQL

## 🎉 Vantagens da Nova Arquitetura

- ✅ **Mais barato**: 75% de economia
- ✅ **Mais simples**: Sem Kubernetes complexo
- ✅ **Mais rápido**: Deploy em minutos
- ✅ **Auto-scaling**: Container Apps escala automaticamente
- ✅ **URLs automáticas**: Sem configuração de DNS
- ✅ **CORS pronto**: Funciona com o frontend imediatamente
- ✅ **Infrastructure as Code**: Bicep para deploy reprodutível
- ✅ **Versionamento**: Toda infraestrutura versionada no Git

## 🆚 Bicep vs Scripts Bash

| Aspecto | Scripts Bash | Bicep (IaC) |
|---------|-------------|-------------|
| **Reprodutibilidade** | Manual | Declarativa |
| **Versionamento** | Scripts no Git | Infraestrutura versionada |
| **Paralelização** | Sequencial | Paralela automática |
| **Estado** | Scripts imperativos | Estado desejado |
| **Rollback** | Manual | Automático |
| **Auditoria** | Logs de execução | Histórico de deployments |
| **Colaboração** | Qualquer um pode alterar | Code review obrigatório |

---

**🚀 Pronto! Agora você tem uma aplicação completa no Azure com Infrastructure as Code!**

**Recomendação**: Use o deploy com Bicep (`deploy-bicep.sh`) para uma experiência mais profissional e reprodutível.

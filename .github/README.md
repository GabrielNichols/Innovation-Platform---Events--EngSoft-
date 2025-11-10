# GitHub Actions Workflows - Innovation Platform

Este documento explica como configurar e usar os workflows de CI/CD para a Innovation Platform.

## 📋 Workflows Disponíveis

### 🚀 **Deploy Automático por Microserviço**

Cada microserviço tem seu próprio workflow de deploy automático:

- **`auth-service-AutoDeployTrigger-[ID].yml`** - Deploy do auth-service
- **`gateway-AutoDeployTrigger.yml`** - Deploy do gateway
- **`events-service-AutoDeployTrigger.yml`** - Deploy do events-service
- **`projects-service-AutoDeployTrigger.yml`** - Deploy do projects-service
- **`participants-service-AutoDeployTrigger.yml`** - Deploy do participants-service
- **`notifications-service-AutoDeployTrigger.yml`** - Deploy do notifications-service

### 🎨 **Frontend CI/CD**

- **`frontend-ci-cd.yml`** - Build e deploy do frontend para Static Web App

### 🏗️ **Infraestrutura (Kubernetes - Não usado)**

- **`infrastructure-deploy.yml`** - Deploy para AKS (legado, não usado na arquitetura atual)
- **`backend-ci-cd.yml`** - Workflow antigo (substituído pelos workflows individuais)

## 🔐 **Configuração de Secrets Necessários**

### Para Cada Microserviço (substitua [SERVICE] pelo nome do serviço):

```bash
# Exemplos para auth-service:
AUTHSERVICE_AZURE_CLIENT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
AUTHSERVICE_AZURE_TENANT_ID=51da9440-4e5e-47b3-8e5c-4817f6f43c04
AUTHSERVICE_AZURE_SUBSCRIPTION_ID=012f0e50-fa82-4ade-a8f6-c82683e6cb90
AUTHSERVICE_REGISTRY_USERNAME=innovationplatformacr
AUTHSERVICE_REGISTRY_PASSWORD=[ACR_ACCESS_TOKEN]
```

### Para o Frontend:
```bash
AZURE_STATIC_WEB_APPS_DEPLOYMENT_TOKEN=635458245f12766679fd9f344d54f55014cfb29ced8643ece68397232723b47a03-2de36d87-4662-4714-9fbe-ebb8da27fdc200f061206f5f6f0f
```

## 🚀 **Como Funciona o Deploy**

### 1. **Trigger Automático**
- Push na branch `main`
- Mudanças em `backend/[microserviço]/**`
- Trigger manual via GitHub Actions

### 2. **Processo de Deploy**
1. **Checkout** do código
2. **Login no Azure** usando OIDC
3. **Build da imagem** Docker
4. **Push para ACR** (Azure Container Registry)
5. **Deploy no Container App**

### 3. **Imagens Geradas**
- `innovationplatformacr.azurecr.io/[service]:[github-sha]`
- Tag única por commit para rastreabilidade

## 🛠️ **Configuração Inicial**

### 1. **Criar Service Principal (Uma vez)**
```bash
# Criar via portal Azure ou usar o workflow automático
# O Azure cria automaticamente quando você configura no Container App
```

### 2. **Configurar Secrets no GitHub**
- Acesse: `Settings > Secrets and variables > Actions`
- Adicione todos os secrets listados acima

### 3. **Verificar ACR**
- Certifique-se que `innovationplatformacr.azurecr.io` existe
- Cada microserviço precisa de acesso ao registry

## 📊 **Monitoramento**

### **Verificar Status dos Deploys**
- Acesse: `Actions` tab no GitHub
- Cada workflow mostra o status individual
- Logs detalhados disponíveis

### **Verificar Container Apps**
```bash
az containerapp list --resource-group innovation-platform-rg --output table
```

## 🔄 **Fluxo de Desenvolvimento**

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Código    │ -> │   Commit   │ -> │   Push      │
│   Alterado  │    │   Local    │    │   GitHub    │
└─────────────┘    └─────────────┘    └─────────────┘
                                                    │
                                                    ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Workflow   │ -> │   Build     │ -> │   Test      │
│  Triggered  │    │   Docker    │    │   & Push    │
└─────────────┘    └─────────────┘    └─────────────┘
                                                    │
                                                    ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Deploy     │ -> │   Azure     │ -> │   Running   │
│  Container  │    │   Container │    │   Service   │
│  App        │    │   Apps      │    │             │
└─────────────┘    └─────────────┘    └─────────────┘
```

## 🚨 **Troubleshooting**

### **Erro: "No subscriptions found"**
- Verifique se o Service Principal tem as permissões corretas
- Confirme que o `tenant-id` e `subscription-id` estão corretos

### **Erro: "Login failed"**
- Verifique se os secrets estão configurados corretamente
- Confirme que o Service Principal não foi deletado

### **Erro: "ACR access denied"**
- Verifique as credenciais do registry
- Confirme que o ACR existe e está acessível

### **Deploy Stuck**
- Verifique os logs do Container App no portal Azure
- Use `az containerapp logs show` para debug

## 📝 **Manutenção**

- **Atualizar secrets** quando necessário
- **Monitorar uso** dos recursos Azure
- **Revisar logs** regularmente para detectar issues
- **Atualizar workflows** quando houver mudanças na arquitetura

---

**🎯 Status:** Todos os workflows estão configurados e prontos para uso!

**📞 Suporte:** Em caso de problemas, verifique os logs dos workflows no GitHub Actions.

# 🚀 Guia Rápido - Dev Mode

## ⚠️ IMPORTANTE: Fluxo de Login/Cadastro Atualizado

- **Login** = Página separada (LoginPage)
- **Cadastro** = Onboarding completo (OnboardingPage)
- **Admin** = NÃO é selecionável no cadastro (definido pelo backend)

## TL;DR

Botão flutuante no canto inferior direito = **Dev Mode** completo.

## 3 Passos para Testar

### 1️⃣ Ative o Login
- Abra o Dev Mode (botão inferior direito)
- Toggle de login: **ON** ✅
- Agora você está logado como "John Doe"

### 2️⃣ Escolha um Role
- **👤 Usuário** - Interface normal
- **📅 Organizador** - + Gerenciar Eventos
- **🛡️ Admin** - + Deletar eventos, acesso total

### 3️⃣ Navegue para Perfil
- Veja perfil completo com dados mock
- Portfolio, skills, rating, tudo funciona
- Perfil muda automaticamente conforme role

## Ícones no Botão

```
</>  = Dev Mode
🟢   = Logado (verde)
🔴   = Deslogado (vermelho)
👤   = Role atual (User/Organizer/Admin)
```

## Testes Rápidos

### Ver perfil completo
1. Login: ON
2. Role: qualquer
3. Ir para **Perfil** ✓

### Testar gestão de eventos
1. Login: ON
2. Role: **Organizador** ou **Admin**
3. Ir para **Perfil**
4. Clicar em **"Gerenciar Eventos"** ✓

### Comparar perfis por role
1. Login: ON
2. Role: **User** → ver perfil desenvolvedor
3. Role: **Organizer** → perfil muda para organizador
4. Role: **Admin** → perfil muda para admin ✓

## Mock Profile "John Doe"

```
✅ Nome completo
✅ Bio personalizada por role
✅ 8-10 skills relevantes
✅ 3-4 projetos no portfolio
✅ Rating 4.8
✅ Verificado
✅ Localização: São Paulo
✅ Disponível 15h/semana
```

## Produção

Quando for para produção:

```typescript
<DevRoleToggle enabled={false} />
```

Ou remova o componente completamente.

## Arquivos Criados

- `/components/DevRoleToggle.tsx` - Componente do toggle
- `/mock/mockProfile.ts` - Dados do perfil John Doe
- `/DEV_TOGGLE_GUIDE.md` - Documentação completa
- `/QUICK_DEV_GUIDE.md` - Este guia

---

**Pronto! Agora você pode testar toda a interface sem conectar backend.** 🎉

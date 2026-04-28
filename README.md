# PanamáLanza 🇵🇦

Plataforma de validación de ideas de negocio para emprendedores panameños, impulsada por IA.

---

## Cómo lanzar en Railway (paso a paso)

### 1. Crea el repositorio en GitHub
1. Ve a github.com → "New repository"
2. Nómbralo `panama-lanza`
3. Déjalo público o privado (da igual)
4. Sube todos estos archivos

### 2. Consigue tus API Keys (todas gratis)

**Claude API (Anthropic)**
1. Ve a console.anthropic.com
2. Crea una cuenta
3. Ve a "API Keys" → "Create Key"
4. Copia el key (empieza con `sk-ant-...`)

**Resend (emails)**
1. Ve a resend.com
2. Crea cuenta gratis
3. Ve a "API Keys" → "Create API Key"
4. Copia el key (empieza con `re_...`)
5. En "Domains", agrega y verifica tu dominio O usa el dominio de prueba de Resend

### 3. Despliega en Railway
1. Ve a railway.app → "New Project"
2. Elige "Deploy from GitHub repo"
3. Selecciona `panama-lanza`
4. Railway detecta Next.js automáticamente

**Agrega PostgreSQL:**
1. En tu proyecto Railway → "+ New" → "Database" → "PostgreSQL"
2. Railway crea la DB y agrega DATABASE_URL automáticamente

**Agrega las variables de entorno:**
En tu servicio Next.js → "Variables" → agrega:
```
ANTHROPIC_API_KEY = sk-ant-tu-key-aqui
RESEND_API_KEY = re_tu-key-aqui
```

### 4. Corre las migraciones de base de datos
En Railway → tu servicio → "Shell":
```bash
npx prisma migrate deploy
```

### 5. Actualiza el email de envío
En `pages/api/register.js`, línea del `from:`, cambia:
```
from: 'PanamáLanza <noreply@tu-dominio.com>'
```
Por tu dominio verificado en Resend. Si aún no tienes dominio, usa el dominio de prueba de Resend.

### 6. ¡Lanza!
Railway te da una URL tipo `panama-lanza.up.railway.app`
Compártela en tu grupo de Facebook y empieza a recoger usuarios.

---

## Costo mensual estimado
- Railway: $0 (plan hobby gratuito) → $5/mes cuando crezcas
- Resend: $0 (hasta 3,000 emails/mes)
- Claude API: ~$0.003 por análisis → 500 usuarios = $1.50
- **Total para lanzar: $0**

---

## Stack
- Next.js 14
- PostgreSQL + Prisma ORM
- Claude API (claude-opus-4-5)
- Resend (emails transaccionales)
- Railway (hosting)

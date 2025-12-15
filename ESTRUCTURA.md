# 📁 Estructura del Proyecto - MentorIA

## 🎯 Objetivo

Proyecto Next.js 14 (App Router) organizado de forma modular y escalable para trabajo en equipo.

## 📂 Estructura de Carpetas

```
src/
├── app/                          # 🔥 Solo rutas y layouts (App Router)
│   ├── (auth)/                   # Route group: autenticación
│   │   ├── login/
│   │   ├── register/
│   │   ├── forgot/
│   │   └── reset-password/
│   ├── (dashboard)/              # Route group: área privada
│   │   └── page.tsx
│   ├── (public)/                 # Route group: páginas públicas
│   │   ├── profile/
│   │   ├── terms/
│   │   └── privacy/
│   ├── api/                      # API Routes
│   │   └── contact/
│   ├── layout.tsx                # Layout raíz
│   └── page.tsx                  # Página de inicio
│
├── components/                   # ✨ Componentes reutilizables
│   ├── layout/                   # Componentes de layout
│   │   ├── Header.tsx            # Header unificado (con auth y search)
│   │   └── index.ts
│   ├── ui/                       # Componentes de UI
│   │   ├── LanguageSelector.tsx
│   │   ├── Toast.tsx
│   │   └── index.ts
│   ├── navigation/               # Componentes de navegación
│   └── accessibility/            # Componentes de accesibilidad
│       ├── AccessibilityMenu.tsx
│       ├── SyncA11y.tsx
│       ├── accessibility.module.css
│       └── index.ts
│
├── features/                     # 🚀 Lógica por dominio
│   ├── auth/                     # Feature: autenticación
│   │   ├── components/           # Componentes específicos de auth
│   │   ├── hooks/
│   │   │   └── useAuth.ts        # Hook personalizado para auth
│   │   ├── services/
│   │   │   └── authService.ts    # Servicio de autenticación
│   │   └── index.ts              # Exports públicos
│   ├── dashboard/                # Feature: dashboard
│   │   └── components/
│   └── profile/                  # Feature: perfil
│       └── components/
│
├── contexts/                     # 🌍 Contextos de React
│   └── LanguageContext.tsx
│
├── providers/                    # 🔌 Providers
│   └── ToastProvider.tsx
│
├── lib/                          # 📚 Utilidades y configuraciones
│   └── supabase.ts
│
├── styles/                       # 🎨 Estilos globales
│   ├── globals.css
│   └── LanguageSelector.css
│
├── translations/                 # 🌐 Internacionalización
│   ├── es.json
│   ├── en.json
│   └── fr.json
│
└── types/                        # 📝 TypeScript types
    └── index.ts
```

## 🎯 Principios de Organización

### 1. **app/** - Solo Rutas y Layouts
- ✅ Archivos `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`
- ✅ Route groups: `(auth)`, `(dashboard)`, `(public)`
- ❌ No componentes reutilizables
- ❌ No lógica de negocio

### 2. **components/** - Componentes Reutilizables por Propósito
- **layout/**: Headers, Footers, Sidebars
- **ui/**: Botones, Inputs, Selectors, Toasts, Modales
- **navigation/**: Menús, breadcrumbs, tabs
- **accessibility/**: Componentes de accesibilidad

### 3. **features/** - Lógica por Dominio
Cada feature agrupa todo lo relacionado:
```
features/auth/
├── components/    # Componentes específicos
├── hooks/         # Hooks personalizados
├── services/      # Servicios y API calls
├── utils/         # Utilidades específicas
└── index.ts       # Exports públicos
```

### 4. **Route Groups**
Los route groups `()` permiten organizar sin afectar las URLs:
- `app/(auth)/login/page.tsx` → `/login`
- `app/(dashboard)/page.tsx` → `/dashboard`
- `app/(public)/profile/page.tsx` → `/profile`

## 🔧 Imports Mejorados

### Antes ❌
```tsx
import Header from '../../../../components/Header';
import { supabase } from '../../../../lib/supabase';
```

### Ahora ✅
```tsx
import { Header } from '@/components/layout';
import { useAuth, authService } from '@/features/auth';
import { supabase } from '@/lib/supabase';
```

## 📝 Guía de Desarrollo

### Crear un nuevo componente reutilizable
```bash
# Ubicación
src/components/ui/Button.tsx

# Export en index
# src/components/ui/index.ts
export { default as Button } from './Button';
```

### Crear una nueva feature
```bash
# Estructura
src/features/nueva-feature/
├── components/
├── hooks/
├── services/
└── index.ts
```

### Agregar una nueva ruta
```bash
# Con route group
src/app/(grupo)/nueva-ruta/page.tsx

# La URL será: /nueva-ruta
```

## 🚀 Ventajas de esta Estructura

1. **Modular**: Cada feature es independiente
2. **Escalable**: Fácil agregar nuevas features
3. **Mantenible**: Código organizado por dominio
4. **Trabajo en equipo**: Menos conflictos en Git
5. **Testing**: Más fácil probar features aisladas
6. **Imports limpios**: Rutas relativas más cortas

## 🔄 Cambios Principales

- ✅ Header unificado (eliminado HeaderFixed duplicado)
- ✅ Componentes movidos a carpetas por propósito
- ✅ Accesibilidad renombrada correctamente
- ✅ Features con hooks y services organizados
- ✅ Route groups implementados
- ✅ Archivos duplicados eliminados

## 📦 Exports Centralizados

Cada carpeta importante tiene un `index.ts` que exporta:
```tsx
// components/ui/index.ts
export { default as LanguageSelector } from './LanguageSelector';
export { default as Toast } from './Toast';

// features/auth/index.ts
export { useAuth } from './hooks/useAuth';
export { authService } from './services/authService';
```

## 🛠️ Próximos Pasos Sugeridos

1. Configurar path aliases en `tsconfig.json`:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/features/*": ["./src/features/*"]
    }
  }
}
```

2. Crear más features según necesidad:
   - `features/content-generator/`
   - `features/library/`
   - `features/quiz/`

3. Agregar tests unitarios por feature

## 🎨 Accesibilidad

Los componentes de accesibilidad se mantienen intactos:
- ✅ ARIA attributes preservados
- ✅ Focus management funcional
- ✅ Keyboard navigation activo
- ✅ Todas las preferencias guardadas

---

**Última actualización**: Diciembre 2024
**Mantenedor**: Equipo MentorIA

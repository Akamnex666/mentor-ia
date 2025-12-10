# Sistema de Idiomas - MentorIA

## ✅ Implementación Completa

El sistema de internacionalización está listo y funcionando. **No se modificó el diseño original**, solo se agregó la funcionalidad de cambio de idioma.

## 🌍 Idiomas Disponibles

- **🇪🇸 Español (ES)** - Idioma por defecto
- **🇬🇧 Inglés (EN)**
- **🇫🇷 Francés (FR)**

## 🎯 Cómo Usar

### Para el usuario:
1. Abre la aplicación en `http://localhost:3000`
2. En la barra de navegación superior derecha, verás 3 botones: **ES | EN | FR**
3. Haz clic en cualquier botón para cambiar el idioma
4. **Todo el contenido se traduce instantáneamente**
5. El idioma seleccionado se guarda automáticamente en tu navegador

### Selector de Idioma:
- Los botones ES, EN, FR están ubicados junto al botón "Iniciar Sesión"
- El idioma activo se muestra con color azul
- El cambio es instantáneo, sin recargar la página

## 📁 Archivos Creados

```
src/
├── translations/
│   ├── es.json          # Traducciones en español
│   ├── en.json          # Traducciones en inglés
│   └── fr.json          # Traducciones en francés
├── contexts/
│   └── LanguageContext.tsx   # Contexto para manejar idiomas
├── components/
│   └── LanguageSelector.tsx  # Botones de selección
└── styles/
    └── LanguageSelector.css  # Estilos del selector
```

## 🔧 Cómo Agregar Traducciones

Si necesitas traducir más texto:

1. **Abre los archivos de traducción** en `src/translations/`
2. **Agrega tu nueva clave** en los 3 archivos (es.json, en.json, fr.json):

```json
// es.json
{
  "miSeccion": {
    "titulo": "Mi Título en Español"
  }
}

// en.json
{
  "miSeccion": {
    "titulo": "My Title in English"
  }
}

// fr.json
{
  "miSeccion": {
    "titulo": "Mon Titre en Français"
  }
}
```

3. **Usa la traducción** en tu componente:

```tsx
import { useLanguage } from "../contexts/LanguageContext";

export default function MiComponente() {
  const { t } = useLanguage();
  
  return <h1>{t('miSeccion.titulo')}</h1>;
}
```

## 🎨 Personalizar el Selector

Puedes modificar los estilos en `src/styles/LanguageSelector.css`:

- Cambiar colores
- Ajustar tamaños
- Modificar animaciones
- Agregar más idiomas

## ➕ Agregar Más Idiomas

Para agregar un nuevo idioma (ej: Portugués):

1. **Crear archivo de traducción**: `src/translations/pt.json`
2. **Actualizar el contexto**: `src/contexts/LanguageContext.tsx`
   ```tsx
   import pt from '../translations/pt.json';
   type Locale = 'es' | 'en' | 'fr' | 'pt';
   const translations = { es, en, fr, pt };
   ```
3. **Agregar botón**: `src/components/LanguageSelector.tsx`
   ```tsx
   <button
     className={`lang-btn ${locale === 'pt' ? 'active' : ''}`}
     onClick={() => setLocale('pt')}
   >
     PT
   </button>
   ```

## ✨ Características

- ✅ **Cambio instantáneo** sin recargar la página
- ✅ **Persistencia** - Se guarda el idioma seleccionado
- ✅ **Diseño intacto** - No se modificó nada del diseño original
- ✅ **Responsive** - Funciona en móviles y tablets
- ✅ **Accesible** - Compatible con modo de alto contraste
- ✅ **Ligero** - No requiere librerías externas complejas

## 🚀 Traducciones Incluidas

Todo el contenido está traducido:
- ✅ Navegación
- ✅ Hero / Banner principal
- ✅ Características
- ✅ Estadísticas
- ✅ Preguntas frecuentes
- ✅ Accesibilidad
- ✅ Footer

## 📝 Notas

- El sistema usa **Context API de React** para manejar el estado global
- Las traducciones se almacenan en **localStorage**
- **No requiere rutas especiales** como /es, /en, /fr
- Funciona con el diseño actual **sin cambios**

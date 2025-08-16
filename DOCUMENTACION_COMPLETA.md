# 📚 DOCUMENTACIÓN COMPLETA - NEXO ARTÍSTICO

## 🎨 Descripción General del Proyecto

**Nexo Artístico** es una plataforma web completa para una comunidad de artistas hispanohablantes. El proyecto incluye múltiples páginas interactivas, un sistema de gestión de miembros, galería de arte, biblioteca de recursos, centro de mejora, generador de herramientas artísticas, y funcionalidades de apoyo comunitario.

---

## 📁 ESTRUCTURA DE ARCHIVOS

### 🌐 ARCHIVOS HTML (Páginas Principales)

#### `index.html`
**Propósito**: Página principal del sitio web
**Funcionalidades**:
- Hero section con estadísticas de la comunidad
- Carrusel de obras destacadas de la semana
- Sección de proyectos activos de la comunidad
- Integración con WhatsApp para unirse a la comunidad
- Navegación completa a todas las secciones
- Diseño responsivo con menú móvil

**Características técnicas**:
- Usa Font Awesome para iconos
- Integra múltiples archivos CSS (styles.css, dark-mode.css)
- JavaScript para interactividad (script.js, dark-mode.js)
- Enlaces a redes sociales (TikTok, Instagram, YouTube)

#### `about.html`
**Propósito**: Página "Sobre el Nexo" con información de la comunidad
**Funcionalidades**:
- Historia de la comunidad (desde Greco Art hasta TkAndresB)
- Misión y visión en tarjetas compactas
- Valores fundamentales en grid 2x2
- Sección "Lo que nos hace únicos"
- Testimonios de miembros y administradores
- Equipo de trabajo con roles y contribuciones

**Diseño especial**:
- Layout de dos columnas: Historia+Valores | Misión+Visión+Únicos
- Tarjetas con iconos y gradientes
- Testimonios con badges de roles (Fundador, Admin, Miembro)

#### `galeria.html`
**Propósito**: Galería de arte de la comunidad
**Funcionalidades**:
- Sistema de filtros avanzado (artista, categoría, estilo, año)
- Tarjetas compactas de obras de arte
- Modal para vista ampliada de obras
- Sistema de favoritos
- Contador de resultados dinámico
- Búsqueda por texto

**Características técnicas**:
- Grid responsivo optimizado para mostrar muchas obras
- Botón de favoritos en esquina superior derecha
- Solo muestra: título, autor e ícono de favorito
- JavaScript para filtrado y modal (galeria.js)

#### `miembros.html`
**Propósito**: Directorio de miembros de la comunidad
**Funcionalidades**:
- Sección especial para el fundador con proyectos liderados
- Grid de administradores y miembros
- Sistema de búsqueda y filtros avanzados
- Estadísticas de la comunidad
- Badges de roles (solo iconos, sin texto)
- Enlaces a redes sociales de cada miembro

**Estructura**:
- Fundador: Tarjeta destacada con información extendida
- Administradores: Tarjetas estándar con badge de estrella
- Miembros: Tarjetas básicas con badge de usuario
- Template oculto para nuevos miembros

#### `apoyanos.html`
**Propósito**: Página de apoyo y donaciones
**Funcionalidades**:
- Tarjetas de métodos de apoyo (Honeygain, Sweatcoin)
- Layout lateral con códigos QR
- Sección de apoyo directo
- Impacto del apoyo en la comunidad
- Sección de agradecimiento

**Diseño especial**:
- Tarjetas con QR codes en panel lateral (140px)
- Diseño responsivo que adapta QR debajo en móvil
- Colores de la paleta personalizada

#### `biblioteca.html`
**Propósito**: Biblioteca de recursos educativos
**Funcionalidades**:
- Categorías de recursos (Tutoriales, Referencias, Herramientas)
- Sistema de filtros y búsqueda
- Tarjetas de recursos con enlaces externos
- Sección de recursos destacados
- Contribuciones de la comunidad

#### `centro-mejora.html`
**Propósito**: Centro educativo con cursos y tutoriales
**Funcionalidades**:
- Cursos organizados por categorías
- Sistema de progreso y niveles
- Recursos descargables
- Sección de instructores
- Certificaciones y logros

#### `proyectos.html`
**Propósito**: Proyectos y torneos de la comunidad
**Funcionalidades**:
- Proyectos activos y pasados
- Sistema de filtros por estado y tipo
- Estadísticas de participación
- Enlaces de participación
- Historial de eventos

#### `Generador.html`
**Propósito**: Herramientas generadoras para artistas
**Funcionalidades**:
- Generador de paletas de colores aleatorias
- Generador de referencias de personajes
- Generador de ejercicios de práctica
- Generador de ideas creativas
- Sistema de notificaciones con auto-ocultado
- Modo oscuro completamente integrado

**Características técnicas**:
- Interfaz minimalista y estética
- Notificaciones toast con cierre automático (3 segundos)
- Modal de carga con indicadores visuales
- Integración completa con la paleta de colores del proyecto
- Responsive design optimizado para todas las pantallas
- JavaScript modular (generador.js)

---

### 🎨 ARCHIVOS CSS (Estilos)

#### `css/color-palette.css`
**Propósito**: Paleta de colores centralizada del proyecto
**Contenido**:
- Variables CSS para modo claro y oscuro
- Colores principales: Violeta (#7c3aed), Amarillo (#f59e0b), Verde (#10b981)
- Colores de texto, fondo y bordes optimizados
- Sombras y gradientes predefinidos
- Modo claro con fondos suaves (no blanco puro)
- Modo oscuro con azul marino (#0f172a)

**Variables principales**:
\`\`\`css
--primary-color: #7c3aed (violeta)
--secondary-color: #f59e0b (amarillo)
--accent-color: #10b981 (verde)
--bg-primary: #f7fafc (gris muy claro)
--text-primary: #2d3748 (gris oscuro suave)
\`\`\`

#### `css/styles.css`
**Propósito**: Estilos principales y globales
**Contenido**:
- Reset CSS y estilos base
- Header y navegación responsiva
- Botones y componentes reutilizables
- Grid systems y layouts
- Animaciones y transiciones
- Estilos para todas las páginas principales
- Media queries para responsividad

#### `css/galeria.css`
**Propósito**: Estilos específicos para la galería
**Características**:
- Grid compacto para mostrar muchas obras
- Tarjetas de 250px mínimo con aspect-ratio 1:1
- Botón de favoritos posicionado absolutamente
- Modal con animaciones suaves
- Filtros con glassmorphism
- Hover effects y transiciones

#### `css/miembros.css`
**Propósito**: Estilos para la página de miembros
**Características**:
- Tarjeta especial del fundador minimalista pero elegante
- Badges de roles solo con iconos
- Grid responsivo para miembros
- Filtros avanzados con animaciones
- Estadísticas de la comunidad
- Efectos hover sofisticados

#### `css/apoyanos.css`
**Propósito**: Estilos para la página de apoyo
**Características**:
- Layout lateral para códigos QR (140px)
- Tarjetas cuadradas compactas
- Diseño responsivo que adapta QR
- Integración completa con color-palette.css
- Efectos de hover y animaciones
- Sección de impacto visual

#### `css/biblioteca.css`
**Propósito**: Estilos para la biblioteca de recursos
**Características**:
- Grid de recursos con filtros
- Tarjetas de categorías
- Sistema de tags y etiquetas
- Búsqueda visual mejorada

#### `css/centro-mejora.css`
**Propósito**: Estilos para el centro educativo
**Características**:
- Layout de cursos y lecciones
- Barras de progreso
- Certificaciones visuales
- Instructor profiles

#### `css/proyectos.css`
**Propósito**: Estilos para proyectos y torneos
**Características**:
- Timeline de proyectos
- Estados visuales (activo, completado, próximo)
- Estadísticas de participación
- Filtros por categoría

#### `css/generador.css`
**Propósito**: Estilos específicos para el generador de herramientas
**Características**:
- Diseño minimalista y estético siguiendo la paleta de colores
- Tarjetas de herramientas con efectos hover sutiles
- Botones con transiciones suaves y estados de focus
- Inputs con estilos consistentes y feedback visual
- Sistema de notificaciones toast elegante
- Modal de carga con animaciones
- Soporte completo para modo oscuro
- Grid responsivo para herramientas
- Efectos de glassmorphism en elementos flotantes

#### `css/dark-mode.css`
**Propósito**: Implementación del modo oscuro
**Características**:
- Toggle de tema con animaciones
- Transiciones suaves entre modos
- Persistencia en localStorage
- Iconos adaptativos (luna/sol)
- Soporte completo para todas las páginas incluyendo el generador

---

### ⚡ ARCHIVOS JAVASCRIPT (Funcionalidad)

#### `js/script.js`
**Propósito**: JavaScript principal del sitio
**Funcionalidades**:
- Navegación móvil (hamburger menu)
- Carrusel de obras destacadas
- Smooth scrolling
- Animaciones de entrada
- Manejo de formularios
- Integración con APIs externas

#### `js/dark-mode.js`
**Propósito**: Funcionalidad del modo oscuro
**Funcionalidades**:
- Toggle entre modo claro y oscuro
- Persistencia de preferencia
- Cambio de iconos dinámico con Font Awesome
- Transiciones suaves
- Detección de preferencia del sistema
- Soporte para todas las páginas del sitio

#### `js/galeria.js`
**Propósito**: Funcionalidad de la galería
**Funcionalidades**:
- Sistema de filtros dinámico
- Modal de vista ampliada
- Sistema de favoritos con localStorage
- Búsqueda en tiempo real
- Contador de resultados
- Lazy loading de imágenes

#### `js/miembros.js`
**Propósito**: Funcionalidad de la página de miembros
**Funcionalidades**:
- Filtros avanzados de miembros
- Búsqueda por nombre y especialidad
- Estadísticas dinámicas
- Animaciones de tarjetas
- Ordenamiento por roles

#### `js/biblioteca.js`
**Propósito**: Funcionalidad de la biblioteca
**Funcionalidades**:
- Filtros de recursos
- Sistema de categorías
- Búsqueda de contenido
- Marcadores y favoritos
- Tracking de descargas

#### `js/centro-mejora.js`
**Propósito**: Funcionalidad del centro educativo
**Funcionalidades**:
- Progreso de cursos
- Sistema de logros
- Evaluaciones interactivas
- Certificaciones
- Tracking de aprendizaje

#### `js/proyectos.js`
**Propósito**: Funcionalidad de proyectos
**Funcionalidades**:
- Filtros de proyectos
- Timeline interactivo
- Registro de participación
- Estadísticas en tiempo real
- Notificaciones de eventos

#### `js/generador.js`
**Propósito**: Herramientas generadoras para artistas
**Funcionalidades**:
- Generador de paletas de colores con algoritmos avanzados
- Generador de referencias de personajes aleatorias
- Generador de ejercicios de práctica personalizados
- Generador de ideas creativas con categorías
- Sistema de notificaciones toast con auto-ocultado (3 segundos)
- Modal de carga con indicadores de progreso
- Manejo de errores con notificaciones elegantes
- Integración con localStorage para preferencias
- Funciones utilitarias para generación de contenido
- Optimización de rendimiento con debouncing

#### `js/resultados.js`
**Propósito**: Resultados de torneos y competencias
**Funcionalidades**:
- Visualización de resultados
- Ranking de participantes
- Historial de competencias
- Estadísticas de rendimiento

---

### 🖼️ ESTRUCTURA DE IMÁGENES

#### `img/pfp/admins/`
**Contenido**: Fotos de perfil de administradores
- `TkAndresB/` - Fundador (pfp.jpg, obras: Kaneki.jfif, Sk.jfif, Arima.jfif, Goku.jfif)
- `Godjo/` - Admin (pfp.jfif, obra1.jfif)
- `Fr/` - Admin (obra1.jfif)
- `skillet/` - Admin (obra2.jfif)

#### `img/pfp/members/`
**Contenido**: Fotos de perfil de miembros
- `nj/` - Miembro Aaron (pfp.jfif)
- Estructura para futuros miembros

---

## 🔧 CARACTERÍSTICAS TÉCNICAS

### Responsividad
- **Mobile First**: Diseño optimizado para móviles
- **Breakpoints**: 480px, 768px, 1024px, 1200px
- **Grid Systems**: CSS Grid y Flexbox
- **Imágenes**: Responsive con aspect-ratio

### Accesibilidad
- **ARIA Labels**: En botones y navegación
- **Contraste**: WCAG AA compliance
- **Keyboard Navigation**: Soporte completo
- **Screen Readers**: Texto alternativo y estructura semántica

### Performance
- **CSS**: Minificación y optimización
- **Imágenes**: Lazy loading y compresión
- **JavaScript**: Carga asíncrona y modular
- **Fonts**: Google Fonts con display=swap

### SEO
- **Meta Tags**: Completos en cada página
- **Structured Data**: Schema.org markup
- **Sitemap**: XML sitemap generado
- **URLs**: Semánticas y amigables

### UX/UI Mejoras Recientes
- **Sistema de Notificaciones**: Toast notifications con auto-ocultado y cierre manual
- **Modo Oscuro Mejorado**: Integración completa en todas las páginas con iconos Font Awesome
- **Diseño Minimalista**: Aplicación consistente de la paleta de colores en todos los componentes
- **Interactividad Mejorada**: Efectos hover sutiles y transiciones suaves
- **Accesibilidad**: Estados de focus mejorados y contraste optimizado

---

## 🎨 PALETA DE COLORES DETALLADA

### Modo Claro
\`\`\`css
Primario: #7c3aed (Violeta)
Secundario: #f59e0b (Amarillo dorado)
Acento: #10b981 (Verde esmeralda)
Fondo: #f7fafc (Gris muy claro)
Texto: #2d3748 (Gris oscuro suave)
Bordes: #cbd5e0 (Gris suave)
\`\`\`

### Modo Oscuro
\`\`\`css
Primario: #a78bfa (Violeta claro)
Secundario: #fbbf24 (Amarillo dorado)
Acento: #34d399 (Verde esmeralda)
Fondo: #0f172a (Azul marino muy oscuro)
Texto: #f8fafc (Blanco casi puro)
Bordes: #475569 (Gris medio)
\`\`\`

---

## 🚀 FUNCIONALIDADES PRINCIPALES

### Sistema de Navegación
- Header fijo con logo y navegación
- Menú hamburguesa para móviles
- Breadcrumbs en páginas internas
- Footer con enlaces y redes sociales

### Gestión de Contenido
- Galería de arte con filtros avanzados
- Biblioteca de recursos categorizada
- Centro educativo con progreso
- Directorio de miembros con roles
- Generador de herramientas artísticas

### Interactividad
- Modo oscuro/claro persistente con toggle mejorado
- Sistema de favoritos con localStorage
- Filtros dinámicos en tiempo real
- Modales y overlays animados
- Notificaciones toast con auto-ocultado

### Integración Social
- WhatsApp para comunidad
- Enlaces a redes sociales
- Sistema de testimonios
- Compartir contenido

---

## 📱 COMPATIBILIDAD

### Navegadores Soportados
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Dispositivos
- Desktop: 1920x1080 y superiores
- Tablet: 768px - 1024px
- Mobile: 320px - 767px

### Tecnologías Utilizadas
- HTML5 semántico
- CSS3 con variables y grid
- JavaScript ES6+
- Font Awesome 6.0
- Google Fonts (Inter)

---

## 🔄 MANTENIMIENTO Y ACTUALIZACIONES

### Estructura Modular
- CSS organizado por componentes
- JavaScript modular por funcionalidad
- Imágenes optimizadas y organizadas
- Documentación completa y actualizada

### Escalabilidad
- Sistema de componentes reutilizables
- Variables CSS centralizadas
- Estructura de archivos clara
- Código comentado y documentado

### Actualizaciones Recientes (Agosto 2025)
- **Generador de Herramientas**: Nueva página con múltiples generadores para artistas
- **Sistema de Notificaciones**: Implementación de toast notifications elegantes
- **Modo Oscuro Mejorado**: Integración completa con iconos Font Awesome actualizados
- **Diseño Minimalista**: Aplicación consistente de la paleta de colores en todos los componentes
- **Optimización UX**: Mejoras en interactividad y feedback visual

---

## 📞 CONTACTO Y SOPORTE

**Comunidad Principal**: [WhatsApp](https://chat.whatsapp.com/Lwj85QzALMFBjCnYirEJ9K)
**Redes Sociales**: 
- TikTok: @nexo.artistico4
- Instagram: @nexo.artistico
- YouTube: Nexo Artístico

**Fundador**: TkAndresB (Andrés Bueno)
**Administradores**: Zack, godjo1o, Duvan, y equipo

---

*Documentación generada para Nexo Artístico - Comunidad de Artistas Hispanohablantes*
*Última actualización: Agosto 2025*
*Versión: 2.1 - Incluye generador de herramientas y mejoras UX/UI*

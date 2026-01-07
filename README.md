# Persistencia de imágenes y datos

Las imágenes de portada de las ciudades y todos los datos se almacenan localmente en el navegador usando IndexedDB (ver src/db.ts). Esto asegura que las imágenes y datos persisten incluso si recargas la página o cierras el navegador.

No es necesario usar localStorage adicionalmente, ya que IndexedDB es más robusto y adecuado para almacenar imágenes en base64 y grandes volúmenes de datos.
# 📍 Agenda Preparate México

Una aplicación web moderna y profesional para la gestión integral de salones de eventos en las 32 entidades federativas mexicanas.

## ✨ Características Principales

### 🎯 Pantalla 1 - Estados
- Grid interactivo de tarjetas con los 32 estados mexicanos
- Gradientes únicos por estado
- Navegación intuitiva a ciudades
- Opción de agregar nuevos estados

### 🏙️ Pantalla 2 - Ciudades
- Visualización de ciudades por estado
- Indicadores de "Más usado" (más de 3 salones)
- Contador de salones registrados
- Opción de agregar nuevas ciudades

### 🎭 Pantalla 3 - Catálogo de Salones
- Visualización en tarjetas tipo catálogo
- Imágenes principales del salón
- Información clave: nombre, dirección, capacidad, precio
- Rating de valoración
- Íconos de editar y eliminar
- Botón para agregar nuevo salón

### 📝 Pantalla 4 - Registro de Salón
Formulario en 3 pasos:

#### Paso 1: Información Principal
- Nombre del salón/hotel
- Cantidad de salones (1-5)
- Detalles por salón:
  - Capacidad en herradura
  - Altura del salón
  - Precio
  - Cursos disponibles (Epoxy, Tuning, Globo, Maquillaje)
- Datos de contacto del propietario
- Ubicación en Google Maps
- Carga de múltiples fotos
- Comentarios opcionales

#### Paso 2: Datos Bancarios (Opcional)
- Ciudad (autorrellenada)
- Cursos (autorrellenados)
- Nombre del salón (autorrellenado)
- Beneficiario
- Número de cuenta
- Banco
- Monto
- Forma de pago (100%, 50%, Evento, Salón×Voleto, Diferido)
- Concepto (opcional)
- **Botón de descarga**: Genera archivo de texto con los datos bancarios

#### Paso 3: Valoración
- Cursos indicados (opción múltiple)
- Localización céntrica (Sí/No)
- Estacionamiento disponible (Sí/No)
- Estacionamiento techado (Sí/No)
- Baños limpios (Sí/No)
- Limpieza entrada/salida (Sí/No)
- Buena iluminación (Sí/No)
- Contactos cercanos (Sí/No)
- Descripción detallada

### 🔍 Pantalla 5 - Detalle del Salón
- Vista completa con todas las características
- Galería de imágenes interactiva
- Información de contacto
- Detalles de cada salón (capacidad, altura, precio, cursos)
- Rating visual (estrellas)
- Datos bancarios (si existen)
- Botones de editar y eliminar

## 🎨 Diseño y Estilo

### Características Visuales
- **Modo Oscuro**: Base de color azul oscuro/negro azulado
- **Gradientes**: Únicos por estado (púrpura, azul, verde, naranja, rosa)
- **Tarjetas**: Bordes redondeados (12-16px), sombras suaves
- **Animaciones**: Hover effects, transiciones suaves
- **Tipografía**: Inter (body), Poppins (títulos)
- **Íconos**: Lucide Icons

### Colores Primarios
- Fondo: Dark 950 (#020617)
- Tarjetas: Dark 800 (#1e293b)
- Bordes: Dark 700 (#334155)
- Acentos: Púrpura, Azul, Verde, Naranja, Rosa

## 💾 Persistencia de Datos

- Los datos se guardan automáticamente en **localStorage**
- Sincronización en tiempo real
- Posibilidad de exportar/importar datos
- Datos persistentes entre sesiones

## 🚀 Instalación y Uso

### Requisitos
- Node.js (v16 o superior)
- npm o yarn

### Pasos de Instalación

1. **Clona o navega al directorio del proyecto:**
```bash
cd c:\Users\Usuario\Desktop\AgeMx
```

2. **Instala las dependencias:**
```bash
npm install
```

3. **Inicia el servidor de desarrollo:**
```bash
npm run dev
```

4. **Abre tu navegador:**
```
http://localhost:5173
```

### Compilar para Producción
```bash
npm run build
npm run preview
```

## 📱💻 Instalar como aplicación (PWA)

La app se puede instalar como **aplicación de escritorio** (Windows/Mac/Linux) y como **app móvil** (Android/iOS) desde el navegador.

- **Desktop (Chrome/Edge):** abre `http://localhost:5173/` → botón **Instalar** (icono de “+”/monitor) en la barra de direcciones.
- **Android (Chrome):** menú ⋮ → **Instalar app** / **Agregar a pantalla principal**.
- **iPhone/iPad (Safari):** botón **Compartir** → **Agregar a pantalla de inicio**.

Para probar el comportamiento “instalado” y el Service Worker con mayor fidelidad, usa `npm run build` y luego `npm run preview`.

## 📦 Dependencias

- **React 18.2**: Framework principal
- **TypeScript**: Tipado estático
- **Tailwind CSS**: Estilos y diseño
- **Lucide React**: Iconografía
- **Vite**: Build tool y dev server

## 📁 Estructura del Proyecto

```
AgeMx/
├── src/
│   ├── components/
│   │   ├── StateCard.tsx
│   │   ├── CityCard.tsx
│   │   └── SalonCard.tsx
│   ├── screens/
│   │   ├── StatesScreen.tsx
│   │   ├── CitiesScreen.tsx
│   │   ├── SalonsScreen.tsx
│   │   ├── RegisterSalonScreen.tsx
│   │   └── SalonDetailScreen.tsx
│   ├── context/
│   │   └── AppContext.tsx
│   ├── types.ts
│   ├── data.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

## 🔧 Características Técnicas

### Context API
- Gestión centralizada del estado
- Acceso global a datos de estados, ciudades y salones
- Métodos CRUD completos

### LocalStorage
- Almacenamiento persistente
- Sincronización automática
- No requiere backend

### TypeScript
- Tipado completo
- Interfaces bien definidas
- Mejor experiencia de desarrollo

### Responsive Design
- Adaptable a mobile, tablet y desktop
- Grid flexible
- Breakpoints optimizados

## 📝 Notas Importantes

1. **Las imágenes** se guardan como base64 en localStorage. Para aplicaciones con muchas imágenes, considera usar un servicio de almacenamiento en la nube.

2. **Validaciones**: Todos los campos obligatorios están validados en cada paso del formulario.

3. **Autocompletado**: Los campos de datos bancarios se rellenan automáticamente con la información del registro del salón.

4. **Descarga de datos**: El formato de descarga de datos bancarios es un archivo `.txt` simple.

5. **Google Maps**: Los URLs de ubicación se abren en una nueva pestaña.

## 🎯 Posibles Mejoras Futuras

- Integración con backend (Express, Django, FastAPI)
- Sistema de autenticación
- Exportación a PDF
- Búsqueda avanzada
- Filtros por calificación
- Integración con Google Places API
- Galería de fotos mejorada
- Sistema de reportes

## 📧 Soporte

Para reportar problemas o sugerencias, favor de contactar al equipo de desarrollo.

## 📄 Licencia

© 2024 Agenda Preparate México. Todos los derechos reservados.

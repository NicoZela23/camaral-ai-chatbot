# Camaral AI ChatBot

Un chatbot de IA de calidad empresarial que educa a los prospectos sobre la tecnología de avatares digitales de Camaral, demostrando código de calidad empresarial y experiencia de usuario.

## Características

- **RAG-powered Q&A**: Respuestas precisas basadas en la base de conocimiento
- **Streaming de respuestas**: Respuestas en tiempo real palabra por palabra
- **Preguntas sugeridas**: Preguntas iniciales para ayudar a los usuarios
- **Indicador de escritura**: Muestra el estado durante el procesamiento
- **Renderizado Markdown**: Soporte completo para markdown en respuestas
- **Botón de copiar**: Copia fácil de respuestas
- **Modo oscuro**: Tema claro/oscuro con persistencia
- **Memoria de conversación**: Mantiene el contexto de la conversación
- **Fuentes de respuesta**: Muestra las fuentes utilizadas
- **Puntuación de confianza**: Indica la confiabilidad de las respuestas
- **Fallback elegante**: Manejo de errores y respuestas de baja confianza

## Requisitos Previos

- Node.js 18+
- Docker & Docker Compose
- npm
- Clave API de Google Gemini

## 🛠️ Instalación

1. **Clonar el repositorio**

```bash
git clone <repo-url>
cd camaral-ai-chatbot
```

2. **Instalar dependencias**

```bash
npm install
```

> **Nota**: El proyecto incluye un archivo `.npmrc` que configura `legacy-peer-deps=true` para resolver automáticamente conflictos de dependencias entre `chromadb` y `@google/generative-ai`. Esto es seguro y no afecta la funcionalidad.

3. **Configurar variables de entorno**

```bash
cp .env.example .env.local
# Editar .env.local y agregar tu GEMINI_API_KEY
```

4. **Iniciar ChromaDB en segundo plano**

```bash
docker-compose up -d
```

5. **Ingerir la base de conocimiento**

```bash
npm run ingest
```

> **Importante**: Cada vez que agregues o modifiques documentos en la base de conocimiento, debes ejecutar `npm run ingest` nuevamente para actualizar ChromaDB.

6. **Iniciar el servidor de desarrollo**

```bash
npm run dev
```

7. **Abrir en el navegador**

```
http://localhost:3000
```

## Estructura del Proyecto

```
camaral-ai-chatbot/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/            # API routes
│   │   ├── layout.tsx       # Layout principal
│   │   └── page.tsx         # Página principal
│   ├── components/          # Componentes React
│   │   ├── chat/            # Componentes de chat
│   │   ├── layout/          # Componentes de layout
│   │   └── ui/              # Componentes UI base (shadcn/ui)
│   ├── lib/                 # Librerías core
│   │   ├── rag/             # Pipeline RAG
│   │   ├── llm/             # Integración LLM
│   │   └── utils/           # Utilidades
│   ├── knowledge-base/      # Base de conocimiento (Markdown)
│   ├── types/               # Tipos TypeScript
│   └── hooks/               # Hooks personalizados
├── scripts/                 # Scripts de utilidad
├── docker-compose.yml        # Configuración ChromaDB
└── package.json
```

## Configuración

### Variables de Entorno

Ver `.env.example` para todas las variables disponibles. Las más importantes:

- `GEMINI_API_KEY`: Tu clave API de Google Gemini (requerida)
- `CHROMADB_URL`: URL de ChromaDB (default: http://localhost:8000)
- `RAG_TOP_K`: Número de documentos a recuperar (default: 5)
- `LLM_TEMPERATURE`: Temperatura del modelo (default: 0.7)

## Scripts Disponibles

- `npm run dev`: Inicia el servidor de desarrollo
- `npm run build`: Construye para producción
- `npm start`: Inicia el servidor de producción
- `npm run lint`: Ejecuta ESLint
- `npm run type-check`: Verifica tipos TypeScript
- `npm run ingest`: Ingiere la base de conocimiento en ChromaDB
- `npm run docker:up`: Inicia ChromaDB
- `npm run docker:down`: Detiene ChromaDB

## Arquitectura

El proyecto utiliza:

- **Next.js 15**: Framework React con App Router
- **ChromaDB**: Base de datos vectorial para RAG
- **Google Gemini Pro 1.5**: Modelo de lenguaje
- **Tailwind CSS**: Estilos
- **shadcn/ui**: Componentes UI
- **Framer Motion**: Animaciones

### Flujo de Datos

1. Usuario envía mensaje → `InputBox`
2. POST `/api/chat` → API Route Handler
3. Generar embedding de consulta → Gemini embedding-001
4. Búsqueda vectorial → ChromaDB (top-5 resultados)
5. Reranking → Scoring de relevancia
6. Construir contexto → Combinar documentos recuperados
7. Generar respuesta → Gemini Pro 1.5 (streaming)
8. Stream al cliente → Server-Sent Events
9. Renderizar respuesta → `MessageBubble`

## Gestión de la Base de Conocimiento

### Cómo Agregar Nuevos Documentos

**Importante**: Los archivos Markdown en la carpeta `knowledge-base/` **NO se cargan automáticamente**. El sistema utiliza un archivo índice (`index.json`) que actúa como catálogo de documentos. Para agregar nuevos documentos, sigue estos pasos:

#### Paso 1: Crear el archivo Markdown

Crea tu archivo `.md` en la estructura de carpetas apropiada dentro de `src/knowledge-base/`:

```
src/knowledge-base/
├── company/          # Información de la empresa
├── products/         # Información de productos
├── faqs/             # Preguntas frecuentes
└── [tu-categoria]/   # Puedes crear nuevas categorías
```

**Formato del archivo Markdown**:

- El archivo debe comenzar con un título H1 (`# Título del Documento`)
- Usa estructura clara con encabezados (`##`, `###`)
- El contenido debe estar en español
- Puedes usar listas, código, enlaces, etc.

**Ejemplo** (`src/knowledge-base/products/nuevo-producto.md`):

```markdown
# Nuevo Producto de Camaral

## Descripción General

Este es un nuevo producto que ofrece...

## Características Principales

- Característica 1
- Característica 2
- Característica 3

## Casos de Uso

### Caso de Uso 1

Descripción del caso de uso...
```

#### Paso 2: Registrar el documento en `index.json`

Abre `src/knowledge-base/index.json` y agrega una nueva entrada en el array `documents`:

```json
{
  "id": "identificador-unico",
  "title": "Título del Documento",
  "category": "products",
  "tags": ["tag1", "tag2", "tag3"],
  "path": "products/nuevo-producto.md",
  "priority": 8,
  "description": "Descripción opcional del documento"
}
```

**Campos requeridos**:

- `id`: Identificador único (sin espacios, usar guiones)
- `title`: Título descriptivo del documento
- `category`: Una de las categorías existentes (`company`, `products`, `faqs`) o una nueva
- `tags`: Array de tags relevantes (mínimo 2-3 tags)
- `path`: Ruta relativa desde `knowledge-base/` al archivo `.md`
- `priority`: Número del 1-10 (mayor = más importante en reranking)

**Campos opcionales**:

- `description`: Descripción adicional del documento

**Ejemplo completo de entrada**:

```json
{
  "id": "product-nuevo-producto",
  "title": "Nuevo Producto de Camaral",
  "category": "products",
  "tags": ["producto", "features", "nuevo"],
  "path": "products/nuevo-producto.md",
  "priority": 9,
  "description": "Información detallada sobre nuestro nuevo producto"
}
```

#### Paso 3: Ejecutar la ingestion

Una vez agregado el archivo y actualizado `index.json`, ejecuta:

```bash
npm run ingest
```

Este comando:

1. Lee todos los documentos listados en `index.json`
2. Divide cada documento en chunks (fragmentos) de ~500 caracteres
3. Genera embeddings para cada chunk usando Google Gemini
4. Almacena los embeddings y metadatos en ChromaDB
5. Resetea la colección anterior (reemplaza completamente los datos)

**Nota**: El proceso de ingestion puede tardar varios minutos dependiendo del número de documentos y su tamaño. El script mostrará el progreso en la consola.

### Actualizar Documentos Existentes

Para actualizar un documento existente:

1. **Edita el archivo `.md`** directamente
2. **Ejecuta `npm run ingest`** nuevamente

> **Importante**: Cada vez que ejecutas `npm run ingest`, se **resetea completamente** la base de datos vectorial. Todos los documentos se procesan desde cero. Esto asegura consistencia pero significa que debes ejecutar la ingestion completa cada vez.

### Estructura de Categorías

Las categorías disponibles son:

- **`company`**: Información sobre Camaral, misión, tecnología
- **`products`**: Productos, características, integraciones
- **`faqs`**: Preguntas frecuentes, guías, soporte

Puedes agregar nuevas categorías editando el objeto `categories` en `index.json`:

```json
"categories": {
  "company": { ... },
  "products": { ... },
  "faqs": { ... },
  "nueva-categoria": {
    "name": "Nombre de la Categoría",
    "description": "Descripción de la categoría"
  }
}
```

### Mejores Prácticas

1. **Títulos claros**: Usa títulos descriptivos en H1 al inicio de cada documento
2. **Estructura consistente**: Mantén una estructura similar entre documentos de la misma categoría
3. **Tags relevantes**: Usa tags que los usuarios probablemente usarían al hacer preguntas
4. **Prioridad adecuada**: Asigna prioridades altas (8-10) a documentos críticos
5. **Chunks coherentes**: El sistema divide automáticamente en chunks, pero asegúrate de que cada párrafo tenga sentido por sí solo
6. **Contenido en español**: Todo el contenido debe estar en español para consistencia con el chatbot

### Verificar la Ingestion

Después de ejecutar `npm run ingest`, verifica que todo funcionó correctamente:

1. Revisa la salida de la consola - debe mostrar estadísticas al final
2. Prueba hacer una pregunta relacionada con tu nuevo documento en el chatbot
3. Verifica que las fuentes de respuesta incluyan tu nuevo documento

## Testing

Ejecuta las verificaciones de calidad:

```bash
npm run lint
npm run type-check
```

## Licencia

Ver [LICENSE](./LICENSE) para más información.

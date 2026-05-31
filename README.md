# SpaceXplorer

Aplicación fullstack para explorar, curar y enriquecer contenido del archivo de imágenes de la NASA usando IA generativa.

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS v4, Zustand, React Router 7 |
| Backend | NestJS 11, CQRS, Prisma 7, PostgreSQL 16 |
| IA | OpenAI SDK (GPT-4o-mini) |
| Auth | JWT + bcrypt |
| DevOps | Docker Compose |

## Funcionalidades

**Core:**
- Búsqueda de imágenes NASA con filtros por año y misión
- Colecciones personalizadas con CRUD completo
- Generación de resúmenes por imagen via OpenAI
- Autenticación con registro y login

**Diferenciadores implementados:**
- **Búsqueda semántica** — escribe en lenguaje natural ("atardeceres en Marte") y la IA traduce la consulta a keywords que la API de NASA entiende
- **Sistema de tags** — tagging manual por imagen más sugerencias generadas por IA

## Requisitos

- Docker y Docker Compose
- Una API key de OpenAI (opcional — sin ella, las funciones de IA retornan error)
- Una API key de NASA (opcional — usa `DEMO_KEY` como fallback, con rate limit de 30 req/hora)

## Instalación y ejecución

```bash
# 1. Clonar el repo
git clone https://github.com/georgeaguilar/challenge.git
cd challenge

# 2. Crear el archivo de variables de entorno
cp .env.example .env
# Editar .env con tus API keys

# 3. Levantar todo
docker compose up --build
```

La aplicación queda disponible en:
- **Frontend:** http://localhost
- **API:** http://localhost:3001/api

### Variables de entorno

```env
NASA_API_KEY=tu_key_de_nasa       # Obtener en https://api.nasa.gov
OPENAI_API_KEY=tu_key_de_openai
JWT_SECRET=cambia_esto_en_produccion
```

## Arquitectura

```
frontend/          React SPA servida por nginx
backend/
  src/
    auth/          Registro, login, guards JWT
    collections/   CRUD de colecciones (CQRS)
    collection-images/  Imágenes dentro de colecciones, tags (CQRS)
    nasa/          Proxy a NASA Image API + búsqueda semántica
    ai-summary/    Generación de resúmenes y sugerencias de tags
    prisma/        Servicio de base de datos
prisma/
  schema.prisma    Modelos: User, Collection, CollectionImage, Tag, ImageTag
  migrations/      Historial de migraciones
```

El backend sigue el patrón **CQRS** via `@nestjs/cqrs`: cada operación de lectura es un `Query` con su `Handler`, cada escritura es un `Command` con su `Handler`. Esto separa intenciones claramente y facilita escalar reads/writes de forma independiente.

**Soft delete** está implementado en `Collection`, `CollectionImage` e `ImageTag`: en lugar de borrar registros se setea `deletedAt`. Al re-agregar una imagen o tag previamente eliminado, se restaura el registro (upsert con `deletedAt: null`) en lugar de crear un duplicado.

## Decisiones técnicas y trade-offs

**CQRS en el backend**
Agrega boilerplate para una app de este tamaño, pero demuestra cómo estructurar un sistema que crezca sin mezclar lógica de lectura y escritura. Si el proyecto fuera más pequeño, un simple service/controller habría sido suficiente.

**Búsqueda semántica sin embeddings**
En lugar de mantener una base de datos de vectores, la búsqueda semántica usa OpenAI para traducir la consulta del usuario a keywords en inglés que NASA entiende, luego ejecuta la búsqueda convencional. Es más simple de operar y no requiere infraestructura extra, a costa de no ser "verdadera" búsqueda vectorial.

**Soft delete**
Preserva historial y permite recuperación futura. El trade-off es que todos los queries deben filtrar `deletedAt: null` explícitamente; si se olvida en algún lugar, aparecen registros eliminados.

**Zustand sobre Redux**
API más simple y menos boilerplate para el scope de esta app. Redux tendría más sentido en una aplicación con estado global más complejo o equipo más grande.

**DEMO_KEY como fallback de NASA**
Permite levantar el proyecto sin configuración, pero el rate limit de 30 req/hora lo hace inutilizable en uso real. La documentación debe dejar claro que se necesita una key propia.

## Tests

```bash
# Backend
cd backend && npm test

# Frontend
cd frontend && npm test
```

## Qué haría con más tiempo

1. **Más cobertura de tests** — integración en el backend (controllers + handlers contra DB real) y tests de componentes clave en el frontend (SearchPage, CollectionDetailPage)
2. **Comparador de imágenes** — seleccionar 2+ imágenes y ver análisis comparativo generado por IA side-by-side
3. **Export a PDF** — generar una presentación de la colección con imágenes y resúmenes de IA
4. **Timeline interactivo** — visualizar las imágenes de una colección en una línea de tiempo navegable por año
5. **Paginación en colecciones** — actualmente carga todas las imágenes de una colección; con muchas imágenes puede ser lento
6. **Manejo de errores más granular en el frontend** — actualmente algunos errores de API no se muestran al usuario

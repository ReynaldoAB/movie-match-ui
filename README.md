# Movie Match UI

Frontend de **Movie Match** construido con **React + Vite**.

## Qué incluye
- Vista de **Dashboard** con métricas del catálogo y reviews.
- Vista de **Lista de películas** con grid de tarjetas.
- Formulario modal para agregar películas.
- Filtros remotos por género y rating mínimo.
- Modal de detalle por película con:
  - información básica,
  - eliminación de película,
  - listado de reviews,
  - formulario para agregar review.

## Requisitos
- Node.js 18+
- Backend corriendo en `http://localhost:3000`

## Instalación
```bash
npm install
```

## Ejecutar en desarrollo
```bash
npm run dev
```

La app abre en `http://localhost:5173`.

## Cómo se conecta al backend
En frontend, las llamadas usan rutas con prefijo `'/api'`.

Ejemplo:
- `GET /api/movies`
- `GET /api/movies/genres`
- `GET /api/stats`

Vite redirige ese prefijo al backend (`http://localhost:3000`) mediante `server.proxy` en `vite.config.js`.

## Endpoints usados por la UI
- `GET /movies`
- `GET /movies?genre=ACTION&minRating=8`
- `GET /movies/genres`
- `GET /movies/:id`
- `POST /movies`
- `DELETE /movies/:id`
- `POST /movies/:id/reviews`
- `GET /stats`

## Estructura principal
- `src/App.tsx`: navegación entre dashboard/lista, filtros, detalle y reviews.
- `src/components/Dashboard.jsx`: métricas y actividad reciente.
- `src/add-movie-form.tsx`: modal para crear películas.
- `src/movie-card.tsx`: tarjeta de película.

## Scripts disponibles
- `npm run dev`: servidor de desarrollo.
- `npm run build`: build de producción.
- `npm run preview`: previsualización del build.
- `npm run lint`: lint con ESLint.
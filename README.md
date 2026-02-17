# Movie Match UI

Frontend de la app **Movie Match** construido con **React + Vite**.

## Funcionalidades
- Listado de películas desde API.
- Formulario modal para agregar película.
- Dropdown de género en el formulario (`GET /movies/genres`).
- Dropdown de rating mínimo en el formulario (`Any rating`, `7+`, `8+`, `9+`).
- Botón `Cancel` para cerrar el modal sin guardar.
- Filtros sobre el grid:
	- Género (desde `/movies/genres`).
	- Rating mínimo (`Any rating`, `7+`, `8+`, `9+`).
	- Botón `Clear filters` visible solo cuando hay filtros activos.
- Filtros remotos: cuando cambian, la UI consulta con query params (ejemplo: `/movies?genre=ACTION&minRating=8`).
- Click en tarjeta para abrir modal de detalle de película.
- Sección de reviews dentro del modal:
	- Lista reviews existentes con autor, estrellas (1-5) y comentario.
	- Mensaje vacío: `No reviews yet. Be the first!`.
	- Formulario para agregar review (`name`, `rating`, `comment`).
	- Actualización inmediata de la lista tras enviar review (sin recargar la página).

## Requisitos
- Node.js 18+
- API corriendo en `http://localhost:3000`

## Instalación
```bash
npm install
```

## Ejecutar en desarrollo
```bash
npm run dev
```

La app queda en: `http://localhost:5173`

## Configuración de la API
La UI consume:
- `GET http://localhost:3000/movies`
- `GET http://localhost:3000/movies?genre=ACTION&minRating=8`
- `GET http://localhost:3000/movies/genres`
- `GET http://localhost:3000/movies/{id}` (incluye reviews)
- `POST http://localhost:3000/movies`
- `POST http://localhost:3000/movies/{id}/reviews`

Si cambias el puerto de la API, actualiza `API_URL` en `src/App.tsx`.

## Estructura
- `src/App.tsx`: lista, filtros y carga remota desde la API
- `src/add-movie-form.tsx`: formulario modal para agregar
- `src/movie-card.tsx`: tarjeta de película
- `src/App.tsx`: también incluye modal de detalle y reseñas
- `src/index.css`: estilos base

## Notas de datos
- El backend valida `genre` como enum (ejemplo: `ACTION`, `COMEDY`, etc.).
- El formulario muestra errores de guardado cuando la API responde con error.
- Para guardar película, selecciona rating `7+`, `8+` o `9+` (no `Any rating`).

## Scripts
- `npm run dev` — servidor de desarrollo
- `npm run build` — build de producción
- `npm run preview` — previsualizar build
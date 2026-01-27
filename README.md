# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

# Movie Match UI

Frontend de la app **Movie Match** construido con **React + Vite**.

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
- `POST http://localhost:3000/movies`

Si cambias el puerto de la API, actualiza `API_URL` en `src/App.tsx`.

## Estructura
- `src/App.tsx`: lista de películas y carga desde la API
- `src/add-movie-form.tsx`: formulario para agregar
- `src/movie-card.tsx`: tarjeta de película
- `src/index.css`: estilos base

## Scripts
- `npm run dev` — servidor de desarrollo
- `npm run build` — build de producción
- `npm run preview` — previsualizar build
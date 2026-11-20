# PulsePass

SPA pública y de administración de eventos construida con React, TypeScript y Tailwind CSS.

## Desarrollo

```bash
npm install
npm run dev
```

La aplicación usa `VITE_API_BASE_URL=/api` por defecto y el proxy de Vite hacia `http://localhost:8080`.
Las imágenes de eventos y el fondo de inicio de sesión están empaquetados localmente en `public/images/`; son fotografías de Unsplash bajo su licencia de uso.

## Validación

```bash
npm run lint
npm run build
npm test
```

## Convenciones

- Los datos de sesión provienen de `/api/auth/me`; el correo se obtiene una vez con `/api/users/by-username`.
- Las rutas públicas, autenticadas y por rol están protegidas tanto en el router como por el backend.
- Los estados de carga, vacío, error y éxito usan los componentes compartidos de `src/componentes`.
- Ejecuta `npm run format:check`, `npm run lint`, `npm test` y `npm run build` antes de entregar cambios.
- Consulta [docs/VALIDACION.md](docs/VALIDACION.md) y [docs/diseno/README.md](docs/diseno/README.md) para los criterios visuales y de proceso.

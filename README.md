# PulsePass

PulsePass es una aplicación web de eventos y entradas. Los visitantes pueden explorar la cartelera, los artistas y las sedes. Los usuarios registrados pueden comprar y cancelar entradas, el personal puede validar el ingreso y los administradores pueden gestionar la publicación de eventos.

Este repositorio contiene el **frontend**. Para ejecutar el sistema completo también necesitas el proyecto **Backend PulsePass** y una base PostgreSQL.

## Funcionalidades

| Acceso | Qué puedes hacer |
| --- | --- |
| Visitante | Consultar eventos publicados, aplicar filtros de búsqueda, categoría y artista, explorar artistas y sedes, crear una cuenta e iniciar sesión. |
| `USER` | Comprar entradas, consultar el historial y el detalle de sus tickets, y solicitar la cancelación de una entrada pagada para un evento futuro. |
| `STAFF` | Consultar entradas pagadas por evento, buscar un ticket por código y marcarlo como usado. |
| `ADMIN` | Crear eventos en borrador, asociar artistas, publicar eventos y acceder a las operaciones de ingreso. |

Las entradas pueden ser `GENERAL`, `VIP`, `BACKSTAGE` o `STUDENT`. El backend calcula el precio y comprueba la edad en la fecha del evento, el aforo y el estado de la entrada. Cuando se vende el último cupo, el evento pasa a `SOLD_OUT`. Si se cancela una entrada y queda espacio disponible, vuelve a `PUBLISHED`. Las entradas usadas siguen ocupando cupo. La compra local de demostración no procesa un pago real.

## Tecnologías y arquitectura

| Componente | Tecnologías |
| --- | --- |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS 4 y React Router. |
| Datos y formularios | TanStack Query, React Hook Form y Zod. |
| API | Java 21, Spring Boot, Spring Security, JWT Bearer, JPA/Hibernate y MapStruct. |
| Persistencia | PostgreSQL y migraciones Flyway. |
| Pruebas | Vitest, Testing Library, MSW y axe-core en el frontend. JUnit y Testcontainers en el backend. |

El navegador envía las solicitudes a la API REST. Spring Security verifica el token y el rol, los servicios aplican las reglas de negocio y PostgreSQL almacena los usuarios, roles, sedes, artistas, eventos y entradas. En desarrollo, Vite reenvía las rutas `/api` al backend.

## Inicio rápido en Windows

### 1. Iniciar el backend

Necesitas **Java 21** y una instancia local de **PostgreSQL**. Crea la base `pulsepass` en pgAdmin si todavía no existe. En PowerShell, abre el directorio del proyecto backend y configura las variables para esa terminal:

```powershell
cd C:\Users\Jhesu\pulse-pass
$env:DB_URL = 'jdbc:postgresql://localhost:5432/pulsepass'
$env:DB_USER = 'postgres'
$env:DB_PASSWORD = Read-Host 'Contraseña de PostgreSQL' -MaskInput
$bytes = New-Object byte[] 32
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$rng.GetBytes($bytes)
$env:PULSEPASS_JWT_SECRET_BASE64 = [Convert]::ToBase64String($bytes)
$rng.Dispose()
.\mvnw.cmd spring-boot:run
```

El ejemplo de entrada oculta usa PowerShell 7. Si ya tienes `DB_PASSWORD` y `PULSEPASS_JWT_SECRET_BASE64` configuradas, conserva sus valores. Spring carga las variables de entorno de la terminal. Flyway aplica las migraciones al arrancar y la API queda disponible en `localhost:8080`.

### 2. Iniciar el frontend

Usa **Node.js 24** y npm. En otra terminal, desde la raíz de este repositorio:

```powershell
npm ci
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173). El frontend usa `VITE_API_BASE_URL=/api` por defecto y Vite apunta a `http://localhost:8080`. Para cambiar la URL, copia [`.env.example`](./.env.example) como `.env.local` y reinicia Vite. Para servir la compilación fuera de Vite, el alojamiento debe enviar las rutas del frontend a `index.html` y dirigir `/api` al backend o usar una URL de API con CORS configurado.

### 3. Cargar datos de demostración

Abre pgAdmin, selecciona la base local `pulsepass`, abre **Query Tool** y ejecuta [`scripts/seed-demo.sql`](./scripts/seed-demo.sql). Hazlo después del primer inicio del backend para que las tablas ya existan. Puedes ejecutar el script de nuevo sin duplicar las filas de demostración.

| Evento | Caso de prueba |
| --- | --- |
| `DEMO-CARIBE` | Explorar el detalle, comprar una entrada y consultar o cancelar el ticket. |
| `DEMO-AFORO` | Vender el único cupo, cancelar y comprobar que se puede comprar otra vez. |
| `DEMO-EDAD` | Verificar el rechazo con una cuenta que tenga menos de 18 años en la fecha del evento. |
| `DEMO-BORRADOR` | Asociar un artista y publicar el evento desde el panel de administración. |

El script crea sedes y eventos y vincula artistas existentes. La preparación de cuentas se hace en el paso siguiente. Los fixtures de Postman del backend usan la base dedicada `pulsepass_e2e`. Su guía está en `tests/e2e/README.md` del backend.

### 4. Preparar cuentas y roles

Desde [Registro](http://localhost:5173/registro), crea una cuenta por cada rol que quieras probar. Todas empiezan con `USER`. El backend exige al menos 12 caracteres y un máximo de 72 bytes UTF-8 para la contraseña.

Para asignar `ADMIN` a una cuenta **ya registrada**, detén el backend con `Ctrl+C` y ejecuta en la misma terminal:

```powershell
$env:SPRING_PROFILES_ACTIVE = 'local'
$env:PULSEPASS_LOCAL_ROLE_BOOTSTRAP_ENABLED = 'true'
$env:PULSEPASS_LOCAL_ROLE_BOOTSTRAP_EMAIL = 'demo-admin@example.test'
$env:PULSEPASS_LOCAL_ROLE_BOOTSTRAP_ROLE = 'ADMIN'
.\mvnw.cmd spring-boot:run
```

Usa el correo que registraste. Para asignar `STAFF` a la segunda cuenta, repite el arranque con su correo y `PULSEPASS_LOCAL_ROLE_BOOTSTRAP_ROLE='STAFF'`. Después de asignar ambos roles, reinicia con `PULSEPASS_LOCAL_ROLE_BOOTSTRAP_ENABLED='false'`. Los roles quedan guardados en PostgreSQL. Cierra sesión y vuelve a ingresar para cargar los permisos. La asignación por arranque está pensada para el perfil de desarrollo `local`.

## Rutas del frontend

| Acceso | Rutas |
| --- | --- |
| Público | `/`, `/eventos`, `/eventos/:eventCode`, `/artistas`, `/artistas/:id`, `/sedes`, `/sedes/:code`, `/login`, `/registro` |
| Sesión iniciada | `/cuenta` |
| `USER` | `/mis-tickets`, `/mis-tickets/:ticketCode`, `/compra/confirmacion/:ticketCode` |
| `STAFF` o `ADMIN` | `/staff/validacion`, `/staff/tickets-pagados`, `/staff/eventos/:eventCode/tickets` |
| `ADMIN` | `/admin/eventos`, `/admin/eventos/nuevo`, `/admin/eventos/:eventCode` |

La sesión se valida mediante `GET /api/auth/me`. El frontend obtiene el correo del perfil con `GET /api/users/by-username` y usa ese correo al comprar o consultar entradas propias. El backend vuelve a verificar el rol y el propietario en cada operación protegida.

## API REST

| Recurso | Operaciones principales |
| --- | --- |
| Sesión y usuarios | `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/users` |
| Cartelera | `GET /api/events/published`, `GET /api/events/{eventCode}`, `GET /api/events/by-artist` |
| Sedes y artistas | `GET /api/venues/active`, `GET /api/venues/{code}`, `GET /api/artists/active`, `GET /api/artists/{id}`, `GET /api/artists/by-stage-name` |
| Tickets | `POST /api/tickets`, `GET /api/tickets/by-user`, `GET /api/tickets/{ticketCode}`, `PATCH /api/tickets/{ticketCode}/cancel` |
| Ingreso | `GET /api/events/{eventCode}/tickets/paid`, `PATCH /api/tickets/{ticketCode}/use` |
| Administración | `POST /api/events`, `PATCH /api/events/{eventCode}/publish`, `POST /api/events/{eventCode}/artists/{artistId}` |

Las solicitudes autenticadas llevan `Authorization: Bearer <token>`. Una sesión inválida devuelve `401`, los permisos insuficientes devuelven `403` y un conflicto con una regla de negocio puede devolver `409`.

## Pruebas y compilación

| Comando en el frontend | Resultado |
| --- | --- |
| `npm test` | Ejecuta las pruebas automatizadas. MSW simula respuestas de la API en las pruebas de interfaz. |
| `npm run coverage` | Genera el reporte de cobertura en `coverage/`. |
| `npm run lint` | Ejecuta ESLint. |
| `npm run format:check` | Comprueba el formato de código con Prettier. |
| `npm run build` | Comprueba TypeScript y genera la compilación en `dist/`. |
| `npm run preview` | Sirve la compilación para revisión local. |
| `npm run lhci` | Audita Inicio con Lighthouse. Ejecuta el build primero y ten Chrome disponible. |

Para ejecutar la suite del backend, usa `.\mvnw.cmd clean test` en su repositorio. Las pruebas de integración con Testcontainers requieren Docker activo.

Para una prueba manual del sistema completo:

1. Con `USER`, compra una entrada de `DEMO-CARIBE`, revisa el estado `PAID` y cancélala. Confirma que aparezca como `CANCELLED`.
2. Compra el único cupo de `DEMO-AFORO`, cancélalo y comprueba que la cartelera muestre nuevamente el evento y permita otra compra.
3. Con `STAFF`, busca una entrada de demostración que siga en `PAID`, valídala y comprueba que pase a `USED`. El ticket usado no debe poder validarse otra vez.
4. Con `ADMIN`, busca `DEMO-BORRADOR`, asocia un artista, publica el evento y abre la cartelera pública para comprobar que aparece.

## Estructura del frontend

| Ubicación | Contenido |
| --- | --- |
| `src/pages/` | Pantallas de cartelera, artistas, sedes, cuenta, entradas, ingreso y administración. |
| `src/funcionalidades/` | Consultas, mutaciones y validación de datos por dominio. |
| `src/componentes/` | Controles visuales y estados de carga, error y listas vacías. |
| `src/layouts/` y `src/router.tsx` | Diseño compartido, navegación y guardas de acceso. |
| `src/lib/` | Cliente HTTP, rutas, almacenamiento de sesión y utilidades. |
| `src/test/` | Pruebas, datos de ejemplo y simulaciones de la API. |
| `public/images/` | Fotografías locales de Unsplash usadas en la interfaz. |
| `scripts/` | Datos de demostración para PostgreSQL. |

## Problemas frecuentes

| Síntoma | Qué revisar |
| --- | --- |
| La cartelera está vacía | Comprueba que el backend use la misma base en la que ejecutaste `seed-demo.sql` y que haya eventos publicados. |
| Vite abre, pero las solicitudes fallan | Comprueba que el backend escuche en el puerto 8080 y que PostgreSQL esté disponible. |
| Spring falla al iniciar | Revisa `DB_URL`, `DB_USER`, `DB_PASSWORD` y la clave JWT. Busca el primer error de conexión o migración en la terminal del backend. |
| El panel devuelve `403` | Comprueba el rol de la cuenta y vuelve a iniciar sesión después de asignarlo. |

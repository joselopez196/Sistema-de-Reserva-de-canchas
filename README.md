# Sistema de Reserva de Canchas

Página web para consultar horarios y administrar reservas de canchas deportivas. Permite gestionar clientes y pagos, revisar el historial y descargar o restaurar respaldos.

## Descripción

El sistema muestra la disponibilidad de las canchas por fecha y permite crear, editar y cancelar reservas. También ayuda a organizar los datos de clientes, registrar pagos recibidos y consultar los saldos pendientes.

Está desarrollado con HTML, CSS y JavaScript. Para el uso básico, se puede abrir `index.html` directamente en un navegador.

## Objetivo

Facilitar la gestión de las reservas y pagos de canchas deportivas, ayudar a evitar cruces de horarios y reunir la información del negocio en una sola página.

## Funcionalidades

### Reservas

- Consultar disponibilidad por fecha y cancha.
- Ver horarios disponibles y reservados.
- Crear y editar reservas con datos del cliente, cancha, fecha, hora y duración.
- Calcular el precio de acuerdo con la cancha y el tiempo reservado.
- Evitar cruces con otras reservas activas.
- Cancelar una o varias reservas visibles.
- Conservar las reservas canceladas en el historial.

### Clientes

- Guardar nombre, correo y teléfono.
- Buscar, editar y eliminar clientes.
- Asociar los datos de contacto del cliente con sus reservas.

### Pagos

- Registrar pagos recibidos asociados a una reserva.
- Indicar el método de pago, el importe y una referencia opcional.
- Consultar los importes pagados y pendientes.
- Buscar, editar y eliminar pagos.
- Controlar que el importe registrado no supere el saldo pendiente.

El sistema registra pagos recibidos; no procesa cobros electrónicos.

### Reportes e historial

- Consultar reservas activas y canceladas.
- Buscar en el historial por fecha, cliente o cancha.
- Descargar un respaldo JSON de reservas, clientes y pagos.
- Descargar un reporte CSV de las reservas.
- Restaurar información desde un archivo JSON.

### Apariencia

- Interfaz en español, con importes en soles peruanos (S/).
- Tema claro y oscuro.
- Diseño adaptable a pantallas pequeñas.
- Animaciones que respetan la preferencia de movimiento reducido del dispositivo.

## Canchas y tarifas

| Cancha | Tarifa por hora |
| --- | ---: |
| Fútbol 7 - Cancha 1 | S/ 80 |
| Fútbol 7 - Cancha 2 | S/ 80 |
| Tenis - Cancha 1 | S/ 45 |
| Pádel - Cancha 1 | S/ 60 |

Los horarios configurados son 07:00, 08:00, 09:00, 10:00, 11:00, 12:00 y de 16:00 a 21:00. La duración se puede establecer en 1 hora, 1 hora y 30 minutos o 2 horas.

## Tecnologías utilizadas

- HTML
- CSS
- JavaScript
- LocalStorage

## Cómo ejecutar el proyecto

1. Descarga o clona este repositorio.
2. Abre la carpeta del proyecto.
3. Abre el archivo `index.html` en un navegador.
4. Usa las pestañas para acceder a Reservas, Clientes, Pagos y Reportes e historial.

No se requiere instalar dependencias para el uso básico.

## Organización de archivos

- `index.html`: estructura y contenido de la página.
- `styles.css`: diseño, temas, adaptación a pantallas y animaciones.
- `app.js`: lógica de reservas, clientes, pagos, reportes y almacenamiento.

## Almacenamiento y limitaciones

La información se guarda en LocalStorage del navegador. Los datos permanecen disponibles en el mismo navegador y dispositivo, pero no se sincronizan automáticamente con otros dispositivos o usuarios.

Para compartir información entre varios usuarios o dispositivos, se necesitaría conectar el proyecto a un servidor y una base de datos. Se recomienda descargar respaldos periódicamente desde la sección Reportes e historial.

## Ramas del repositorio

- `main`: versión principal del proyecto.
- `backend`: rama destinada al trabajo relacionado con el backend.
- `fronted`: rama destinada al trabajo relacionado con el frontend.

## Autor

Joselopez196
```

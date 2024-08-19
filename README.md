# Microservicio de Órdenes

Este microservicio gestiona las órdenes en nuestro sistema. Proporciona funcionalidades para crear, listar y actualizar el estado de las órdenes.

## Características

- Creación de órdenes
- Listado de órdenes con paginación
- Búsqueda de órdenes por ID
- Actualización del estado de las órdenes

## Requisitos previos

- Node.js
- Docker
- Docker Compose

## Configuración

1. Clona este repositorio
2. Instala las dependencias:

   ```
   npm install
   ```

3. Configura las variables de entorno en un archivo `.env` basado en el `.env template`
4. Ejecutar migracion de prisma  ``npx prisma migrate dev`

## Levantar la base de datos con Docker

Para levantar la base de datos, ejecuta el siguiente comando:

```
docker compose up -d

```





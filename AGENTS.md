# Verificación

- `npm test` ejecuta `refactor.test.mjs` con el runner nativo de Node, sin dependencias de pruebas adicionales.
- Las pruebas extraen con TypeScript los handlers reales de selección de año y edición de citas; no requieren exportarlos ni moverlos fuera de los componentes.

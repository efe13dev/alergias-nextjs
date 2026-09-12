# Verificación

- `npm test` ejecuta `refactor.test.mjs` con el runner nativo de Node, sin dependencias de pruebas adicionales.
- Las pruebas extraen con TypeScript los handlers reales de selección de año y edición de citas; no requieren exportarlos ni moverlos fuera de los componentes.
- `npm run lint` ejecuta `biome check .` (lint + formato + orden de imports/clases). `npm run lint:fix` aplica los arreglos seguros y `npm run format` solo formatea. Biome sustituye a ESLint y Prettier.

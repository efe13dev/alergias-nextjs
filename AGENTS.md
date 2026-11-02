# Verificación

- `bun test` ejecuta `refactor.test.mjs` con el runner nativo de Bun, sin dependencias de pruebas adicionales.
- Las pruebas extraen con TypeScript los handlers reales de selección de año y edición de citas; no requieren exportarlos ni moverlos fuera de los componentes.
- `bun run lint` ejecuta `oxlint` y `bun run format` ejecuta `oxfmt` (formato + orden de imports/clases Tailwind). `bun run lint:fix` aplica los arreglos seguros de `oxlint`. Oxlint y Oxfmt sustituyen a Biome, ESLint y Prettier.

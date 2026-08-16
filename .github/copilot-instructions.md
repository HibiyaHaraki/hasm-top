# HASM Top Copilot Instructions

## Project boundaries

- Keep the top-level app focused on the HASM project index and the HASM Markdown preview.
- Treat `submodules/hasm_markdown` as the source of truth for the Markdown page design, editor syntax highlighting, and related behavior.
- Do not edit files inside `submodules/hasm_markdown`, `submodules/hasm`, or `submodules/hasm_logo` from this repository. Update the upstream repository instead, then run the appropriate sync script.
- Do not edit files under `src/generated/` by hand. Regenerate them with `npm run sync:markdown-design`.

## UI and design

- The HASM Markdown page must match the current `hasm_markdown` design. Reuse its synced tokens, class names, typography, spacing, and interaction patterns before introducing new styling.
- All user-facing copy must support the shared multi-language system in `src/i18n.js`. Add the same key to every supported locale and persist language changes consistently.
- Colors must come from `src/hasm_color_pattern`. Do not hard-code theme colors in components. Use the shared CSS variables and preserve readable foregrounds for text placed on accent backgrounds.
- Validate responsive behavior when adding controls or changing layout. Keep selectors and navigation usable on narrow screens.

## Logging

- Use `src/hasm_logger/src/react/logger.js` for application and script logging. Prefer `createLogger("module-name")` for module-specific context.
- Use `trace` for diagnostic detail, `debug` for development state, `info` for completed lifecycle actions, `warn` for recoverable conditions, and `error` for failures.
- Do not add direct `console.log`, `console.warn`, or `console.error` calls when a `hasm_logger` call is appropriate.
- Scripts should include the repository's header comment describing the file name, purpose, and behavior. Add concise functional comments before non-obvious blocks.

## Validation

- Run `npm run sync` when validating sync behavior.
- Run `npm run build` after changes to React code, generated design integration, or sync scripts.
- Run `npm run lint` for code-quality checks. Existing warnings in submodules are outside this repository's scope unless the change causes them.
- Keep changes focused and do not commit or modify submodule contents as part of top-level work.

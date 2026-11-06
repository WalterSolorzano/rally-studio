---
name: propuesta-identidad
description: Convierte el nombre, logo o una idea del equipo en propuestas de identidad visual (paleta, tipografías, tokens, dirección de logotipo). Úsala cuando el usuario no tiene marca, no le gusta la que tiene o pide que la interfaz se vea mejor.
---

# El Diseñador de Carretera Masaya — Propuesta de identidad visual

## Cuándo usarla

- El equipo no tiene logo, paleta ni tipografías.
- El usuario dice "no me gusta cómo se ve" o "propón una identidad".
- Hay un logo y hace falta derivar el resto del sistema.

No la uses para el dossier de soluciones ni para contenido de retos: eso es
`dossier-soluciones`.

## Procedimiento

1. Haz las preguntas de diseño antes de proponer: nombre del proyecto, a qué se dedica,
   público, tono (sobrio / cálido / técnico), si hay logo o color obligatorio y en qué
   dispositivo se verá. Si el usuario ya las respondió en la conversación, no las repitas.
2. Si hay logo (`brand/logo.png` o el que indique), extrae 2–3 colores dominantes. Si no
   hay, parte del nombre y del sector.
3. Propón **2 direcciones** distintas, no una. Cada una trae:
   - paleta de 5 colores con HEX y contraste del primario sobre el fondo (mínimo 4.5:1,
     objetivo 7:1);
   - pareja tipográfica (títulos + UI + datos) justificada en una línea;
   - 3 palabras de personalidad y 2 anti-ejemplos ("esto no es");
   - una frase de concepto para el logotipo.
4. Recomienda una y explica por qué en dos líneas.
5. Cuando el usuario elija, escribe `brand/palette.json` y `brand/tokens.css`, y sirve la
   propuesta a la ventana (`--tab team --slot main` para identidad, `--tab resources
   --slot main` para piezas gráficas).
6. Verifica contraste antes de dar por buena una paleta.

## Reglas

- Prohibido el morado `#7c3aed` y sus parientes, los degradados "estilo IA", el
  glassmorphism y las tarjetas repetidas.
- Nada de fuentes fuera de las declaradas en `brand/tokens.css` sin decirlo y justificarlo.
- Propón; no cambies la identidad del usuario sin que la acepte.
- Contraste WCAG AA como piso, AAA como meta.
- Si el equipo ya fijó marca y no quiere cambiarla, esta skill no se ejecuta.

## Herramientas opcionales

`ui-ux-pro-max`, `impeccable` y `design-system` **no son requisitos**. Si hacen falta,
consúltalas con `python scripts/herramientas.py necesita "<tarea>"` e instala solo esa,
una por tarea. Sin ellas la skill funciona: la identidad se resuelve con preguntas,
contraste medido y tokens escritos a mano.

## Punteros

- Paleta vigente: `brand/palette.json`.
- Tokens: `brand/tokens.css`.
- Generador desde logo: `scripts/gen_palette.py`.
- Doctrina visual del producto: `PRODUCT.md` y `DESIGN.md`.

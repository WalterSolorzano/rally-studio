# Cómo sugerir elementos gráficos

Un elemento gráfico justifica su existencia cuando dice algo que el texto no dice.
Antes de proponer un icono, una ilustración o una figura, responde qué reemplaza.

## Decisión, en orden

1. **¿Es un número o un nombre?** Si sí, va en texto, con jerarquía tipográfica. No
   se dibuja.
2. **¿Se resuelve con la receta?** Volumen, halo, planos, anillo: `skills/_comun/recetas-visuales.md`,
   solo `var(--…)`. Antes que cualquier render.
3. **¿Es un icono de interfaz?** SVG de trazo uniforme (un solo `stroke-width`),
   esquinas del mismo radio, tamaño de `--space-4` o `--space-5`. Nada de emoji.
4. **¿Es una imagen de contexto?** Foto real de la problemática del proyecto, no
   banco de imágenes genérico. Sobre ella va placa de superficie para el texto.
5. **¿Es 3D?** Solo si es la pieza física: `skills/modelo-3d-blender/SKILL.md`, con
   ficha aprobada y `gpu_lock`.

## Reglas duras

- Sin emojis como iconos, viñetas ni en el HTML.
- Sin morado `#7c3aed` ni colores fuera de `brand/tokens.css`.
- Sin cards genéricas ni `backdrop-filter`: la estructura se hace con jerarquía
  tipográfica, filas y divisores de 1 px.
- Fuentes solo las de `brand/tokens.css`; ninguna familia nueva por elemento.
- Banderas de país: emoji no se renderiza en Chromium/Windows; se dibuja SVG de
  franjas con los colores del país.
- Caras en iconos: ojos y boca derivados del radio del dibujo y placa blanca detrás;
  nada de caritas con degradado.
- Thumbnail y portada: sin figuras básicas (cuadrado, rectángulo, círculo, triángulo)
  como argumento visual; foto real de la problemática sobre ilustración; sin texto
  de relleno, sin logos, sin marcas de agua; PNG 2048×2048 con fondo transparente.
- Capturas, GIF y figuras con datos: `skills/_comun/capturas.md`.

## Prueba antes de entregar

- Mira el elemento a 390 px de ancho. Si se convierte en una mancha, no sirve en
  móvil y hay que simplificarlo.
- Mide el contraste del texto sobre la figura: ≥ 4.5:1. La compuerta
  `python scripts/probar_diseno.py --tipo <pieza>` lo cubre para `site/`.
- Quita el elemento y vuelve a leer la pieza. Si nada se pierde, sobra.

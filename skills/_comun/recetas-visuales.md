# Cómo resolver volumen sin pedir un modelo 3D

3D-lite **antes** que Blender. Un mockup, una cabecera o un icono con volumen se
resuelven con CSS y los tokens del proyecto. Blender queda para la pieza física que
se va a mostrar como objeto: ficha técnica aprobada, `gpu_lock` tomado, render
auditado. Encender GPU para un brillo de fondo es quemar tiempo del rally.

## La regla

1. Se parte de `brand/tokens.css`. Ninguna receta escribe un color literal ni una
   fuente: solo `var(--…)`. Si la receta necesita un tono, lo deriva con `color-mix`
   del token que ya existe.
2. El volumen va en decoración. **Ningún dato se lee sobre una receta**: la cifra, el
   nombre y la etiqueta van en texto propio, encima del fondo limpio.
3. `--color-accent-decor` es siempre < 3:1 contra el fondo: sirve de halo, nunca de
   texto.
4. Toda transición sale de `--motion-*`, y toda animación vive dentro de
   `@media (prefers-reduced-motion: no-preference)`.

## Recetas listas

Viven en `design/recetas/`. Se copia la clase al proyecto; no se importa el archivo
completo.

| Receta | Uso | Antipatrón que reemplaza |
|---|---|---|
| `bisel-dispositivo.css` | Marco de teléfono o de ventana para una maqueta | Teléfono de tres rectángulos y un círculo, o un emoji de teléfono |
| `esfera-volumetrica.css` | Cuerpo redondo con luz, para un objeto o un estado | Círculo plano con degradado de tres colores y brillo glassmorphism |
| `capas-atmosfera.css` | Fondo de cabecera o de escena por planos que se alejan | Degradado violeta de plantilla y `backdrop-filter` |
| `planos-horizonte.css` | Suelo en perspectiva para situar la pieza | Rejilla de decenas de divs o un degradado morado |
| `anillo-progreso.css` | Avance circular con el número aparte | Donut de cuatro divs rotados o canvas por métrica |
| `halo-suave.css` | Separa la pieza protagonista sin dibujar caja | Card con borde, sombra difusa y fondo translúcido |

## Cuándo sube a Blender

Solo si se cumplen las tres:

- La pieza es un **objeto físico** que el jurado debe reconocer (equipo, prototipo,
  contenedor), no un efecto de fondo.
- Existe ficha técnica con dimensiones reales, tomadas de `budget/bom.csv` o del
  reto, aprobada por el humano antes de abrir Blender.
- El video o la landing tienen un encuadre donde esa pieza se ve de verdad.

Para todo lo demás: `skills/modelo-3d-blender/SKILL.md` no se abre.

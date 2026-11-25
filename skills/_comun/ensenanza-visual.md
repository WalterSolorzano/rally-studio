# Cómo enseñar visualmente

Reglas para que una imagen enseñe algo en el video o en la landing. Si el rótulo
necesita explicación, la imagen no está enseñando: está decorando.

## Una idea por imagen

- Un solo foco. El ojo entra por el elemento más grande y sale por el rótulo; si hay
  dos focos del mismo tamaño, no hay foco.
- La imagen responde una pregunta concreta: qué es, cuánto cuesta, dónde ocurre, qué
  cambia. Si no hay pregunta, se retira del video.
- La cifra que acompaña a la imagen existe antes que la imagen: sale de
  `research/claims.json` o de `budget/budget.json`, nunca del dibujo.

## Rótulos

- Texto **fuera** de la foto cuando la foto tiene textura: placa de superficie
  (`--bg-app` al 92 %) con tinta `--text-title`. Nunca texto claro sobre foto sin
  placa.
- Margen mínimo 6 % del ancho del cuadro; el rótulo no toca el borde.
- Tamaño de letra mínimo 2 % de la altura del cuadro (a 1080 px de alto: 22 px).
- Regular antes que bold. La jerarquía se hace por tamaño y color, no por negrita en
  todo.
- Rótulos con flecha cuando señalan un punto de la imagen; la flecha termina en el
  objeto, no en el aire.
- Acentos reales del español escritos con tilde: `producción`, `kilómetros`, `más`.
  Un rótulo sin tildes se lee como error del equipo.

## Cámara y secuencia (para el video)

- Una distancia focal por secuencia: no se mezcla plano general con macro en el mismo
  pase.
- El movimiento lo da la cámara o el objeto, no el fundido: entre tomas se desplaza o
  se corta, nunca se cruza en fundido (deja texto fantasma).
- Cada toma cambia algo respecto a la anterior: escala, ángulo o dato. Dos tomas
  iguales son una toma.

## Entrega

- Gráfico suelto: PNG 2048×2048, fondo transparente, sin texto incrustado y sin
  marcas de agua; el rótulo va en la composición, no en el archivo.
- Captura o GIF: reglas completas en `skills/_comun/capturas.md`.
- Nombrado: `asset_<shotlist_id>_<descripcion>.<ext>`.
- Antes de entregar: mirar el PNG al 100 % y al 25 %. Al 25 % se ve si el foco
  aguanta; al 100 % se ven los cortes de letra y las transparencias sucias.

## Lo que no se hace

- Emoji como icono o como viñeta.
- Ilustración genérica de oficina, apretón de manos o bombilla para representar la
  idea.
- Poner el nombre del proyecto en los primeros 20 s del video.
- Morado `#7c3aed` o cualquier color fuera de `brand/tokens.css`.

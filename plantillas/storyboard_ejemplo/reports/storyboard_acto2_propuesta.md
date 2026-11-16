# Acto II propuesto: 0:20 - 1:00 (40 s exactos)

Version independiente, escrita desde `knowledge/rubric_matrices.md` §1 y §3,
`docs/INFORME_INVESTIGACION.md` §9.3 y `script/guion_guia.md`.
No copia la version de `docs/STORYBOARD.md`.

## Restricciones que respeta

- 40 s exactos, de 0:20 a 1:00. Suma: 5 + 10 + 10 + 6 + 5 + 4 = 40.
- Cero nombre de proyecto, equipo o ciudad en el guion hablado. El nombre entra como
  rotulo en pantalla a partir de 0:20 y se lee de `brief.json` cuando exista.
- Cero cifras como hecho. `research/claims.json` esta vacio (`[]`) y `budget/budget.json`
  tambien, asi que todo dato va como `[PENDIENTE]`.
- Fraccion de rubrica del Acto II: 33 % de 120 s = 39,6 s. Aqui 40 s = 33,3 % (+0,3 pp).
- Funcion del acto segun §9.3: nombrar la solucion y abrir la caja negra. El beneficio
  no aparece antes que el mecanismo.

## Las 6 tomas

| ID | Ventana | s | Que se ve | Voz en off (palabras) | Item de rubrica | Evidencia del corpus |
|---|---|---|---|---|---|---|
| A1 | 0:20-0:25 | 5 | Placa tipografica: una sola frase de tesis. El nombre del proyecto entra como rotulo pequeno, nunca hablado. Sin logo, sin integrantes. | "Es un sistema que convierte el descarte en insumo, sin cambiarle la rutina a quien lo usa." (16) | e3 propuesta de valor clara | §9.3 linea 635: "Una sola frase de tesis («es un sistema que…»)". §9.1 linea 609: el Acto II "nombra la solucion". |
| A2 | 0:25-0:35 | 10 | Render 3D del prototipo en vista 3/4, giro lento de 30 grados, escala legible contra una mano o un escritorio. Una sola distancia focal. | "Se instala en el mismo puesto de trabajo. Tres piezas, sin obra y sin capacitacion larga: se arma en una mesa." (20) | a1 solucion innovadora; e4 ilustraciones claras | §8.5 item 3, linea 594: "El render 3D es el lenguaje comun del pitch tecnico". §9.3 linea 629: "corte, vista explosionada, diagrama de bloques". |
| A3 | 0:35-0:45 | 10 | Vista explosionada: cuatro componentes se separan y cada uno se resalta mientras la voz lo nombra. Maximo cuatro. | "Cuatro partes: entrada, camara de proceso, sensor y salida. La carcasa se imprime; el resto se compra en catalogo local." (19) | a2 capacidad creativa; a3 tecnologias apropiadas; d2 recursos de facil obtencion | §9.3 lineas 629-631: "el jurado debe entender como funciona sin leer el reporte"; Techriders "valvulas y sensores". d2 solo en `rubric_matrices` §1.d.2, sin respaldo en el corpus: se declara. |
| A4 | 0:45-0:51 | 6 | Diagrama de bloques del flujo interno sobre una linea: entra residuo, ocurre el proceso, sale insumo. Flechas con rotulo. | "El residuo entra por arriba, el proceso lo separa y el insumo sale al costado." (15) | d1 base teorica documentada | §9.3 linea 629: "diagrama de bloques, reaccion quimica, flujo de datos" como formas de abrir el mecanismo. |
| A5 | 0:51-0:56 | 5 | Demo real en operacion: equipo encendido o interfaz respondiendo. Tres segundos sin voz; solo SFX de clic o tecleo. | "Asi funciona, sin intervencion." (4) | a4 usabilidad; d3 acorde a los usuarios | §9.3 linea 631: los ganadores "muestran" el sistema en operacion (BidiSign, gemelo digital). `guion_guia` §"Que evitar": descartar la app sola sin hardware tangible. |
| A6 | 0:56-1:00 | 4 | Placa de validacion: instrumento o registro de prueba en pantalla, con la fuente al pie. El numero queda como `[PENDIENTE]` hasta que exista `claims.json`. | "[PENDIENTE] ciclos medidos; el registro queda abierto." (6) | d4 solucion tecnicamente validada | §9.4 linea 645: "cada una con su base". `guion_guia` regla 6: metrica con fuente oficial obligatoria. Sin claims no hay cifra: se marca. |

Total de voz: 80 palabras en 40 s = 120 ppm. Por debajo de la referencia de 130-140 ppm
de `guion_guia`, que es margen a favor del limite de 120 s medido en audio.

## Cobertura de rubrica de este Acto II

Declarados en el contrato de cada toma: a1, a2, a3, a4, d1, d2, d3, d4, e3, e4 (10 items).
Contraste con la version actual de `script/shotlist.csv`, que en el Acto II solo declara
a1 (S05), d1 (S06), d4 (S07) y e3 (S04): cuatro items.

## Huecos que este acto NO cierra y hay que declarar

- c2 eficiencia energetica: no se toca aqui. Va a pautado y canvas (`rubric_matrices` §3,
  "el video no necesita cubrir los 19 items").
- Cifra de la placa A6: bloqueada por `research/claims.json` vacio.
- Nombre y rotulo de A1: bloqueados por `brief.json` vacio. No se inventa.
- Medidas reales de A2 y A3: hoy salen de `budget/bom.csv`, que solo tiene una carcasa
  generica de 150 x 80 x 30 mm. Con el BOM real cambian los `asset_id`.

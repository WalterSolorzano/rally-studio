# Cerebro de conocimiento — Rally Studio

Este documento explica qué es el cerebro. El informe técnico **vivo** (nodos, aristas,
comunidades, nodos centrales y preguntas sugeridas) es
[`brain/corpus/graphify-out/GRAPH_REPORT.md`](../brain/corpus/graphify-out/GRAPH_REPORT.md),
que graphify reescribe en cada reconstrucción.

**Qué contiene:** el conocimiento de dominio del certamen (rúbricas, banco de retos,
ganadores 2014–2026, patrones de pitch, claims verificables, estructura del pautado y
del video de 120 s).

**Qué NO contiene, a propósito:** el motor del sistema (`scripts/`, `dashboard/`), las
instrucciones de instalación y los proyectos de ediciones anteriores. El cerebro aprende
a ganar, no a programar.

**Cómo se reconstruye:** ver [`brain/README.md`](../brain/README.md).

---

## Por qué este archivo ya no copia las cifras

Hasta el 2026-11-17 este documento era una copia congelada del informe del 2026-10-19
(420 nodos · 732 aristas · 29 comunidades). Esa copia se desincronizó en cuanto el corpus
se partió por instancia y por año, y una cifra escrita a mano en dos sitios acaba
mintiendo en uno de los dos. Ahora la cifra vive solo donde se genera.

Para consultar el estado real:

```
graphify update brain/corpus     # reconstruye el grafo del cerebro (sin coste de API)
```

Los archivos resultantes están en `brain/corpus/graphify-out/`: `graph.json` (el grafo),
`graph.html` (visualizador), `GRAPH_REPORT.md` (informe) y `.graphify_labels.json`
(nombres de las comunidades).

---

## Qué se puede y qué no se puede preguntar al grafo

Las relaciones del cerebro son de dos clases. **606 son `contains`**: el título de un
documento y sus encabezados, o sea el índice de cada documento. **44 son `references`** y
cruzan de un documento a otro; salen del bloque `## Relacionado` que
`brain/sync_corpus.py` escribe al final de cada archivo (mapa `RELACIONADO`). Gracias a
esas 44 el cerebro es **una sola red conexa** (642 nodos, 129 comunidades) en vez de 36
árboles sueltos.

Lo que todavía no hay: relaciones semánticas inferidas (`conceptually_related_to`,
`semantically_similar_to`). Solo aparecen al correr el pase con un proveedor de LLM; sin
proveedor configurado, no existen, y no se pueden inventar a mano.

Las **hiperaristas** del grafo del repositorio (`graphify-out/graph.json`) son de ese
pase anterior y no se regeneran con `graphify update`. Una de ellas, `rubrica_nacional_100_puntos`,
afirma "Rúbrica Nacional de 100 puntos (25-25-20-15-15)" como si fuera oficial. No lo es:
`knowledge/rubric_matrices.md` §2 declara esos pesos como **hipótesis sin fuente**. Si se
cita esa hiperarista, se cita una afirmación que el propio documento normativo desmiente.

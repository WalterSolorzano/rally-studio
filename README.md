# Rally Studio · Workbench para Maratones de Innovación

[![Plataforma](https://img.shields.io/badge/Plataforma-Web%20Local-0866F5.svg)](#)
[![Certámenes](https://img.shields.io/badge/Certamen-Rally%20Latam%20%2828h%29%20%7C%20Nacional%20%2824h%29-1D4ED8.svg)](#)
[![Cerebro Graphify](https://img.shields.io/badge/Cerebro%20Graphify-420%20Nodos%20%7C%20732%20Aristas-6366F1.svg)](#el-cerebro-de-datos-graphify)
[![Equipo](https://img.shields.io/badge/Subagentes-Roster%20Estudiantil-16a34a.svg)](#el-equipo-de-subagentes-el-dream-team-del-desvelo)
[![3D Engine](https://img.shields.io/badge/Blender-Renders%203D%20%2B%20BOM-EA580C.svg)](#del-render-3d-al-presupuesto-real)

> **Un espacio de trabajo creado por un estudiante universitario que ya vivió y ganó un rally, diseñado para ayudar a otros equipos a no perder la cabeza en maratones de 24h y 28h (Rally Latinoamericano y Rally Nacional Nicaragua Innova). No te garantiza el primer lugar por arte de magia, pero te ahorra horas de caos, organiza tus ideas y evita que te descalifiquen por un error tonto.**

---

<div align="center">

![Rally Studio Workbench](site/rally_studio_logo.svg)

*Figura 1: Rally Studio — Workbench de Innovación: Sistema de dirección táctica, deliberación colaborativa y calibración de rúbricas para certámenes oficiales.*

</div>

---

## ⚡ Inicio Rápido (En 1 minuto)

```powershell
# 1. Instala requerimientos básicos (Python 3.10+)
pip install -r requirements.txt

# 2. Inicia el sistema (o haz doble clic en "Iniciar Rally.bat")
.\iniciar_rally.ps1
```
Abre en tu navegador en: **<http://localhost:8000/dashboard/>**

> ⚠️ **Aviso de transparencia:** Este es un proyecto independiente desarrollado por un estudiante universitario basado en su experiencia en competencia. **No es una herramienta oficial de ninguna universidad, comité organizador ni institución.**

---

## Lo Que Hace Realmente Fuerte a Rally Studio

1. **Prompts pulidos y testeados:** No pierdes 45 minutos a las 3:00 AM inventando qué pedirle a ChatGPT o Claude; el sistema ya tiene las plantillas exactas con límites de palabras y formatos de rúbrica.
2. **Entiende el contexto de los dos certámenes:**
   - **Rally Latinoamericano (28h):** Presupuesto en **USD**, escalabilidad regional y enfoque internacional.
   - **Rally Nacional Nicaragua Innova (24h):** Presupuesto en **C$ (córdobas)** con tasa oficial del BCN, anclaje a municipios reales y planes de desarrollo local.
3. **Motor 3D en Blender:** Vinculado a materiales reales para generar renders y despieces que justifican cada dólar del presupuesto.
4. **Cerebro relacional de conocimiento:** Analiza patrones históricos de proyectos y rúbricas anteriores para que no tropieces con los mismos errores.
5. **Guardarraíles contra la descalificación:** Revisa que el video no pase de 120s, que no esté en privado en YouTube, que los números cuadren y que el PDF cumpla la nomenclatura.

---

## El Cerebro de Datos (Graphify)

<div align="center">

![Grafo de Conocimiento Graphify — Rally System](graphify_knowledge_graph.png)

*Figura 2: Cerebro de Conocimiento Real (Graphify) — 420 nodos, 732 aristas y 29 comunidades (criterios de rúbricas, banco de ganadores 2014–2026 y patrones técnicos).*

</div>

En lugar de textos sueltos, el sistema compila una red de conocimiento estructurada (`graphify-out/`):
- **420 nodos y 732 aristas** con criterios de evaluación y relaciones entre problemas y soluciones reales.
- **Banco histórico de precedentes:** Revisa cómo resolvieron desafíos técnicos equipos anteriores.
- Puedes navegar el grafo interactivo abriendo [`graphify-out/graph.html`](graphify-out/graph.html).

---

## El Flujo de 13 Etapas

```
[00 Certamen] ──> [01 Equipo] ──> [02 Retos] ──> [03 Solución] ──> [04 Impacto/ODS]
                                                                          │
[09 Canvas]   <── [08 Recursos]<── [07 Budget] <── [06 Pautado] <── [05 Multi-IA]
     │
     └──> [10 Guion 120s] ──> [11 Web Demo] ──> [12 Checklist Final] ──> ¡A tiempo!
```

<div align="center">

![Resumen del Rally](dash-resumen.png)

*Figura 3: Resumen del Rally — las 13 fases con su estado, avance de rúbrica y la lista de entregables con responsable.*

</div>

<div align="center">

![Pantalla de certamen con temporizador](dash-pautado.png)

*Figura 4: Etapa 00 — selección del certamen, temporizador del evento, panel de preparación oficial y criterio de jurado.*

</div>

<div align="center">

![Bucle de trabajo del agente](docs/img/05-flujo.png)

*Figura 5: El bucle de trabajo del agente y la frontera dura — contenido sí, motor y reglas de negocio intactas.*

</div>

---

## El Equipo de Subagentes (El Dream Team del Desvelo)

Cada agente tiene una tarea especializada para aligerar la carga mental del equipo:

| Subagente | Nombre de Guerra | Qué hace por ti |
|---|---|---|
| `guiar-usuario` | **Tu Última Neurona** | Te acompaña paso a paso en las 13 etapas para que no te pierdas a las 4 AM. |
| `orquestador` | **El Admin del Grupo** | Reparte el trabajo en paralelo y cuida que tu computadora no se congele con los procesos pesados. |
| `sharktank` | **El Destructor de Sueños** | Analiza tu idea con honestidad brutal: busca si ya existe en China o qué fallas técnicas tiene antes de que pierdas 10 horas. |
| `auditar-entregable` | **La Tóxica que Revisa el Chat** | Busca cualquier contradicción en los números del pautado o límites de caracteres y te avisa a tiempo. |
| `presupuesto` | **Don Cangrejo (El Palmado)** | Cotiza componentes reales, busca proveedores con enlaces verificables y no deja que infles precios. |
| `modelo-3d-blender` | **El Quemador de Tostadas** | Arma el modelo 3D y los renders para el video basados en la lista de materiales. |
| `dossier-soluciones` | **Labia Interna** | Estructura propuestas lógicas (problema-causa-insight-solución) con precedentes creíbles. |
| `proponer-retos` | **La Ruleta Rusa** | Lee la lista de retos del comité y ayuda al equipo a descartar los más complicados. |
| `ingestar-investigacion`| **La Chismosa del Barrio** | Busca estadísticas reales con fuentes, año y URL para sostener el impacto. |
| `contexto-rally` | **San Google de los Ganadores** | Consulta proyectos y rúbricas anteriores para no inventar ruedas cuadradas. |
| `publicar-sitio` | **El del Ciber del Barrio** | Te deja listo el despliegue de la web demo para que el jurado la pruebe. |
| `servir-a-ventana` | **PedidosYa** | Te sirve sugerencias en pantalla en formato "Aceptar / Descartar" sin tocar tus textos por la fuerza. |
| `sugerir-por-fase` | **Café Presto con Ansiedad** | Te avisa cuánto tiempo queda del cronómetro para congelar entregables. |
| `propuesta-identidad` | **El Diseñador de Carretera Masaya** | Te ayuda a armar paleta de colores y tipografías legibles que se vean profesionales. |

---

## Del Render 3D al Presupuesto Real

En vez de poner fotos genéricas de internet o cubos abstractos, el sistema conecta la lista de componentes físicos (`budget/bom.csv`) con el viewport de Blender:

<div align="center">

![Render del nodo SITRA-01 con regla](docs/img/sitra_nodo.png)

*Figura 6: Render del nodo — carcasa ABS monobloque, sonda, panel solar y antena LoRa, con regla de referencia para escala.*

</div>

<div align="center">

![Vista de despiece del nodo](docs/img/sitra_despiece.png)

*Figura 7: Despiece para el video — diez componentes numerados y rotulados, coherentes con la lista de materiales del presupuesto.*

</div>

<div align="center">

![Viewport de Blender con el modelo SITRA](docs/img/sitra_blender.png)

*Figura 8: El modelo en Blender — captura del viewport con la jerarquía de la escena y las medidas reales del nodo.*

</div>

<div align="center">

![Tabla de presupuesto de SITRA](docs/img/presupuesto_sitra.png)

*Figura 9: Tabla generada por scripts/gen_budget.py — rubros, cantidades, costo unitario y enlaces reales. En Nacional en C$ (tasa BCN); en Latam en USD.*

</div>

---

## Comparativa de Certámenes Oficiales

| Certamen | Tiempo | Moneda | Foco Principal |
|---|:---:|:---:|---|
| **Rally Latinoamericano** | **28 h** | **USD** | Escalabilidad regional en América Latina, viabilidad técnica y modelo de negocio sostenible. |
| **Rally Nacional (Nicaragua Innova)** | **24 h** | **C$ (NIO)** | Anclaje a municipios reales de Nicaragua, articulación con planes territoriales y viabilidad local. |

---

## Funcionamiento en Redes Inestables (Campus)

- **Funciona sin internet:** Si se cae el WiFi de la universidad durante la madrugada, el sistema guarda todo en el navegador (`localStorage`) y en tu servidor local.
- **Invitaciones de equipo:** Comparte el proyecto en la red local con un enlace temporal (`python scripts/crear_proyecto.py`).
- **Respaldo en memoria USB:** Puedes exportar e importar el estado completo en un archivo `.json` ligero en cualquier momento.

# Rally Studio · Tu Copiloto para el Rally de Innovación

[![Plataforma](https://img.shields.io/badge/Plataforma-Web%20Local-0866F5.svg)](#)
[![Certámenes](https://img.shields.io/badge/Certamen-Rally%20Latam%20%2828h%29%20%7C%20Nacional%20%2824h%29-1D4ED8.svg)](#)
[![Base de Datos](https://img.shields.io/badge/Base%20de%20Datos-Ganadores%20y%20R%C3%BAbricas-6366F1.svg)](#el-mapa-de-conocimiento)
[![Asistentes IA](https://img.shields.io/badge/Asistentes%20IA-14%20Ayudantes-16a34a.svg)](#el-equipo-de-asistentes-el-dream-team-del-desvelo)
[![3D y Presupuesto](https://img.shields.io/badge/Blender-Renders%203D%20%2B%20Excel-EA580C.svg)](#del-diseño-3d-al-presupuesto-en-excel)

> **Un espacio de trabajo creado por un estudiante universitario que ya vivió y ganó un rally, diseñado para ayudar a otros equipos a no perder la cabeza en maratones de 24h y 28h (Rally Latinoamericano y Rally Nacional Nicaragua Innova). No te promete ganar por arte de magia, pero te ahorra horas de caos, organiza a tu grupo y evita que te descalifiquen por un error tonto.**

---

<div align="center">

![Rally Studio](site/rally_studio_logo.svg)

*Figura 1: Rally Studio — Tu centro de control durante el rally: organiza los retos, redacta la propuesta, calcula los costos y arma el guion en un solo lugar.*

</div>

---

## ⚡ Inicio Rápido (En 1 minuto)

```powershell
# 1. Instala los requerimientos básicos (Python 3.10+)
pip install -r requirements.txt

# 2. Inicia el sistema (o haz doble clic en "Iniciar Rally.bat")
.\iniciar_rally.ps1
```
Abre en tu navegador en: **<http://localhost:8000/dashboard/>**

> ⚠️ **Aviso de transparencia:** Este es un proyecto independiente desarrollado por un estudiante universitario basado en su experiencia en competencia. **No es una herramienta oficial de ninguna universidad, comité organizador ni institución.**

---

## ¿Por qué te ayuda durante la competencia?

1. **Prompts listos y testeados:** No pierdes tiempo a las 3:00 AM pensando qué preguntarle a ChatGPT o Claude; el sistema ya tiene las plantillas listas con las palabras exactas y límites de la competencia.
2. **Conoce las reglas de los dos certámenes:**
   - **Rally Latinoamericano (28h):** Presupuesto en **dólares (USD)**, enfoque regional y soluciones aplicables a toda América Latina.
   - **Rally Nacional Nicaragua Innova (24h):** Presupuesto en **córdobas (C$)** con tasa oficial del BCN, anclado a municipios y necesidades del país.
3. **Modelos 3D y presupuesto real:** Conecta piezas reales con Blender para sacar renders y despieces que justifican cada peso que pones en la tabla.
4. **Historial de ganadores:** Consulta proyectos de años anteriores y cómo evalúan los jueces para no tropezar con ideas que ya fracasaron.
5. **Guardas contra descalificación:** Te avisa si tu video pasa de 120 segundos, si lo pusiste en privado en YouTube o si las cifras del documento no cuadran con el presupuesto.

---

## El Mapa de Conocimiento

<div align="center">

![Mapa de Conocimiento](graphify_knowledge_graph.png)

*Figura 2: Mapa de consulta con proyectos premiados de años anteriores, rúbricas de evaluación y antecedentes de solución.*

</div>

En lugar de carpetas con documentos sueltos que nadie lee a medianoche:
- Revisa cómo resolvieron problemas técnicos otros equipos universitarios en ediciones anteriores.
- Puedes explorar el mapa interactivo en cualquier momento abriendo [`graphify-out/graph.html`](graphify-out/graph.html).

---

## Las 13 Etapas del Rally, Paso a Paso

```
[00 Certamen] ──> [01 Equipo] ──> [02 Retos] ──> [03 Solución] ──> [04 Impacto/ODS]
                                                                          │
[09 Canvas]   <── [08 Recursos]<── [07 Budget] <── [06 Pautado] <── [05 Multi-IA]
     │
     └──> [10 Guion 120s] ──> [11 Web Demo] ──> [12 Checklist Final] ──> ¡A tiempo!
```

<div align="center">

![Resumen del Rally](dash-resumen.png)

*Figura 3: Pantalla principal — las 13 etapas organizadas para ver qué falta hacer y quién se encarga de cada parte.*

</div>

<div align="center">

![Pantalla de inicio con temporizador](dash-pautado.png)

*Figura 4: Inicio y cronómetro — eliges si compites en el Latinoamericano (28h) o en el Nacional (24h) y controlas el tiempo restante.*

</div>

<div align="center">

![Cómo te ayudan las IAs](docs/img/05-flujo.png)

*Figura 5: Cómo te asisten las IAs — te hacen sugerencias en pantalla y tú decides si las aceptas o descartas con un botón.*

</div>

---

## El Equipo de Asistentes (El Dream Team del Desvelo)

Cada asistente tiene un trabajo puntual para que tu equipo se reparta la carga:

| Asistente | Nombre de Guerra | Qué hace por ti |
|---|---|---|
| `guiar-usuario` | **Tu Última Neurona** | Te acompaña paso a paso por las 13 etapas para que no te pierdas a las 4 AM. |
| `orquestador` | **El Admin del Grupo** | Reparte las tareas y cuida que tu computadora no se pegue con procesos pesados. |
| `sharktank` | **El Destructor de Sueños** | Analiza tu idea con total sinceridad: busca si ya existe en otro país o qué fallas tiene antes de que pierdas 10 horas. |
| `auditar-entregable` | **La Tóxica que Revisa el Chat** | Busca cualquier contradicción en los números del documento o límites de palabras y te avisa a tiempo. |
| `presupuesto` | **Don Cangrejo (El Palmado)** | Cotiza componentes reales con proveedores y enlaces para que el jurado verifique los precios. |
| `modelo-3d-blender` | **El Quemador de Tostadas** | Arma el modelo 3D y las imágenes para el video basándose en la lista de materiales. |
| `dossier-soluciones` | **Labia Interna** | Estructura propuestas lógicas y creíbles (problema, causa, idea y cómo medirla). |
| `proponer-retos` | **La Ruleta Rusa** | Lee los retos que publica el comité y ayuda al grupo a descartar los más complicados. |
| `ingestar-investigacion`| **La Chismosa del Barrio** | Busca datos y estadísticas oficiales con fuente y año para respaldar el impacto. |
| `contexto-rally` | **San Google de los Ganadores** | Recuerda las reglas oficiales y ejemplos ganadores anteriores para no inventar ruedas cuadradas. |
| `publicar-sitio` | **El del Ciber del Barrio** | Te ayuda a subir la página web de demostración para que el jurado la pueda abrir desde su teléfono. |
| `servir-a-ventana` | **PedidosYa** | Te muestra las sugerencias en pantalla para que solo tengas que darle a "Aceptar" o "Descartar". |
| `sugerir-por-fase` | **Café Presto con Ansiedad** | Te recuerda cuánto tiempo queda en el reloj para que no dejes todo a última hora. |
| `propuesta-identidad` | **El Diseñador de Carretera Masaya** | Te ayuda a elegir colores y letras que se vean limpias y fáciles de leer. |

---

## Del Diseño 3D al Presupuesto en Excel

En lugar de buscar fotos al azar en internet, el sistema conecta los materiales que vas a cotizar con un modelo 3D:

<div align="center">

![Render del nodo con regla](docs/img/sitra_nodo.png)

*Figura 6: Ejemplo de render 3D con medidas reales para mostrar en el video.*

</div>

<div align="center">

![Vista de despiece](docs/img/sitra_despiece.png)

*Figura 7: Vista desarmada del prototipo para explicarle claramente al jurado cómo se construye por dentro.*

</div>

<div align="center">

![El modelo en Blender](docs/img/sitra_blender.png)

*Figura 8: El modelo abierto en Blender listo para animar o exportar imágenes.*

</div>

<div align="center">

![Tabla de presupuesto](docs/img/presupuesto_sitra.png)

*Figura 9: Hoja de presupuesto con precios reales y enlaces a proveedores para que el jurado verifique cada costo.*

</div>

---

## ¿En qué certamen vas a competir?

| Certamen | Tiempo | Moneda | Enfoque Principal |
|---|:---:|:---:|---|
| **Rally Latinoamericano** | **28 h** | **Dólares (USD)** | Solución replicable en varios países de la región, técnica clara y modelo sostenible. |
| **Rally Nacional (Nicaragua Innova)** | **24 h** | **Córdobas (C$)** | Aplicado a un municipio real de Nicaragua y conectado con las necesidades locales. |

---

## Hecho para cuando el internet de la universidad falla

- **Funciona sin internet:** Si se cae el WiFi del campus durante la madrugada, el sistema guarda todo en tu navegador y en tu computadora.
- **Comparte en red local:** Puedes compartir el espacio con tus compañeros de equipo mediante un enlace sencillo (`python scripts/crear_proyecto.py`).
- **Respaldo en USB:** Puedes guardar todo el proyecto en un archivo `.json` liviano para pasarlo por memoria USB cuando quieras.

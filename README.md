<div align="center">

# RALLY STUDIO · ERP & WORKBENCH DE INNOVACIÓN

[![Licence](https://img.shields.io/badge/Licencia-MIT-0866F5.svg)](LICENSE)
[![Rally Latam](https://img.shields.io/badge/Rally%20Latam-28%20Horas-0D1B35.svg)](https://rallydeinnovacion.org)
[![Nicaragua Innova](https://img.shields.io/badge/Nicaragua%20Innova-24%20Horas-0866F5.svg)](https://nicaraguainnova.gob.ni)
[![Multi-AI Ready](https://img.shields.io/badge/Multi--IA-Ready-10b981.svg)](#-guía-para-agentes-de-ia-trae-este-proyecto-y-trabaja)
[![DOCX Direct Compile](https://img.shields.io/badge/DOCX-Auto--Compile-blue.svg)](#-compilación-y-exportación-directa-a-word-docx)

> **Plataforma Integral de Gestión, Colaboración Multi-IA y Despacho Rápido para Rallies de Innovación (Rally Latinoamericano 28h & Rally Nacional Nicaragua Innova 24h).**  
> Diseñada para competir y ganar: Cero fricción, colaboración multi-usuario sin registro basada en mascotas, selección estratégica de retos con Top 3 recomendados, matrices oficiales duales (Nacional CNU / LATAM SIRLI), compilación en un clic a la plantilla Word (`.docx`) y tokens ultra-optimizados.

`#rally-latinoamericano` `#rally-innovacion` `#nicaragua-innova` `#cnu` `#innovacion-abierta` `#multi-ai` `#hackathon` `#pitch-120s` `#word-docx` `#erp`

</div>

---

## ⚡ Guía para Agentes de IA ("Trae este proyecto y trabaja")

Si eres un modelo de Inteligencia Artificial (ChatGPT, Claude, Gemini, DeepSeek, OpenCode o Antigravity) y el usuario te ha dado este repositorio con la orden *"trabaja aquí"*, lee estas **4 reglas fundamentales** para no desperdiciar tokens:

1. **Tu Fuente Única de Verdad es `brief.json`**:
   - Lee exclusivamente `brief.json` al iniciar. Contiene el nombre del proyecto, el reto seleccionado, la categoría, la universidad y la sede. No inventes nombres nuevos.
2. **Mapa de Archivos & Dónde Editar**:
   - **Documento Pautado Oficial**: Edita `docs/pautado_draft.docx` o actualiza `state.pautado` vía el dashboard. *Límites estrictos de caracteres con espacios: Problema (1,250), Solución (1,250), Prefactibilidad (1,000), Innovación (1,000), Impacto (1,500).*
   - **Presupuesto**: `budget/budget.xlsx` (debe situarse estrictamente entre $4,000 y $6,000 USD para lote piloto de 10 unidades, incluyendo flete del 18%).
   - **Guion Pitch 120s**: `script/script.md` o `dashboard/app.js` (estricto en 4 actos a 135 ppm, total 250 a 270 palabras). Acto 1 tiene **prohibido** mencionar el nombre del proyecto o logos.
   - **Demostración Web**: `site/index.html` y `site/style.css` (interfaz de prototipo territorial para capturar en video).
3. **No leas archivos innecesarios ni consumas tokens de más**:
   - Para consultar rúbricas oficiales y ponderaciones exactas: lee `knowledge/rubric_matrices.md` (ambas matrices detalladas: Jurado Nacional CNU vs. Jurado LATAM SIRLI).
   - Para entender la fórmula de guion y errores críticos: lee `knowledge/rubric_latam.md` (33 líneas).
4. **Respeto Estricto de Diseño**:
   - Cero gradientes genéricos violetas/morados (`#7c3aed`), cero cards translúcidas flotantes. Usa únicamente la paleta corporativa: **Azul Cobalto (`#0866F5`)**, **Azul Marino Oficial (`#0D1B35`)** y grises neutros de 1px con tipografía de números tabulares.

---

## 🚀 Arquitectura del Sistema (ERP Rally Studio)

```
rally-studio/
├── AGENTS.md                  # Reglas de oro para agentes LLM (contexto en <100 líneas)
├── brief.json                 # Fuente de verdad compartida por todo el certamen
├── brand/
│   ├── palette.json           # Paleta cromática calibrada AAA
│   └── tokens.css             # Variables CSS del sistema de diseño
├── dashboard/                 # ERP & Workbench Web de Competencia
│   ├── index.html             # Shell de aplicación líquida
│   ├── style.css              # Sistema de diseño sobrio (Linear / Swiss)
│   ├── app.js                 # Núcleo reactivo, colaboración, soft-locks, Top retos y despacho IA
│   ├── graph.html             # Explorador visual de conocimiento
│   └── docs/                  # Carpeta de entregables generados
├── site/                      # Prototipo / Landing interactiva para el video pitch
├── knowledge/                 # Bóveda de rúbricas oficiales y análisis de ganadores
│   ├── rubric_matrices.md     # Especificación canónica: Jurado Nacional vs. Jurado LATAM
│   ├── rubric_latam.md        # Rúbrica 100 pts oficial, cronología 120s y errores críticos
│   ├── pautado_latam_ref.docx # Plantilla oficial Word Rally Latam
│   └── pautado_nacional_ref.docx # Plantilla oficial Word Rally Nacional
└── scripts/
    ├── rally_service.py       # Micro-backend HTTP: Telemetría, Ingesta, Rúbricas & Compilador DOCX
    ├── gen_pautado.py         # Generador del documento oficial Word
    ├── gen_budget.py          # Generador de cotización y presupuesto Excel
    └── gen_script.py          # Generador de guion en 4 actos para locución
```

---

## 🎯 UI Especializada de Selección de Reto

Al cargar la biblioteca de retos oficiales, el sistema abre la vista especializada de selección estratégica:
- **Top 3 Retos Recomendados**: Algoritmo de idoneidad que clasifica automáticamente los 3 desafíos con mayor probabilidad de victoria (`winRate`), destacando badges como `#1 MÁS VIABLE`, `#2 ALTO IMPACTO` y `#3 DIFERENCIADO`.
- **Modal de Inteligencia Táctica**: Al inspeccionar cualquier reto, despliega:
  1. *Enfoque WOW*: La fórmula de hibridación sistémica que rompe con las soluciones genéricas.
  2. *Adaptación a Nicaragua*: Cómo aterrizar el desafío a la realidad territorial, comunidades y materias primas autóctonas (Waslala, San Juan de Oriente, Rivas, café, biomasa).
  3. *Factor de Novedad*: Por qué el tribunal evaluador considerará la propuesta disruptiva.
  4. *Patrón de Ganadores Históricos*: Casos de éxito comparables (Güegüense Pinolero, STEM Synergy, Techriders, Nexus Innova).

---

## ⚖️ Matrices de Calificación Oficiales: Nacional vs. LATAM (100 Puntos)

El motor de IA y las auditorías calibran sus reglas según el certamen seleccionado en el Paso 01:

| Criterio | Rally Internacional LATAM (28H) | Jurado Nacional Nicaragua Innova (24H) |
| :--- | :---: | :---: |
| **Grado de Innovación** | **30 pts** (Disrupción tecnológica, modularidad, diseño paramétrico) | **25 pts** (Hibridación accesible ESP32/LoRa, IA, materias locales) |
| **Impacto Social / Territorial** | **20 pts** (Universalidad continental, beneficiarios ODS) | **25 pts** (Alineación con PNDH 2022-2026, Ciudades Creativas, municipios reales) |
| **Viabilidad Técnica** | **20 pts** (Balances de masa/energía, despiece CAD, rigor) | **20 pts** (Factibilidad en laboratorios CNU/INATEC, uso de recursos locales) |
| **Prefactibilidad Económica** | **20 pts** (Costos en USD, B2B/B2G autosostenible sin subsidios) | **15 pts** (Presupuesto C$/USD para piloto, modelo comunitario Canvas, plan 12 meses) |
| **Presentación y Entregables** | **10 pts** (Pitch 120s exacto, pautado SIRLI con límites de caracteres) | **15 pts** (Documento técnico de hasta 10 páginas APA 7, Video 120s y Naming Dual) |
| **Categorías Oficiales** | **2 Categorías:** Innovación e Impacto Social | **3 Categorías:** Innovación Tecnológica, Social y Procesos/Organizacional |
| **Regla Clave de Persuasión** | **Deslocalización:** El caso local es un piloto; el sistema debe escalar a toda la región. | **Anclaje Territorial:** Debe nombrar municipios vulnerables y actores institucionales locales. |

---

## 👥 Colaboración Multi-Usuario sin Login & Soft-Locks en Tiempo Real

- **Cero formularios de registro**: Cada miembro del equipo que ingresa al dashboard recibe automáticamente una mascota emblemática única (🐆 Jaguar Ágil, 🪶 Quetzal Guía, 🛡️ Armadillo Blindado, ⚡ Colibrí Veloz, 🐾 Ocelote Creativo, 🦅 Halcón Vigía).
- **Estampado de autoría**: Cada sección editada en el pautado o en el guion audiovisual refleja el sello de la mascota autora.
- **Soft-Locks visuales**: Prevención de colisiones en tiempo real mediante `BroadcastChannel`. Si un compañero está redactando una sección, se resalta visualmente indicando quién está activo.
- **Bypass para Wi-Fi Universitario**: Si la red del certamen aísla terminales locales, la sincronización se realiza en 1 clic copiando el **Token de Estado** para compartirlo vía WhatsApp o sincronizando el JSON central en Google Drive.

---

## 🛠️ Puesta en Marcha Rápida (1 Comando)

Inicia el servicio autónomo local (Dashboard + Telemetría + Compilador Word):

```bash
python scripts/rally_service.py
```

En Windows hay un lanzador desacoplado (sobrevive al cierre de la consola y escribe su registro en `%TEMP%\rally_service.log`):

```powershell
# Doble clic en "Iniciar Rally.bat", o:
powershell -ExecutionPolicy Bypass -File .\iniciar_rally.ps1
```

Abre en tu navegador:
- **ERP Workbench Oficial:** `http://localhost:8000/`
- **Prototipo Territorial para Video:** `http://localhost:8000/site/index.html`
- **Telemetría en Vivo:** `http://localhost:8000/api/telemetry`
- **API Rúbricas Oficiales:** `http://localhost:8000/api/rubric?type=nacional` o `?type=latam`

---

## 🤖 IA Gratis Local (Opcional, Recomendado)

El OCR por IA visual, el botón **Pulir** y el copiloto automático funcionan mejor con un endpoint de IA. La vía gratuita recomendada es **[FreeLLMAPI](https://github.com/tashfeenahmed/freellmapi)**: ~34 proveedores gratis (Gemini, Groq, Cerebras, Mistral, OpenRouter, Cloudflare, Cohere, NVIDIA...) detrás de **un solo endpoint OpenAI-compatible**, con routing y failover.

Rally Studio trae el instalador automatizado (baja la última Release, **verifica el sha256 publicado** y extrae la app portable sin permisos de administrador):

```powershell
# App portable → %LOCALAPPDATA%\Programs\FreeLLMAPI
powershell -ExecutionPolicy Bypass -File .\scripts\setup_ia_gratis.ps1

# O el instalador oficial con asistente (-Silencioso para /S)
powershell -ExecutionPolicy Bypass -File .\scripts\setup_ia_gratis.ps1 -Modo instalador
```

Configuración en 3 pasos:

1. Abre FreeLLMAPI y copia tu **unified key** (`freellm-...`).
2. Guárdala en `scripts\freellmapi.key` (una línea; el `.gitignore` ya excluye `*.key`).
3. Ejecuta `.\Iniciar Rally.bat`: el lanzador detecta la IA, la arranca si está apagada y exporta por ti `RALLY_AI_URL=http://127.0.0.1:31415/v1` y `RALLY_AI_KEY`.

Verifica el puente en `http://localhost:8000/api/ai/status`. Al re-escanear una imagen, el OCR debe responder `source:"ai"` con los retos ya jerarquizados (título, demanda, ODS, categoría).

**Sin FreeLLMAPI no se rompe nada:** el OCR cae a EasyOCR local como red de seguridad, el copiloto usa la CLI de OpenCode si está instalada y, si no, quedan los chips de chats web gratis. Detalle completo del puente, la cascada de OCR y las variables de entorno en [`AUTO_IA.md`](AUTO_IA.md).

---

## 📄 Compilación y Exportación Directa a Word (.docx)

Haz clic en el botón **"Compilar en Plantilla Word (.docx)"** en la fase de Pautado. El backend inyecta los textos validados directamente en los campos correspondientes de la plantilla oficial de la competencia, conservando encabezados institucionales, márgenes y tipografías oficiales.

---

## ⚖️ Descargo de Responsabilidad y Propósito Metodológico

> **Aviso Importante**: **Rally Studio** es una herramienta pedagógica y de orquestación de flujo de trabajo concebida exclusivamente como un soporte metodológico y organizativo para equipos multidisciplinarios.  
> 
> En competencias de alta intensidad como el Rally de Innovación (24 a 28 horas continuas), **donde no existe orden y control operativo se pierde la mayor parte del tiempo útil**: los equipos se dispersan en debates redundantes, descuidan los entregables obligatorios, no calibran el presupuesto y la idea más brillante o potencialmente ganadora termina descalificada o diluida por falta de ejecución formal.
>
> Esta suite proporciona el andamiaje técnico, la sincronización en vivo y la disciplina paramétrica para que el talento humano enfoque su energía creativa en la solución real. **No garantiza resultados ni reemplaza el criterio crítico, la ética, la originalidad de los participantes ni las decisiones soberanas de los comités evaluadores oficiales.** El equipo participante es el único responsable de la veracidad, autoría y rigurosidad de los datos presentados en su competencia.

---

## 👨‍💻 Autoría, Experiencia y Filosofía Abierta

Este sistema fue concebido y desarrollado a partir de **3 años consecutivos de experiencia directa en el terreno competitivo** de ambos certámenes (Rally Latinoamericano de Innovación y Rally Nacional de Innovación «Nicaragua Innova»), habiendo alcanzado la distinción de **Ganador del 1.er Lugar Nacional**.

Como **Ingeniero Industrial de la Universidad Nacional de Ingeniería (UNI, Nicaragua)**, entiendo de primera mano los cuellos de botella que enfrentan los equipos bajo presión extrema: fricción comunicativa, dispersión de tiempo, descuido del costeo real y la falta de un control de calidad riguroso que traduzca una gran idea en un entregable técnicamente ganador.

**Rally Studio es un proyecto vivo y está completamente abierto a mejoras**:
- Pull Requests, optimizaciones algorítmicas y nuevas plantillas son bienvenidas.
- Diseñado por y para la comunidad de innovadores, docentes tutores y estudiantes de ingeniería de América Latina.

---

> *"Las grandes soluciones no nacen de la suerte, sino del orden, el coraje y la pasión de quienes se atreven a construir bajo presión. Confíen en su talento, mantengan la calma en la hora 20 y dejen en alto a su universidad y a su país. ¡Mucho éxito en la jornada y que gane la mejor innovación!"* 🚀💡🏆

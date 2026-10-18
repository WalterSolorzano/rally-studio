# RALLY STUDIO · ERP & WORKBENCH DE INNOVACIÓN

> **Plataforma Integral de Gestión, Colaboración Multi-IA y Despacho Rápido para Rallies de Innovación (Rally Latinoamericano 28h & Rally Nacional 24h).**  
> Diseñada para competir y ganar: Cero fricción, colaboración multi-usuario sin registro basada en mascotas, ingesta contextual automática, compilación en un clic a la plantilla oficial Word (`.docx`) y tokens ultra-optimizados.

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
3. **No leas archivos innecesarios**:
   - Para consultar rúbricas oficiales y pesos evaluables: lee `knowledge/rubric_latam.md` (33 líneas).
   - Para entender errores comunes descalificantes: lee `knowledge/winners_analysis.md`.
4. **Respeto Estricto de Diseño**:
   - Cero gradientes genéricos violetas/morados (`#7c3aed`), cero cards translúcidas flotantes. Usa únicamente la paleta corporativa: **Azul Cobalto (`#0866F5`)**, **Azul Marino Oficial (`#0D1B35`)** y grises neutros de 1px.

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
│   ├── app.js                 # Núcleo reactivo, colaboración, soft-locks y despacho IA
│   ├── graph.html             # Explorador visual de conocimiento
│   └── docs/                  # Carpeta de entregables generados
├── site/                      # Prototipo / Landing interactiva para el video pitch
├── knowledge/                 # Bóveda de rúbricas oficiales y análisis de ganadores
│   ├── rubric_latam.md        # Matriz 100 pts oficial (Innovación 30, Impacto 20...)
│   ├── pautado_latam_ref.docx # Plantilla oficial Word Rally Latam
│   └── pautado_nacional_ref.docx # Plantilla oficial Word Rally Nacional
└── scripts/
    ├── rally_service.py       # Micro-backend HTTP: Telemetría, Ingesta & Compilador DOCX
    ├── gen_pautado.py         # Generador del documento oficial Word
    ├── gen_budget.py          # Generador de cotización y presupuesto Excel
    └── gen_script.py          # Generador de guion en 4 actos para locución
```

---

## 🛠️ Puesta en Marcha Rápida (1 Comando)

Inicia el servicio autónomo local (Dashboard + Telemetría + Compilador Word):

```bash
python scripts/rally_service.py
```

Abre en tu navegador:
- **ERP Workbench Oficial:** `http://localhost:8000/`
- **Prototipo Territorial para Video:** `http://localhost:8000/site/index.html`

---

## 👥 Colaboración Multi-Usuario sin Login & Soft-Locks en Tiempo Real

- **Cero formularios de registro**: Cada miembro del equipo que ingresa al dashboard recibe automáticamente una mascota emblemática única (🐆 Jaguar Ágil, 🪶 Quetzal Guía, 🛡️ Armadillo Blindado, ⚡ Colibrí Veloz, 🐾 Ocelote Creativo, 🦅 Halcón Vigía).
- **Estampado de autoría**: Cada sección editada en el pautado o en el guion audiovisual refleja el sello de la mascota autora.
- **Soft-Locks visuales**: Prevención de colisiones en tiempo real mediante `BroadcastChannel`. Si un compañero está redactando una sección, se resalta visualmente indicando quién está activo.
- **Bypass para Wi-Fi Universitario**: Si la red del certamen aísla terminales locales, la sincronización se realiza en 1 clic copiando el **Token de Estado** para compartirlo vía WhatsApp o sincronizando el JSON central en Google Drive.

---

## 🏆 Matriz Oficial de Evaluación Rally (100 Puntos)

| Criterio | Peso | Foco de Evaluación |
| :--- | :---: | :--- |
| **a. Grado de Innovación** | **30 pts** | Hibridación ciber-física, tecnología apropiada, novedad verificable. |
| **b. Impacto Social** | **20 pts** | Problemática específica, valor social sobre mercado, beneficiarios reales. |
| **c. Prefactibilidad** | **20 pts** | Presupuesto sustentado ($4,000–$6,000 USD), eficiencia energética, insumos comerciales. |
| **d. Viabilidad Técnica** | **20 pts** | Base teórica documentada, componentes accesibles, factibilidad operativa probada. |
| **e. Presentación (Pitch)**| **10 pts** | Capacidad de síntesis, 120s exactos, claridad visual y solidez argumental. |

---

## 📄 Compilación y Exportación Directa a Word (.docx)

Haz clic en el botón **"Compilar en Plantilla Word (.docx)"** en la fase de Pautado. El backend inyecta los textos validados directamente en los campos correspondientes de la plantilla oficial de la competencia, conservando encabezados institucionales, márgenes y tipografías oficiales.

Desarrollado con rigor de ingeniería para equipos de alto rendimiento en el **Rally Latinoamericano de Innovación** y **Rally Nacional Nicaragua Innova**.

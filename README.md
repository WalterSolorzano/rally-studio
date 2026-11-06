# Rally Studio · Autonomous Innovation Workbench ⚡

[![Plataforma](https://img.shields.io/badge/Plataforma-Web%20Local%20%7C%20Zero%20Dependency-0866F5.svg)](#)
[![Certamen](https://img.shields.io/badge/Certamen-Rally%20Latam%20%2828h%29%20%7C%20Nacional%20%2824h%29-1D4ED8.svg)](#)
[![Cerebro Graphify](https://img.shields.io/badge/Cerebro%20Graphify-420%20Nodos%20%7C%20732%20Aristas-6366F1.svg)](#cerebro-y-subagentes-especialistas)
[![Subagentes](https://img.shields.io/badge/Subagentes-14%20Skills%20%7C%20Buz%C3%B3n%20Reactivo-16a34a.svg)](#cerebro-y-subagentes-especialistas)
[![3D Engine](https://img.shields.io/badge/Blender-Headless%20BOM%20%7C%20Renders%203D-EA580C.svg)](#del-render-3d-en-blender-al-presupuesto-real)

> **Workbench táctico de innovación de alto rendimiento para maratones de 24h y 28h (Rally Latinoamericano y Rally Nacional Nicaragua Innova). De la ingesta oficial de retos al prototipo 3D, pautado matemático y guion validado de 120s en tiempo récord.**

---

<p align="center">
  <img src="dash-resumen.png" alt="Rally Studio Dashboard - 13 Fases de Alto Desempeño" width="100%" />
</p>
<p align="center"><em>Centro de Mando: 13 fases orquestadas en tiempo real, calibración matemática de rúbrica a 100 puntos y buzón reactivo de propuestas.</em></p>

---

## ⚡ En 60 Segundos: Cómo Funciona

```
   [ Retos Oficiales ] ──> Ingesta Universal (.ZIP, PDF, DOCX, Fotos)
          │
          ▼
   [ Swarm de Subagentes ] ──> Analizan 420 nodos de ganadores históricos & detectan vacíos
          │
          ▼
   [ Blender 3D + BOM ] ──> Genera render táctico y extrae lista de costos automáticamente
          │
          ▼
   [ Pautado & Pitch 120s ] ──> Blindaje SIRLI: cero descalificaciones, cifras 100% cuadradas
```

---

## 🌟 La Tríada Visual: Interfaz, 3D y Control Táctico

### 1. Interfaz Táctica (Zero Emojis, Zero Fatiga Cognitiva)
Diseñada bajo estándar militar-académico para maratones nocturnas sin distracciones:

| Dashboard Pautado & Criterios | Modelo de Negocio Canvas |
|---|---|
| ![Pautado Oficial](dash-pautado.png) | ![Canvas Integrado](dashboard/shots/fix-canvas.png) |
| *Control exacto de caracteres, rúbrica activa y validación en vivo.* | *Mapeo de aliados, costos e ingresos sincronizados con el presupuesto.* |

---

### 2. Del Render 3D en Blender al Presupuesto Real

Rally Studio conecta **Blender Headless** directamente con el motor de presupuestos:
- **Modelado paramétrico asistido:** Scripts de Blender generan renders técnicos listos para el video y dossier.
- **Extracción de BOM (Bill of Materials):** La escena 3D exporta componentes físicos a cotizar.
- **Cotizaciones con Respaldo URL:** Ni un solo precio inventado; cada fila contiene enlace real del proveedor en córdobas (C$) o dólares (USD) según el certamen.

---

### 3. Cerebro y Subagentes Especialistas

No es un chatbot genérico. Es un enjambre de **14 skills y subagentes** con roles innegociables:

<p align="center">
  <img src="docs/img/05-flujo.png" alt="Arquitectura del Enjambre de Subagentes" width="95%" />
</p>

| Agente / Skill | Misión de Combate | Entregable Clave |
|---|---|---|
| **Orquestador** | Conduce el flujo de 13 fases y coordina especialistas. | Estado global y sincronización |
| **Dossier & Soluciones** | Cruza retos con 420 nodos de proyectos ganadores históricos. | `Dossier_Soluciones.pdf` |
| **Sharktank** | Evalúa la idea antes de programar para evitar descartes del jurado. | Score predictivo de victoria |
| **Presupuesto (Don Cangrejo)** | Construye presupuesto en rango ($4,000–$6,000 USD / C$ equivalentes). | `budget.xlsx` con URLs auditadas |
| **Guion PAS-V** | Redacta el pitch en 4 actos con corte estricto ≤ 120 segundos. | `script.md` + audio TTS medido |
| **Control SIRLI** | Congela assets al 75% del tiempo y corre auditoría final antes de entrega. | Cero descalificaciones |

---

## 🚀 Puesta en Marcha (Ultra Rápida)

### 1. Clonar y Lanzar en Local (Windows)
```powershell
git clone https://github.com/WalterSolorzano/rally-studio.git
cd rallysistem
pip install -r requirements.txt
.\Iniciar Rally.bat
```
Abre en tu navegador: **`http://localhost:8000/dashboard/`** *(Zero dependencias externas, funciona offline en redes universitarias).*

### 2. Conectar tu Asistente IA
- **OpenCode / Antigravity / Claude Code:**
  ```powershell
  python scripts/sync_skills.py
  ```
  Las skills se sincronizan de inmediato y el agente interactúa con el dashboard vía buzón en vivo:
  ```powershell
  python scripts/servir_propuesta.py --tab pautado --slot problema --kind text --title "Problema Validado" --payload propuesta.json
  ```

### 3. Checklist Pre-Entrega Obligatorio (SIRLI)
Antes de subir tu solución al certamen, ejecuta el validador estricto:
```powershell
python arsenal.py check-todo
```
*(Verifica: video ≤ 120s, coherencia de cifras entre guion y presupuesto, y caracteres dentro de norma).*

---

## 📚 Documentación Técnica Detallada

- **[Manual de IAs y MCPs](docs/MANUAL_IA.md)** — Configuración de OpenCode, Antigravity y subagentes.
- **[Motor de Soluciones](docs/MOTOR_SOLUCIONES.md)** — Algoritmo de emparejamiento reto-solución.
- **[Instalación y Despliegue en Red](docs/INSTALACION_Y_DESPLIEGUE.md)** — Despliegue multiusuario en red local.
- **[Rúbricas y Puntajes Oficiales](.agents/rules/rubricas-y-puntajes.md)** — Criterios de evaluación de jurados.

---
<p align="center">
  <b>Rally Studio</b> · Desarrollado para ganar maratones de innovación.
</p>

# Empieza aquí

**Rally Studio** — el workbench local donde se termina un rally de innovación.

## Arranque (Windows, 4 pasos)

1. `pip install -r requirements.txt`
2. Doble clic en `Iniciar Rally.bat` — o `.\iniciar_rally.ps1` (si el puerto está ocupado: `-Puerto 8080`)
3. Abre `http://localhost:8000/dashboard/`; la llave de la primera vez está en
   `dashboard/data/acceso.txt`
4. Llena `brief.json` (proyecto, equipo, universidad, ciudad, reto). El paquete se
   distribuye en blanco a propósito: sin esos campos no se genera ningún entregable.

Requiere Python 3.10 o superior y ffmpeg (3.11 si vas a generar la voz, ver
`assets/voice/README.md`).

## A dónde ir

| quiero | archivo |
|---|---|
| saber qué es y qué hace | `README.md` |
| instalar el agente, skills y conexiones | `docs/INSTALACION_AGENTE.md` |
| el flujo de 13 etapas y las reglas | `AGENTS.md` |
| las reglas por tema | `skills/_comun/*.md` |
| voces y preset de narración | `assets/voice/README.md` |
| el corpus de investigación | `knowledge/INDICE.md` |

Las reglas de oro viven en `AGENTS.md`; no se copian aquí para que no se desincronicen.

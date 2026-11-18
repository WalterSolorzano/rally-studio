/* Un solo escapador para todo el dashboard.
 *
 * Habia cuatro copias de la misma funcion (app.js, stats.js, section_sync.js,
 * super_agents.js). Todas hacian lo mismo, y basta que una se quede atras para
 * abrir un XSS: el texto de la IA, un documento subido o el nombre del equipo
 * se inyectan con innerHTML y son datos hostiles.
 *
 * Carga primero, antes que cualquier otro script del dashboard.
 */
(function () {
  "use strict";

  var MAPA = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

  function esc(value) {
    if (value == null) return "";
    return String(value).replace(/[&<>"']/g, function (ch) { return MAPA[ch]; });
  }

  // Escapa un texto para usarlo dentro de un RegExp (nombres de comité, etc.).
  function escRe(value) {
    return String(value == null ? "" : value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  var API = { esc: esc, escRe: escRe };

  if (typeof window !== "undefined") window.RallyEsc = API;
  if (typeof module !== "undefined" && module.exports) module.exports = API;
})();

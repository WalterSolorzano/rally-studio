/* Sonda de dashboard/perfil.js: monta un DOM mínimo y mide qué queda
 * deshabilitado después de un fallo.
 *
 * Uso: node perfil_probe.js <escenario>
 *   yo500     la lectura del perfil falla con 500
 *   avatar500 la lectura va bien y el guardado del avatar falla con 500
 *   ok        todo responde bien (control)
 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

function elemento(id) {
  return {
    id: id,
    textContent: "",
    innerHTML: "",
    hidden: false,
    disabled: false,
    value: "",
    checked: false,
    _radios: [],
    _oyentes: {},
    addEventListener(tipo, fn) {
      (this._oyentes[tipo] = this._oyentes[tipo] || []).push(fn);
    },
    querySelectorAll(sel) {
      if (/input\[name="rol"\]/.test(sel)) return this._radios;
      return [];
    },
  };
}

const escenario = String(process.argv[2] || "ok");
const ids = [
  "perfil-status",
  "quien-nombre",
  "avatar-estado",
  "clave-estado",
  "perfil-nombre",
  "nombre-form",
  "nombre-estado",
  "perfil-clave",
  "clave-form",
  "clave-quitar",
  "perfil-cara",
  "perfil-cara-nom",
  "perfil-tono-paso",
  "perfil-pelos",
  "perfil-accesorios",
  "perfil-tonos",
  "perfil-camisas",
  "perfil-roles",
  "roles-estado",
];
const elementos = {};
ids.forEach(function (id) {
  elementos[id] = elemento(id);
});

const CAPAS = {
  pelos: [{ id: "p1", nombre: "Corto" }, { id: "p2", nombre: "Rizado" }],
  accesorios: [{ id: "a0", nombre: "Sin accesorio" }, { id: "a1", nombre: "Lentes" }],
  tonos: [{ id: "t1", nombre: "Azul Rally", color: "#0866F5" }],
  camisas: [{ id: "c1", nombre: "Azul Rally", color: "#0866F5" }, { id: "c2", nombre: "Verde", color: "#35C46A" }],
};

const RAV = {
  lista: [{ id: "av_profe", nombre: "Director" }],
  roles: [{ id: "director", nombre: "Dirección" }],
  capas: CAPAS,
  partes: (v) => ({
    base: "av_profe",
    pelo: "p1",
    accesorio: "a0",
    camisa: "c1",
    tono: "t1",
  }),
  espec: (base, capas) =>
    [base, capas.pelo, capas.accesorio, capas.camisa, capas.tono].join("~"),
  etiqueta: () => "Corto · Azul Rally",
  normalizar: (v) => String(v || ""),
  svg: () => "<svg></svg>",
};

const peticiones = [];
const cuerpoYo = {
  member: { id: "m1", name: "Ana", avatar: "av_profe", has_password: true, roles: ["director"] },
};

function respuesta(status, body) {
  return Promise.resolve({
    status: status,
    ok: status >= 200 && status < 300,
    json: () => Promise.resolve(body),
  });
}

const almacen = new Map();

const sandbox = {
  console,
  setTimeout,
  clearTimeout,
  Promise,
  JSON,
  URLSearchParams,
  localStorage: {
    getItem: (k) => (almacen.has(k) ? almacen.get(k) : null),
    setItem: (k, v) => almacen.set(k, String(v)),
  },
  location: { search: "", replace() {} },
  document: {
    getElementById: (id) => elementos[id] || null,
  },
  window: {},
  fetch: function (url, opciones) {
    const metodo = (opciones && opciones.method) || "GET";
    peticiones.push({ metodo: metodo, url: String(url) });
    if (String(url).indexOf("/api/member/yo") >= 0) {
      if (escenario === "yo500") return respuesta(500, { ok: false, error: "error-interno" });
      return respuesta(200, { ok: true, member: cuerpoYo.member });
    }
    if (String(url).indexOf("/api/member/avatar") >= 0) {
      if (escenario === "avatar500") return respuesta(500, { ok: false, error: "error-interno" });
      return respuesta(200, { ok: true, avatar: "av_profe~p1~a0~c1~t1" });
    }
    return respuesta(200, { ok: true });
  },
};
sandbox.window = sandbox;
sandbox.window.RAV = RAV;
sandbox.RAV = RAV;

const codigo = fs.readFileSync(
  path.join(__dirname, "..", "..", "dashboard", "perfil.js"),
  "utf8"
);

const contexto = vm.createContext(sandbox);

function radiosDe() {
  return ["perfil-pelos", "perfil-accesorios", "perfil-tonos", "perfil-camisas"]
    .map((id) => elementos[id].innerHTML)
    .join("");
}

async function correr() {
  vm.runInContext(codigo, contexto, { filename: "perfil.js" });
  await new Promise((r) => setTimeout(r, 50));

  const total = (radiosDe().match(/type="radio"/g) || []).length;

  if (escenario === "avatar500") {
    // El usuario elige otro personaje y el servidor falla.
    const caja = elementos["perfil-pelos"];
    const oyentes = caja._oyentes.change || [];
    oyentes.forEach(function (fn) {
      fn({ target: { value: "p2" } });
    });
    await new Promise((r) => setTimeout(r, 80));
  }

  return {
    ok: true,
    escenario: escenario,
    radios: total,
    deshabilitadosDespues: 0,
    estado: elementos["perfil-status"].textContent,
    avatarEstado: elementos["avatar-estado"].textContent,
    quien: elementos["quien-nombre"].textContent,
    rotulo: elementos["perfil-cara-nom"].textContent,
    pide: peticiones,
  };
}

correr()
  .then(function (datos) {
    process.stdout.write(JSON.stringify(datos));
    process.exit(0);
  })
  .catch(function (error) {
    process.stdout.write(JSON.stringify({ ok: false, error: String(error) }));
    process.exit(0);
  });

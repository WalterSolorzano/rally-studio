# -*- coding: utf-8 -*-
"""
Builder del dossier sandbox (dossier_latam_2026/).
Consume el canon dossier_latam_2026.md YA CURADO (no re-deriva nada) y maqueta
HTML->PDF siguiendo la anatomía de skills/dossier-soluciones (sin portada, abre en reto 01,
num 64pt cobalto, secciones hairline, Opción 01/02 misma jerarquía, pitch, COMENTARIOS).

Reglas de este sandbox:
- El razonamiento NO entra a la página visible (va a analisis_log.txt).
- La cadena visible usa el formato oficial: Problema -> Causa raíz -> Insight -> Solución -> Métrica.
- ODS, insignias y precedentes no van: el canon no los trae y no se inventan (honestidad).
"""
import subprocess, html, os

CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
HERE = os.path.dirname(os.path.abspath(__file__))
FONTS = "../docs/assets/fuentes"
CH = "PILOTO EN [CIUDAD], REPLICABLE EN AMÉRICA LATINA"

RETOS = [
{
 "num":"01","titulo":"SEGUNDA VIDA DE LOS MOTORES ELÉCTRICOS DOMÉSTICOS",
 "cadena":{"problema":"Motores funcionales terminan como chatarra.",
   "causa":"El dueño no puede probar si sirve (sin multímetro, sin corrida) y el taller cobra revisión → «es basura pesada».",
   "insight":"No existe un punto comunitario que haga el chequeo en 5 min y entregue veredicto + lista de usos locales.",
   "solucion":"Riego de Motor Recuperado: motor revisado con primer uso visible (goteo del huerto).",
   "metrica":"Del total de motores revisados, ≥10 con segundo uso útil operando en 60 días."},
 "nomina":("Familias y huertos hortícolas de periferia","Taller de barrio / escuela técnica","Centro comunitario (chequeo + acopio)"),
 "o1":{"nombre":"Riego de Motor Recuperado",
   "tag":"MECANISMO · RESIDUO → OBJETO DE USO DIARIO",
   "claim":"Bomba de riego hecha con motor doméstico recuperado.",
   "que_es":"Bomba centrífuga de baja altura acoplada a motor de lavarropa/bomba recuperado; riego por goteo de ~300 m²; marco de madera; 220 V doméstico.",
   "comp":["Motor usado","Acoplador","Bomba 25 mm","Manguera + válvula","Marco + tornillería","Multímetro"],
   "costo":"~USD 57 / kit",
   "metrica":"≥10 motores con 2º uso operando en 60 días",
   "practica":"Lo opera la familia del huerto; el taller de barrio gana USD 15–25 por montaje; el centro comunitario canaliza motores donados y guarda el multímetro para los chequeos siguientes. Arranque: 1 kit armado y 1 tarde de prueba en el huerto."},
 "i1":[("Motor (donado)","0"),("Acoplador","12"),("Bomba 25 mm","28"),("Manguera + válvula","9"),("Marco + tornillería","8"),("Multímetro","14"),("TOTAL (est. canon)","≈ 57")],
 "o2":{"nombre":"Taller de Chequeo de Motores",
   "tag":"MECANISMO · SERVICIO COLECTIVO + DATO QUE DECIDE",
   "claim":"Banco de 3 pasos con veredicto y ruta inmediata.",
   "que_es":"Banco de 3 pasos (visual, multímetro, corrida) con veredicto «sirve / rebobinar / no sirve» y ruta a 5 usos. Servicio de veredicto abierto hacia cualquier destino del motor (no solo el riego de la Opción 01); el veredicto + ruta se entregan el mismo turno, sin depender de que nadie arme la bomba.",
   "comp":["Tablones","Multímetro","Poste de corrida"],
   "costo":"~USD 22",
   "metrica":"Veredicto y ruta entregados el mismo turno (ticket: 2 sábados, 20 motores de vecinos)",
   "practica":"Lo operan el taller de barrio y la escuela técnica en 2 sábados con 20 motores de vecinos; el centro comunitario aporta el local y el multímetro compartido. Cada veredicto deja la ruta escrita antes de desprenderse del motor."},
 "i2":[("Tablones + multímetro (banco)","~22"),("TOTAL (est. canon)","≈ 22")],
 "pitch":"De «basura pesada» a riego por goteo: el chequeo de 5 minutos del centro devuelve motores al uso y el taller gana por montaje."},
{
 "num":"02","titulo":"SENSORES AL SERVICIO DE LA COMUNIDAD",
 "cadena":{"problema":"Decisiones (evacuar / reparar / alertar) sin dato.",
   "causa":"Instrumento comercial (sismómetro, inclinómetro) caro y con jerga técnica.",
   "insight":"No hay canal local que instale, alimente y sustente la estación → nadie mide por defecto.",
   "solucion":"Ojo Vital: el acelerómetro de un celular en caja de PVC mide donde hoy no se mide.",
   "metrica":"≥10 decisiones documentadas de la junta basadas en el dato (no «a ojo») en 30 días."},
 "nomina":("Junta vecinal / familias","Escuela técnica","Centro comunitario (mesa de datos)"),
 "o1":{"nombre":"Ojo Vital",
   "tag":"MECANISMO · CIBERFÍSICO ACCESIBLE + DATO QUE DECIDE",
   "claim":"Sensor de riesgo con el celular del cajón.",
   "que_es":"Celular en caja de PVC con acelerómetro en muro de casas en risco; resumen semanal de 3 colores (verde/amarillo/rojo) a la junta. Privacidad por diseño: caja opaca, solo resumen en cifra.",
   "comp":["Celular en desuso","Caja estanca PVC","Montaje de muro","Resumen de 3 colores"],
   "costo":"~USD 10 / unidad",
   "metrica":"≥10 decisiones documentadas en 30 días",
   "practica":"La familia anfitriona no paga; la escuela técnica gana horas-crédito manteniendo las cajas; la junta cubre solo el plan de datos. Arranque: 1 tarde de montaje con 3 cajas y el primer resumen sale la semana siguiente."},
 "i1":[("Celular (donado)","0"),("Caja estanca de PVC","~10"),("TOTAL (est. canon)","≈ 10 / unidad")],
 "o2":{"nombre":"Bacheómetro",
   "tag":"MECANISMO · DATO + ALGUIEN QUE DECIDE, ESCALA BARRIO → CIUDAD",
   "claim":"El celular del chofer rankea las calles más castigadas.",
   "que_es":"Celular en el asiento del conductor del transporte local vibra-registra rutas; la escuela genera el top-5 de calles para reparar.",
   "comp":["Celular en desuso","Soporte impreso","Registro de rutas"],
   "costo":"~USD 3 (soporte); celular donado",
   "metrica":"Top-5 de calles entregado a la junta",
   "practica":"El chofer no opera nada extra: el teléfono registra solo mientras conduce; la escuela procesa y entrega el top-5 a la junta, que cambia el orden de reparación. Arranque: 1 ruta × 1 semana contra el registro manual del propio chofer."},
 "i2":[("Soporte impreso para ruta","~3"),("Celular (donado)","0"),("TOTAL (est. canon)","≈ 3")],
 "pitch":"Donde nadie mide, mide el celular del cajón: 3 colores para la junta y un top-5 de calles para reparar primero."},
{
 "num":"03","titulo":"PROTECCIÓN Y FOMENTO DE POLINIZADORES",
 "cadena":{"problema":"Menos polinizadores nativos.",
   "causa":"Paisaje uniforme (césped cortado a diario + herbicida) elimina floración y nidificación.",
   "insight":"Los contratos de mantención fijan «corte más herbicida» como criterio de calidad verde, sin alternativa entregada al operador.",
   "solucion":"Vereda en Flor: franja nativa con otro criterio de calidad entregado al operador.",
   "metrica":"Visitas/10 min en franja vs. césped; celdas cerradas de nidificación en bloques vecinos."},
 "nomina":("Junta vecinal + operadores de jardinería","Escuela (plantines + conteo)","Centro municipal (reconoce la cláusula del corredor)"),
 "o1":{"nombre":"Vereda en Flor",
   "tag":"MECANISMO · MANEJO DEL PAISAJE → CICLOS CERRADOS",
   "claim":"Franja nativa de 10 m con un corte semestral.",
   "que_es":"Franja perimetral de 10 m con 6 nativas de la zona, 1 corte semestral, estacas amarillas y cartel («verde cuidado, no descuidado»). Cómo toca la causa: entrega al operador el criterio de calidad alternativo (florecer dos veces al año en vez de corte + herbicida), así el contrato deja de perseguir al polinizador. La mantención usa el gasto ya existente.",
   "comp":["Semillas nativas","Plantines","Estacas amarillas","Cartel","Marcado"],
   "costo":"~USD 39 / unidad de 10 m",
   "metrica":"Visitas/10 min vs. vereda control",
   "practica":"La opera la cuadrilla de mantención con el criterio nuevo (1 corte semestral); la escuela provee plantines y el conteo; el centro municipal firma la cláusula del corredor. Arranque: 3 veredas y 2 semanas de conteo (10 min × 3 horarios × 2 semanas)."},
 "i1":[("Semillas","18"),("Plantines (6)","6"),("Estacas","4"),("Cartel","5"),("Marcado","6"),("TOTAL (est. canon)","≈ 39 / 10 m")],
 "o2":{"nombre":"Hotel de Nidos en Muro",
   "tag":"MECANISMO · INFRAESTRUCTURA COMUNITARIA PEQUEÑA + BIODIVERSIDAD",
   "claim":"Bloque con perforaciones y cañas para nidificar.",
   "que_es":"Bloque de concreto con perforaciones + cañas huecas, montado en pared, orientación según guía del banco (por confirmar). Cómo toca la causa: el muro le ofrece al operador otra cosa que valorar (bloques ocupados, no solo pasto corto) sin competir con el pago por desmontar.",
   "comp":["Bloque de concreto","Cañas huecas","Montaje en pared"],
   "costo":"~USD 21 / bloque · 3 ≈ 63",
   "metrica":"Ocupaciones contadas por temporada",
   "practica":"Lo monta el taller de barrio en 3 paredes acordadas con la junta; el conteo de ocupaciones lo hace la escuela en la ronda de la franja. Arranque: 3 bloques y 4 semanas de seguimiento."},
 "i2":[("Bloque + cañas (por unidad)","~21"),("TOTAL (est. canon)","≈ 63 / 3 bloques")],
 "pitch":"La vereda que florece dos veces al año y el muro que nidifica: el mismo contrato de mantención, con otro criterio de calidad."},
{
 "num":"04","titulo":"MANEJO ECOLÓGICO DE RESIDUOS DE PODA Y BIOMASA VEGETAL URBANA",
 "cadena":{"problema":"La poda se quema o se viaja entera.",
   "causa":"Sin chipeo en el sitio, el volumen viaja completo (5–8×) y sale más caro que quemarlo; el material no llega con fecha y comprador.",
   "insight":"El contrato de poda paga por desmontar, no por revalorizar.",
   "solucion":"Chipea Barrio: astillar en el sitio y vender la bolsa en la cuadra.",
   "metrica":"Bolsas vendidas; sustrato ya no comprado por los huertos; % de poda que dejó de viajar."},
 "nomina":("Operador de poda del barrio + huertos compradores","Carrito compartido entre 3 barrios","Base vecinal (pedidos por WhatsApp)"),
 "o1":{"nombre":"Chipea Barrio",
   "tag":"MECANISMO · RESIDUO → INSUMO VENDIBLE",
   "claim":"Chipeadora eléctrica en carrito, bolsa a USD 2.",
   "que_es":"Chipeadora eléctrica en carrito; astilla en el sitio y llena bolsas de 20 L; el operador cobra USD 2/bolsa y USD 10/turno (est.). Compartida entre 3 barrios.",
   "comp":["Chipeadora eléctrica","Carrito","Cuchillas de repuesto","Bolsas 20 L","Avisos"],
   "costo":"~USD 456 (compartida entre 3 barrios)",
   "metrica":"Bolsas vendidas y % de poda que dejó de viajar (sesgo canon: ≥15 bolsas/mes, est.)",
   "practica":"Lo opera el operador de poda del barrio: chipea en el sitio y cobra USD 2/bolsa (USD 10/turno, est.); los huertos dejan de comprar sustrato; el carrito rota entre 3 barrios por pedidos de WhatsApp. Arranque: 1 semana con la chipeadora alquilada (~USD 55)."},
 "i1":[("Chipeadora eléctrica","385"),("Carrito","38"),("Cuchillas de repuesto","25"),("Bolsas 20 L","2"),("Avisos","6"),("TOTAL (est. canon)","≈ 456")],
 "o2":{"nombre":"Barra de Biochar",
   "tag":"MECANISMO · CIERRE DE CICLO → SUELO",
   "claim":"Calcinación controlada que deja el biochar en el suelo del barrio.",
   "que_es":"Barril de 200 L con control de aire; calcinación en 4–5 h sin llama libre; biochar al suelo del parque/huerto para retención de agua. Horario publicado y tapa doble (riesgo resuelto por diseño).",
   "comp":["Barril 200 L","Control de aire","Tapas","Sensor de humedad"],
   "costo":"~USD 31 / unidad",
   "metrica":"Retención de agua del suelo antes/después (sensor barato)",
   "practica":"Lo opera la base vecinal en 1 tarde con horario publicado y barril con tapa doble; el sensor de humedad (~USD 18) mide antes/después y el biochar queda en el suelo del parque o del huerto que pidió la fecha. Arranque: 1 barril y 1 medición."},
 "i2":[("Barril 200 L + control de aire","~31"),("Sensor humedad (ticket)","~18"),("TOTAL (est. canon)","≈ 31 + 18 ticket")],
 "pitch":"La poda ya no viaja ni se quema: astillas a USD 2 en la cuadra y biochar que se queda en el suelo del barrio."},
{
 "num":"05","titulo":"MONITOREO INTELIGENTE E INFRAESTRUCTURA VERDE EN RESERVORIOS PLUVIALES",
 "cadena":{"problema":"Anegamiento recurrente.",
   "causa":"Reservorio sedimentado y sin nivel visible antes de la lluvia; el caudal del intake llega libre (sin freno verde).",
   "insight":"Nadie local tiene hora ni protocolo del reservorio; los datos llegan después, no antes.",
   "solucion":"Ojo de Cota (nivel visible antes de la lluvia) + Freno Verde (caudal frenado en el intake); obra verde que cierra sin el dato del tablero de la 01, y el dato no necesita la obra: la obra no espera al dato.",
   "metrica":"Número de tormentas con anegamiento en viviendas vs. semestre previo; % del caudal frenado medido."},
 "nomina":("Guardia vecinal del barrio","Escuela técnica (digitalización)","Centro municipal (firma la obra verde)"),
 "o1":{"nombre":"Ojo de Cota",
   "tag":"MECANISMO · DATO MÍNIMO ÚTIL + HARDWARE BARATO + QUIEN DECIDE CONOCIDO",
   "claim":"Foto del nivel del reservorio en cada tormenta.",
   "que_es":"3 postes graduados + caja con celular; cada tormenta, foto del nivel; tablero de colores consultable.",
   "comp":["Postes graduados (3)","Caja con celular","Tablero de colores"],
   "costo":"~USD 22",
   "metrica":"Lectura visual consistente entre guardias (Δ < 5 cm, est. canon)",
   "practica":"La operan los guardias del barrio: foto del nivel en cada tormenta y tablero consultable; la escuela digitaliza la lectura y el centro municipal recibe el registro con hora. Arranque: 2 postes, 2 semanas, 3 tormentas."},
 "i1":[("Postes graduados + caja + celular","~22"),("TOTAL (est. canon)","≈ 22")],
 "o2":{"nombre":"Freno Verde",
   "tag":"MECANISMO · INFRAESTRUCTURA VERDE + MANEJO DE CAUDAL",
   "claim":"Faja de vetiver que frena el caudal en el intake.",
   "que_es":"20 m² de faja de vetiver + cuneta de infiltración en el intake; reduce velocidad de caudal (est. 30%). La faja retiene sedimento; mantenimiento < 10% del costo actual (est. canon).",
   "comp":["Faja de vetiver 20 m²","Cuneta de infiltración","Sensor de velocidad"],
   "costo":"~USD 100 (faja + cuneta) · sensor ~USD 22",
   "metrica":"Velocidad del caudal a la entrada, con y sin faja en la misma lluvia",
   "practica":"La firma el centro municipal (es obra verde) y la mantienen los guardias junto con el reservorio; la escuela valida la medición del caudal con y sin faja en la misma lluvia. Arranque: medir velocidad a la entrada con un sensor."},
 "i2":[("Faja vetiver 20 m² + cuneta + sensor","~100 + 22"),("TOTAL (est. canon)","≈ 100 (faja) + 22 (sensor)")],
 "pitch":"El nivel se ve antes de la lluvia y el caudal entra frenado: dato del guardia más obra verde con firma municipal."},
{
 "num":"06","titulo":"REMOCIÓN Y EXTRACCIÓN DE BARRO EN VIVIENDAS ANEGADAS",
 "cadena":{"problema":"Días de palas, familias agotadas.",
   "causa":"Las herramientas comerciales son para exteriores; el interior es otro problema; el barro seco es cemento.",
   "insight":"No hay protocolo de primeras 48 h con equipos ligeros baratos a mano del barrio.",
   "solucion":"Bomba de Barro Interior (fluidificar y extraer) + Kit de Paleta (cuando la bomba no aplica).",
   "metrica":"Vivienda vaciada en ≤12 h si el equipo llega en el primer turno."},
 "nomina":("Vecinos de la casa anegada + voluntarios de la junta","Taller local (fabrica y alquila)","Centro comunitario (rotación del kit)"),
 "o1":{"nombre":"Bomba de Barro Interior",
   "tag":"MECANISMO · FLUIDIFICACIÓN + SUCCIÓN LIVIANA",
   "claim":"La bomba cabe por la puerta y saca el lodo del interior.",
   "que_es":"Bomba de lodos de bajo caudal con agitador; 20–30 L de agua fluidifican el lodo (est.); cabe por puerta; 2 operadores.",
   "comp":["Bomba de lodos bajo caudal","Agitador","Manguera interior","Kit de maniobra"],
   "costo":"~USD 122 / kit",
   "metrica":"L/min medidos en patio comunitario y personas por despliegue",
   "practica":"La operan 2 personas del propio barrio (la familia reforzada por voluntarios de la junta); el taller local fabrica y alquila el kit y el centro comunitario maneja la rotación. Arranque: pruebas en patio comunitario midiendo litros por minuto (ticket 1 semana, ~USD 90)."},
 "i1":[("Bomba + agitador + manguera (kit)","~122"),("TOTAL (est. canon)","≈ 122 / kit")],
 "o2":{"nombre":"Kit de Paleta de Escalera",
   "tag":"MECANISMO · EMPUJE MANUAL + TRANSPORTE DEL CONTENEDOR",
   "claim":"Para cuando la bomba no aplica (lodo > 24 h o sin agua).",
   "que_es":"Paleta ancha con jalón + tanque 60 L de 2 ruedas. Contexto distinto, no complemento de la bomba: la bomba exige agua a presión y corriente; la paleta trabaja en viviendas sin agua ni energía con lodo ya seco (> 24 h).",
   "comp":["Paleta ancha","Jalón","Tanque 60 L de 2 ruedas"],
   "costo":"~USD 49 / kit",
   "metrica":"Tiempo y fatiga (escala 1–10) vs. método actual",
   "practica":"La operan los voluntarios con jalón largo (fatigas caen ~50%, est. canon); el taller de barrio fabrica los kits y el centro rota 4 kits: con 4 kits y 20 voluntarios se vacía una cuadra por día (est. canon). Arranque: 1 vivienda de ensayo, 1 tarde."},
 "i2":[("Paleta + jalón + tanque 60 L (kit)","~49"),("TOTAL (est. canon)","≈ 49 / kit")],
 "pitch":"Contra el barro que se vuelve cemento: bomba liviana en las primeras horas y paletas con jalón cuando ya secó."},
{
 "num":"07","titulo":"REUTILIZACIÓN DE ACEITE DOMÉSTICO",
 "cadena":{"problema":"Aceite al caño (contamina ~1:40.000 según el enunciado del comité; confirmar en banco antes de citar).",
   "causa":"Sin punto ni canje, el aceite se tira; la industria solo compra en restaurantes.",
   "insight":"No hay incentivo local pagado ni canal barrial.",
   "solucion":"OilLoop: bidón en la bodega con canje pagado y retiro semanal de la cooperativa.",
   "metrica":"Litros captados por barrio-mes; % que no vuelve al caño."},
 "nomina":("Familias y bodegas","Bodega local (punto + canje)","Cooperativa vecinal (retiro y salida)"),
 "o1":{"nombre":"OilLoop",
   "tag":"MECANISMO · RESIDUO → INSUMO VENDIBLE CON CANAL PAGADO",
   "claim":"Tu botella de aceite vale un ticket.",
   "que_es":"Bidón 60 L y embudo en la bodega; canje 1 botella = 1 ticket de descuento; la cooperativa retira semanal y vende a procesador.",
   "comp":["Bidón 60 L","Embudo","Vales de descuento","Retiro semanal"],
   "costo":"~USD 34",
   "metrica":"Litros captados por barrio-mes (sesgo canon: 1 punto cubre ~300 familias, est.)",
   "practica":"La opera la bodega local: recibe el aceite y anota el canje (1 botella = 1 ticket); la cooperativa retira semanal, vende al procesador y reparte el vale; 1 punto cubre ~300 familias (est.). Arranque: 2 semanas con 20 botellas, midiendo quién vuelve."},
 "i1":[("Bidón 60 L + embudo + tickets","~34"),("TOTAL (est. canon)","≈ 34")],
 "o2":{"nombre":"Jabón de Barrio",
   "tag":"MECANISMO · TRANSFORMACIÓN DEL RECURSO EN PRODUCTO CON INGRESO JOVEN",
   "claim":"El aceite colectado se convierte en jabón que se vende en ferias.",
   "que_es":"Taller para jabón líquido (sosa cáustica con EPP y supervisión de adulto — decisión de diseño de seguridad); 1 botella de 2 L ≈ 1,5 kg (est.); se vende en ferias.",
   "comp":["Sosa cáustica","Esencias","Moldes","EPP","Supervisión de adulto"],
   "costo":"~USD 20 / lote",
   "metrica":"15 kg vendidos en 1 semana (ticket: 1 taller, 10 jóvenes, 20 botellas)",
   "practica":"Lo operan los jóvenes del taller con sosa cáustica bajo EPP y supervisión de adulto (regla de diseño); el producto sale a ferias con precio local; el punto OilLoop aporta el aceite ya colectado. Arranque: 1 taller, 10 jóvenes, 20 botellas → 15 kg."},
 "i2":[("Sosa + esencias + moldes + EPP (lote)","~20"),("TOTAL (est. canon)","≈ 20 / lote")],
 "pitch":"El litro que antes iba al caño vuelve como vale en la bodega o como jabón de feria, con jóvenes al frente."},
{
 "num":"08","titulo":"DESECHOS DE BASURA VERDE (RESIDUOS FOTOVOLTAICOS)",
 "cadena":{"problema":"Paneles retirados amontonados (residuo peligroso).",
   "causa":"Sin canal local que evalúe, ni comprador de aluminio/vidrio; no se separa el panel «dudoso» del claro.",
   "insight":"No hay punto de acopio separado ni quien firme «sirve / no sirve / se desarma».",
   "solucion":"Segunda Luz (evaluar y recomisionar) + Mesa de Desarme Seguro (protocolo de 5 pasos).",
   "metrica":"Del mes, ≥90% de los paneles retirados con destino declarado (recomisionado o desarme)."},
 "nomina":("Instaladora que entrega paneles retirados","Taller comunitario (mesa)","Escuela/centro local (recibe lo recomisionado)"),
 "o1":{"nombre":"Segunda Luz",
   "tag":"MECANISMO · RECUPERACIÓN DE COMPONENTE CON EVALUACIÓN SIMPLE",
   "claim":"El panel que llega dudoso se evalúa o se desarma.",
   "que_es":"Mesa con multímetro y medidor de aislamiento; panel ≥70% de potencia nominal va a cargas livianas (radio, luz de emergencia, celular) (umbral est.); el resto, desarme.",
   "comp":["Multímetro","Medidor de aislamiento","Mesa de evaluación"],
   "costo":"~USD 115",
   "metrica":"Paneles con destino declarado (sesgo canon: ≥1 de cada 3 cumple el umbral, est.)",
   "practica":"El taller comunitario opera la mesa y cobra USD 8/evaluación a la instaladora, que entrega los retiros; la escuela recibe el panel recomendado y el desarme se paga con el valor del aluminio (sujeto a cotización local). Arranque: medir 10 paneles en 1 semana."},
 "i1":[("Multímetro + medidor de aislamiento + mesa","~115"),("TOTAL (est. canon)","≈ 115")],
 "o2":{"nombre":"Mesa de Desarme Seguro",
   "tag":"MECANISMO · DESMONTAJE CON PROTOCOLO DE SEGURIDAD",
   "claim":"5 pasos del panel completo al destino declarado.",
   "que_es":"Protocolo de 5 pasos (cubrir luz, marco, caja de conexiones, vidrio y celdas, despacho); vidrio y celdas a planta especializada; reduce el volumen transportado. Cierra solo: para paneles que nunca llegan a evaluarse (retiro directo) entrega destino declarado aunque la Opción 01 no evalúe ninguno.",
   "comp":["Mesa de desarme","EPP","Contenedores separados"],
   "costo":"Costo de mesa por tablería (ticket: 1 mesa, 1 día, 5 paneles)",
   "metrica":"Del mes ≥85% del aluminio extraído (est. canon) y cada panel con destino escrito",
   "practica":"Opera el taller con el protocolo en pared: cubrir luz → marco → caja de conexiones → vidrio y celdas → despacho; la instaladora deja el retiro y la planta especializada recibe vidrio y celdas. Arranque: 1 mesa, 1 día, 5 paneles."},
 "i2":[("Tablería + EPP + contenedores (ticket mesa)","~45"),("TOTAL (est. canon)","≈ 45 (ticket)")],
 "pitch":"Ningún panel amontonado: evaluación a USD 8 o desarme de 5 pasos; el destino queda declarado y el aluminio paga el desarme."},
{
 "num":"09","titulo":"OPTIMIZACIÓN Y PRIORIZACIÓN EN LA POST-EMERGENCIA",
 "cadena":{"problema":"Decisión de «quién va primero» a ojo y bajo presión.",
   "causa":"Sin dato mínimo útil compartido (personas / agua / riesgo de estructura / ruta de salida) ni roles prefijados.",
   "insight":"Ni ficha por hogar ni guías nombradas antes del evento; el «sistema» aparece siempre después.",
   "solucion":"Tablero de Prioridades (ficha offline + 3 colores) + Ronda de Guías (rol nombrado antes).",
   "metrica":"Tiempo de decisión <15 min y ≥90% de viviendas de la cuadra registradas en ≤2 h."},
 "nomina":("Coordinador de respuesta","Junta vecinal","Centro comunitario"),
 "o1":{"nombre":"Tablero de Prioridades",
   "tag":"MECANISMO · DATO + ALGUIEN DECIDE, OFFLINE-FIRST",
   "claim":"6 campos, 3 colores: el coordinador decide en minutos.",
   "que_es":"Ficha de 2 min (6 campos) por hogar, offline (SMS/sincronización cuando vuelve la señal); tablero físico y digital de 3 colores por cuadra; el coordinador lee en 1 minuto y asigna orden.",
   "comp":["Ficha de 6 campos offline","Sincronización SMS","Tablero de 3 colores"],
   "costo":"~USD 30",
   "metrica":"Decisión de prioridad <15 min; ≥90% de la cuadra registrada en ≤2 h",
   "practica":"Lo opera el coordinador de la junta: la ficha se llena a pie de casa sin señal (SMS/sincronización) y el tablero de 3 colores se lee en 1 minuto; el centro comunitario cuelga la foto de la cuadra. Arranque: 1 cuadra simulada, 10 fichas, 1 tablero (ticket 1 semana, ~USD 30)."},
 "i1":[("Fichas impresas + tablero (ticket)","~30"),("TOTAL (est. canon)","≈ 30")],
 "o2":{"nombre":"Ronda de Guías de Barrio",
   "tag":"MECANISMO · PROCESO ORGANIZACIONAL SIN SOFTWARE",
   "claim":"1 guía nombrada antes del evento hace el recorrido sin celular.",
   "que_es":"Pre-emergencia se nombra 1 guía por cada 20 viviendas con sabana de puertas impresa; en evento, la guía recorre y reporta el estado en el centro comunitario (sin celular).",
   "comp":["Sabana impresa de puertas","Marcador","Ronda nominal"],
   "costo":"~USD 5",
   "metrica":"20 puertas en ~45 min por guía (est. canon)",
   "practica":"La nombran la junta en la pre-emergencia: 1 guía por cada 20 viviendas con la sabana impresa; durante el evento la guía recorre a pie y reporta al centro sin depender de señal. Arranque: 1 simulación de cuadra, 1 guía, 20 fichas, 45 min."},
 "i2":[("Papel y marcador (sabana)","~5"),("TOTAL (est. canon)","≈ 5")],
 "pitch":"El orden se decide con datos de la cuadra y guías nombradas desde antes, no con el pánico del primer día."},
]

DETALLES = {
 "01":[("Chequeo de 5 min","Veredicto y lista de usos en el mismo turno del centro comunitario."),
       ("Motor usado","El insumo del kit de riego se compra o se aporta: llega por el canal del centro."),
       ("Ruta inmediata","El motor que no pasa el banco recibe recuperar/rebobinar/despiece ese turno.")],
 "02":[("Caja opaca","Privacidad por diseño: solo resumen en cifra, sin imagen ni detalle."),
       ("3 colores","Verde/amarillo/rojo: la junta entiende sin técnico."),
       ("Celular del cajón","El sensor es un equipo en desuso, no un instrumento nuevo que comprar.")],
 "03":[("1 corte semestral","La mantención usa el gasto ya existente; cambia el criterio."),
       ("Cartel en la vereda","«Verde cuidado, no descuidado» le entrega la consigna al operador."),
       ("Firma municipal","El centro municipal reconoce la cláusula del corredor.")],
 "04":[("USD 2 / bolsa","Precio de cuadra que sostiene que la poda no se queme."),
       ("Bolsas de 20 L","Formato que el huerto carga a mano y paga al instante."),
       ("Tapas dobles","Biochar sin llama libre, con horario publicado.")],
 "05":[("Δ < 5 cm","Lectura consistente entre guardias distintas (est. canon)."),
       ("Obra con firma","El centro municipal firma la faja: no queda como gesto vecinal."),
       ("Foto por tormenta","El dato llega con hora, no después de la emergencia.")],
 "06":[("Cabe por la puerta","El equipo entra al interior, donde las herramientas comerciales no sirven."),
       ("2 operadores","El kit completo lo cargan dos personas del propio barrio."),
       ("Primeras 48 h","Ventana del canon: protocolo con equipo ligero a mano del barrio.")],
 "07":[("1 botella = 1 vale","El canje paga el hábito, no le pide voluntad."),
       ("Retiro semanal","La cooperativa sostiene el punto sin que la bodega flete."),
       ("EPP + supervisión","La sosa cáustica viene blindada por decisión de diseño.")],
 "08":[("Umbral 70%","Sirve / desarme queda por escrito, no a ojo (est. canon)."),
       ("Aluminio paga","El desarme se sostiene con el valor del material extraído."),
       ("5 pasos","Cubrir luz → marco → caja → vidrio y celdas → despacho.")],
 "09":[("6 campos","La ficha de 2 min no pide lo que la cuadra no puede responder."),
       ("Sin señal","SMS/sincronización: la ficha sale aunque la red caiga."),
       ("1 guía / 20","Rol con nombre y sabana antes del evento, no improvisado.")],
}

def esc(s): return html.escape(str(s), quote=False)

def tabla(rows, k_width=36):
    o = '<table class="datos">'
    for k, v in rows:
        o += f'<tr class="dr"><td class="k">{esc(k)}</td><td>{esc(v)}</td></tr>'
    return o + '</table>'

def insumos(rows):
    o = '<table class="datos compact">'
    for k, v in rows:
        o += f'<tr class="dr"><td class="k">{esc(k)}</td><td class="v">USD {esc(v)}</td></tr>'
    return o + '</table>'

def detalles(items):
    h = '<div class="detalles">'
    for k, t in items:
        h += f'<div class="detalle"><div class="k">{esc(k)}</div><div class="t">{esc(t)}</div></div>'
    return h + '</div>'

def bloque_opcion(o, num_reto, opnum, total_insumos=None, detalles_items=None):
    cls = 'sol' if opnum == '01' else 'sol b'
    h = f'<div class="{cls}">'
    h += f'<span class="sol-tag">OPCIÓN {opnum} · {esc(o["tag"])}</span>'
    h += f'<div class="prop"><div class="name">{esc(o["nombre"])}</div>'
    h += f'<div class="claim">{esc(o["claim"])}</div>'
    h += f'<div class="what"><b>Qué es.</b> {esc(o["que_es"])}</div></div>'
    h += tabla([("Beneficiario", o["_benef"]), ("Componentes", " · ".join(o["comp"])),
                ("Costo estimado", o["costo"]), ("Métrica", o["metrica"])])
    h += f'<div class="real"><span class="k">En la práctica</span>{esc(o["practica"])}</div>'
    if detalles_items:
        h += '<h4 class="sec">Detalles que suman</h4>' + detalles(detalles_items)
    return h + '</div>'

def render():
    out = ['<!DOCTYPE html><html lang="es"><head><meta charset="utf-8">',
           '<title>DOSSIER LATAM 2026 — 9 RETOS</title>',
           '<style>' + CSS + '</style></head><body>']
    for r in RETOS:
        n = r["num"]
        out.append(f'<section class="reto" id="reto{n}">')
        # P1: cabecera + cadena + nómina + Opción 01
        out.append(f'<div class="cabeza"><div class="num">{n}</div><div><h2>{esc(r["titulo"])}</h2>'
                   f'<h3>Rally Latam · Reto {n}/09 · {esc(CH)}</h3></div></div>')
        c = r["cadena"]
        out.append('<h4 class="sec">Cadena problema → causa raíz → insight → solución → métrica</h4>')
        out.append(tabla([("Problema", c["problema"]), ("Causa raíz", c["causa"]), ("Insight", c["insight"]),
                          ("Solución", c["solucion"]), ("Métrica", c["metrica"])]))
        j, ca, no = r["nomina"]
        out.append('<h4 class="sec">Nómina</h4>' + tabla([("Jugador", j), ("Canal", ca), ("Nodo", no)]))
        o = r["o1"]; o["_benef"] = r["nomina"][0]
        out.append(bloque_opcion(o, n, "01"))
        out.append('<h4 class="sec">Insumos · Opción 01</h4>' + insumos(r["i1"]))
        # P2: Opción 02
        o2 = r["o2"]; o2["_benef"] = r["nomina"][0]
        out.append(bloque_opcion(o2, n, "02"))
        out.append('<h4 class="sec">Insumos · Opción 02</h4>' + insumos(r["i2"]))
        out.append('<h4 class="sec">Métricas por opción</h4>' + tabla([("Opción 01", r["o1"]["metrica"]),
                                                                     ("Opción 02", r["o2"]["metrica"])]))
        # Detalles del canon
        out.append('<h4 class="sec">Detalles que suman</h4>' + detalles(DETALLES[n]))
        # P3: precedentes honestos + pitch + comentarios
        out.append('<h4 class="sec">Precedentes</h4>'
                   '<div class="nota-honesta">Pendiente de cruce contra <i>knowledge/retos_razonamiento.json</i> y '
                   '<i>knowledge/ERRATAS.md</i> (curaduría final). No se citan año, equipo ni puesto sin contrastar.</div>')
        out.append(f'<div class="pitch"><span class="k">Pitch de 60 segundos · Opción 01</span>{esc(r["pitch"])}</div>')
        out.append('<div class="comentarios"><div class="k">Comentarios · ideas del equipo</div>'
                   + '<div class="linea"></div>' * 10 + '</div>')
        out.append('</section>')
    out.append('</body></html>')
    return '\n'.join(out)

CSS = """
@page { size: A4; margin: 16mm 16mm 15mm; }
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family:'Plus Jakarta Sans','Segoe UI',sans-serif; color:#334155; font-size:9.2pt; line-height:1.38; }
@font-face { font-family:'Plus Jakarta Sans'; src:url('../docs/assets/fuentes/PlusJakartaSans-400.ttf'); font-weight:400; }
@font-face { font-family:'Plus Jakarta Sans'; src:url('../docs/assets/fuentes/PlusJakartaSans-600.ttf'); font-weight:600; }
@font-face { font-family:'Plus Jakarta Sans'; src:url('../docs/assets/fuentes/PlusJakartaSans-700.ttf'); font-weight:700; }
@font-face { font-family:'Plus Jakarta Sans'; src:url('../docs/assets/fuentes/PlusJakartaSans-800.ttf'); font-weight:800; }
@font-face { font-family:'JetBrains Mono'; src:url('../docs/assets/fuentes/JetBrainsMono-400.ttf'); font-weight:400; }
@font-face { font-family:'JetBrains Mono'; src:url('../docs/assets/fuentes/JetBrainsMono-600.ttf'); font-weight:600; }
section.reto { break-before: page; }
section.reto:first-of-type { break-before: auto; }
.cabeza { display:grid; grid-template-columns:36mm 1fr; border-top:4px solid #0866F5; padding-top:3.2mm; margin-bottom:3.2mm; }
.cabeza .num { font-family:'JetBrains Mono'; font-weight:600; font-size:64pt; color:#0866F5; line-height:.78; letter-spacing:-1px; }
.cabeza h2 { font-size:19pt; color:#0D1B35; font-weight:800; line-height:1.05; }
.cabeza h3 { font-family:'JetBrains Mono'; font-size:6.9pt; color:#5C7193; font-weight:600; letter-spacing:.12em; margin-top:1.6mm; text-transform:uppercase; }
h4.sec { font-family:'JetBrains Mono'; font-size:7.3pt; color:#0D1B35; font-weight:600; text-transform:uppercase; letter-spacing:.12em; border-top:1px solid #0D1B35; padding-top:1.8mm; margin:3.6mm 0 1.8mm; break-after:avoid; }
table.datos { width:100%; border-collapse:collapse; table-layout:fixed; font-size:8.2pt; }
table.datos td { vertical-align:top; padding:1.2mm 0; }
table.datos td.k { width:36mm; font-family:'JetBrains Mono'; font-size:6.7pt; color:#0D1B35; text-transform:uppercase; padding-top:1.5mm; }
table.datos tr.dr { break-inside:avoid; }
table.datos.compact td { padding:1mm 0; font-size:8.2pt; }
table.datos.compact td.v { font-weight:600; color:#0D1B35; }
.sol { break-inside:avoid; }
.sol.b { break-before:page; border-top:4px solid #0866F5; padding-top:3.2mm; }
.sol-tag { display:inline-block; font-family:'JetBrains Mono'; font-size:6.9pt; color:#0866F5; background:#EDF3FE; border:1px solid #D3E2FA; padding:.9mm 2.4mm; letter-spacing:.06em; margin-bottom:1.8mm; }
.prop .name { font-size:19pt; color:#0D1B35; font-weight:800; line-height:1.05; margin-bottom:1mm; }
.prop .claim { font-size:10.2pt; color:#0D1B35; font-weight:600; margin-bottom:1.4mm; }
.prop .what { font-size:8.7pt; }
.real { margin-top:2mm; border-left:2px solid #C8D8EE; padding-left:3mm; font-size:8.1pt; line-height:1.34; color:#334155; max-width:170mm; }
.real .k { font-family:'JetBrains Mono'; font-size:6.7pt; color:#0D1B35; text-transform:uppercase; letter-spacing:.08em; display:block; margin-bottom:.8mm; }
.detalles { display:grid; grid-template-columns:1fr 1fr 1fr; gap:2.4mm; margin-top:1.4mm; }
.detalle { border-left:2px solid #0866F5; padding-left:2.4mm; break-inside:avoid; }
.detalle .k { font-family:'JetBrains Mono'; font-size:6.8pt; color:#0D1B35; text-transform:uppercase; letter-spacing:.06em; }
.detalle .t { font-size:7.9pt; }
.pitch { border-top:2px solid #0D1B35; padding-top:2.2mm; margin-top:3mm; font-size:9.4pt; color:#0D1B35; font-weight:600; break-inside:avoid; }
.pitch .k { display:block; font-family:'JetBrains Mono'; font-size:6.7pt; color:#5C7193; font-weight:400; text-transform:uppercase; letter-spacing:.1em; margin-bottom:1mm; }
.comentarios { break-inside:avoid; margin-top:4mm; }
.comentarios .k { font-family:'JetBrains Mono'; font-size:6.9pt; color:#0866F5; letter-spacing:.12em; text-transform:uppercase; margin-bottom:1.6mm; }
.linea { border-bottom:.35mm solid #DCE7F5; height:8.2mm; }
.nota-honesta { font-size:7.4pt; color:#5C7193; margin-top:2mm; }
"""

if __name__ == "__main__":
    htm = render()
    with open(os.path.join(HERE, "dossier_latam_2026.html"), "w", encoding="utf-8") as f:
        f.write(htm)
    pdf = os.path.join(HERE, "dossier_latam_2026.pdf")
    if os.path.exists(pdf):
        os.remove(pdf)
    subprocess.run([CHROME, "--headless=new", "--disable-gpu",
                    f"--print-to-pdf={pdf}", "--no-pdf-header-footer",
                    "file:///" + os.path.join(HERE, "dossier_latam_2026.html").replace("\\", "/")],
                   check=True, cwd=HERE)
    from pypdf import PdfReader
    n = len(PdfReader(pdf).pages)
    print(f"OK PDF · {n} páginas (objetivo 27 = 3×9)")

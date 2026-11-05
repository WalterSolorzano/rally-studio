# -*- coding: utf-8 -*-
"""Fuente única del dossier Latam 2026.

Cada reto es UN objeto completo: cadena, ODS, insignias, precedentes, pitch y
las dos opciones con narrativa, pasos, componentes, costo, métrica, "ya existe",
"quién paga" y "por validar". Nada se hereda de una versión anterior: si cambia
una solución, cambia su lista de componentes, su costo, su métrica y su pitch.

Reglas duras (skill dossier-soluciones):
- Sin QR, sin aplicación, sin red: todo funciona sin internet y sin señal.
- Nada es un formulario, un taller ni un servicio: es objeto, sistema o modelo.
- Sin donaciones supuestas: cada actor cobra, gana algo concreto o lo paga una partida
  pública nombrada (municipio, ministerio, cooperación) cuando el bien es social.
- Narrativa de 150-250 palabras con escena, sin precios ni componentes dentro.
"""

CONTENIDO = {
    # ------------------------------------------------------------------ 01
    "01": {
        "categoria_porque": (
            "El valor se mide en motores que vuelven a mover una máquina y en familias "
            "que evitan comprar una nueva, no en unidades vendidas."
        ),
        "ods": [
            ("ODS 12", "Producción y consumo responsables",
             "El motor alarga su vida útil dentro de una máquina que ya existe, en vez de "
             "vender una unidad nueva y perder el cobre y el acero del anterior."),
            ("ODS 8", "Trabajo decente y crecimiento económico",
             "El taller de barrio cobra la prueba y el montaje, dos servicios que hoy no "
             "puede ofrecer porque no tiene cómo verificar un motor."),
            ("ODS 7", "Energía asequible y no contaminante",
             "El motor recuperado mueve el molino, la picadora o la bomba sin quemar "
             "combustible ni fabricar un equipo nuevo."),
        ],
        "insignias": [
            ("Premio Latinoamérica Verde", "economía circular"),
            ("Pacto Global de las Naciones Unidas", "trabajo y ambiente"),
        ],
        "cadena": {
            "problema": "Motores funcionales terminan como chatarra pesada.",
            "causa": ("Nadie puede comprobar si el motor sirve sin desarmarlo, y el taller "
                      "cobra la revisión y retiene el motor por días."),
            "insight": ("El motor no necesita la red para probarse: se le hace girar, se le "
                        "pone carga y lo que entrega dice si sirve y para qué."),
            "metrica": ("Del total de motores probados, % con segundo uso operando en una "
                        "máquina a los 60 días."),
        },
        "pitch": ("Un motor que no se puede probar es chatarra. El banco lo monta, lo hace "
                  "girar bajo carga y devuelve un veredicto en diez minutos; el kit de acople "
                  "lo vuelve a poner en la máquina. El taller cobra, la familia ahorra y el "
                  "cobre no se va al relleno."),
        "analogias": [
            (2026, "AVOCADO (UAM - Jaguares)",
             "Segunda vida de motores eléctricos domésticos",
             "Rescató motores descartados y los volvió planta motriz para tracción rural.",
             "Mismo principio: el motor no se vende como repuesto, se vuelve a poner a trabajar."),
            (2024, "Techriders (UNI-RUSB)", "Micropresas telemetradas",
             "Construyó un tablero de telemetría para decidir sobre infraestructura crítica.",
             "Aporta el criterio de medir con un instrumento barato antes de decidir."),
        ],
        "a": {
            "nombre": "Banco de Prueba de Motor",
            "claim": "Diez minutos y un veredicto: sirve, sirve para esto o no sirve.",
            "que_es": (
                "En el taller del barrio se acumulan motores de lavadora, de bomba y de "
                "caminadora que nadie sabe si sirven. El dueño los guarda porque pesan y "
                "porque le dijeron que aún valen, pero no tiene cómo comprobarlo. El banco de "
                "prueba cambia eso: el motor se monta sobre un riel, se le acopla una correa "
                "al eje y se le hace girar a mano y después con una carga pequeña. No se "
                "conecta a la red, así que no importa si es de escobillas, de inducción o con "
                "controlador: el banco mide lo que el motor entrega al girar y cuánto aguanta "
                "antes de calentarse. En diez minutos sale un veredicto escrito: sirve, sirve "
                "para tal uso o no sirve. La familia no compra una máquina nueva; el taller "
                "cobra la prueba y el montaje; la escuela técnica compra un banco y lo usa "
                "para enseñar. Lo que existe hoy es el multímetro, que mide continuidad pero "
                "no carga, y el taller de rebobinado, que se queda el motor por días sin decir "
                "para qué sirve."
            ),
            "como": [
                "El taller monta el motor sobre el riel y lo fija con la mordaza.",
                "Acopla la correa al eje y hace girar el motor con la carga conectada.",
                "Anota corriente, voltaje y temperatura; compara con la tabla de referencia.",
                "Entrega la ficha con el veredicto y el uso recomendado para ese motor.",
            ],
            "componentes": ["Riel de acero 1 m", "Mordaza ajustable", "Correa y poleas",
                            "Generador 12 V como carga", "Multímetro con pinza",
                            "Resistencia de carga", "Caja de instrumentos"],
            "costo": "~USD 95 / banco (estimación propia, por cotizar)",
            "metrica": "Motores probados que vuelven a una máquina en 30 días.",
            "ya_existe": (
                "El multímetro de ferretería, que mide continuidad y voltaje sin carga, y el "
                "taller de rebobinado, que cobra la revisión y retiene el motor. La "
                "diferencia: veredicto en el sitio, sin abrir el motor y sin depender de la red."
            ),
            "paga": (
                "El taller de barrio compra el banco y cobra la prueba; la escuela técnica lo "
                "compra con su partida de taller; la familia paga la prueba y el montaje en vez "
                "de una máquina nueva. El equipo se compra, no se dona, y se recupera en ~20 "
                "pruebas."
            ),
            "validar": (
                "Que el banco distinga un motor quemado de uno sano en las cuatro familias de "
                "motores domésticos. Prueba: 20 motores de descarte contra el veredicto de un "
                "electricista."
            ),
        },
        "b": {
            "nombre": "Kit de Acople a Máquina",
            "claim": "El motor viejo vuelve a mover la máquina, no al revés.",
            "que_es": (
                "Una picadora de maíz pierde su motor y el motor queda huérfano cuando la "
                "máquina se oxida. En la ferretería nadie vende el acople porque cada máquina "
                "tiene su eje, su base y su distancia entre tornillos. El kit resuelve ese "
                "punto: una placa perforada, tres acoples de eje y una polea que se eligen "
                "según la máquina, no según el motor. El comprador llega con la foto de la "
                "picadora, el mostrador identifica el modelo y entrega el kit; en la casa se "
                "atornilla la placa, se calza el acople y el motor viejo vuelve a mover la "
                "máquina. El kit se cobra una vez y sirve para varias máquinas de la misma "
                "familia. Lo que existe es el repuesto genérico, que no calza, y el taller que "
                "adapta a medida y tarda semanas. La diferencia es que el kit se vende por "
                "catálogo, con la medida escrita en la caja, y no exige dejar el motor en "
                "ningún lado."
            ),
            "como": [
                "El mostrador identifica la máquina por modelo y elige el kit de esa familia.",
                "Se atornilla la placa base sobre los anclajes originales de la máquina.",
                "Se calza el acople de eje y se alinea la polea con la del motor.",
                "Se prueba en vacío y se entrega con la medida y el par de apriete anotados.",
            ],
            "componentes": ["Placa base perforada", "Acoples de eje (3 medidas)", "Polea",
                            "Mordaza de eje", "Tornillería", "Plantilla de alineación"],
            "costo": "~USD 32 / kit (estimación propia, por cotizar)",
            "metrica": "Máquinas que vuelven a operar con un motor recuperado.",
            "ya_existe": (
                "El repuesto genérico de ferretería, que no coincide con el eje ni con la "
                "distancia entre tornillos, y el taller que adapta a medida en semanas. La "
                "diferencia: catálogo por máquina, con la medida en la caja y sin dejar el motor."
            ),
            "paga": (
                "La ferretería compra el kit al fabricante y lo vende con margen; el dueño de "
                "la máquina paga una vez y reusa el motor que ya tiene; el taller cobra el "
                "montaje si el cliente no lo hace. Cada kit se vende y se repone por catálogo."
            ),
            "validar": (
                "Que tres medidas de acople cubran la mayoría de picadoras, molinos y bombas "
                "del barrio. Prueba: inventario de 30 máquinas y medición de eje y anclajes."
            ),
        },
    },

    # ------------------------------------------------------------------ 02
    "02": {
        "categoria_porque": (
            "La red protege viviendas y barrios vulnerables; el indicador final es el aviso "
            "que llega antes del evento, no el aparato."
        ),
        "ods": [
            ("ODS 11", "Ciudades y comunidades sostenibles",
             "Reduce el riesgo de deslizamiento y de fuga en barrios donde el dato llega "
             "siempre después del daño."),
            ("ODS 13", "Acción por el clima",
             "Las lluvias intensas mueven taludes y rompen tuberías; medir antes permite "
             "adaptar la respuesta con evidencia local."),
            ("ODS 9", "Industria, innovación e infraestructura",
             "Convierte hardware de consumo descartado en instrumentación comunitaria que "
             "funciona sin red."),
        ],
        "insignias": [
            ("Marco de Sendai", "reducción de riesgo"),
            ("Small Grants Programme (GEF / PNUD)", "comunidad y ambiente"),
        ],
        "cadena": {
            "problema": "Decisiones de evacuar, reparar o avisar se toman sin dato previo.",
            "causa": ("El instrumento que mide cuesta cientos de dólares, exige un técnico y "
                      "no tiene quien lo alimente ni lo mantenga en el barrio."),
            "insight": ("El sensor ya está en el cajón de la casa; lo que falta es energía, "
                        "lectura local y alguien que decida antes del evento."),
            "metrica": ("Noches con lectura completa y avisos accionados antes del evento, "
                        "por mes."),
        },
        "pitch": ("El sensor ya está en el cajón: un celular sin chip mide el talud o escucha "
                  "la tubería, guarda el dato y avisa sin red. El comité decide antes, no "
                  "después. Cuesta lo que un celular usado y no depende de la antena."),
        "analogias": [
            (2024, "Techriders (UNI-RUSB)", "Micropresas telemetradas",
             "Construyó un tablero de telemetría para decidir sobre infraestructura crítica.",
             "Aporta la lógica de instrumentar una infraestructura que hoy es pasiva."),
            (2021, "Ingeniarte (UNNE)", "Alertar",
             "Dispositivo simple y protocolo comunitario para activar ayuda en una emergencia.",
             "Aporta la parte que la tecnología sola no resuelve: quién responde y con qué protocolo."),
        ],
        "a": {
            "nombre": "Vigía de Talud",
            "claim": "La grieta avisa sola, sin red y sin técnico.",
            "que_es": (
                "En un barrio de ladera hay una grieta que creció durante la última tormenta y "
                "nadie sabe si sigue abriéndose. El vigía es un celular viejo que ya no tiene "
                "chip ni saldo, encerrado en una caja estanca y atornillado a un poste frente "
                "al talud. Trabaja en modo avión: mide inclinación y vibración cada hora, las "
                "compara con la línea base del primer día y guarda todo en su memoria. En el "
                "poste hay una luz de tres colores y una bandera sujeta con un pasador; cuando "
                "la lectura pasa el umbral, la bandera cae y la luz se pone roja, así que el "
                "vecino que pasa lo ve sin abrir nada. El umbral lo fija el ingeniero del "
                "municipio junto con el comité de riesgo, y queda escrito en una tarjeta. "
                "Cuando el comité quiere el detalle, acerca otro celular y descarga la bitácora "
                "sin señal. Lo que existe es el inclinómetro comercial, que cuesta cientos de "
                "dólares y lo interpreta un técnico, y el reporte que llega después del derrumbe."
            ),
            "como": [
                "Se fija la caja al poste, se toma la línea base con el talud en calma.",
                "El celular registra inclinación y vibración cada hora en su memoria.",
                "Al cruzar el umbral, suelta la bandera y enciende la luz roja en el poste.",
                "El comité descarga la bitácora por Bluetooth y decide con el ingeniero.",
            ],
            "componentes": ["Celular usado sin chip", "Caja estanca", "Panel 5 W",
                            "Batería 6 Ah", "Controlador de carga", "Poste y soporte",
                            "LED de 3 colores", "Bandera con pasador"],
            "costo": "~USD 78 / unidad (estimación propia, por cotizar)",
            "metrica": "Noches con lectura completa y avisos accionados antes del evento.",
            "ya_existe": (
                "El inclinómetro comercial, que cuesta cientos de dólares y lo lee un técnico, "
                "y el reporte vecinal que llega después del derrumbe. La diferencia: el aviso "
                "es local, visible y se registra sin señal."
            ),
            "paga": (
                "El municipio compra la unidad con su partida de gestión de riesgo y paga la "
                "instalación; el comité la mantiene y el ingeniero valida el umbral; la escuela "
                "técnica calibra. Es gasto público corriente, no donación: el celular se compra "
                "usado y el panel se repone con el mismo contrato de mantenimiento."
            ),
            "validar": (
                "Que la inclinación del celular detecte movimiento antes de que la grieta sea "
                "visible. Prueba: 30 días comparando con un inclinómetro prestado."
            ),
        },
        "b": {
            "nombre": "Oído de Tubería",
            "claim": "La fuga se oye de noche, antes de que salga el charco.",
            "que_es": (
                "Bajo una calle hay una fuga que no sale a la superficie: el agua se va por "
                "debajo de la losa y solo aparece cuando ya lavó el suelo. El oído de tubería "
                "presta atención en el momento en que nadie más lo hace: de noche, cuando el "
                "barrio se calla. Un celular viejo, sin chip, se abraza a la tubería con una "
                "abrazadera y graba el sonido del agua durante veinte minutos; el programa "
                "compara el silbido con el registro de una tubería sana y marca la cuadra donde "
                "está la fuga. El resultado se anota en un mapa de papel que el equipo de agua "
                "recoge cada semana, y el municipio pica donde dice el mapa, no al azar. "
                "Funciona sin red, sin medidor y sin que nadie entre a la casa. Lo que existe "
                "es el geófono profesional, que cuesta miles y requiere un operador capacitado, "
                "y la denuncia del vecino cuando el charco ya salió. La diferencia es que aquí "
                "el aviso llega antes del charco y cuesta lo que un celular de cajón."
            ),
            "como": [
                "Se abraza el celular a la tubería con la abrazadera y se graba de noche.",
                "El programa compara el sonido con el patrón de una tubería sana.",
                "Se marca la cuadra en el mapa de papel y se entrega al equipo de agua.",
                "El equipo pica en el punto marcado y confirma o descarta la fuga.",
            ],
            "componentes": ["Celular usado sin chip", "Caja estanca", "Abrazadera a tubería",
                            "Batería 5 Ah", "Panel 3 W", "Mapa impreso de la cuadra",
                            "Marcador y pintura"],
            "costo": "~USD 55 / unidad (estimación propia, por cotizar)",
            "metrica": "Fugas localizadas por semana sin abrir la calle al azar.",
            "ya_existe": (
                "El geófono profesional, que cuesta miles y exige operador, y la denuncia del "
                "vecino cuando el charco ya salió. La diferencia: la escucha es nocturna, "
                "grabada y se puede repetir sin señal."
            ),
            "paga": (
                "El municipio compra dos unidades por cuadrilla con el presupuesto de agua y "
                "ahorra horas de excavación; el equipo usa el mapa; el vecino no paga y evita "
                "el corte. Es partida pública, no donación: el celular se compra usado y el "
                "mantenimiento va en el mismo contrato."
            ),
            "validar": (
                "Que el micrófono del celular distinga una fuga de una llave abierta o de una "
                "bomba. Prueba: 10 puntos con fuga conocida y 10 sin fuga."
            ),
        },
    },

    # ------------------------------------------------------------------ 03
    "03": {
        "categoria_porque": (
            "El resultado se mide en colonias vivas y frutos cuajados dentro de la ciudad: "
            "el polinizador llega cuando alguien gana con tenerlo cerca."
        ),
        "ods": [
            ("ODS 15", "Vida de ecosistemas terrestres",
             "Instala colonias de abejas nativas y cobertura florida en patios, huertos y "
             "bordes urbanos, sin ampliar la frontera agrícola."),
            ("ODS 2", "Hambre cero",
             "Aumenta el cuajado de fruto en huertos familiares y escolares con polinización "
             "local y miel de la misma caja."),
            ("ODS 8", "Trabajo decente y crecimiento económico",
             "La miel y la división de colonias dan ingreso al que cuida la caja; el vivero "
             "vende la colonia y la semilla."),
        ],
        "insignias": [
            ("Small Grants Programme (GEF / PNUD)", "comunidad y ambiente"),
            ("Premio Latinoamérica Verde", "impacto ambiental medible"),
        ],
        "cadena": {
            "problema": "Menos polinizadores nativos y menos fruto cuajado en huertos urbanos.",
            "causa": ("El paisaje es uniforme (césped cortado, suelo desnudo) y no hay una "
                      "colonia cerca del huerto que polinice cuando abre la flor."),
            "insight": ("El polinizador no se protege con un cartel ni con una certificación: "
                        "se instala donde alguien gana miel y fruta con tenerlo."),
            "metrica": ("Colonias vivas a los 6 meses y frutos cuajados por rama testigo "
                        "frente a la rama sin caja."),
        },
        "pitch": ("La abeja nativa no se protege con un cartel: se instala en el patio. Una "
                  "caja con colonia da miel, se divide al año y cuaja más fruta; la cobertura "
                  "florida cubre el suelo y la trae de vuelta. El dueño gana miel y fruta: por "
                  "eso la compra."),
        "analogias": [
            (2023, "Nicarq Sinergy (UNI-RUSB)", "BioInnova",
             "Integró agua, saneamiento y producción en una unidad de resiliencia comunitaria.",
             "Aporta la mirada de sistema: la caja, la flor y el huerto se juzgan juntos."),
            (2025, "STEM Synergy (UAM-DIEM)", "Huertos verticales con recirculación hídrica",
             "Diseñó un sistema modular de cultivo con riego eficiente y materiales reciclados.",
             "Comparte la lógica de un módulo que se instala en espacio ya construido."),
        ],
        "a": {
            "nombre": "Caja de Abejas Nativas",
            "claim": "Una colonia en el patio: miel para la casa y más fruta en el árbol.",
            "que_es": (
                "En el patio de una casa hay dos limoneros que dan flor cada año y casi ningún "
                "limón. La familia culpa al suelo y al agua, pero el problema es que no hay "
                "quién transporte el polen cuando la flor abre. La caja de abejas nativas "
                "resuelve eso con un objeto: una colmena racional de madera, con su colonia de "
                "abejas sin aguijón, que se cuelga bajo el alero y trabaja en un radio corto, "
                "justo el del patio. La familia no necesita traje ni ahumador: abre la caja, "
                "cosecha miel dos veces al año y, cuando la colonia crece, la divide y vende la "
                "nueva. El vivero vende la caja con colonia y compra las divisiones; el dueño "
                "del huerto gana miel, fruta y una colonia que se multiplica. Lo que existe es "
                "el apiario de abeja europea, que exige equipo, humo y manejo, y el panal "
                "silvestre que se saquea y se pierde. La diferencia es que esta caja cabe en un "
                "patio y se paga sola con la miel."
            ),
            "como": [
                "El vivero entrega la caja con la colonia y la cuelga en un lugar con sombra.",
                "La familia revisa la entrada una vez por semana y repone el comedero al inicio.",
                "A los seis meses cosecha miel y deja la reserva para la temporada seca.",
                "Cuando la colonia crece, se divide y la nueva caja se vende o se queda en casa.",
            ],
            "componentes": ["Caja racional de madera", "Colonia de abeja sin aguijón",
                            "Trampa de entrada", "Comedero", "Soporte de colgado",
                            "Guía de manejo de una hoja"],
            "costo": "~USD 45 / caja con colonia (estimación propia, por cotizar)",
            "metrica": "Colonias vivas a 6 meses y frutos cuajados por rama testigo.",
            "ya_existe": (
                "El apiario de abeja europea, que exige traje, humo y manejo, y el panal "
                "silvestre que se saquea y se pierde. La diferencia: abeja nativa sin "
                "aguijón, caja de patio y miel que paga la inversión."
            ),
            "paga": (
                "La familia o el dueño del huerto compra la caja; el vivero la vende con "
                "colonia y compra las divisiones; el municipio compra cajas para huertos "
                "escolares con su partida de agricultura urbana. La miel y las divisiones "
                "devuelven el costo."
            ),
            "validar": (
                "Que la colonia sobreviva la estación seca y que el cuajado suba frente a una "
                "rama sin caja. Prueba: 10 cajas y 10 ramas testigo durante una floración."
            ),
        },
        "b": {
            "nombre": "Mezcla de Cobertura Florida",
            "claim": "Un kilo de semilla cubre el suelo desnudo y devuelve las flores.",
            "que_es": (
                "Entre las hileras del huerto hay tierra pelada, y cada temporada el dueño "
                "gasta en herbicida y en deshierbe para que no crezca nada. La mezcla de "
                "cobertura cambia ese suelo por una alfombra de plantas nativas que florecen en "
                "dos momentos del año: cubre la tierra, la protege del sol y de la lluvia, y "
                "trae de vuelta a las abejas que ya viven en la cuadra. Se vende por kilo, como "
                "cualquier semilla, y se siembra al voleo antes de la lluvia; no necesita "
                "bandeja, ni riego permanente, ni que nadie la cuide. El vivero la mezcla y la "
                "vende; el agricultor ahorra deshierbe y herbicida; la escuela la usa en el "
                "huerto. Lo que existe es el herbicida, que deja el suelo pelado, y la semilla "
                "de pasto, que se corta antes de florecer. La diferencia es que esta cobertura "
                "se deja florecer, cubre el suelo y no compite con el cultivo."
            ),
            "como": [
                "El vivero mezcla semilla nativa de porte bajo con dos épocas de floración.",
                "El agricultor siega bajo y siembra al voleo antes de la lluvia.",
                "La cobertura cierra el suelo y florece en la siguiente estación.",
                "Se corta una vez al año, después de la semilla, para que vuelva sola.",
            ],
            "componentes": ["Semilla nativa de cobertura (1 kg)", "Mezcla de dos floraciones",
                            "Bolsa de papel", "Ficha de siembra", "Rodillo de contacto"],
            "costo": "~USD 8 / kg (estimación propia, por cotizar)",
            "metrica": "Metros cuadrados cubiertos y flores por metro en temporada.",
            "ya_existe": (
                "El herbicida, que deja el suelo pelado, y la semilla de pasto, que se corta "
                "antes de florecer. La diferencia: cubre sin química, se deja florecer y "
                "vuelve sola al año siguiente."
            ),
            "paga": (
                "El agricultor o la escuela compra el kilo; el vivero mezcla y vende; el "
                "municipio compra para taludes y bordes de vereda con su partida de "
                "mantenimiento verde. La semilla se vende como cualquier insumo agrícola y "
                "ahorra deshierbe."
            ),
            "validar": (
                "Que la mezcla no compita con el cultivo y vuelva a florecer sin resiembra. "
                "Prueba: dos parcelas testigo durante un ciclo completo."
            ),
        },
    },

    # ------------------------------------------------------------------ 04
    "04": {
        "categoria_porque": (
            "El beneficio es ambiental y comunitario: menos quema, mejor suelo y un servicio "
            "que se paga por jornada y no por volumen transportado."
        ),
        "ods": [
            ("ODS 11", "Ciudades y comunidades sostenibles",
             "Convierte un residuo municipal en cobertura y carbón para alcorques, huertos y "
             "taludes urbanos."),
            ("ODS 12", "Producción y consumo responsables",
             "Cierra el ciclo de la poda y reduce el volumen que viaja a relleno o a quema."),
            ("ODS 13", "Acción por el clima",
             "Evita emisiones de quema abierta y mejora la retención de agua del suelo."),
        ],
        "insignias": [
            ("Premio Latinoamérica Verde", "impacto ambiental medible"),
            ("Small Grants Programme (GEF / PNUD)", "comunidad y ambiente"),
        ],
        "cadena": {
            "problema": "La poda se quema o viaja entera al relleno.",
            "causa": ("El contrato paga por desmontar y transportar, no por revalorizar; el "
                      "volumen viaja completo y sale más caro que quemarlo."),
            "insight": ("Si el comprador existe antes del corte, la poda deja de ser basura."),
            "metrica": ("% de poda que no sale del barrio y bolsas entregadas por jornada."),
        },
        "pitch": ("La poda viaja al relleno porque nadie la compra antes de cortarla. La "
                  "suscripción vende la astilla antes de la jornada; el horno de dos tambores "
                  "convierte la rama gruesa en carbón. Menos volumen, menos quema, mismo barrio."),
        "analogias": [
            (2025, "Mentes Volcanicas (UNI-RUPAP)", "Paneles constructivos de Tetra Pak",
             "Transformó un residuo compuesto en un panel con especificación y control de proceso.",
             "Mismo patrón: residuo local, transformación simple y producto con uso definido."),
            (2017, "BottleLife (Montevideo, Uruguay)", "Sistema constructivo con envases reciclados",
             "Organizó la recolección de un residuo domiciliario y lo volvió producto modular.",
             "Aporta la lección logística: sin acopio previo, el residuo no llega al equipo."),
        ],
        "a": {
            "nombre": "Suscripción de Astilla",
            "claim": "Se vende la astilla antes de encender la chipeadora.",
            "que_es": (
                "En un barrio, la poda de los árboles se amontona en la esquina hasta que pasa "
                "el camión y se la lleva entera, con todo el volumen que ocupa. La suscripción "
                "cambia el orden: el operador vende primero y corta después. Los vecinos pagan "
                "una cuota mensual y dejan la poda atada en la vereda el día que pasa la "
                "chipeadora; a cambio reciben bolsas de astilla para sus alcorques y macetas. "
                "El operador no compra la máquina hasta tener veinte suscriptores: arrienda la "
                "chipeadora por jornada y la remolca por una ruta fija, así que cada visita ya "
                "está pagada antes de salir. La astilla fresca no se vende como sustrato: se "
                "entrega como cobertura y se deja compostar seis semanas antes de usarla en "
                "huerto. Lo que existe es el contrato municipal que paga por desmontar y "
                "transportar, sin importar cuánto volumen viaje, y la bolsa de sustrato que el "
                "vivero trae de fuera. La diferencia es que aquí el comprador existe antes del "
                "corte."
            ),
            "como": [
                "Se inscriben veinte suscriptores por cuadra y se fija un día de ruta.",
                "El operador arrienda la chipeadora y recorre la ruta con el remolque.",
                "Cada suscriptor deja la poda atada y recibe sus bolsas de astilla.",
                "La astilla se deja compostar seis semanas antes de usarse en huerto.",
            ],
            "componentes": ["Alquiler de chipeadora por jornada", "Remolque", "Cuchillas",
                            "Bolsas de 20 L", "Báscula", "Avisos de ruta"],
            "costo": "~USD 90 / jornada (estimación propia, por cotizar)",
            "metrica": "% de poda de la cuadra que no sale del barrio.",
            "ya_existe": (
                "El contrato municipal que paga por desmontar y transportar, y la bolsa de "
                "sustrato que el vivero trae de fuera. La diferencia: la demanda está pagada "
                "antes de que la máquina salga y el residuo se queda en la cuadra."
            ),
            "paga": (
                "El suscriptor paga cuota mensual y recibe astilla; el operador cobra la ruta "
                "y no compra máquina hasta tener demanda; el vivero vende la astilla compostada "
                "en saco. La jornada se cubre con la cuota ya cobrada y el municipio paga aparte "
                "la recolección que se ahorra."
            ),
            "validar": (
                "Cuántos suscriptores por cuadra sostienen una jornada de chipeadora. Prueba: "
                "una ruta piloto de 20 casas durante dos meses."
            ),
        },
        "b": {
            "nombre": "Horno de Retorta de Tambor",
            "claim": "Dos tambores convierten la rama gruesa en carbón sin humo negro.",
            "que_es": (
                "En el patio de una casa hay una montaña de ramas gruesas que no sirven para "
                "compost y que nadie quiere llevar al relleno. El horno de retorta convierte "
                "esa madera en carbón sin quemarla al aire. Son dos tambores, uno dentro de "
                "otro: en el de adentro se apila la poda seca y se tapa; en el de afuera se "
                "hace fuego con las ramas finas, y el humo que sale del tambor interior se "
                "quema en la llama de la cámara exterior, así que no escapa negro. En cuatro "
                "horas queda carbón que se usa en los alcorques, en los huertos y en los filtros "
                "de agua del barrio. El operador cobra por lote y entrega el carbón a quien "
                "trajo la poda; el municipio le paga la recolección que se ahorra. Lo que "
                "existe es la quema abierta, que contamina y rinde poco, y el horno industrial "
                "de biochar, que cuesta miles y no cabe en un patio. La diferencia es que este "
                "horno se arma con dos tambores y se opera sin energía."
            ),
            "como": [
                "Se arma el tambor interior dentro del exterior y se deja la cámara de fuego.",
                "Se llena el tambor interior con poda seca y se tapa con sello de barro.",
                "Se alimenta el fuego exterior con ramas finas durante cuatro horas.",
                "Se apaga, se deja enfriar y se entrega el carbón a quien trajo la poda.",
            ],
            "componentes": ["Tambor 200 L interior", "Tambor 200 L exterior", "Tubo de escape",
                            "Termómetro", "Tapa con sello", "Horquilla de carga"],
            "costo": "~USD 210 / horno (estimación propia, por cotizar)",
            "metrica": "Lotes de carbón entregados por mes y poda que no se quemó al aire.",
            "ya_existe": (
                "La quema abierta, que contamina y rinde poco, y el horno industrial de "
                "biochar, que no cabe en un patio. La diferencia: retorta de dos tambores, sin "
                "energía y con el humo quemado en la misma cámara."
            ),
            "paga": (
                "El operador del patio cobra por lote; el municipio paga la recolección que se "
                "ahorra; el huerto compra el carbón a precio de barrio. El horno se paga con "
                "lotes y el carbón tiene comprador fijo."
            ),
            "validar": (
                "Rendimiento y emisiones del horno frente a la quema abierta. Prueba: tres "
                "lotes medidos con termómetro y báscula."
            ),
        },
    },

    # ------------------------------------------------------------------ 05
    "05": {
        "categoria_porque": (
            "Protege a una comunidad expuesta a inundaciones y articula comité de cuenca, "
            "municipio y vecinos alrededor de una obra que se ve."
        ),
        "ods": [
            ("ODS 6", "Agua limpia y saneamiento",
             "Mejora la operación del reservorio y reduce los sedimentos que descarga aguas "
             "abajo."),
            ("ODS 11", "Ciudades y comunidades sostenibles",
             "Reduce el anegamiento en barrios aguas abajo con obra verde y aviso local."),
            ("ODS 13", "Acción por el clima",
             "Adapta el drenaje urbano a lluvias más intensas con soluciones basadas en la "
             "naturaleza."),
        ],
        "insignias": [
            ("Fondos de Agua (The Nature Conservancy)", "cuenca y agua"),
            ("Marco de Sendai", "reducción de riesgo"),
        ],
        "cadena": {
            "problema": "Anegamiento recurrente en las viviendas de aguas abajo.",
            "causa": ("Nadie ve el nivel antes de la lluvia y el caudal del intake entra libre, "
                      "sin freno y con sedimentos."),
            "insight": ("El aviso sirve si llega antes y sin red; la obra sirve si no depende "
                        "del aviso."),
            "metrica": ("Tormentas con anegamiento en viviendas frente al semestre anterior."),
        },
        "pitch": ("El nivel se ve en la esquina antes de que llueva y el caudal entra frenado "
                  "por una compuerta que flota. Sin red, sin celular y sin motor: el vecino ve "
                  "el color, la sirena suena y el agua llega más lenta."),
        "analogias": [
            (2024, "Techriders (UNI-RUSB)", "Micropresas telemetradas",
             "Construyó un tablero de telemetría para decidir sobre infraestructura crítica.",
             "Aporta la arquitectura de medición y control, aquí resuelta sin red."),
            (2023, "Nicarq Sinergy (UNI-RUSB)", "BioInnova",
             "Integró agua, saneamiento y producción en una unidad de resiliencia comunitaria.",
             "Demuestra que una solución de agua se sostiene cuando la comunidad la opera."),
        ],
        "a": {
            "nombre": "Regla de Nivel",
            "claim": "El nivel del reservorio se ve desde la esquina.",
            "que_es": (
                "El reservorio del barrio se llena en silencio y la gente se entera cuando el "
                "agua ya entró a las casas. La regla de nivel pone el dato donde se ve: un "
                "poste junto al muro, con una varilla que sube con el agua y tres franjas "
                "pintadas de verde, amarillo y rojo. Cualquiera que pase por la esquina sabe "
                "cómo está el nivel sin abrir una pantalla. Cuando la varilla llega a la franja "
                "roja, un flotador cierra un contacto y una sirena de batería suena en la casa "
                "del guardia, que ya tiene escrito a quién llamar. No usa red, no usa celular y "
                "no depende de que alguien mande un mensaje. El comité de cuenca y el municipio "
                "fijan juntos dónde va cada franja, con la cota que da el plano. Lo que existe "
                "es la regla pintada en el muro, que se tapa de lodo y nadie limpia, y el aviso "
                "que llega cuando el agua ya está adentro. La diferencia es que aquí el nivel se "
                "ve antes y la alarma no necesita señal."
            ),
            "como": [
                "Se fija el poste y se cala la varilla del flotador contra la cota del plano.",
                "Se pintan las tres franjas con el comité y el municipio.",
                "Al subir el agua, la varilla marca el color y el flotador arma el contacto.",
                "La sirena suena en la casa del guardia y el comité sigue el protocolo escrito.",
            ],
            "componentes": ["Poste graduado", "Varilla de flotador", "Boya", "Sirena 12 V",
                            "Batería 12 Ah", "Panel 10 W", "Gabinete estanco"],
            "costo": "~USD 85 / punto (estimación propia, por cotizar)",
            "metrica": "Tormentas con anegamiento frente al semestre anterior.",
            "ya_existe": (
                "La regla pintada en el muro, que se tapa de lodo y nadie limpia, y el aviso "
                "que llega con el agua adentro. La diferencia: lectura pública, alarma local y "
                "cero dependencia de la red."
            ),
            "paga": (
                "El municipio compra el punto como parte de la obra del reservorio; el comité "
                "de cuenca limpia la varilla y prueba la sirena cada mes; el guardia recibe un "
                "pago simbólico por estar de turno. El mantenimiento va en el contrato de la "
                "obra, con partida pública."
            ),
            "validar": (
                "Que la varilla no se trabe con sedimento en crecida. Prueba: una temporada de "
                "lluvia con limpieza semanal registrada."
            ),
        },
        "b": {
            "nombre": "Compuerta de Flotador",
            "claim": "Frena la crecida sin motor y falla abierta.",
            "que_es": (
                "En la boca del canal que alimenta el reservorio entra toda el agua de una vez y "
                "arrastra sedimentos que después hay que sacar a pala. La compuerta de flotador "
                "frena ese golpe sin motor ni electricidad: una hoja que flota y sube con el "
                "caudal, montada sobre bisagras, que deja pasar el agua normal y se cierra "
                "cuando el río crece. Un contrapeso y un orificio de purga impiden que cierre "
                "del todo, así que nunca embalsa agua hacia arriba ni inunda al vecino. Se "
                "instala en la boca con anclajes, se revisa una vez al mes y no consume nada. El "
                "municipio la compra como parte de la obra verde del reservorio; el comité de "
                "cuenca la mantiene y el guardia reporta si se traba. Lo que existe es la "
                "rejilla fija, que se tapa en la primera crecida, y la compuerta motorizada, que "
                "necesita energía y un tablero que nadie repara. La diferencia es que esta "
                "compuerta trabaja sola y falla abierta."
            ),
            "como": [
                "Se ancla el marco en la boca del canal, a plomo con el muro.",
                "Se monta la hoja en las bisagras y se calza el flotador con el contrapeso.",
                "Se deja el orificio de purga abierto para que nunca cierre del todo.",
                "Se revisa una vez al mes y se limpia la rejilla de hojas.",
            ],
            "componentes": ["Hoja de PRFV", "Bisagras de acero inoxidable", "Flotador",
                            "Contrapeso", "Sello de goma", "Rejilla", "Anclajes"],
            "costo": "~USD 140 / unidad (estimación propia, por cotizar)",
            "metrica": "% del caudal de crecida que entra frenado y sedimentos retenidos.",
            "ya_existe": (
                "La rejilla fija, que se tapa en la primera crecida, y la compuerta motorizada, "
                "que necesita energía y tablero. La diferencia: pasiva, sin consumo y con purga "
                "que impide embalsar aguas arriba."
            ),
            "paga": (
                "El municipio la compra dentro de la obra del reservorio; el comité de cuenca "
                "la mantiene con la limpieza mensual; el vecino de aguas arriba no paga y no "
                "recibe el rebote. Es inversión pública en la obra, no donación."
            ),
            "validar": (
                "Que el contrapeso abra la compuerta cuando baja el caudal y no deje sedimento "
                "atrapado. Prueba: una temporada con dos crecidas medidas."
            ),
        },
    },

    # ------------------------------------------------------------------ 06
    "06": {
        "categoria_porque": (
            "El núcleo es un dispositivo mecánico nuevo y su viabilidad técnica; el impacto "
            "social es la vivienda que se recupera en horas en vez de días."
        ),
        "ods": [
            ("ODS 11", "Ciudades y comunidades sostenibles",
             "Acelera la recuperación de viviendas y reduce los días de desplazamiento."),
            ("ODS 3", "Salud y bienestar",
             "Baja el esfuerzo físico extremo y el riesgo de lesión de vecinos y voluntarios."),
            ("ODS 13", "Acción por el clima",
             "Responde a eventos extremos más frecuentes con una herramienta replicable."),
        ],
        "insignias": [
            ("Marco de Sendai", "reducción de riesgo"),
            ("Small Grants Programme (GEF / PNUD)", "comunidad y ambiente"),
        ],
        "cadena": {
            "problema": "Días de pala y familias agotadas después del anegamiento.",
            "causa": ("Las herramientas disponibles son de exterior y para agua limpia; el lodo "
                      "denso atasca lo que hay y el barro seco pesa como cemento."),
            "insight": ("El lodo se mueve con succión positiva y poca agua, no con fuerza "
                        "humana ni con energía de la red."),
            "metrica": "Horas por vivienda vaciada y sacos retirados por jornada.",
        },
        "pitch": ("El lodo no se saca a pala: se succiona con un pedal o se arrastra en un "
                  "trineo que separa el agua. Sin luz, sin combustible y sin meterse al cuarto. "
                  "La casa se recupera en horas, no en días."),
        "analogias": [
            (2021, "Ingeniarte (UNNE)", "Alertar",
             "Dispositivo simple y protocolo comunitario para activar ayuda en una emergencia.",
             "Aporta el criterio de diseño para emergencia: una sola acción, sin energía."),
            (2024, "Techriders (UNI-RUSB)", "Micropresas telemetradas",
             "Construyó un tablero de telemetría para decidir sobre infraestructura crítica.",
             "Comparte la lógica de resolver con electromecánica accesible y operador local."),
        ],
        "a": {
            "nombre": "Bomba de Pedal",
            "claim": "Dos personas y un pedal sacan el lodo denso sin electricidad.",
            "que_es": (
                "Cuando el agua se va de una casa, queda un lodo espeso que pesa como cemento y "
                "no entra en una cubeta sin deshacerse. La bomba de pedal mueve ese lodo con dos "
                "personas: una pedalea y la otra dirige la manguera por el pasillo. Es una bomba "
                "de diafragma, sin motor ni combustible, que succiona barro con piedras pequeñas "
                "y lo empuja hasta la calle; se desarma en tres piezas y cabe en el maletero de "
                "un carro. La junta del barrio la compra entre varias familias y la presta por "
                "turnos; el taller local la repara con repuestos de ferretería. Funciona con luz "
                "cortada, sin generador y sin que nadie se meta al cuarto. Lo que existe es la "
                "bomba de achique eléctrica, que se atasca con sólidos y no tiene corriente, y "
                "la pala con cubeta, que toma días y lesiona la espalda. La diferencia es que "
                "esta bomba saca el lodo denso, no solo el agua, y no necesita energía."
            ),
            "como": [
                "Se arma la bomba en el pasillo y se pasa la manguera hasta el punto más bajo.",
                "Una persona pedalea y la otra guía la manguera por el cuarto.",
                "El lodo sale a la calle y se descarga en un punto acordado con la junta.",
                "Se desarma, se lava con agua limpia y se guarda para la siguiente casa.",
            ],
            "componentes": ["Bomba de diafragma de doble cámara", "Pedal y biela",
                            "Manguera de 2 pulgadas", "Filtro de entrada", "Válvulas",
                            "Bastidor plegable"],
            "costo": "~USD 180 / unidad (estimación propia, por cotizar)",
            "metrica": "Horas por vivienda vaciada en las primeras 48 horas.",
            "ya_existe": (
                "La bomba de achique eléctrica, que se atasca con sólidos y no tiene corriente, "
                "y la pala con cubeta, que toma días. La diferencia: mueve lodo denso con pedal "
                "y se desarma para llevarla en un carro."
            ),
            "paga": (
                "La junta del barrio compra una unidad entre varias familias y la presta por "
                "turnos; el taller local cobra la reparación; la familia no paga alquiler y "
                "devuelve la bomba limpia. La alcaldía puede comprar unidades para el comité "
                "de emergencia con su partida de riesgo."
            ),
            "validar": (
                "Que el diafragma succione lodo con piedras de hasta 3 cm sin atascarse. Prueba: "
                "tres casas con lodo real y cronómetro."
            ),
        },
        "b": {
            "nombre": "Trineo Filtrante",
            "claim": "Entra por el pasillo y separa el agua del lodo en el camino.",
            "que_es": (
                "Cuando el lodo ya secó, la casa huele a tierra y el piso está duro como una "
                "losa. El trineo filtrante entra por el pasillo donde no entra una carretilla: "
                "es una chapa plegada con ruedas pequeñas y un saco de geotextil adentro. Se "
                "arrastra con una manija, se llena de lodo y el agua sale por el saco mientras "
                "los sólidos quedan adentro; cuando pesa, se levanta y se vacía en la calle. No "
                "usa energía, no levanta polvo y no exige palear dentro de la casa. El taller de "
                "metal del barrio lo fabrica con chapa de segunda y lo vende o lo alquila; la "
                "junta lo rota entre las casas. Lo que existe es la carretilla, que no pasa por "
                "la puerta, y la cubeta, que obliga a cargar veinte kilos por viaje. La "
                "diferencia es que el trineo separa el agua del lodo en el camino y trabaja en "
                "el espacio donde la casa es más angosta."
            ),
            "como": [
                "Se extiende el saco de geotextil dentro del trineo plegado.",
                "Se arrastra por el pasillo y se carga el lodo seco con la pala corta.",
                "El agua escurre por el saco y los sólidos quedan retenidos.",
                "Se vacía en la calle, se lava el saco y se cuelga para secar.",
            ],
            "componentes": ["Trineo de chapa plegada", "Saco de geotextil", "Ruedas pequeñas",
                            "Manija de arrastre", "Cincha", "Pala corta"],
            "costo": "~USD 60 / unidad (estimación propia, por cotizar)",
            "metrica": "Sacos de lodo retirados por jornada y agua que no vuelve al piso.",
            "ya_existe": (
                "La carretilla, que no pasa por la puerta, y la cubeta, que obliga a cargar "
                "veinte kilos por viaje. La diferencia: filtra en el camino y trabaja en el "
                "pasillo angosto."
            ),
            "paga": (
                "El taller de metal del barrio lo fabrica y lo vende o alquila; la junta lo rota "
                "entre las casas; la familia paga el alquiler del día. Cada trineo se vende y "
                "la alcaldía puede comprar un lote para el comité de emergencia."
            ),
            "validar": (
                "Que el geotextil retenga el lodo fino y no se rasgue al arrastrar. Prueba: "
                "cinco jornadas con el mismo saco."
            ),
        },
    },

    # ------------------------------------------------------------------ 07
    "07": {
        "categoria_porque": (
            "El punto de partida es el hogar y el beneficio es agua limpia en la cuadra, con "
            "un envase que vuelve y una comisión que se paga en la bodega."
        ),
        "ods": [
            ("ODS 6", "Agua limpia y saneamiento",
             "Evita que el aceite llegue al caño y a los cuerpos de agua del barrio."),
            ("ODS 12", "Producción y consumo responsables",
             "Convierte un residuo doméstico en insumo y devuelve el envase al circuito."),
            ("ODS 11", "Ciudades y comunidades sostenibles",
             "Reduce el taponamiento de la red y el aceite que termina en la calle."),
        ],
        "insignias": [
            ("Premio Latinoamérica Verde", "economía circular"),
            ("Pacto Global de las Naciones Unidas", "trabajo y ambiente"),
        ],
        "cadena": {
            "problema": "El aceite usado se tira al caño o a la basura.",
            "causa": ("No hay punto de acopio en la cuadra ni comprador que pague por el litro; "
                      "la industria solo compra a restaurantes."),
            "insight": ("El aceite no es basura si el envase vuelve y alguien paga una comisión "
                        "en la misma bodega."),
            "metrica": "Litros acopiados por bodega al mes y garrafas que vuelven.",
        },
        "pitch": ("El litro que antes iba al caño vuelve como descuento en la bodega o como "
                  "lubricante para la cadena. Garrafa retornable, depósito en la esquina y "
                  "comisión pagada al bodeguero: nadie dona nada y el aceite no llega al río."),
        "analogias": [
            (2017, "BottleLife (Montevideo, Uruguay)", "Sistema constructivo con envases reciclados",
             "Organizó la recolección de un residuo domiciliario y lo volvió producto modular.",
             "Mismo problema de dos mitades: acopio disperso y transformación simple."),
            (2025, "Mentes Volcanicas (UNI-RUPAP)", "Paneles constructivos de Tetra Pak",
             "Transformó un residuo compuesto en un panel con especificación y control de proceso.",
             "Aporta el criterio de calidad: el lote necesita ficha y prueba antes de venderse."),
        ],
        "a": {
            "nombre": "Garrafa con Depósito",
            "claim": "La garrafa vuelve y el descuento se paga en la bodega.",
            "que_es": (
                "En la cocina hay una botella cortada con aceite viejo y nadie sabe qué hacer "
                "con ella: tirarla al caño tapa la tubería, tirarla a la basura la revienta en "
                "el camión. La garrafa retornable cambia el destino: la bodega entrega una "
                "garrafa de cinco litros con sello, la familia la llena con el aceite usado y la "
                "devuelve en el mismo punto. La bodega anota la entrega y descuenta en la "
                "compra; el depósito de doscientos litros se retira cuando está lleno y el "
                "procesador paga una comisión por litro a la bodega. Nadie dona nada: la bodega "
                "gana comisión y clientela, el procesador gana materia prima y la familia gana "
                "descuento. El sello y el número de garrafa evitan que el mismo litro se cobre "
                "dos veces. Lo que existe es la botella plástica que se tira, el camión de "
                "basura que no recibe líquidos y el restaurante que vende a granel. La "
                "diferencia es que aquí el envase vuelve y el pago ocurre en la cuadra."
            ),
            "como": [
                "La bodega entrega la garrafa sellada y anota el número en su cuaderno.",
                "La familia la llena con el aceite de cocina usado y la devuelve.",
                "La bodega descuenta en la compra y vacía la garrafa en el depósito.",
                "El procesador retira el depósito lleno y paga la comisión por litro.",
            ],
            "componentes": ["Garrafa de 5 L retornable", "Sello y número", "Depósito de 200 L",
                            "Bomba de trasvase", "Báscula", "Cuaderno de comisión"],
            "costo": "~USD 4 / garrafa + depósito (estimación propia, por cotizar)",
            "metrica": "Litros acopiados por bodega al mes y garrafas devueltas.",
            "ya_existe": (
                "La botella plástica que se tira, el camión de basura que no recibe líquidos y "
                "el restaurante que vende a granel. La diferencia: el envase vuelve y el "
                "descuento se cobra en la misma cuadra."
            ),
            "paga": (
                "El procesador paga comisión por litro a la bodega; la bodega descuenta a la "
                "familia y gana clientela; el vecino entrega el aceite y recibe descuento. La "
                "comisión cubre la garrafa y el retiro; si el municipio suma un incentivo por "
                "litro acopiado, el punto despega antes."
            ),
            "validar": (
                "Cuántos litros por mes sostienen el retiro semanal y cuántas garrafas vuelven. "
                "Prueba: una bodega piloto durante dos meses."
            ),
        },
        "b": {
            "nombre": "Aceite para Cadena",
            "claim": "El aceite usado, filtrado y probado, lubrica la cadena del taller.",
            "que_es": (
                "El aceite que sobra de la cocina se puede volver a usar, pero nadie lo hace "
                "porque sale sucio y sin envase. El aceite para cadena lo filtra y lo pone en un "
                "frasco con pico: se cuela dos veces, se prueba la acidez con una tira y, si "
                "pasa, se etiqueta como lubricante para cadenas de moto, bisagras y herramientas. "
                "El taller de motos y el bicicletero del mercado lo compran por caja; la familia "
                "que entrega el aceite recibe un frasco o un descuento. No compite con el jabón "
                "artesanal, que ya tiene su mercado: compite con el lubricante nuevo, que cuesta "
                "más y viene en envase plástico. La prueba de acidez es lo que separa el lote "
                "bueno del que se descarta, y queda anotada en la etiqueta. Lo que existe es el "
                "aceite usado a granel, que mancha y huele, y el lubricante de tienda. La "
                "diferencia es que este sale filtrado, probado y en un envase que se puede usar "
                "sin ensuciar la cadena."
            ),
            "como": [
                "Se recibe el aceite y se deja reposar para que baje el sedimento.",
                "Se filtra dos veces por malla y se prueba la acidez con una tira.",
                "Se envasa en frasco de 1 L con pico y etiqueta de lote.",
                "El taller o el bicicletero lo compra por caja y devuelve el frasco.",
            ],
            "componentes": ["Filtro de malla", "Embudo", "Frascos de 1 L con pico",
                            "Etiquetas de lote", "Tiras de acidez", "Caja de transporte"],
            "costo": "~USD 3 / frasco (estimación propia, por cotizar)",
            "metrica": "Frascos vendidos por mes y lotes descartados por acidez.",
            "ya_existe": (
                "El aceite usado a granel, que mancha y huele, y el lubricante nuevo de tienda. "
                "La diferencia: filtrado, probado y en un envase con pico que no ensucia."
            ),
            "paga": (
                "El taller o el bicicletero compra el frasco; la familia que entrega aceite "
                "recibe descuento o un frasco; el que filtra cobra el servicio de acondicionado. "
                "El lubricante tiene comprador fijo y el lote se repone por caja."
            ),
            "validar": (
                "Que la acidez del aceite de cocina usado no dañe la cadena. Prueba: dos "
                "cadenas testigo durante un mes con medición de desgaste."
            ),
        },
    },

    # ------------------------------------------------------------------ 08
    "08": {
        "categoria_porque": (
            "El núcleo es un proceso técnico de evaluación y reuso con viabilidad logística; "
            "el impacto es energía que sigue disponible en vez de volverse residuo peligroso."
        ),
        "ods": [
            ("ODS 7", "Energía asequible y no contaminante",
             "Extiende la vida del módulo y lleva energía a bombeo e iluminación de baja "
             "exigencia."),
            ("ODS 12", "Producción y consumo responsables",
             "Evita que un panel que aún genera se entierre antes de tiempo."),
            ("ODS 11", "Ciudades y comunidades sostenibles",
             "Evita que residuos peligrosos queden amontonados en patios y botaderos urbanos."),
        ],
        "insignias": [
            ("Premio Latinoamérica Verde", "economía circular"),
            ("Pacto Global de las Naciones Unidas", "trabajo y ambiente"),
        ],
        "cadena": {
            "problema": "Paneles retirados se amontonan como residuo peligroso.",
            "causa": ("Nadie dice «sirve / no sirve» con un número, y no hay comprador para el "
                      "panel que todavía genera."),
            "insight": ("Bajo sol y con carga, la potencia real se sabe en veinte minutos."),
            "metrica": "% de paneles evaluados con destino declarado y unidades revendidas.",
        },
        "pitch": ("Un panel retirado no es basura: es un panel sin ficha. Bajo sol y con carga "
                  "se mide lo que entrega, se etiqueta y se vende con garantía para bombeo. El "
                  "instalador deja de regalar dudas y el comprador sabe qué potencia recibe."),
        "analogias": [
            (2025, "Mentes Volcanicas (UNI-RUPAP)", "Paneles constructivos de Tetra Pak",
             "Transformó un residuo compuesto en un panel con especificación y control de proceso.",
             "Comparte la lógica de separar, especificar y reconstruir un producto vendible."),
            (2023, "Gueguense Pinolero (UNMRMA / UNI-RMAV)", "DIGNA",
             "Dimensionó un módulo solar de 400 W dentro de una vivienda con restricciones de costo.",
             "Aporta el criterio de dimensionar para el uso real y no para el catálogo."),
        ],
        "a": {
            "nombre": "Probador Bajo Sol",
            "claim": "Veinte minutos al sol y el panel tiene veredicto con número.",
            "que_es": (
                "En el patio de una instaladora se apilan paneles que los clientes devolvieron "
                "porque «ya no rinden». Nadie sabe si es verdad: el multímetro marca voltaje en "
                "vacío y eso no dice cuánta potencia entrega el panel cuando trabaja. El probador "
                "bajo sol resuelve la duda en veinte minutos: el panel se conecta a una "
                "resistencia de carga, se compara la corriente con la de una celda de referencia "
                "que está al lado, y se anota la hora y la irradiancia del momento. El resultado "
                "es una ficha con el porcentaje de potencia real y un veredicto: sirve, sirve "
                "para bombeo, o no sirve. La instaladora cobra la evaluación y deja de regalar "
                "paneles dudosos; el comprador sabe qué está comprando. Lo que existe es el "
                "multímetro, que mide sin carga, y el proveedor que no certifica paneles usados. "
                "La diferencia es que aquí el número se mide bajo el sol y a plena carga, no de "
                "noche ni en vacío."
            ),
            "como": [
                "Se limpia el panel y se orienta al sol junto a la celda de referencia.",
                "Se conecta la carga resistiva y se mide corriente y voltaje a plena carga.",
                "Se compara con la celda de referencia y se calcula el % de potencia.",
                "Se emite la ficha con hora, irradiancia y veredicto de destino.",
            ],
            "componentes": ["Carga resistiva", "Celda de referencia", "Pinza amperimétrica",
                            "Multímetro", "Caja de instrumentos", "Cables y conectores"],
            "costo": "~USD 135 / kit (estimación propia, por cotizar)",
            "metrica": "Paneles evaluados con destino declarado por semana.",
            "ya_existe": (
                "El multímetro, que mide en vacío y no dice la potencia real, y el proveedor que "
                "no certifica paneles usados. La diferencia: medición a plena carga y bajo sol, "
                "con ficha y veredicto."
            ),
            "paga": (
                "La instaladora compra el kit y cobra la evaluación; el puesto de segunda vida "
                "lo usa para clasificar stock; el comprador paga la ficha incluida en el panel. "
                "La evaluación se cobra por unidad y el kit se repone por taller."
            ),
            "validar": (
                "Que la medición con carga se acerque a la del equipo profesional. Prueba: 10 "
                "paneles medidos con ambos métodos."
            ),
        },
        "b": {
            "nombre": "Panel de Segunda Vida",
            "claim": "Panel probado, con potencia escrita y seis meses de garantía.",
            "que_es": (
                "Un panel que ya no alcanza para una casa puede bombear agua en un corral o "
                "encender tres lámparas en una bodega. El panel de segunda vida se vende probado, "
                "con el porcentaje de potencia escrito en una etiqueta y seis meses de garantía. "
                "Viene con soporte de ángulo, controlador de carga y cableado, listo para "
                "instalar en bombeo o en iluminación; el comprador paga por lo que el panel "
                "entrega, no por lo que promete la caja. La instaladora que lo retiró lo entrega "
                "al puesto, el puesto lo prueba y lo vende; el comprador ahorra frente al panel "
                "nuevo. Lo que existe es el panel usado que se vende «como está», sin número y "
                "sin garantía, y el desarme para recuperar aluminio, que pierde el panel entero "
                "para ganar unos kilos de metal. La diferencia es que aquí el panel sigue "
                "generando y el riesgo lo asume quien lo probó."
            ),
            "como": [
                "El puesto recibe el panel retirado y lo pasa por el probador bajo sol.",
                "Se etiqueta con el % de potencia y se arma el kit de instalación.",
                "Se vende para bombeo o iluminación con seis meses de garantía.",
                "Si falla dentro de la garantía, el puesto lo repone del mismo stock.",
            ],
            "componentes": ["Panel probado", "Soporte de ángulo", "Controlador de carga",
                            "Batería 12 V", "Cableado", "Etiqueta de potencia"],
            "costo": "~USD 45 / kit + panel (estimación propia, por cotizar)",
            "metrica": "Paneles revendidos con garantía y fallas dentro del plazo.",
            "ya_existe": (
                "El panel usado que se vende «como está», y el desarme para recuperar aluminio. "
                "La diferencia: potencia escrita, kit de instalación y garantía de seis meses."
            ),
            "paga": (
                "La instaladora entrega el panel retirado y cobra por el retiro; el puesto lo "
                "prueba, lo equipa y lo vende con margen; el comprador paga menos que un panel "
                "nuevo. El stock se compra a la instaladora y el precio incluye la garantía."
            ),
            "validar": (
                "Cuántos paneles retirados superan el 60 % de potencia y sostienen la garantía. "
                "Prueba: 20 paneles con seguimiento de seis meses."
            ),
        },
    },

    # ------------------------------------------------------------------ 09
    "09": {
        "categoria_porque": (
            "La decisión protege vidas en comunidades afectadas; la herramienta es simple, "
            "funciona sin red y deja un registro que se puede auditar."
        ),
        "ods": [
            ("ODS 11", "Ciudades y comunidades sostenibles",
             "Ordena la respuesta en las primeras horas y reduce el impacto del desastre."),
            ("ODS 16", "Paz, justicia e instituciones sólidas",
             "Hace transparente y auditable el criterio con que se asignan recursos."),
            ("ODS 13", "Acción por el clima",
             "Mejora la respuesta ante eventos extremos cada vez más frecuentes."),
        ],
        "insignias": [
            ("Marco de Sendai", "reducción de riesgo"),
            ("Pacto Global de las Naciones Unidas", "derechos y transparencia"),
        ],
        "cadena": {
            "problema": "La decisión de «quién va primero» se toma a ojo y bajo presión.",
            "causa": ("No hay un estado compartido de la cuadra ni roles definidos antes del "
                      "evento; la información vive en cuadernos y en la memoria."),
            "insight": ("El orden se decide con lo que se ve en la calle, no con una base de "
                        "datos que se cae con la antena."),
            "metrica": "Casas atendidas por hora y entregas duplicadas por jornada.",
        },
        "pitch": ("Cuando cae la antena, el orden se decide en la calle: un tablero con una "
                  "ficha por casa y un talonario numerado que se cuadra en una mesa. Sin red, "
                  "sin aplicación y sin que nadie cobre dos veces la misma ayuda."),
        "analogias": [
            (2021, "Ingeniarte (UNNE)", "Alertar",
             "Dispositivo simple y protocolo comunitario para activar ayuda en una emergencia.",
             "Es el mismo principio: una acción, una persona que responde y un protocolo previo."),
            (2024, "Techriders (UNI-RUSB)", "Micropresas telemetradas",
             "Construyó un tablero de telemetría para decidir sobre infraestructura crítica.",
             "Aporta la idea de un estado compartido visible para decidir."),
        ],
        "a": {
            "nombre": "Tablero de Manzana",
            "claim": "Una ficha por casa, a la vista de todos, sin red.",
            "que_es": (
                "Después de una inundación, la información vive en la cabeza de veinte "
                "voluntarios y en un cuaderno que se moja. El tablero de manzana la pone en una "
                "pared: una ficha por casa, con cuatro datos que se mueven a mano (cuántas "
                "personas, si hay agua, si la estructura está en pie y por dónde se sale). El "
                "jefe de manzana mueve la ficha a rojo, amarillo o verde según lo que vio, y el "
                "coordinador recorre la calle y lee el tablero sin abrir ninguna aplicación. "
                "Cada dos horas pasa el resumen por radio al puesto municipal, que anota el mismo "
                "código. Funciona sin luz, sin red y sin batería; si se moja, se seca y se sigue "
                "usando. Los vecinos ven el tablero y saben que su casa está contada. Lo que "
                "existe es la lista en cuaderno, que se pierde y se duplica, y el grupo de "
                "mensajes, que se cae cuando se cae la antena. La diferencia es que el estado "
                "compartido está en la calle, a la vista de todos."
            ),
            "como": [
                "Antes del evento se numeran las casas y se entrega una ficha por vivienda.",
                "El jefe de manzana recorre y mueve la ficha a rojo, amarillo o verde.",
                "El coordinador lee el tablero y pasa el resumen por radio cada dos horas.",
                "Al cierre se fotografían las fichas y se archivan para la auditoría.",
            ],
            "componentes": ["Tablero plegable", "Fichas imantadas (100)",
                            "Tarjetas de casa numeradas", "Marcador de pizarra",
                            "Protocolo impreso", "Funda impermeable"],
            "costo": "~USD 35 / tablero (estimación propia, por cotizar)",
            "metrica": "Casas atendidas por hora y fichas sin actualizar al cierre.",
            "ya_existe": (
                "La lista en cuaderno, que se pierde y se duplica, y el grupo de mensajes, que "
                "se cae con la antena. La diferencia: el estado está a la vista y se lee "
                "caminando, sin energía."
            ),
            "paga": (
                "La alcaldía o la junta compra un tablero por manzana con su partida de "
                "emergencia; el jefe de manzana lo opera sin sueldo y recibe capacitación; el "
                "municipio se ahorra la duplicación de ayuda. Cada tablero se compra y se reusa "
                "en la siguiente temporada."
            ),
            "validar": (
                "Que el tablero reduzca entregas duplicadas frente al cuaderno. Prueba: dos "
                "manzanas comparadas en un simulacro."
            ),
        },
        "b": {
            "nombre": "Talonario de Vales",
            "claim": "Tres copias con el mismo número: nadie cobra dos veces.",
            "que_es": (
                "En la entrega de agua y comida, la misma casa recibe dos veces porque dos "
                "voluntarios anotan en dos listas que nunca se cruzan. El talonario de vales "
                "evita eso sin ningún sistema: cada entrega se escribe tres veces con el mismo "
                "número, una copia queda en la casa, otra en la bodega y otra en manos del "
                "coordinador. Al final del día, los talones se ordenan por número y se cuadran "
                "en una tabla; si una casa aparece dos veces, el número la delata. La serie se "
                "imprime por jornada y se sella al entregar, así que no se puede reutilizar. "
                "Funciona con lluvia, sin luz y sin señal, y deja un registro que se puede "
                "auditar después. Lo que existe es la lista suelta sin número, que se moja y se "
                "confunde, y el registro digital, que se cae justo cuando más se necesita. La "
                "diferencia es que aquí el control viaja en papel y se puede reconstruir en una "
                "mesa."
            ),
            "como": [
                "Se imprime el talonario por jornada y se sella la serie antes de salir.",
                "Se entrega la ayuda y se llenan las tres copias con el número visible.",
                "Una copia queda en la casa, otra en la bodega y otra con el coordinador.",
                "Al cierre se ordenan los talones por número y se cuadra la tabla.",
            ],
            "componentes": ["Talonario triplicado (100)", "Sello de serie", "Marcador grueso",
                            "Tabla de cuadre", "Funda impermeable"],
            "costo": "~USD 6 / 100 vales (estimación propia)",
            "metrica": "Entregas duplicadas por jornada y talones cuadrados al cierre.",
            "ya_existe": (
                "La lista suelta sin número, que se moja y se confunde, y el registro digital, "
                "que se cae con la red. La diferencia: número único en tres copias que se "
                "cuadran en una mesa."
            ),
            "paga": (
                "El municipio o la junta compra los talonarios por jornada con su partida de "
                "operativo; la bodega recibe una copia y cobra contra ella; el coordinador "
                "cuadra y firma. El costo por vale es parte del operativo de entrega."
            ),
            "validar": (
                "Que el talonario reduzca el doble cobro frente a la lista suelta. Prueba: una "
                "jornada real con dos mesas de entrega."
            ),
        },
    },
}

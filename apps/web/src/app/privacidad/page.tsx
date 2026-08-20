import type { Metadata } from 'next';
import Link from 'next/link';

import { LegalLayout, LegalList, LegalSection } from '@/components/legal/LegalLayout';
import {
  LEGAL_CONTACT_LABEL,
  LEGAL_CONTACT_URL,
  LEGAL_JURISDICTION,
  LEGAL_MINIMUM_AGE,
  LEGAL_PROCESSORS,
} from '@/lib/legal';

export const metadata: Metadata = {
  title: 'Política de privacidad',
  description:
    'Qué datos guarda Deska, para qué los usa y qué derechos tienes sobre ellos. Sin anuncios, sin rastreo y sin venta de datos.',
};

/** Enlace de contacto, repetido en varios apartados. */
function Contacto() {
  return (
    <a
      href={LEGAL_CONTACT_URL}
      target="_blank"
      rel="noreferrer noopener"
      className="focus-ring rounded-control text-primary underline decoration-dotted underline-offset-2"
    >
      {LEGAL_CONTACT_LABEL}
    </a>
  );
}

export default function PrivacidadPage() {
  return (
    <LegalLayout
      title="Política de privacidad"
      summary={
        <>
          <p>
            <strong className="text-primary">Tu tablero es tuyo.</strong> Guardamos lo que escribes
            para poder devolvértelo en cualquier dispositivo, y nada más.
          </p>
          <p>
            <strong className="text-primary">No vendemos ni cedemos tus datos</strong> a nadie con
            fines comerciales, no mostramos anuncios y no usamos rastreadores de terceros. Deska no
            lleva Google Analytics ni ninguna herramienta parecida.
          </p>
          <p>
            <strong className="text-primary">Nadie lee tus notas.</strong> El panel interno de uso
            solo devuelve recuentos: cuántas cuentas hay, cuántas postulaciones y a qué empresas se
            postula más. Tus notas, tus contactos y tus archivos no salen de tu cuenta.
          </p>
          <p>
            <strong className="text-primary">Puedes irte cuando quieras</strong> y llevarte o borrar
            todo lo que has escrito.
          </p>
        </>
      }
    >
      <LegalSection number={1} title="Quién trata tus datos">
        <p>
          Deska es un proyecto personal operado por la persona que lo desarrolla y lo publica, con
          residencia en {LEGAL_JURISDICTION}. A efectos de la normativa de protección de datos,
          actúa como responsable del tratamiento.
        </p>
        <p>
          Para cualquier asunto relacionado con tus datos, incluido el ejercicio de los derechos del
          apartado 8, puedes escribir a través de <Contacto />.
        </p>
      </LegalSection>

      <LegalSection number={2} title="Qué datos recogemos">
        <p>Solo lo necesario para que el servicio funcione. En concreto:</p>
        <LegalList
          items={[
            <>
              <strong className="text-primary">Datos de la cuenta.</strong> Tu correo electrónico y,
              si entras con Google, el nombre y la foto de perfil que Google nos comunica. La
              contraseña, si usas una, nunca la vemos: la gestiona nuestro proveedor de
              identidad en forma cifrada.
            </>,
            <>
              <strong className="text-primary">El contenido de tu tablero.</strong> Todo lo que
              escribes: empresas, puestos, fechas, estados, enlaces, personas de contacto, notas del
              proceso y notas del mural.
            </>,
            <>
              <strong className="text-primary">Los archivos que subes.</strong> Currículums, cartas
              de presentación y capturas. Pueden contener datos personales tuyos y de terceros; el
              apartado 9 explica tu responsabilidad sobre ellos.
            </>,
            <>
              <strong className="text-primary">Tus preferencias.</strong> El tema visual, el estilo
              de iconos y si ya viste el tutorial. Se guardan en tu propio navegador, no en nuestros
              servidores.
            </>,
            <>
              <strong className="text-primary">Datos técnicos de funcionamiento.</strong> Nuestros
              proveedores registran de forma automática direcciones IP, fechas de conexión y errores,
              como hace cualquier servidor. Sirven para mantener el servicio en pie y detectar
              abusos, y no se usan para crear perfiles sobre ti.
            </>,
          ]}
        />
        <p>
          No recogemos datos de categorías especiales —salud, ideología, religión, origen étnico,
          orientación sexual— ni te los pedimos en ningún formulario. Si decides escribirlos en una
          nota, quedarán guardados como cualquier otro texto tuyo.
        </p>
      </LegalSection>

      <LegalSection number={3} title="Para qué los usamos y con qué base legal">
        <LegalList
          items={[
            <>
              <strong className="text-primary">Para prestarte el servicio.</strong> Mostrarte tu
              tablero, sincronizarlo entre dispositivos, guardar tus archivos y calcular tu progreso.
              Base legal: la ejecución del contrato que aceptas al crear la cuenta.
            </>,
            <>
              <strong className="text-primary">Para mantenerlo seguro y en funcionamiento.</strong>{' '}
              Detectar fallos, prevenir abusos y hacer copias de seguridad. Base legal: nuestro
              interés legítimo en que el servicio no se caiga ni sea atacado.
            </>,
            <>
              <strong className="text-primary">Para saber cómo se usa el producto, en conjunto.</strong>{' '}
              Solo recuentos agregados, nunca sobre una persona concreta. Base legal: interés
              legítimo, limitado a datos que no permiten identificarte.
            </>,
            <>
              <strong className="text-primary">Para escribirte si hace falta.</strong> Confirmar tu
              correo o avisarte de un cambio importante en el servicio. Base legal: la ejecución del
              contrato. No enviamos publicidad.
            </>,
          ]}
        />
        <p>
          <strong className="text-primary">
            No usamos tus datos para publicidad, ni para venderlos, ni para cederlos a terceros con
            fines comerciales, ni para entrenar modelos de inteligencia artificial.
          </strong>
        </p>
      </LegalSection>

      <LegalSection number={4} title="Qué ve exactamente el panel interno">
        <p>
          Existe un panel de uso al que solo accede la cuenta que administra el proyecto. Está
          construido de forma que únicamente puede devolver recuentos. En concreto ve: número de
          cuentas registradas, cuántas tuvieron actividad en los últimos treinta días, número total
          de postulaciones, reparto por etapa, media de postulaciones por persona, y los nombres de
          empresa y de área más repetidos con su recuento.
        </p>
        <p>
          <strong className="text-primary">
            No puede ver tus notas, tus contactos, tus archivos, tus enlaces ni qué postulaciones son
            tuyas.
          </strong>{' '}
          Esa restricción no es una promesa: está en el código, que devuelve únicamente cifras
          agregadas y ningún identificador de persona.
        </p>
      </LegalSection>

      <LegalSection number={5} title="Quién más interviene">
        <p>
          Deska se apoya en proveedores de infraestructura que tratan datos por cuenta nuestra y
          siguiendo nuestras instrucciones. No son socios comerciales ni reciben tus datos para usos
          propios.
        </p>
        <LegalList
          items={LEGAL_PROCESSORS.map((proveedor) => (
            <>
              <strong className="text-primary">{proveedor.name}.</strong> {proveedor.purpose}
            </>
          ))}
        />
        <p>
          Estos proveedores pueden alojar la información en servidores situados fuera de tu país,
          incluidos los Estados Unidos. En esos casos las transferencias se amparan en las cláusulas
          contractuales tipo aprobadas por la Comisión Europea o en un marco de adecuación
          equivalente.
        </p>
        <p>
          Además, podríamos comunicar datos si una autoridad competente lo exige mediante una orden
          válida, o si fuera imprescindible para defender derechos ante un tribunal.
        </p>
      </LegalSection>

      <LegalSection number={6} title="Cookies y almacenamiento en tu navegador">
        <p>
          Deska no usa cookies de publicidad ni de analítica, ni propias ni de terceros. Lo único que
          guarda en tu navegador es:
        </p>
        <LegalList
          items={[
            <>
              <strong className="text-primary">La cookie de tu sesión.</strong> La necesita el inicio
              de sesión para reconocerte entre páginas. Sin ella no podrías mantener la sesión
              abierta.
            </>,
            <>
              <strong className="text-primary">Tres preferencias.</strong> El tema, el estilo de
              iconos y si ya completaste el tutorial. Nunca salen de tu dispositivo.
            </>,
          ]}
        />
        <p>
          Al tratarse exclusivamente de almacenamiento técnico y de preferencias solicitadas por ti,
          no requiere un banner de consentimiento. Puedes borrarlo en cualquier momento desde las
          opciones de tu navegador; perderás la sesión y los ajustes visuales, nada más.
        </p>
      </LegalSection>

      <LegalSection number={7} title="Cuánto tiempo guardamos las cosas">
        <LegalList
          items={[
            <>
              Mientras tu cuenta exista, conservamos tu tablero y tus archivos, porque son
              precisamente lo que vienes a consultar.
            </>,
            <>
              Si pides que borremos la cuenta, eliminamos tus datos personales y tu contenido en un
              plazo máximo de <strong className="text-primary">treinta días</strong>.
            </>,
            <>
              Las copias de seguridad pueden conservar una réplica durante un máximo de{' '}
              <strong className="text-primary">noventa días</strong> más, tras los cuales se
              sobrescriben solas. Durante ese periodo no se usan para nada que no sea restaurar el
              servicio ante un desastre.
            </>,
            <>
              Los recuentos agregados sobreviven al borrado, porque ya no permiten identificarte:
              son cifras, no datos personales.
            </>,
          ]}
        />
      </LegalSection>

      <LegalSection number={8} title="Tus derechos">
        <p>
          Con independencia del país en el que residas, aplicamos el estándar del Reglamento General
          de Protección de Datos europeo, que es el más exigente. Puedes:
        </p>
        <LegalList
          items={[
            <>
              <strong className="text-primary">Acceder</strong> a los datos que tenemos sobre ti.
            </>,
            <>
              <strong className="text-primary">Rectificar</strong> lo que esté mal. La mayor parte
              puedes corregirla tú mismo desde la aplicación.
            </>,
            <>
              <strong className="text-primary">Suprimir</strong> tu cuenta y todo su contenido.
            </>,
            <>
              <strong className="text-primary">Llevarte tus datos</strong> en un formato legible por
              una máquina, para usarlos en otro servicio.
            </>,
            <>
              <strong className="text-primary">Oponerte</strong> a un tratamiento basado en interés
              legítimo, o pedir que se <strong className="text-primary">limite</strong>.
            </>,
            <>
              <strong className="text-primary">Retirar tu consentimiento</strong> cuando el
              tratamiento se base en él, sin que ello afecte a lo hecho antes de retirarlo.
            </>,
            <>
              <strong className="text-primary">Reclamar</strong> ante la autoridad de protección de
              datos de tu país si crees que no hemos cumplido.
            </>,
          ]}
        />
        <p>
          Para ejercerlos, escribe a través de <Contacto />. Respondemos en un plazo máximo de un
          mes. No cobramos por atender estas solicitudes.
        </p>
      </LegalSection>

      <LegalSection number={9} title="Datos de otras personas que tú introduces">
        <p>
          Al anotar el nombre o el correo de una persona de contacto de una empresa, o al subir un
          documento que menciona a terceros, estás introduciendo datos de alguien que no es tú. Sobre
          esa información:
        </p>
        <LegalList
          items={[
            <>
              Eres tú quien decide qué anotar y con qué finalidad, así que respecto de esos datos
              actúas como responsable.
            </>,
            <>
              Deska los guarda por cuenta tuya y no los usa para nada más: no los cruza, no los
              enriquece y no los comparte.
            </>,
            <>
              Te corresponde anotar solo lo que necesites para tu proceso de búsqueda y no incluir
              información sensible de terceros.
            </>,
          ]}
        />
      </LegalSection>

      <LegalSection number={10} title="Seguridad">
        <p>Las medidas que están efectivamente implantadas, no las que suenan bien:</p>
        <LegalList
          items={[
            <>Todo el tráfico viaja cifrado mediante HTTPS.</>,
            <>
              La base de datos aplica seguridad a nivel de fila: cada consulta queda restringida por
              la propia base a las filas de su dueño, aunque la aplicación fallara.
            </>,
            <>
              Los archivos viven en un almacén privado. Para verlos se genera un enlace firmado que
              caduca solo; no existe una dirección pública que alguien pueda adivinar.
            </>,
            <>Las contraseñas las custodia el proveedor de identidad en forma cifrada.</>,
          ]}
        />
        <p>
          Ningún sistema es invulnerable. Si se produjera una brecha que suponga un riesgo para tus
          derechos, te lo comunicaremos y lo notificaremos a la autoridad competente dentro de las
          setenta y dos horas siguientes a tener constancia de ella.
        </p>
      </LegalSection>

      <LegalSection number={11} title="Menores de edad">
        <p>
          Deska no está dirigida a menores de {LEGAL_MINIMUM_AGE} años y no debe usarse por debajo de
          esa edad sin autorización de quien ejerza la patria potestad. Si detectamos una cuenta de
          un menor sin esa autorización, la eliminaremos.
        </p>
      </LegalSection>

      <LegalSection number={12} title="Cambios en esta política">
        <p>
          Si cambiamos algo, actualizaremos la fecha del encabezado. Cuando el cambio afecte de forma
          sustancial a cómo tratamos tus datos, te avisaremos dentro de la aplicación antes de que
          entre en vigor, para que puedas leerlo y decidir si sigues usando el servicio.
        </p>
        <p>
          También puedes consultar los{' '}
          <Link
            href="/terminos"
            className="focus-ring rounded-control text-primary underline decoration-dotted underline-offset-2"
          >
            términos de servicio
          </Link>
          .
        </p>
      </LegalSection>
    </LegalLayout>
  );
}

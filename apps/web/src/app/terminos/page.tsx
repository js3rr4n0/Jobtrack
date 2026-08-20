import type { Metadata } from 'next';
import Link from 'next/link';

import { LegalLayout, LegalList, LegalSection } from '@/components/legal/LegalLayout';
import {
  LEGAL_CONTACT_LABEL,
  LEGAL_CONTACT_URL,
  LEGAL_JURISDICTION,
  LEGAL_MINIMUM_AGE,
} from '@/lib/legal';

export const metadata: Metadata = {
  title: 'Términos de servicio',
  description:
    'Las condiciones de uso de Deska. Servicio gratuito, sin cobros y sin tarjeta, con los límites de responsabilidad claramente indicados.',
};

function Contacto() {
  return (
    <Link
      href={LEGAL_CONTACT_URL}
      className="focus-ring rounded-control text-primary underline decoration-dotted underline-offset-2"
    >
      {LEGAL_CONTACT_LABEL}
    </Link>
  );
}

export default function TerminosPage() {
  return (
    <LegalLayout
      title="Términos de servicio"
      summary={
        <>
          <p>
            <strong className="text-primary">Deska es gratis.</strong> No cobramos nada, no pedimos
            tarjeta y no hay versión de pago escondida ni periodo de prueba que caduque en un cobro.
          </p>
          <p>
            <strong className="text-primary">Lo que escribes es tuyo.</strong> Puedes llevártelo o
            borrarlo cuando quieras.
          </p>
          <p>
            <strong className="text-primary">Es una herramienta para organizarte,</strong> no una
            agencia de empleo. No conseguimos trabajo, no hablamos con las empresas y no garantizamos
            ningún resultado en tu búsqueda.
          </p>
          <p>
            <strong className="text-primary">Se ofrece tal cual.</strong> Es un proyecto personal y
            gratuito: hacemos lo posible por que funcione, pero no podemos responder de los daños que
            se deriven de un fallo. Guarda copia de lo que sea importante.
          </p>
        </>
      }
    >
      <LegalSection number={1} title="Qué es esto y a quién obliga">
        <p>
          Estos términos son el contrato entre tú y quien opera Deska. Al crear una cuenta o usar el
          servicio, los aceptas. Si no estás de acuerdo con alguno, la solución es sencilla: no uses
          el servicio.
        </p>
        <p>
          Debes tener al menos {LEGAL_MINIMUM_AGE} años para crear una cuenta, o contar con la
          autorización de quien ejerza tu patria potestad.
        </p>
      </LegalSection>

      <LegalSection number={2} title="El servicio es gratuito">
        <p>
          Deska se ofrece <strong className="text-primary">sin coste alguno</strong>. No solicitamos
          datos de tarjeta, no hay suscripción, no hay funciones de pago y no existe ningún cobro
          diferido ni renovación automática.
        </p>
        <p>
          Si algún día existiera una modalidad de pago, sería para funciones nuevas y se te
          comunicaría con antelación. Lo que hoy usas gratis seguiría siendo gratis, y en ningún caso
          se te cobraría nada sin que tú lo contrataras de forma expresa.
        </p>
      </LegalSection>

      <LegalSection number={3} title="Tu cuenta">
        <LegalList
          items={[
            <>
              Eres responsable de mantener tus credenciales a salvo y de la actividad que ocurra
              desde tu cuenta.
            </>,
            <>Debes darnos un correo válido y no suplantar a otra persona.</>,
            <>
              Puedes cerrar tu cuenta cuando quieras. Al hacerlo, se aplica lo previsto en la{' '}
              <Link
                href="/privacidad"
                className="focus-ring rounded-control text-primary underline decoration-dotted underline-offset-2"
              >
                política de privacidad
              </Link>{' '}
              sobre plazos de borrado.
            </>,
          ]}
        />
      </LegalSection>

      <LegalSection number={4} title="Lo que escribes sigue siendo tuyo">
        <p>
          Conservas todos los derechos sobre tu contenido: tus notas, tus datos y los archivos que
          subas. No adquirimos ninguna titularidad sobre ellos.
        </p>
        <p>
          Nos concedes únicamente la licencia técnica imprescindible para prestarte el servicio:
          almacenar tu contenido, transmitirlo entre tus dispositivos, mostrarlo en tu pantalla y
          copiarlo en las copias de seguridad. Esa licencia es gratuita, no exclusiva, se limita a
          operar Deska y termina cuando borras el contenido o la cuenta.
        </p>
        <p>
          <strong className="text-primary">
            No usamos tu contenido para publicidad, ni lo cedemos a terceros, ni lo empleamos para
            entrenar modelos de inteligencia artificial.
          </strong>
        </p>
      </LegalSection>

      <LegalSection number={5} title="Uso aceptable">
        <p>Al usar Deska te comprometes a no:</p>
        <LegalList
          items={[
            <>Subir contenido ilícito, ni material sobre el que no tengas derechos.</>,
            <>
              Introducir datos personales de terceros más allá de lo razonable para tu propia
              búsqueda de empleo.
            </>,
            <>
              Intentar acceder a cuentas o datos de otras personas, ni sortear las medidas de
              seguridad.
            </>,
            <>
              Someter el servicio a cargas automatizadas que puedan degradarlo para los demás, ni
              extraer datos de forma masiva.
            </>,
            <>Usar el servicio para enviar publicidad no solicitada o cometer fraude.</>,
          ]}
        />
        <p>
          Si incumples estas reglas podemos suspender o cerrar tu cuenta. Cuando sea razonable te
          avisaremos antes y te daremos ocasión de recuperar tu contenido; si el incumplimiento es
          grave o hay riesgo para terceros, podremos actuar de inmediato.
        </p>
      </LegalSection>

      <LegalSection number={6} title="Deska no es una agencia de empleo">
        <p>Conviene que esto quede sin ambigüedad. Deska es una herramienta para organizarte:</p>
        <LegalList
          items={[
            <>
              <strong className="text-primary">No intermediamos</strong> entre tú y ninguna empresa,
              ni enviamos tu candidatura, ni hablamos con nadie en tu nombre.
            </>,
            <>
              <strong className="text-primary">No garantizamos ningún resultado.</strong> Ni
              entrevistas, ni ofertas, ni contrataciones. Lo que muestra el tablero es lo que tú has
              escrito.
            </>,
            <>
              <strong className="text-primary">No verificamos las ofertas</strong> que anotas ni las
              empresas que registras. Comprobar que una oferta es legítima es cosa tuya.
            </>,
            <>
              <strong className="text-primary">Los avisos son de apoyo, no una garantía.</strong> Las
              fechas, los recordatorios y los enlaces de videollamada dependen de lo que tú
              introduzcas y de que tu dispositivo funcione. No respondemos de una entrevista perdida.
            </>,
          ]}
        />
      </LegalSection>

      <LegalSection number={7} title="Enlaces y servicios de terceros">
        <p>
          Los enlaces que guardas —ofertas, salas de videollamada, sitios de empresas— llevan a
          servicios ajenos que no controlamos. No respondemos de su contenido, su disponibilidad ni
          sus prácticas de privacidad. Lo mismo vale para el inicio de sesión con Google, que se rige
          por las condiciones de Google.
        </p>
      </LegalSection>

      <LegalSection number={8} title="Disponibilidad y cambios">
        <p>
          Deska es un proyecto personal, no un servicio con acuerdo de nivel de servicio. Puede haber
          interrupciones, mantenimientos y errores. Podemos modificar funciones, retirarlas o
          suspender el servicio por completo.
        </p>
        <p>
          Si decidiéramos cerrarlo, avisaríamos con al menos{' '}
          <strong className="text-primary">treinta días</strong> de antelación dentro de la
          aplicación, para que tengas tiempo de llevarte tu contenido.
        </p>
      </LegalSection>

      <LegalSection number={9} title="Sin garantías">
        <p>
          El servicio se presta <strong className="text-primary">tal cual y según disponibilidad</strong>.
          Hasta donde permita la ley aplicable, se excluye toda garantía, expresa o implícita, sobre
          comerciabilidad, idoneidad para un fin concreto, ausencia de errores o continuidad del
          servicio.
        </p>
        <p>
          En particular, no garantizamos que el servicio esté libre de interrupciones, que los datos
          no puedan perderse, ni que los cálculos de progreso sean adecuados para ninguna finalidad
          distinta de la orientativa.
        </p>
        <p>
          <strong className="text-primary">
            Conserva por tu cuenta una copia de lo que sea importante para ti.
          </strong>
        </p>
      </LegalSection>

      <LegalSection number={10} title="Límite de responsabilidad">
        <p>
          Hasta donde permita la ley aplicable, y teniendo en cuenta que el servicio se presta de
          forma gratuita, no responderemos de daños indirectos, incidentales, especiales ni
          consecuentes, incluidos el lucro cesante, la pérdida de oportunidades laborales, la pérdida
          de datos ni el daño reputacional.
        </p>
        <p>
          Nuestra responsabilidad total acumulada por cualquier reclamación relacionada con el
          servicio se limita a{' '}
          <strong className="text-primary">
            la mayor de estas dos cantidades: lo que hayas pagado por Deska en los doce meses
            anteriores —que es cero, porque el servicio es gratuito— o cincuenta dólares
            estadounidenses
          </strong>
          .
        </p>
        <p>
          Nada de lo anterior excluye ni limita la responsabilidad que no pueda excluirse por ley,
          como el dolo, la culpa grave o los daños a la vida y la integridad física. Si tu
          legislación te reconoce derechos como consumidor que no admiten renuncia, esos derechos se
          mantienen intactos y prevalecen sobre este apartado.
        </p>
      </LegalSection>

      <LegalSection number={11} title="Indemnidad">
        <p>
          Si un tercero reclama contra nosotros por causa del contenido que subiste o del uso que
          hiciste del servicio incumpliendo estos términos, te comprometes a asumir los gastos
          razonables de defensa que ello nos ocasione. No se aplica cuando la reclamación derive de
          nuestra propia actuación.
        </p>
      </LegalSection>

      <LegalSection number={12} title="Propiedad del software">
        <p>
          El código, el diseño, el nombre Deska y su logotipo pertenecen a quien desarrolla el
          proyecto. Estos términos no te transfieren ningún derecho sobre ellos más allá del uso
          normal de la aplicación. Tu contenido, como dice el apartado 4, es cosa aparte y sigue
          siendo tuyo.
        </p>
      </LegalSection>

      <LegalSection number={13} title="Cambios en estos términos">
        <p>
          Podemos actualizarlos. La fecha del encabezado indica la última versión. Si el cambio es
          sustancial, te avisaremos dentro de la aplicación antes de que entre en vigor. Seguir
          usando Deska después de esa fecha equivale a aceptar la nueva versión; si no la aceptas,
          puedes cerrar tu cuenta y llevarte tu contenido.
        </p>
      </LegalSection>

      <LegalSection number={14} title="Ley aplicable y conflictos">
        <p>
          Estos términos se rigen por las leyes de {LEGAL_JURISDICTION}, y cualquier conflicto se
          someterá a sus tribunales.
        </p>
        <p>
          Si resides en un país cuya normativa de consumo te permite acudir a los tribunales de tu
          domicilio, ese derecho se respeta y prevalece sobre el párrafo anterior.
        </p>
        <p>
          Antes de acudir a los tribunales, te pedimos que nos lo cuentes a través de <Contacto />:
          casi todo se resuelve antes de llegar ahí.
        </p>
      </LegalSection>

      <LegalSection number={15} title="Si alguna cláusula no vale">
        <p>
          Si un tribunal declara nula o inaplicable alguna parte de estos términos, esa parte se
          interpretará de la forma más próxima posible a su intención original, o se tendrá por no
          puesta, y el resto seguirá plenamente en vigor.
        </p>
        <p>
          Estos términos, junto con la{' '}
          <Link
            href="/privacidad"
            className="focus-ring rounded-control text-primary underline decoration-dotted underline-offset-2"
          >
            política de privacidad
          </Link>
          , constituyen el acuerdo completo entre tú y nosotros sobre el uso de Deska.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}

import { ButtonLink, Eyebrow, Muted, PageDescription, PageTitle, Surface } from '../components/Bits';

const contactPoints = [
  {
    label: 'E-post',
    value: 'hei@jesnesgalleri.no',
    href: 'mailto:hei@jesnesgalleri.no',
  },
  {
    label: 'Telefon',
    value: '+47 41 23 45 67',
    href: 'tel:+4741234567',
  },
  {
    label: 'Adresse',
    value: 'Atelier Jesnes, Bjørvika, Oslo',
  },
];

const ContactPage = () => {
  return (
    <div className="mx-auto max-w-4xl space-y-16">
      <section className="space-y-6">
        <Eyebrow>kontakt</Eyebrow>
        <PageTitle>La oss ta en prat</PageTitle>
        <PageDescription>
          Enten du ønsker et samarbeid, en privat visning eller bare vil prate om idéer, er du velkommen til å ta kontakt.
          Vi svarer raskt og fleksibelt.
        </PageDescription>
      </section>

      <section className="grid gap-6 sm:grid-cols-2">
        {contactPoints.map((item) => (
          <Surface key={item.label} className="space-y-2">
            <span className="text-xs uppercase tracking-[0.35em] text-slate-500">{item.label}</span>
            {item.href ? (
              <a
                href={item.href}
                className="block text-lg font-medium text-slate-900 transition-colors hover:text-slate-600"
              >
                {item.value}
              </a>
            ) : (
              <p className="text-lg font-medium text-slate-900">{item.value}</p>
            )}
          </Surface>
        ))}
      </section>

      <Surface variant="subtle" className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Bestill en privat visning</h2>
        <Muted>
          Send oss en kort beskrivelse av hva du ønsker å se, og vi setter opp en digital eller fysisk visning skreddersydd
          for deg.
        </Muted>
        <ButtonLink
          href="mailto:hei@jesnesgalleri.no?subject=Privat%20visning"
          className="w-fit"
        >
          Send forespørsel
        </ButtonLink>
      </Surface>
    </div>
  );
};

export default ContactPage;

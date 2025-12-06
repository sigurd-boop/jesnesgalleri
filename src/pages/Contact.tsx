import { ButtonLink, Eyebrow, Muted, PageDescription, PageTitle, Surface } from '../components/Bits';

const contactPoints = [
  {
    label: 'Inquiries',
    value: 'inquiries@jesne.art',
    href: 'mailto:inquiries@jesne.art',
  },
  {
    label: 'Social',
    value: 'Instagram',
    href: 'https://instagram.com',
  },
];

const ContactPage = () => {
  return (
    <div className="mx-auto max-w-4xl space-y-16">
      <section className="space-y-6 animate-fade-in-up">
        <Eyebrow>contact</Eyebrow>
        <PageTitle>Let’s build something bold</PageTitle>
        <PageDescription>
          Partnerships, private showcases, bespoke commissions — whatever you have in mind, reach out and we’ll respond
          quickly with a tailored next step.
        </PageDescription>
      </section>

      <section className="grid gap-6 sm:grid-cols-2 animate-fade-in-up">
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

      <Surface variant="subtle" className="space-y-4 animate-fade-in-up">
        <h2 className="text-lg font-semibold text-slate-900">Send an inquiry</h2>
        <Muted>
          Share a short brief of what you would like to explore and we will arrange a digital or in-person presentation
          curated for you.
        </Muted>
        <ButtonLink href="mailto:inquiries@jesne.art?subject=Inquiry" className="w-fit">
          Send inquiry
        </ButtonLink>
      </Surface>
    </div>
  );
};

export default ContactPage;

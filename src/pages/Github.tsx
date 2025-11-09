import { ButtonLink, Eyebrow, Muted, PageDescription, PageTitle, Surface } from '../components/Bits';

const GithubPage = () => {
  return (
    <div className="mx-auto max-w-4xl space-y-16">
      <section className="space-y-6">
        <Eyebrow>github</Eyebrow>
        <PageTitle>Utforsk koden</PageTitle>
        <PageDescription>
          Prosjektet er bygget med React, TypeScript og Tailwind CSS. I GitHub-repositoriet finner du alle komponenter,
          eksempeldata og instruksjoner for å koble til dine egne GLB-modeller.
        </PageDescription>
      </section>

      <Surface className="space-y-5">
        <h2 className="text-lg font-semibold text-slate-900">Repository</h2>
        <Muted>
          Gå til GitHub for å klone, åpne issues eller lage dine egne varianter av galleriet.
        </Muted>
        <ButtonLink
          href="https://github.com/ditt-brukernavn/jesnesgalleri"
          target="_blank"
          rel="noreferrer"
          tone="neutral"
          className="w-fit"
        >
          Åpne på GitHub
        </ButtonLink>
      </Surface>

      <Surface variant="subtle" className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Videre utvikling</h2>
        <ul className="space-y-2 text-sm text-slate-600">
          <li>Integrer sanntidsdata fra et CMS som Sanity eller Contentful.</li>
          <li>Legg til en booking-modul for utstillinger eller workshops.</li>
          <li>Utvid galleriet med flere scener eller interaktiv navigasjon.</li>
        </ul>
      </Surface>
    </div>
  );
};

export default GithubPage;

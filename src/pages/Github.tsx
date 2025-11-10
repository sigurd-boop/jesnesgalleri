import { ButtonLink, Eyebrow, Muted, PageDescription, PageTitle, Surface } from '../components/Bits';

const GithubPage = () => {
  return (
    <div className="mx-auto max-w-4xl space-y-16">
      <section className="space-y-6 animate-fade-in-up">
        <Eyebrow>github</Eyebrow>
        <PageTitle>Explore the source</PageTitle>
        <PageDescription>
          The project runs on React, TypeScript, and Tailwind CSS. Visit the repository for every component, sample data,
          and instructions for connecting your own GLB models.
        </PageDescription>
      </section>

      <Surface className="space-y-5 animate-fade-in-up">
        <h2 className="text-lg font-semibold text-slate-900">Repository</h2>
        <Muted>Clone the project, open issues, or fork your own edition on GitHub.</Muted>
        <ButtonLink
          href="https://github.com/ditt-brukernavn/jesnesgalleri"
          target="_blank"
          rel="noreferrer"
          tone="neutral"
          className="w-fit"
        >
          Open on GitHub
        </ButtonLink>
      </Surface>

      <Surface variant="subtle" className="space-y-4 animate-fade-in-up">
        <h2 className="text-lg font-semibold text-slate-900">Next steps</h2>
        <ul className="space-y-2 text-sm text-slate-600">
          <li>Integrate live content from a CMS such as Sanity or Contentful.</li>
          <li>Add a booking module for exhibitions or workshops.</li>
          <li>Expand the gallery with additional scenes or interactive navigation.</li>
        </ul>
      </Surface>
    </div>
  );
};

export default GithubPage;

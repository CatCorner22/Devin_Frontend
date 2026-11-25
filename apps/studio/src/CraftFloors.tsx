import { FLOORS, craftFor, findStep, matchingOptionId, type CatalogEntry, type Project } from '@refraction/core';

const GRADES = { measured: 'measured', convention: 'long-standing convention', 'expert-opinion': 'expert opinion' };
const BASES = { read: 'read in full', abstract: 'a summary, not the original source', snippet: 'search snippet only', builder: 'assistant judgment; not a consulted source' };
const KINDS = { accessibility: 'Using the page', security: 'Protecting data', search: 'Finding public pages', performance: 'Speed and stability' };

function Rule({ entry, project }: { entry: CatalogEntry; project: Project }): React.JSX.Element {
  const { rule } = entry;
  return <li data-rule-id={rule.id}>
    <details className="source">
      <summary>{rule.plain}</summary>
      <p><strong>Why:</strong> {rule.why}</p>
      {entry.floorKind && <p><strong>Kind:</strong> {KINDS[entry.floorKind]}. {entry.publicOnly ? 'Required on public pages only; it does not ask you to publish a private page.' : 'Required for every build.'}</p>}
      {rule.appliesWhen && <p><strong>When:</strong> {rule.appliesWhen}</p>}
      {entry.setBy?.map((ref) => {
        const step = findStep(ref.stepId);
        const option = step?.options.find((option) => option.id === matchingOptionId(project.params, step));
        return <p key={ref.stepId}>Follows the Step <a href={`#${ref.stepId}`}>{step?.name}</a>{option ? `: ${option.label}.` : ': your current values.'}</p>;
      })}
      <p><strong>How to check:</strong> {rule.check.kind === 'person' ? `A person reviews this. ${rule.check.ask}` : rule.check.kind === 'walk' ? `The Fitter must run the keyboard walk (${rule.check.walk}) on the built page.` : `The Fitter must run the page check (${[rule.check.fn, ...(rule.check.also ?? [])].join(', ')}) on the built page.`}</p>
      <p><strong>What a person must still check:</strong> {entry.notChecked}</p>
      <p><strong>How strong the guidance is:</strong> {GRADES[rule.evidence]}. Written on {rule.reviewed}; no person has reviewed this Catalog entry yet.</p>
      <ul>{rule.sources.map((source, index) => <li key={index}>{source.title.replace(/the builder(?:'s|’s)?/gi, 'the assistant')}{source.section && ` — ${source.section}`}. ({BASES[source.basis]}){source.url && <> {source.url}</>}</li>)}</ul>
    </details>
  </li>;
}

export function CraftFloors({ project }: { project: Project }): React.JSX.Element {
  const craft = craftFor(project);
  return <>
    <section aria-labelledby="craft-heading">
      <h2 id="craft-heading">Craft rules</h2>
      <p>Small details for the page you chose. These are requirements to carry into the build, not results of checks. The Fitter (the AI coding assistant that builds from your choices) must check the built page. A starting look and changed values count too, even before you record a Decision.</p>
      {craft.length ? <ul className="catalog-rules" data-testid="craft-rules">{craft.map((entry) => <Rule key={entry.rule.id} entry={entry} project={project} />)}</ul> : <p>No craft rule applies to the current values.</p>}
    </section>
    <section aria-labelledby="floors-heading">
      <h2 id="floors-heading">Floors</h2>
      <p>A floor is a requirement that no design choice can turn off. The list covers using the page, protecting data, finding public pages, and speed. The Studio has not run these checks on a build. Passing a page check alone cannot show that a page meets every need.</p>
      <ul className="catalog-rules" data-testid="floors">{FLOORS.map((entry) => <Rule key={entry.rule.id} entry={entry} project={project} />)}</ul>
    </section>
  </>;
}

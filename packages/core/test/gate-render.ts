import { SAMPLE_CONTENT, createProject, deriveTokens, renderSmallBusiness } from '../src/index.js';

export const render = (page: 'home' | 'contact' = 'contact', business = SAMPLE_CONTENT.business) => {
  const project = createProject();
  return renderSmallBusiness({ page, content: { ...project.content, business, hours: 'Sunday only, noon to 2' }, params: project.params, tokens: deriveTokens(project.params, project.a11y).css });
};

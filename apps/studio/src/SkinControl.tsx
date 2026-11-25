import { findDirection, findSkin, skinsOf } from '@refraction/core';
import { useStudio } from './store';

export function SkinControl(): React.JSX.Element {
  const project = useStudio((s) => s.project);
  const change = useStudio((s) => s.changeSkin);
  const direction = project.direction === null ? undefined : findDirection(project.direction);
  const skins = direction ? skinsOf(direction) : [];
  const retained = !project.skin && project.skinLayer !== undefined && !project.skinLayer.off;
  const restored = project.skinLayer?.off && (project.skinLayer.resets?.length ?? 0) > 0;
  return (
    <section aria-labelledby="project-skin-title">
      <h2 id="project-skin-title">Skin: colors only</h2>
      <p>A Skin covers earlier color choices without changing their saved values, your other Decisions, or your words. A later color choice takes priority for its own Step.</p>
      <div className="inline-field">
        <label htmlFor="project-skin">Project Skin</label>
        <select id="project-skin" value={project.skin ?? (restored ? 'starting-colors' : retained ? 'retained-colors' : '')} onChange={(e) => change(e.target.value || null)} aria-describedby="project-skin-meaning">
          {restored && <option value="starting-colors" disabled>Starting colors on reset Steps</option>}
          {retained && <option value="retained-colors" disabled>Retained colors (Skin unavailable)</option>}
          <option value="">No Skin</option>
          {skins.map((skin) => <option key={skin.id} value={skin.id}>{skin.name}</option>)}
        </select>
      </div>
      <p className="hint" id="project-skin-meaning">{project.skin ? findSkin(project.skin)?.what : restored ? 'You put some Steps back to their starting Skin colors. Choose No Skin to show the underlying saved colors on those Steps too.' : retained ? 'This file kept colors from a Skin that is no longer offered. Choose No Skin to remove that color layer.' : 'The saved colors beneath the Skin are showing. In older projects, a starting Skin is already part of those saved colors.'}</p>
      {project.skin && !project.skinLayer && <p className="hint">This older file already saved its starting Skin into its colors. No Skin removes the name, but cannot remove those saved colors. Choose another Skin to change them.</p>}
      {skins.length === 0 && <p className="hint">This Direction offers no Skins. Choose another Direction to see its Skins.</p>}
      {project.skin && (!project.skinLayer || project.skinLayer.overrides.length > 0 || (project.skinLayer.resets?.length ?? 0) > 0) && <button type="button" className="btn" onClick={() => change(project.skin!)}>Apply this Skin again</button>}
      <p className="hint">No Skin shows the saved colors beneath the layer again. Each change is one Undo step.</p>
    </section>
  );
}

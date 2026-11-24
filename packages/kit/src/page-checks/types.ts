import type { Finding } from '../shapes.js';

/** A page check: it takes the page's document and returns findings. It is self-contained, because a checker sends its text into a browser page. */
export type PageCheck = (doc: Document) => Finding[] | Promise<Finding[]>;

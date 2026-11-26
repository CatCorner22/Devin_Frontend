import ts from 'typescript';

export function declaredTests(text) {
  const file = ts.createSourceFile('tests.tsx', text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const names = [];
  const testCall = (node) => ts.isIdentifier(node) ? ['it', 'test', 'itShared'].includes(node.text)
    : ts.isPropertyAccessExpression(node) ? testCall(node.expression)
      : ts.isCallExpression(node) ? testCall(node.expression) : false;
  const visit = (node) => {
    if (ts.isCallExpression(node) && testCall(node.expression)) {
      const title = node.arguments[0];
      if (title && ts.isStringLiteralLike(title)) names.push(title.text);
      else if (title && ts.isTemplateExpression(title)) names.push(title.getText(file).slice(1, -1));
    }
    ts.forEachChild(node, visit);
  };
  visit(file);
  return names;
}

export function savingReferences(markdown) {
  return [...markdown.matchAll(/\[([^\]]+)\]\(([^\s)]+)#test=([^\s)]+)\)/g)].map((match) => ({
    label: match[1], file: match[2].replace(/^\.\.\/\.\.\//, ''), name: decodeURIComponent(match[3]),
  }));
}

export function checkSavingTable(markdown, readSource) {
  const errors = [];
  const references = savingReferences(markdown);
  const files = new Map();
  if (!references.length) errors.push('The saving table must cite at least one test.');
  for (const { label, file, name } of references) {
    if (!/^(?:apps|packages)\/.+\.(?:test|e2e)\.ts$/.test(file) || file.split('/').includes('..') || file.includes('\\')) { errors.push(`Invalid test path: ${file}`); continue; }
    if (label !== name) errors.push(`The visible test name does not match its reference: ${label}`);
    try {
      if (!files.has(file)) files.set(file, new Set(declaredTests(readSource(file))));
      if (!files.get(file).has(name)) errors.push(`${file} does not declare ${name}`);
    } catch { errors.push(`Cannot read test file: ${file}`); }
  }
  let testTable = false;
  for (const line of markdown.split('\n')) {
    if (!line.startsWith('|')) { testTable = false; continue; }
    const cells = line.split('|').slice(1, -1).map((cell) => cell.trim());
    if (cells.at(-1) === 'Test') { testTable = true; continue; }
    if (!testTable || cells.every((cell) => /^:?-+:?$/.test(cell))) continue;
    const cell = cells.at(-1) ?? '';
    if (!/#test=/.test(cell) && !/No automatic test/i.test(cell)) errors.push(`The Test cell needs a named file reference: ${cell}`);
    const withoutLinks = cell.replace(/\[[^\]]+\]\([^)]*\)/g, '');
    if (/"[^"\n]{15,}"/.test(withoutLinks)) errors.push(`Unlinked test title: ${withoutLinks}`);
  }
  return errors;
}

// Entry point of codemirror.js: everything the viewer needs from CodeMirror, exposed as the global `CM`.
import { EditorState, RangeSetBuilder, StateEffect, StateField } from '@codemirror/state';
import { EditorView, Decoration, GutterMarker, ViewPlugin, WidgetType, gutterLineClass, lineNumbers } from '@codemirror/view';
import { StreamLanguage, syntaxHighlighting } from '@codemirror/language';
import { MergeView, getChunks, unifiedMergeView } from '@codemirror/merge';
import { classHighlighter, highlightCode, tagHighlighter, tags } from '@lezer/highlight';
import { cpp } from '@codemirror/lang-cpp';
import { css, cssLanguage } from '@codemirror/lang-css';
import { go } from '@codemirror/lang-go';
import { html } from '@codemirror/lang-html';
import { java } from '@codemirror/lang-java';
import { javascript } from '@codemirror/lang-javascript';
import { json } from '@codemirror/lang-json';
import { markdown } from '@codemirror/lang-markdown';
import { php } from '@codemirror/lang-php';
import { python } from '@codemirror/lang-python';
import { rust } from '@codemirror/lang-rust';
import { sql } from '@codemirror/lang-sql';
import { vue } from '@codemirror/lang-vue';
import { xml } from '@codemirror/lang-xml';
import { yaml } from '@codemirror/lang-yaml';
import { csharp, dart, kotlin, scala } from '@codemirror/legacy-modes/mode/clike';
import { dockerFile } from '@codemirror/legacy-modes/mode/dockerfile';
import { lua } from '@codemirror/legacy-modes/mode/lua';
import { ruby } from '@codemirror/legacy-modes/mode/ruby';
import { shell } from '@codemirror/legacy-modes/mode/shell';
import { swift } from '@codemirror/legacy-modes/mode/swift';
import { toml } from '@codemirror/legacy-modes/mode/toml';

const legacy = mode => () => StreamLanguage.define(mode);
// Single-file components: lang-html only nests plain CSS in <style>, so SCSS and Less get the CSS parser too.
const sfcStyles = [{ tag: 'style', attrs: a => /^(s?css|less|sass)$/i.test(a.lang || ''), parser: cssLanguage.parser }];
const sfcHtml = () => html({ nestedLanguages: sfcStyles });

// File extensions, special file names, and code fence names mapped to a language.
const table = [
  [['js', 'mjs', 'cjs', 'javascript'], () => javascript()],
  [['jsx'], () => javascript({ jsx: true })],
  [['ts', 'mts', 'cts', 'typescript'], () => javascript({ typescript: true })],
  [['tsx'], () => javascript({ typescript: true, jsx: true })],
  [['py', 'python'], python],
  [['json', 'jsonc'], json],
  [['css', 'scss', 'less'], css],
  [['vue'], () => vue({ base: html({ selfClosingTags: true, nestedLanguages: sfcStyles }) })],
  [['html', 'htm', 'svelte'], sfcHtml],
  [['md', 'markdown'], markdown],
  [['yml', 'yaml'], yaml],
  [['rs', 'rust'], rust],
  [['go'], go],
  [['java'], java],
  [['c', 'h', 'cc', 'cpp', 'hpp', 'cxx'], cpp],
  [['php'], php],
  [['sql'], sql],
  [['xml', 'svg', 'plist'], xml],
  [['sh', 'bash', 'zsh', 'shell'], legacy(shell)],
  [['toml'], legacy(toml)],
  [['dockerfile', 'containerfile'], legacy(dockerFile)],
  [['rb', 'ruby', 'gemfile', 'rakefile'], legacy(ruby)],
  [['kt', 'kts', 'kotlin'], legacy(kotlin)],
  [['swift'], legacy(swift)],
  [['lua'], legacy(lua)],
  [['cs', 'csharp'], legacy(csharp)],
  [['scala'], legacy(scala)],
  [['dart'], legacy(dart)],
];
const byName = new Map();
for (const [names, make] of table) for (const name of names) byName.set(name, make);
const loaded = new Map();

// Returns the language extension for a file path or fence name, or null.
function languageFor(pathOrName) {
  const name = String(pathOrName || '').toLowerCase().split('/').pop();
  const key = byName.has(name) ? name : name.includes('.') ? name.slice(name.lastIndexOf('.') + 1) : name;
  if (!byName.has(key)) return null;
  if (!loaded.has(key)) loaded.set(key, byName.get(key)());
  return loaded.get(key);
}

// classHighlighter, plus distinct classes for function and type definitions.
const highlighter = tagHighlighter([
  { tag: [tags.function(tags.variableName), tags.function(tags.propertyName)], class: 'tok-function' },
  { tag: [tags.definition(tags.typeName), tags.definition(tags.className)], class: 'tok-typeName tok-definition' },
  { tag: tags.self, class: 'tok-keyword' },
]);

// Syntax-highlighted HTML for a snippet, using the same token classes as the editors.
function highlightToHtml(code, language) {
  const esc = s => s.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]);
  const lang = language && (language.language || language);
  if (!lang || !lang.parser) return esc(code);
  let out = '';
  highlightCode(code, lang.parser.parse(code), [highlighter, classHighlighter],
    (text, classes) => { out += classes ? `<span class="${classes}">${esc(text)}</span>` : esc(text); },
    () => { out += '\n'; });
  return out;
}

export {
  EditorState, RangeSetBuilder, StateEffect, StateField, EditorView, Decoration, GutterMarker, ViewPlugin, WidgetType, gutterLineClass, lineNumbers, syntaxHighlighting,
  MergeView, getChunks, unifiedMergeView, classHighlighter, highlighter, languageFor, highlightToHtml,
};

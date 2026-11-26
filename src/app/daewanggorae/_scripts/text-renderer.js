import MarkdownIt from "markdown-it";
import katex from "katex";
import "katex/dist/katex.min.css";
const md = new MarkdownIt({ html: false, linkify: false, typographer: true });
md.renderer.rules.image = () => "";
md.renderer.rules.link_open = (tokens, i, options, env, self) => {
  const href = tokens[i].attrGet("href") || "";
  if (!/^https?:\/\//i.test(href)) tokens[i].attrSet("href", "#");
  tokens[i].attrSet("rel", "noopener noreferrer");
  tokens[i].attrSet("target", "_blank");
  return self.renderToken(tokens, i, options);
};
window.DGText = {
  markdown: (t) => md.render(t),
  formula: (t) =>
    katex.renderToString(t, {
      throwOnError: false,
      trust: false,
      output: "htmlAndMathml",
    }),
};

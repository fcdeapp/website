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

// Use the same verified UTF-16 selectors as the app. Never guess stale offsets.
import { fromMarkdown } from 'mdast-util-from-markdown';
import { prepareBlock, splitLiteralText } from '../_lib/reader/runtime.js';
import { technicalTermRanges, splitTechnicalTerms } from '../_lib/reader/technicalTerms';
const escape = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
window.DGText.reader = async (text, blockId, data, enabled) => {
  if (/\$|\\\(|\\\[/.test(text)) return window.DGText.markdown(text);
  const tree = fromMarkdown(text);
  const inlineTypes = new Set(['text','strong','emphasis','inlineCode','link','break']);
  const safe = node => inlineTypes.has(node.type) && (!node.children || node.children.every(safe));
  if (!tree.children.every(n=>n.type==='paragraph' && n.children.every(safe))) return md.render(text);
  const plan = data ? await prepareBlock(text, data.annotations.blocks.find(b=>b.blockId===blockId), {...data,highlightsEnabled:enabled,resolveDocumentHref:id=>'/daewanggorae/lesson?id='+encodeURIComponent(id)}) : {valid:true,markdown:text,intervals:[]};
  const terms=technicalTermRanges(text);
  const render=(node,protectedNode=false)=>{
    if(node.type==='text') {
      let offset=node.position.start.offset;
      const literal=text.slice(offset,node.position.end.offset)===node.value;
      return (protectedNode ? [{text:node.value}]:splitLiteralText(node.value,offset,node.position.end.offset,plan)).map(piece=>{
        let html=splitTechnicalTerms(piece.text,offset,literal&&!protectedNode?terms:[]).map(part=>part.term?'<span class="technical-term">'+escape(part.text)+'</span>':escape(part.text)).join('');offset+=piece.text.length;
        if(piece.highlight)html='<mark>'+html+'</mark>';
        if(piece.link)html='<a class="concept-link" href="'+escape(piece.link.href)+'" title="'+escape(piece.link.label)+' 교과서로 이동">'+html+'</a>';
        return html;
      }).join('');
    }
    if(node.type==='break')return '<br>';
    if(node.type==='inlineCode')return '<code>'+escape(node.value)+'</code>';
    if(node.type==='link')return /^https?:\/\//.test(node.url)?'<a href="'+escape(node.url)+'" target="_blank" rel="noopener noreferrer">'+node.children.map(n=>render(n,true)).join('')+'</a>':node.children.map(n=>render(n,true)).join('');
    const tag=node.type==='strong'?'strong':'em';return '<'+tag+'>'+node.children.map(n=>render(n,protectedNode)).join('')+'</'+tag+'>';
  };
  return tree.children.map(n=>'<p>'+n.children.map(n=>render(n)).join('')+'</p>').join('');
};
// Inline/display mathematics: preserve surrounding whitespace and source notation.
const math=(state,silent)=>{
 const src=state.src,pos=state.pos;let open,close,display=false;
 if(src.startsWith('$$',pos)){open='$$';close='$$';display=true;}
 else if(src.startsWith('\\[',pos)){open='\\[';close='\\]';display=true;}
 else if(src.startsWith('\\(',pos)){open='\\(';close='\\)';}
 else if(src[pos]==='$' && src[pos+1]!==' '){open='$';close='$';}else return false;
 const end=src.indexOf(close,pos+open.length);if(end<0)return false;
 if(!silent){const token=state.push('dwg_math','',0);token.content=src.slice(pos+open.length,end);token.meta={display};}
 state.pos=end+close.length;return true;
};
md.inline.ruler.before('escape','dwg_math',math);
md.renderer.rules.dwg_math=(tokens,i)=>katex.renderToString(tokens[i].content,{displayMode:tokens[i].meta.display,throwOnError:false,trust:false,output:'htmlAndMathml'});

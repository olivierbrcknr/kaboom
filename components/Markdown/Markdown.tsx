import ReactMarkdown from "react-markdown";

import gfm from "remark-gfm";

import styles from "./Markdown.module.scss";

interface MarkdownProps {
  content: string;
}

const transformObjectArray = (val: string) => {
  const objectString = val.replace(/(\r\n|\n|\r)/gm, "");
  let newJson = objectString.replace(/([a-zA-Z0-9]+?):/g, '"$1":');
  newJson = newJson.replace(/'/g, '"');
  const data = JSON.parse(newJson);

  return data;
};

const Markdown = ({ content }: MarkdownProps) => {
  const ImgRenderer = ({ src, alt }: { src: string; alt: string }) => {
    return <img alt={alt} src={"/rulesImages/" + src} />;
  };

  const codeRenderer = (props) => {
    const isColorBlock = props.className === "language-colors";

    if (isColorBlock) {
      const colors = transformObjectArray(props.children);

      const colorLegend = colors.map((c, k: number) => {
        return (
          <li key={"colorLegend-" + k}>
            <span style={{ background: c.color }}></span>
            <div className={styles.MarkdownLegendInfo}>
              <h6>{c.type}</h6>
            </div>
          </li>
        );
      });

      return <ul className={styles.MarkdownLegend}>{colorLegend}</ul>;
    }

    return <code {...props} />;
  };

  return (
    <ReactMarkdown
      remarkPlugins={[gfm]}
      className={styles.Markdown}
      components={{
        code: codeRenderer,
        img: ImgRenderer,
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

export default Markdown;

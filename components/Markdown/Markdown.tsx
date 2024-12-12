import ReactMarkdown from "react-markdown";

import gfm from "remark-gfm";

import styles from "./Markdown.module.scss";

interface MarkdownProps {
  content: string;
}

const transformObjectArray = (val) => {
  const objectString = val.replace(/(\r\n|\n|\r)/gm, "");
  let newJson = objectString.replace(/([a-zA-Z0-9]+?):/g, '"$1":');
  newJson = newJson.replace(/'/g, '"');
  const data = JSON.parse(newJson);

  return data;
};

const Markdown = ({ content }: MarkdownProps) => {
  const ImgRenderer = (props) => {
    // console.log(props)
    return <img alt={props.alt} src={"/rulesImages/" + props.src} />;
  };

  const codeRenderer = (props) => {
    switch (props.language) {
      case "colors":
        const colors = transformObjectArray(props.value);

        const colorLegend = colors.map((c, k) => {
          return (
            <li key={"colorLegend-" + k}>
              <span style={{ background: c.color }}></span>
              <div className={styles.RulesLegendInfo}>
                <h6>{c.type}</h6>
              </div>
            </li>
          );
        });

        return <ul className={styles.RulesLegend}>{colorLegend}</ul>;

        break;
      default:
        return null;
        break;
    }
  };

  return (
    <ReactMarkdown
      remarkPlugins={[gfm]}
      className={styles.Markdown}
      components={{
        code: codeRenderer,
        image: ImgRenderer,
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

export default Markdown;

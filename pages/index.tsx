// React
import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import gfm from "remark-gfm";

// Components
import Head from "../components/Head";
import Footer from "../components/Footer";

import Game from "../components/Kaboom/Game";

import styles from "./index.module.scss";

import rulesMD from "./Rules.md";

const transformObjectArray = (val) => {
  const objectString = val.replace(/(\r\n|\n|\r)/gm, "");
  let newJson = objectString.replace(/([a-zA-Z0-9]+?):/g, '"$1":');
  newJson = newJson.replace(/'/g, '"');
  const data = JSON.parse(newJson);

  return data;
};

const Home = () => {
  const [showRules, setShowRules] = useState(false);

  const classes = [styles.Home];

  const ImgRenderer = (props) => {
    return <img alt={props.alt} src={"/rulesImages/" + props.src} />;
  };

  const codeRenderer = (props) => {
    switch (props.classname) {
      case "language-colors":
        const colors = transformObjectArray(props.children);

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
        return <code>{props.children}</code>;
        break;
    }
  };

  if (showRules) {
    classes.push(styles.showRules);
  }

  return (
    <div className={classes.join(" ")}>
      <Head title="Kaboom" />

      <div className={styles.GameContainer}>
        <Game />
      </div>

      <div className={styles.RulesContainer}>
        <ReactMarkdown
          remarkPlugins={[gfm]}
          className={styles.Rules}
          components={{
            image: ImgRenderer,
            code: codeRenderer,
          }}
        >
          {rulesMD}
        </ReactMarkdown>
        <Footer />
      </div>

      <div
        className={styles.toggleRulesBtn}
        onClick={() => {
          setShowRules(!showRules);
        }}
      >
        {showRules ? "Hide" : "Show"} Rules
      </div>
    </div>
  );
};

export default Home;

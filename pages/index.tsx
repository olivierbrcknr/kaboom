import clsx from "clsx";
import React, { useState } from "react";

import Footer from "../components/Footer";
import Head from "../components/Head";
import Game from "../components/Kaboom/Game";
import Markdown from "../components/Markdown";
import styles from "./index.module.scss";
import rulesMD from "./Rules.md";

const Home = () => {
  const [showRules, setShowRules] = useState(false);

  return (
    <div className={clsx(styles.Home, showRules && styles.showRules)}>
      <Head title="Kaboom" />

      <div className={styles.GameContainer}>
        <Game />
      </div>

      <div className={styles.RulesContainer}>
        <div className={styles.Rules}>
          <Markdown content={rulesMD} />
        </div>
        <Footer />
      </div>

      <div
        className={styles.toggleRulesBtn}
        onClick={() => setShowRules(!showRules)}
      >
        {showRules ? "Hide" : "Show"} Rules
      </div>
    </div>
  );
};

export default Home;

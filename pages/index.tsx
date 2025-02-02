import React, { useState } from "react";

import clsx from "clsx";

import Footer from "../components/Footer";
import Game from "../components/Kaboom/Game";
import Markdown from "../components/Markdown";

import rulesMD from "./Rules.md";

import styles from "./index.module.scss";

const Home = () => {
  const [showRules, setShowRules] = useState(false);

  return (
    <div className={clsx(styles.Home, showRules && styles.showRules)}>
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

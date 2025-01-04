import Link from "next/link";
// React
import React from "react";

import Footer from "../components/Footer";
import Head from "../components/Head";
import Markdown from "../components/Markdown";
import styles from "./index.module.scss";
import rulesMD from "./Rules.md";

const Home = () => {
  return (
    <div className={styles.RulesPage}>
      <Head title="Kaboom — Rules" />

      <Link href="/">
        <a className={styles.button}>↩ Back to the game</a>
      </Link>

      <div className={styles.Rules}>
        <Markdown content={rulesMD} />
      </div>

      <Footer />
    </div>
  );
};

export default Home;

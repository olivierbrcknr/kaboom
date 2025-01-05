// React
import React from "react";

import Link from "next/link";

import Footer from "../components/Footer";
import Head from "../components/Head";
import Markdown from "../components/Markdown";

import rulesMD from "./Rules.md";

import styles from "./index.module.scss";

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

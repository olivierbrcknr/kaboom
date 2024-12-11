import React from "react";

import styles from "./Footer.module.scss";

const Footer = (props) => {
  const classes = [styles.Footer];
  classes.push(props.className);

  return (
    <footer className={classes.join(" ")}>
      2021 &copy; a project by{" "}
      <a href="https://olivierbrueckner.de/">Olivier Brückner</a>
    </footer>
  );
};

export default Footer;

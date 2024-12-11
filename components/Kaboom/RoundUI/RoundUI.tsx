import React, { useState, useEffect } from "react";

import styles from "./RoundUI.module.scss";

const RoundUI = (props) => {
  const classes = [styles.RoundUI];

  return <div className={classes.join(" ")}></div>;
};

export default RoundUI;

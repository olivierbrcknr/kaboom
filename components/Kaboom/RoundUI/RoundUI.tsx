import clsx from "clsx";

import styles from "./RoundUI.module.scss";

interface RoundUIProps {}

const RoundUI = ({}: RoundUIProps) => {
  return <div className={clsx(styles.RoundUI)}></div>;
};

export default RoundUI;

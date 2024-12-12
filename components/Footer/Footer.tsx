import clsx from "clsx";

import styles from "./Footer.module.scss";

interface FooterProps {}

const Footer = ({}: FooterProps) => {
  return (
    <footer className={clsx(styles.Footer)}>
      2024 &copy; a project by{" "}
      <a target="_blank" href="https://olivierbrueckner.de/">
        Olivier Brückner
      </a>
    </footer>
  );
};

export default Footer;

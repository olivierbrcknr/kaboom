import clsx from "clsx";

import styles from "./Footer.module.scss";

interface FooterProps {}

const Footer = ({}: FooterProps) => {
  return (
    <footer className={clsx(styles.Footer)}>
      2020-{new Date().getFullYear()} &copy; a project by{" "}
      <a href="https://olivierbrueckner.de/" target="_blank">
        Olivier Brückner
      </a>
    </footer>
  );
};

export default Footer;

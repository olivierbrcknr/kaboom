import clsx from "clsx";

import { useIsDarkmode, useKeyboardFocus } from "../utils";
import "../styles/reset.scss";
import "../styles/variables.scss";
import "../styles/index.scss";

export default function App({ Component, pageProps }) {
  const isDark = useIsDarkmode();
  const keyboardFocus = useKeyboardFocus();

  return (
    <div
      className={clsx(
        isDark && "is-dark-mode",
        keyboardFocus && "keyboard-focus",
      )}
    >
      <div id="floating" />
      <Component {...pageProps} />
    </div>
  );
}

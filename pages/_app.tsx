import clsx from "clsx";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";

import Head from "../components/Head";
import { useIsDarkmode, useKeyboardFocus } from "../utils";

import "../styles/reset.scss";
import "../styles/variables.scss";
import "../styles/index.scss";

const ibmMono = IBM_Plex_Mono({
  subsets: ["latin-ext"],
  variable: "--font-family-mono",
  weight: ["300", "400", "500", "600", "700"],
});
const ibmSans = IBM_Plex_Sans({
  subsets: ["latin-ext"],
  variable: "--font-family-reg",
  weight: ["300", "400", "500", "600", "700"],
});

export default function App({ Component, pageProps }) {
  const isDark = useIsDarkmode();
  const keyboardFocus = useKeyboardFocus();

  return (
    <>
      <Head title="Kaboom" />
      <div
        className={clsx(
          "wrapper",
          isDark && "is-dark-mode",
          keyboardFocus && "keyboard-focus",
          ibmMono.variable,
          ibmSans.variable,
        )}
      >
        <div id="floating" />
        <Component {...pageProps} />
      </div>
    </>
  );
}

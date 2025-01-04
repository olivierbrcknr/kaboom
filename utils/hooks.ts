import { useEffect, useState } from "react";

import { MAX_SCREEN_WIDTH, MOBILE_WIDTH } from "./constants";

// Darkmode
export const useIsDarkmode = () => {
  const [isDarkmode, setIsDarkmode] = useState(false);

  useEffect(() => {
    const checkIfDarkmode = () => {
      setIsDarkmode(
        window.matchMedia &&
          window.matchMedia("(prefers-color-scheme: dark)").matches,
      );
    };

    checkIfDarkmode();

    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", checkIfDarkmode);

    return () => {
      window
        .matchMedia("(prefers-color-scheme: dark)")
        .removeEventListener("change", checkIfDarkmode);
    };
  }, []);

  return isDarkmode;
};

// Window
const getWindowDimensions = () => {
  const { innerHeight: windowHeight, innerWidth: windowWidth } = window;
  return {
    windowHeight,
    windowWidth,
  };
};

export const useWindowDimensions = () => {
  const [windowDimensions, setWindowDimensions] = useState({
    windowHeight: 0, // default value before init
    windowWidth: 0, // default value before init
  });

  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowDimensions;
};

export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  const { windowWidth } = useWindowDimensions();

  useEffect(() => {
    setIsMobile(windowWidth <= MOBILE_WIDTH);
  }, [windowWidth]);

  return isMobile;
};

export const useIsMaxScreen = () => {
  const [isMaxScreen, setIsMaxScreen] = useState(false);
  const { windowWidth } = useWindowDimensions();

  useEffect(() => {
    setIsMaxScreen(windowWidth > MAX_SCREEN_WIDTH);
  }, [windowWidth]);

  return isMaxScreen;
};

// Windows / macOS
export const useIsWindows = () => {
  const [isWindows, setIsWindows] = useState(false);

  useEffect(() => {
    if (window.navigator.appVersion.indexOf("Win") != -1) {
      setIsWindows(true);
    }
  }, []);

  return isWindows;
};

export const useIsDev = () => {
  return process.env.NODE_ENV !== "production";
};

import { useEffect, useState } from "react";

const useKeyboardFocus = () => {
  const [keyboardFocus, setKeyboardFocus] = useState(false);

  useEffect(() => {
    // via https://medium.com/hackernoon/removing-that-ugly-focus-ring-and-keeping-it-too-6c8727fefcd2
    const handleFirstTab = (e: KeyboardEvent) => {
      if (e.keyCode === 9) {
        setKeyboardFocus(true);

        window.removeEventListener("keydown", handleFirstTab);
        window.addEventListener("mousedown", handleMouseDownOnce);
      }
    };

    const handleMouseDownOnce = () => {
      setKeyboardFocus(false);

      window.removeEventListener("mousedown", handleMouseDownOnce);
      window.addEventListener("keydown", handleFirstTab);
    };

    window.addEventListener("keydown", handleFirstTab);

    return () => {
      window.removeEventListener("keydown", handleFirstTab);
      window.removeEventListener("mousedown", handleMouseDownOnce);
    };
  }, []);

  return keyboardFocus;
};

export default useKeyboardFocus;

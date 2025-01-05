import React from "react";

import clsx from "clsx";

import styles from "./Button.module.scss";

interface ButtonProps {
  children?: React.JSX.Element | string | string[];
  disabled?: boolean;
  onClick?: () => void;
  theme?: ButtonTheme;
}

type ButtonTheme = "default" | "primary" | "red";

const Button = ({
  children,
  disabled,
  onClick,
  theme = "default",
}: ButtonProps) => {
  return (
    <button
      className={clsx(
        styles.Button,
        disabled && styles.isDisabled,
        theme === "primary" && styles.themePrimary,
        theme === "red" && styles.themeRed,
      )}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default Button;

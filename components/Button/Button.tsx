import React from "react";

import clsx from "clsx";

import styles from "./Button.module.scss";

type ButtonTheme = "default" | "primary" | "alert";

interface ButtonProps {
  children?: string | string[] | React.JSX.Element;
  onClick?: () => void;
  disabled?: boolean;
  theme?: ButtonTheme;
}

const Button = ({
  children,
  onClick,
  disabled,
  theme = "default",
}: ButtonProps) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        styles.Button,
        disabled && styles.isDisabled,
        theme === "primary" && styles.themePrimary,
        theme === "alert" && styles.themeAlert,
      )}
    >
      {children}
    </button>
  );
};

export default Button;

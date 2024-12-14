import React from "react";

import clsx from "clsx";

import styles from "./Button.module.scss";

interface ButtonProps {
  children?: string | string[] | React.JSX.Element;
  onClick?: () => void;
  disabled?: boolean;
}

const Button = ({ children, onClick, disabled }: ButtonProps) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={clsx(styles.Button, disabled && styles.isDisabled)}
    >
      {children}
    </button>
  );
};

export default Button;

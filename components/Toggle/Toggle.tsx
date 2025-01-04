import * as RadixToggle from "@radix-ui/react-toggle";
import clsx from "clsx";
import React from "react";

import styles from "./Toggle.module.scss";

export interface ToggleProps {
  disabled?: boolean;
  id?: string;
  name?: string;
  onChange: (value: boolean) => void;
  value: boolean;
}

const Toggle = ({
  disabled = false,
  id,
  name,
  onChange,
  value,
}: ToggleProps) => {
  return (
    <RadixToggle.Root
      className={clsx(
        styles.Toggle,
        value && styles.isPressed,
        disabled && styles.isDisabled,
      )}
      disabled={disabled}
      id={id}
      name={name}
      onPressedChange={onChange}
      pressed={value}
    >
      <div className={styles.Knob} />
    </RadixToggle.Root>
  );
};

export default React.memo(Toggle);

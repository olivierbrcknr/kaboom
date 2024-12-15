import * as RadixToggle from "@radix-ui/react-toggle";
import React from "react";

import clsx from "clsx";

import styles from "./Toggle.module.scss";

export interface ToggleProps {
  value: boolean;
  name?: string;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  id?: string;
}

const Toggle = ({
  value,
  onChange,
  name,
  disabled = false,
  id,
}: ToggleProps) => {
  return (
    <RadixToggle.Root
      className={clsx(
        styles.Toggle,
        value && styles.isPresed,
        disabled && styles.isDisabled,
      )}
      name={name}
      pressed={value}
      onPressedChange={onChange}
      disabled={disabled}
      id={id}
    >
      <div className={styles.Knob} />
    </RadixToggle.Root>
  );
};

export default React.memo(Toggle);

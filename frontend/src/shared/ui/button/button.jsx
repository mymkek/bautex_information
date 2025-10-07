import React from "react";
import styles from "./Button.module.css";

export const Button = ({
                           children,
                           onClick,
                           type = "button",
                           variant = "primary",
                           disabled = false,
                       }) => {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${styles.button} ${styles[variant]} ${
                disabled ? styles.disabled : ""
            }`}
        >
            {children}
        </button>
    );
};

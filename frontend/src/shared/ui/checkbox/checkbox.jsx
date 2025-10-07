import React from "react";
import styles from "./Checkbox.module.css";

export const Checkbox = ({ label, checked, onChange, disabled = false }) => {
    return (
        <label className={`${styles.wrapper} ${disabled ? styles.disabled : ""}`}>
            <input
                type="checkbox"
                checked={checked}
                onChange={onChange}
                disabled={disabled}
                className={styles.input}
            />
            <span className={styles.customCheckbox}></span>
            {label && <span className={styles.label}>{label}</span>}
        </label>
    );
};

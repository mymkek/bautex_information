import React from 'react';
import classes from './loader.module.css'; // создадим CSS отдельно

export const Loader = () => {
    return (
        <div className={classes.loaderOverlay}>
            <div className={classes.loaderSpinner}></div>
        </div>
    );
};

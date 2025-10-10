import classes from "./page.module.css";
import {LoginForm} from "./ui/Login-form.jsx";
import {useEffect} from "react";

export default function Login() {
    useEffect(() => {
        document.title = "Autorisation — BauTex Composites";
    }, []);

    return (
        <div className={classes.page}>
            <LoginForm/>
        </div>
    );
}

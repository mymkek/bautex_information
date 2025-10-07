import classes from "./page.module.css";
import {LoginForm} from "./ui/Login-form.jsx";

export default function Login() {
    return (
        <div className={classes.page}>
            <LoginForm/>
        </div>
    );
}

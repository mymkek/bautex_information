import classes from './login-form.module.css';
import Input from "../../../shared/ui/input/input.jsx";
import {Logo} from "../../../shared/ui/logo/logo.jsx";
import {Button} from "../../../shared/ui/button/button.jsx";
import {Checkbox} from "../../../shared/ui/checkbox/checkbox.jsx";
import {useState} from "react";
import {config} from "../../../config/config.js";
import {useNavigate} from "react-router-dom";

export const LoginForm = () => {
    const [checked, setChecked] = useState(false);
    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    console.log(config.apiUrl)
    const navigate = useNavigate();

    const handleLogin = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${config.apiUrl}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: login,
                    password: password,
                    rememberMe: checked
                })
            });

            if (!response.ok) {
                if(response.status === 401) {
                    throw new Error("Falscher Login oder Passwort")
                }
            }

            const data = await response.json();

            // Предположим, что сервер возвращает { token: "..." }
            console.log(data);
            if (data.accessToken) {
                localStorage.setItem('accessToken', data.accessToken);

                navigate('/information');
            } else {
                throw new Error('Token nicht erhalten');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={classes.card}>
            <div className={classes.header}>
                <Logo width={395}/>
            </div>
            <div className={classes.body}>
                <h2 className={classes.title}>Autorisation</h2>
                <div className={classes.input_wrapper}>
                    <Input placeholder="Login" value={login} onChange={(e) => setLogin(e.target.value)}/>
                </div>
                <div className={classes.input_wrapper}>
                    <Input placeholder="Passwort" type="password" value={password} onChange={(e) => setPassword(e.target.value)}/>
                </div>
                <div className={classes.checkbox_wrapper}>
                    <Checkbox
                        label="Angemeldet bleiben"
                        checked={checked}
                        onChange={() => setChecked(!checked)}
                    />
                </div>
                {error && <div className={classes.error}>{error}</div>}
                <div className={classes.button_wrapper}>
                    <Button onClick={handleLogin} disabled={loading}>
                        Anmelden
                    </Button>
                </div>
            </div>
        </div>
    )
}

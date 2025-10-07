import classes from './form.module.css';
import Input from "../../../../shared/ui/input/input.jsx";
import {config} from "../../../../config/config.js";
import {useNavigate} from "react-router-dom";
import {useState} from "react";


export const Form = () => {

    const navigate = useNavigate();

    const logout = () => {
        localStorage.removeItem("accessToken");
        navigate('/');
    }

    const [comment, setComment] = useState("");
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setComment(e.target.value);
        setError("");
    }
    const handleSubmitComment = () => {
        console.log('submitComment');
        if(!comment){
            setError("Dieses Feld ist erforderlich.")
        }
    }

    return (
        <div className={classes.box}>
            <button onClick={logout} className={classes.button}>
                <svg   viewBox="0 0 24 21"
                       width={30}
                       height={30}
                       preserveAspectRatio="xMidYMid meet">
                    <path
                        d="M10.1633 18.9378C10.1378 18.8698 10.1289 18.812 10.1376 18.7652C10.1462 18.7188 10.1165 18.6803 10.0484 18.6506C9.98027 18.6209 9.94627 18.5974 9.94627 18.5806C9.94627 18.5636 9.89744 18.5508 9.79956 18.5424C9.70172 18.5339 9.65289 18.5295 9.65289 18.5295H9.48714H9.34686H5.67339C5.11218 18.5295 4.63169 18.3299 4.23198 17.9299C3.83236 17.5303 3.63257 17.0499 3.63257 16.4888V7.50915C3.63257 6.94793 3.83232 6.46763 4.23198 6.06796C4.63169 5.66825 5.11218 5.46833 5.67339 5.46833H9.75497C9.86555 5.46833 9.95248 5.4409 10.0164 5.3855C10.0801 5.33024 10.1225 5.24728 10.1439 5.13675C10.1651 5.02622 10.178 4.92642 10.1823 4.83711C10.1865 4.7479 10.1844 4.63514 10.1758 4.4991C10.1674 4.36311 10.1631 4.27809 10.1631 4.24391C10.1631 4.13339 10.1227 4.03791 10.042 3.95696C9.96115 3.87637 9.86554 3.83594 9.75502 3.83594H5.67339C4.66158 3.83594 3.79631 4.19522 3.0777 4.91373C2.35928 5.63224 2 6.49738 2 7.50928V16.4888C2 17.5006 2.35928 18.3659 3.0777 19.0842C3.79631 19.803 4.66158 20.1623 5.67339 20.1623H9.75515C9.86572 20.1623 9.95271 20.1345 10.0166 20.0795C10.0803 20.0241 10.1227 19.9413 10.144 19.8306C10.1653 19.7202 10.1781 19.6199 10.1824 19.531C10.1866 19.4417 10.1846 19.3291 10.176 19.1931C10.1675 19.0569 10.1633 18.972 10.1633 18.9378Z"
                        fill="currentColor"></path>
                    <path
                        d="M21.7562 11.4234L14.8175 4.48451C14.656 4.32314 14.4646 4.24219 14.2435 4.24219C14.0225 4.24219 13.8311 4.32314 13.6694 4.48451C13.5078 4.6461 13.4271 4.83762 13.4271 5.05859V8.73206H7.71288C7.49165 8.73206 7.30039 8.81301 7.1388 8.97438C6.97721 9.13597 6.89648 9.32736 6.89648 9.54846V14.4465C6.89648 14.6675 6.97721 14.8589 7.1388 15.0204C7.30057 15.1817 7.49178 15.2629 7.71288 15.2629H13.4272V18.9363C13.4272 19.1572 13.5079 19.3488 13.6695 19.5103C13.8311 19.6719 14.0224 19.7528 14.2436 19.7528C14.4646 19.7528 14.656 19.6719 14.8175 19.5103L21.7562 12.5716C21.9178 12.4099 21.9986 12.2188 21.9986 11.9976C21.9986 11.7766 21.9178 11.585 21.7562 11.4234Z"
                        fill="currentColor"></path>
                </svg>
                Ausgang
            </button>
            <div className={classes.inputContainer}>
                <Input placeholder="Kommentar" value={comment} onChange={handleChange} />
                {error ? <div className={classes.error}>{error}</div> : null}
            </div>
            <button onClick={handleSubmitComment} className={classes.button}>Absenden</button>

        </div>
    )
}

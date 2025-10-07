import classes from './header.module.css';
import {Logo} from "../../../../shared/ui/logo/logo.jsx";

export const Header = () => {


    return (
        <header className={classes.box}>
            <h1 className={classes.h1}>
                Kanaltex 86
            </h1>

            <Logo width={557} className={classes.logo}/>
        </header>
    )
}

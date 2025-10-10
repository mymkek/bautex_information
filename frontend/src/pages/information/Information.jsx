import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {Form} from "./ui/form/index.jsx";
import {Header} from "./ui/header/index.jsx";

import classes from './information.module.css';
import {config} from "../../config/config.js";
import {Table} from "./ui/table/index.jsx";
import {Loader} from "../../shared/ui/loader/loader.jsx";

export default function Information() {
    const navigate = useNavigate();

    const [data, setData] = useState([]);

    useEffect(() => {
        document.title = "Information — BauTex Composites";
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        console.log(token)
        if (!token) {
            // если токена нет, редирект на главную
            navigate('/');
        }
    }, [navigate]);

    useEffect(() => {

        try {
            const response = fetch(`${config.apiUrl}/get-data`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                }
            }).then(res => res.json()).then((data) => {
                if(Array.isArray(data.response)) {
                    setData(data.response);
                }
            })
        } catch (e) {

        }
    }, []);

    return (
        <div className={classes.page}>
            <div className={classes.container}>
                <Header/>
                {data?.length ? <Table data={data} /> : <Loader/>}
                <Form/>
            </div>
        </div>
    )
}

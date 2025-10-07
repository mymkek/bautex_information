import React, {useMemo, useState} from "react";
import classes from './table.module.css';
import {Button} from "../../../../shared/ui/button/button.jsx";

export const Table = ({data}) => {

    console.log(data);

    const [selectedRow, setSelectedRow] = useState(null);


    const dataProcessed = useMemo(() => {
        const sortedData = data.sort((a, b) => {
            const aIsGewebe = a.Breite.includes("Gewebe");
            const bIsGewebe = b.Breite.includes("Gewebe");

            if (aIsGewebe && !bIsGewebe) return 1; // a в конец
            if (!aIsGewebe && bIsGewebe) return -1; // b в конец

            // Оба Gewebe или оба обычные — сортируем по числу
            const aNum = parseFloat(a.Breite.replace(/[^\d.,-]/g, "").replace(",", "."));
            const bNum = parseFloat(b.Breite.replace(/[^\d.,-]/g, "").replace(",", "."));

            return aNum - bNum;
        });

        const groupedData = sortedData.reduce((acc, item) => {
            const key = item.Breite;
            if (!acc.has(key)) {
                acc.set(key, []);
            }
            acc.get(key).push(item);
            return acc;
        }, new Map());

        return {
            rollenTotal: data.reduce((acc, cur) => {
                return acc + cur.Rollen
            }, 0),
            kgTotal: data.reduce((acc, cur) => {
                if(!Number.isNaN(parseFloat(cur['PaletteKG ']))) {
                    return acc + parseFloat(cur['PaletteKG '])
                }
                return acc;
            }, 0),
            data: groupedData
        }
    }, [data]);


    const getFormattedDate = () => {
        const now = new Date();

        const day = String(now.getDate()).padStart(2, '0');      // день с ведущим нулём
        const month = String(now.getMonth() + 1).padStart(2, '0'); // месяц с ведущим нулём (0-11 +1)
        const year = now.getFullYear();

        return  `${day}.${month}.${year}`;
    }

    const calculateValue = (data, value) => {
        const sum = data.reduce((sum, item) => {
            // Преобразуем строку в число, если поле пустое, используем 0
            const parsed = Number(item[value]) || 0;
            return sum + parsed;
        }, 0);

        return Number(sum).toLocaleString('de-DE')
    }


    const dataObject = Object.fromEntries(dataProcessed.data);
    console.log(dataObject);

    const handleAccordion = (index) => {
        if(selectedRow === index) {
            setSelectedRow(null)
        } else {
            setSelectedRow(index)
        }

    }

    const reloadPage = () => {
        window.location.reload();
    };

    return (
        <table className={classes.table}>
            <thead>
            <tr className={classes.top}>
                <th className={classes.bold}>Bestand</th>
                <th><button onClick={reloadPage} className={classes.button}>Erneuern</button></th>
                <th>{getFormattedDate()}</th>
                <th>Total:</th>
                <th>Rollen <span className={classes.bold}>{dataProcessed.rollenTotal}</span></th>
                <th>kg <span className={classes.bold}>{dataProcessed.kgTotal}</span></th>
            </tr>
            <tr className={classes.headers}>
                <th>Palette</th>
                <th>Rollen</th>
                <th>Rolle, №</th>
                <th>Breite, mm</th>
                <th>kg</th>
                <th>Laufmeter</th>
            </tr>
            </thead>
            <tbody>
            {Object.keys(dataObject).map((key, index) => (
                <React.Fragment key={index}>
                    <tr className={classes.row} onClick={() => handleAccordion(index)}>
                        <td className={classes.mainTitle}>
                            {
                                (key.includes("Gewebe") ? "Gewebe " : "") +
                                Number(key.replace(/[^\d.,-]/g, "").replace(",", ".") * 1000)
                                    .toLocaleString('de-DE') // форматирует с точкой как разделитель тысяч
                            }
                        </td>
                        <td className={classes.bold}>
                            {calculateValue(dataObject[key], "LaufmeterPalette")}
                        </td>
                        <td className={classes.bold}>
                            {calculateValue(dataObject[key], "PaletteKG ")}
                        </td>
                        <td className={classes.bold}>
                            {calculateValue(dataObject[key], "Rollen")}
                        </td>
                        <td className={classes.bold}>
                            {calculateValue(dataObject[key], "Palette ")}
                        </td>
                        <td>

                        </td>
                    </tr>
                    {selectedRow === index && (
                        <tr>
                            <td>ПАВАо</td>
                            <td>ПАВАо</td>
                            <td>ПАВАо</td>
                            <td>ПАВАо</td>
                            <td>ПАВАо</td>
                            <td>ПАВАо</td>
                        </tr>
                    )}
                </React.Fragment>
            ))}
            </tbody>
        </table>
    );
}

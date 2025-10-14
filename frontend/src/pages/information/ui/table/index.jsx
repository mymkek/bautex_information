import React, {useMemo, useState} from "react";
import classes from './table.module.css';

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

        return Number(sum)
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

    const getTotalRollen = () => {
        return Object.values(dataObject).reduce((acc, cur) => {
            return acc += cur.reduce((rAcc, rCur) => rAcc + rCur.Rollen, 0);
        }, 0);
    }

    const getTotalWeight = () => {
        const total = Object.values(dataObject).reduce((acc, cur) => {
            return acc += cur.reduce((rAcc, rCur) => {
                if(!isNaN(Number(rCur['PaletteKG ']))) {
                    return rAcc + Number(rCur['PaletteKG '])
                }
                return rAcc;
            }, 0);
        }, 0);

        return (total / 1000).toFixed(3)
    }

    const getSubrowContent = (subrow) => {
        const summary = {
            LaufmeterPalette: subrow.reduce((acc, cur) => {
                return acc + (Number(cur.LaufmeterPalette) / 1000)
            }, 0),
            PaletteKG: subrow.reduce((acc, cur) => {
                return acc + (Number(cur["PaletteKG "]) / 1000)
            }, 0),
            Rollen: subrow.reduce((acc, cur) => {
                return acc + Number(cur["Rollen"])
            }, 0)
        }
        return (
            <>
                {subrow.map(row => (
                    <>
                        <tr>
                            <td></td>
                            <td className={classes.bold}>
                                {(Number(row.LaufmeterPalette) / 1000).toFixed(3)}
                            </td>
                            <td className={classes.bold}>
                                {(Number(row["PaletteKG "]) / 1000).toFixed(3)}
                            </td>
                            <td className={classes.bold}>{row.detailed.length || '-'}</td>
                            <td className={classes.bold}>{row["Palette "]}</td>

                            <td></td>
                        </tr>
                        {row?.detailed?.map((detailed) => (
                            <tr>
                                <td></td>
                                <td>{detailed.LaufmeterRollen / 1000}</td>
                                <td>{detailed.RollenKG / 1000}</td>
                                <td>{detailed.NumbRollen}</td>
                                <td></td>
                                <td></td>

                            </tr>
                        ))}
                    </>
                ))}
                <tr className={`${classes.bold} ${classes.summary}`}>
                    <td>Summe</td>
                    <td>{summary.LaufmeterPalette.toFixed(3)}</td>
                    <td>{summary.PaletteKG.toFixed(3)}</td>
                    <td>{subrow.length}</td>
                    <td>{summary.Rollen}</td>
                    <td></td>
                </tr>
            </>
        )
    }

    return (
        <table className={classes.table}>
            <thead>
            <tr className={classes.top}>
                <th className={classes.bold}>Bestand</th>
                <th><button onClick={reloadPage} className={classes.button}>Erneuern</button></th>

                <th>Kg</th>
                <th>Rollen</th>
                <th>{getFormattedDate()}</th>
                <th style={{minWidth: 100}}></th>
            </tr>
            <tr className={classes.headers}>
                <th>Breite, mm</th>
                <th>Laufmeter</th>
                <th className={classes.bold}>{getTotalWeight()}</th>
                <th className={classes.bold}>{getTotalRollen()}</th>
                <th>Palette</th>

                <th></th>

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
                            {selectedRow !== index ? calculateValue(dataObject[key], "LaufmeterPalette") / 1000 : null}
                        </td>
                        <td className={classes.bold}>
                            {selectedRow !== index ? (calculateValue(dataObject[key], "PaletteKG ") / 1000).toFixed(3): null}
                        </td>
                        <td className={classes.bold}>
                            {selectedRow !== index ? calculateValue(dataObject[key], "Rollen"): null}
                        </td>
                        <td className={classes.bold}>
                            {selectedRow !== index ? calculateValue(dataObject[key], "Palette "): null}
                        </td>
                        <td>

                        </td>
                    </tr>
                    {selectedRow === index && getSubrowContent(dataObject[key])}
                </React.Fragment>
            ))}
            </tbody>
        </table>
    );
}

import React, {useMemo, useState, useEffect, useRef} from "react";
import classes from './table.module.css';
import {Logo} from "../../../../shared/ui/logo/logo.jsx";

export const Table = ({data}) => {

    const [selectedRow, setSelectedRow] = useState(null);
    const tableRef = useRef(null);
    const theadRef = useRef(null);


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
                if (!Number.isNaN(parseFloat(cur['PaletteKG ']))) {
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

        return `${day}.${month}.${year}`;
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


    const handleAccordion = (index) => {
        if (selectedRow === index) {
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



    const calculateSubrow = (subrow) => {
        return  {
            LaufmeterPalette: subrow.reduce((acc, cur) => {
                return acc + cur.detailed.reduce((_acc, _cur) => {
                    return _acc + (Number(_cur.LaufmeterRollen))
                }, 0)
            }, 0).toLocaleString('de-DE'),
            PaletteKG: subrow.reduce((acc, cur) => {
                return acc + cur.detailed.reduce((_acc, _cur) => {
                    return _acc + (Number(_cur.RollenKG))
                }, 0)
            }, 0),
            Rollen: subrow.reduce((acc, cur) => {
                return acc + Number(cur["Rollen"])
            }, 0)
        }
    }

    const getTotalWeight = () => {

        const total = Object.values(dataObject).reduce((acc, cur) => {
            return acc + calculateSubrow(cur).PaletteKG
        }, 0);

        return (total / 1000).toFixed(3)
    }

    const getSubrowContent = (subrow) => {

        return (
            <>
                {subrow.map(row => (
                    <>
                        <tr>
                            <td style={{minWidth: 96, maxWidth: 96}}></td>
                            <td></td>
                            <td className={classes.bold}>
                                {row?.detailed?.reduce((acc, cur) => {
                                    return acc + (Number(cur.LaufmeterRollen))
                                }, 0).toLocaleString('de-DE')}
                            </td>
                            <td className={classes.bold}>
                                {(Number(row["PaletteKG "])).toLocaleString('de-DE')}
                            </td>
                            <td className={classes.bold}>{row.detailed.length || '-'}</td>
                            <td className={classes.bold}>{row["Palette "]}</td>

                            <td className={classes.hiddenMobile}></td>
                        </tr>
                        {row?.detailed?.map((detailed) => (
                            <tr>
                                <td  style={{minWidth: 96, maxWidth: 96}}></td>
                                <td></td>
                                <td>{detailed.LaufmeterRollen.toLocaleString('de-DE')}</td>
                                <td>{detailed.RollenKG.toLocaleString('de-DE')}</td>
                                <td>{detailed.NumbRollen.toLocaleString('de-DE')}</td>

                                <td ></td>

                            </tr>
                        ))}
                    </>
                ))}
                <tr className={`${classes.bold} ${classes.summary}`}>
                    <td  style={{minWidth: 96, maxWidth: 96}}></td>
                    <td>Summe</td>

                    <td>{calculateSubrow(subrow).LaufmeterPalette.toLocaleString('de-DE')}</td>
                    <td>{calculateSubrow(subrow).PaletteKG.toLocaleString('de-DE')}</td>
                    <td>{calculateSubrow(subrow).Rollen.toLocaleString('de-DE')}</td>
                    <td>{subrow.length}</td>

                    <td className={classes.hiddenMobile}></td>

                </tr>
            </>
        )
    }

    useEffect(() => {
        const handleScroll = () => {
            if (!tableRef.current || !theadRef.current) return;

            // Проверяем, что экран мобильный (меньше 640px)
            if (window.innerWidth > 640) return;

            const tableRect = tableRef.current.getBoundingClientRect();
            const theadHeight = theadRef.current.offsetHeight;

            // Если конец таблицы находится выше или на уровне верхней границы viewport + высота thead
            if (tableRect.bottom <= theadHeight) {
                // Останавливаем thead в конце таблицы
                theadRef.current.style.position = 'absolute';
                theadRef.current.style.top = `${tableRef.current.scrollHeight - theadHeight}px`;
            } else if (tableRect.top < 0) {
                // Таблица ушла вверх, делаем thead sticky
                theadRef.current.style.position = 'sticky';
                theadRef.current.style.top = '0';
            } else {
                // Таблица полностью видна - обычное состояние
                theadRef.current.style.position = 'sticky';
                theadRef.current.style.top = '0';
            }
        };

        window.addEventListener('scroll', handleScroll);
        window.addEventListener('resize', handleScroll);
        handleScroll(); // Вызываем сразу для начальной проверки

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleScroll);
        };
    }, []);

    return (
        <>
            <div className={classes.mobileHeader}>
                <h1 className={classes.h1}>Kanaltex 86</h1>
                <Logo width={200} className={classes.mobileLogo}/>
            </div>
            <div className={classes.mobileDate}>{getFormattedDate()}</div>
            <table className={classes.table} ref={tableRef}>
                <thead className='scrollableHeaderMobile' >
                    <tr className={`${classes.hiddenMobile} ${classes.desktopHeader} `}>
                        <th colSpan={2} >
                            <h1 className={classes.h1}  style={{marginBottom: 20}}>
                                Kanaltex 86
                            </h1>
                        </th>
                        <th colSpan={4}>
                            <div className={`${classes.logoContainer} ${classes.hiddenMobile}`} style={{marginBottom: 20}}>
                                <Logo width={557} className={classes.logo}/>
                            </div>
                        </th>
                    </tr>
                    <tr className={classes.top}>
                        <th style={{minWidth: 96, maxWidth: 96}}></th>
                        <th className={classes.bold}>Bestand</th>
                        <th>
                            <button onClick={reloadPage} className={`${classes.button} ${classes.erneuernButton}`}>Erneuern</button>
                        </th>

                        <th>kg</th>
                        <th>Rollen</th>
                        <th ><span className={classes.hiddenMobile}>{getFormattedDate()}</span></th>
                        <th className={classes.hiddenMobile} style={{minWidth: 100}}></th>
                    </tr>
                    <tr className={classes.headers}>
                        <th style={{width: 96, maxWidth: 96}}></th>
                        <th>Breite, mm</th>
                        <th>Laufmeter</th>
                        <th className={classes.bold}>{getTotalWeight()}</th>
                        <th className={classes.bold}>{getTotalRollen()}</th>
                        <th>Palette</th>
                        <th className={classes.hiddenMobile}></th>
                    </tr>
                </thead>
                <tbody>
                {Object.keys(dataObject).map((key, index) => {
                    return (
                        <React.Fragment key={index}>

                            <tr className={classes.row} onClick={() => handleAccordion(index)}>
                                <td style={{width: 96, maxWidth: 96}}></td>
                                <td className={classes.mainTitle}>
                                    {
                                        (key.includes("Gewebe") ? "Gewebe " : "") +
                                        Number(key.replace(/[^\d.,-]/g, "").replace(",", ".") * 1000)
                                            .toLocaleString('de-DE')
                                    }
                                </td>
                                <td className={classes.bold}>
                                    {selectedRow !== index ? calculateSubrow(dataObject[key]).LaufmeterPalette.toLocaleString('de-DE') : null}
                                </td>
                                <td className={classes.bold}>
                                    {selectedRow !== index ? calculateSubrow(dataObject[key]).PaletteKG.toLocaleString('de-DE') : null}
                                </td>
                                <td className={classes.bold}>
                                    {selectedRow !== index ? calculateValue(dataObject[key], "Rollen") : null}
                                </td>
                                <td className={classes.bold}>
                                    {selectedRow !== index ? dataObject[key].length : null}
                                </td>
                                <td className={classes.hiddenMobile}>

                                </td>
                            </tr>
                            {selectedRow === index && getSubrowContent(dataObject[key])}
                        </React.Fragment>
                    )
                })}
                </tbody>
            </table>
        </>
    );
}

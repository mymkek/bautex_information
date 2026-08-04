import React, {useMemo, useState, useRef, useEffect} from "react";
import classes from './table.module.css';
import {Logo} from "../../../../shared/ui/logo/logo.jsx";
import {getFormattedDate} from "./utils.js";

export const Table = ({data}) => {

    const [selectedRow, setSelectedRow] = useState(null);
    const [shouldStick, setShouldStick] = useState(true);
    const rowRefs = useRef({});
    const summeRefs = useRef({});


    const dataProcessed = useMemo(() => {
        const sortedData = data.sort(compareByBreite);

        const groupedData = sortedData.reduce((acc, item) => {
            const key = item.Breite;
            if (!acc.has(key)) {
                acc.set(key, []);
            }
            acc.get(key).push(item);
            return acc;
        }, new Map());

        return Object.fromEntries(groupedData)
    }, [data]);

    // Ширина числового блока секции Unverpackt — по самому длинному значению в ней.
    // Общая ширина заголовка становится одинаковой, поэтому начала строк
    // и разряды чисел выстраиваются по одной вертикали.
    const unverpacktValueWidth = useMemo(() => {
        const lengths = Object.keys(dataProcessed)
            .map(createBreiteTitleParts)
            .filter(({category}) => category.key === "unverpackt")
            .map(({valueMm}) => valueMm.length);

        return lengths.length ? `${Math.max(...lengths)}ch` : undefined;
    }, [dataProcessed]);

    // Обычные секции выводятся одной строкой, Unverpackt — указатель + число.
    const renderBreiteTitle = (breite) => {
        const {category, label, valueMm} = createBreiteTitleParts(breite);

        if (category.key !== "unverpackt") {
            return createBreiteTitle(breite);
        }

        return (
            <span className={classes.unverpacktTitle}>
                <span>{label}</span>
                <span className={classes.unverpacktValue} style={{minWidth: unverpacktValueWidth}}>
                    {valueMm}
                </span>
            </span>
        );
    };

    const calculateValue = (data, value) => {
        const sum = data.reduce((sum, item) => {
            // Преобразуем строку в число, если поле пустое, используем 0
            const parsed = Number(item[value]) || 0;
            return sum + parsed;
        }, 0);

        return Number(sum)
    }


    const handleAccordion = (index) => {
        if (selectedRow === index) {
            setSelectedRow(null)
            setShouldStick(true);
        } else {
            setSelectedRow(index)
            setShouldStick(true);
        }

    }

    useEffect(() => {
        const handleScroll = () => {
            if (selectedRow === null) return;

            const rowElement = rowRefs.current[selectedRow];
            const summeElement = summeRefs.current[selectedRow];

            if (!rowElement || !summeElement) return;

            const rowRect = rowElement.getBoundingClientRect();
            const summeRect = summeElement.getBoundingClientRect();

            // Вычисляем позицию, где sticky строка должна остановиться
            // Это позиция Summe минус высота sticky строки и offset шапки
            const headerOffset = window.innerWidth <= 640 ? 60 : 100;
            const stopPosition = summeRect.top - rowRect.height - headerOffset;

            // Если строка Summe приближается к sticky строке, отключаем sticky
            if (stopPosition <= 0) {
                setShouldStick(false);
            } else {
                setShouldStick(true);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [selectedRow]);

    const reloadPage = () => {
        window.location.reload();
    };

    const getTotalRollen = () => {
        return Object.values(dataProcessed).reduce((acc, cur) => {
            return acc + cur.reduce((rAcc, rCur) => rAcc + rCur.Rollen, 0);
        }, 0);
    }

    const calculateSubrow = (subrow) => {
        return  {
            LaufmeterPalette: subrow.reduce((acc, cur) => {
                return acc + cur.detailed.reduce((_acc, _cur) => {
                    return _acc + (Number(_cur.LaufmeterRollen))
                }, 0)
            }, 0),
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

        const total = Object.values(dataProcessed).reduce((acc, cur) => {
            return acc + calculateSubrow(cur).PaletteKG
        }, 0);

        return (total / 1000).toFixed(3)
    }

    const getSubrowContent = (subrow, index) => (
        <>
            {subrow.map((row, rowIndex) => (
                <React.Fragment key={`subrow-${index}-${rowIndex}`}>
                    <tr>
                        <td  className={classes.hiddenMobile} style={{minWidth: 96, maxWidth: 96}}></td>
                        <td></td>
                        <td className={classes.bold}>
                            {formatNumber(row?.detailed?.reduce((acc, cur) => {
                                return acc + (Number(cur.LaufmeterRollen))
                            }, 0))}
                        </td>
                        <td className={classes.bold}>
                            {formatNumber(row["PaletteKG "])}
                        </td>
                        <td className={classes.bold}>{row.detailed.length || '-'}</td>
                        <td className={classes.bold}>{row["Palette "]}</td>

                        <td className={classes.hiddenMobile}></td>
                    </tr>
                    {row?.detailed?.map((detailed, detailedIndex) => (
                        <tr key={`detailed-${index}-${rowIndex}-${detailedIndex}`}>
                            <td  className={classes.hiddenMobile} style={{minWidth: 96, maxWidth: 96}}></td>
                            <td></td>
                            <td>{formatNumber(detailed.LaufmeterRollen)}</td>
                            <td>{formatNumber(detailed.RollenKG)}</td>
                            <td>{detailed.NumbRollen}</td>

                            <td ></td>

                        </tr>
                    ))}
                </React.Fragment>
            ))}
            <tr ref={el => summeRefs.current[index] = el} className={`${classes.bold} ${classes.summary}`}>
                <td  className={classes.hiddenMobile} style={{minWidth: 96, maxWidth: 96}}></td>
                <td>Summe</td>

                <td>{formatNumber(calculateSubrow(subrow).LaufmeterPalette)}</td>
                <td>{formatNumber(calculateSubrow(subrow).PaletteKG)}</td>
                <td>{formatNumber(calculateSubrow(subrow).Rollen)}</td>
                <td>{subrow.length}</td>

                <td className={classes.hiddenMobile}></td>
            </tr>
        </>
    )



    return (
        <>
            <div className={classes.mobileHeader}>
                <h1 className={classes.mobileh1}>Kanaltex 86</h1>
                <Logo width={200} className={classes.mobileLogo}/>
            </div>
            <div className={classes.mobileDate}>{getFormattedDate()}</div>
            <table className={classes.table}>
                <thead>
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
                </thead>
                <thead className='scrollableHeaderMobile' >

                    <tr className={classes.top}>
                        <th className={classes.hiddenMobile} style={{minWidth: 96, maxWidth: 96}}></th>
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
                        <th className={classes.hiddenMobile} style={{width: 96, maxWidth: 96}}></th>
                        <th>Breite, mm</th>
                        <th>Laufmeter</th>
                        <th className={classes.bold}>{getTotalWeight()}</th>
                        <th className={classes.bold}>{getTotalRollen()}</th>
                        <th>Palette</th>
                        <th className={classes.hiddenMobile}></th>
                    </tr>
                </thead>
                <tbody>
                {Object.keys(dataProcessed).map((key, index) => {
                    return (
                        <React.Fragment key={index}>
                            <tr
                                ref={el => rowRefs.current[index] = el}
                                className={`${classes.row} ${selectedRow === index && shouldStick ? classes.rowSticky : ''}`}
                                onClick={() => handleAccordion(index)}
                            >
                                <td className={classes.hiddenMobile} style={{minWidth: 96, maxWidth: 96}}></td>
                                <td className={classes.mainTitle}>
                                    {renderBreiteTitle(key)}
                                </td>
                                <td className={classes.bold}>
                                    {selectedRow !== index ? formatNumber(calculateSubrow(dataProcessed[key]).LaufmeterPalette) : null}
                                </td>
                                <td className={classes.bold}>
                                    {selectedRow !== index ? formatNumber(calculateSubrow(dataProcessed[key]).PaletteKG) : null}
                                </td>
                                <td className={classes.bold}>
                                    {selectedRow !== index ? calculateValue(dataProcessed[key], "Rollen") : null}
                                </td>
                                <td className={classes.bold}>
                                    {selectedRow !== index ? dataProcessed[key].length : null}
                                </td>
                                <td className={classes.hiddenMobile}>

                                </td>
                            </tr>
                            {selectedRow === index && getSubrowContent(dataProcessed[key], index)}
                        </React.Fragment>
                    )
                })}
                </tbody>
            </table>
        </>
    );
}

// Числа в таблице выводятся округлёнными до целых, разделитель разрядов — de-DE.
const formatNumber = (value) => Math.round(Number(value) || 0).toLocaleString("de-DE");

// --- Справочник типов строк по полю Breite ---
// order — приоритет группировки: чем больше, тем ниже секция в таблице.
// labelPrefix — указатель типа, который выводится перед значением ширины.
// test — предикат распознавания типа по строке Breite.
const BREITE_CATEGORIES = [
    { key: "gewebe", labelPrefix: "Gewebe ", order: 1, test: (breite) => breite.includes("Gewebe") },
    { key: "unverpackt", labelPrefix: "Unverpackt ", order: 2, test: (breite) => breite.includes("Unverpackt") },
];

// Обычная (verpackt) строка — без указателя, самая верхняя секция.
const DEFAULT_BREITE_CATEGORY = { key: "normal", labelPrefix: "", order: 0, test: () => true };

// Определяет категорию строки по полю Breite.
const resolveBreiteCategory = (breite = "") =>
    BREITE_CATEGORIES.find((category) => category.test(breite)) ?? DEFAULT_BREITE_CATEGORY;

// Достаёт числовое значение ширины из строки Breite (" Gewebe 2.52" -> 2.52).
const parseBreiteValue = (breite = "") =>
    parseFloat(breite.replace(/[^\d.,-]/g, "").replace(",", "."));

// --- Фабрика строк таблицы ---
// Собирает заголовок строки: указатель типа (Gewebe/Unverpackt) + ширина в мм.
const createBreiteTitle = (breite = "") => {
    const category = resolveBreiteCategory(breite);
    const valueMm = formatNumber(parseBreiteValue(breite) * 1000);
    return category.labelPrefix + valueMm;
};

// Разбирает Breite на указатель типа и ширину в мм по отдельности —
// нужно только для секции Unverpackt, которая рендерится двумя блоками.
const createBreiteTitleParts = (breite = "") => {
    const category = resolveBreiteCategory(breite);
    return {
        category,
        label: category.labelPrefix.trim(),
        valueMm: formatNumber(parseBreiteValue(breite) * 1000),
    };
};

// Сортировка: сначала по секции (normal -> Gewebe -> Unverpackt), затем по ширине.
const compareByBreite = (a, b) => {
    const aCategory = resolveBreiteCategory(a.Breite);
    const bCategory = resolveBreiteCategory(b.Breite);

    if (aCategory.order !== bCategory.order) {
        return aCategory.order - bCategory.order;
    }

    return parseBreiteValue(a.Breite) - parseBreiteValue(b.Breite);
};

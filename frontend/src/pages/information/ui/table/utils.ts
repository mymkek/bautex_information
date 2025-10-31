export const getFormattedDate = () => {
    const now = new Date();

    const day = String(now.getDate()).padStart(2, '0');      // день с ведущим нулём
    const month = String(now.getMonth() + 1).padStart(2, '0'); // месяц с ведущим нулём (0-11 +1)
    const year = now.getFullYear();

    return `${day}.${month}.${year}`;
}

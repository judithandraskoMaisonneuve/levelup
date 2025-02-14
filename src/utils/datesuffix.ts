export const getOrdinalSuffix = (day: number): string => {
    if (day >= 11 && day <= 13) return `${day}th`; // Special cases: 11th, 12th, 13th
    switch (day % 10) {
        case 1: return `${day}st`;
        case 2: return `${day}nd`;
        case 3: return `${day}rd`;
        default: return `${day}th`;
    }
};
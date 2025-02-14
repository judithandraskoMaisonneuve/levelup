export const palette = {
    main: "#efe2e2",
    secondary: "#fff9f0",
    text: "#15172b",

    orange: "#e88432",
    red: "#ef5454",
    blue: "#89e3f7",
    yellow: "#ffd166",
    green: "#8be36e",
    pink: "#ffb6c1",
};

export const applyPalette = () => {
    Object.entries(palette).forEach(([color, value]) => {
        document.documentElement.style.setProperty(`--${color}`, value);
    });
};

import {createTheme} from "@mui/material/styles";

export const bahisTheme = createTheme({
    palette: {
        mode: "light",
        primary: {
            main: "#8f241d",
            dark: "#5f1713",
            light: "#cf8278",
            contrastText: "#fff3df",
        },
        secondary: {
            main: "#ffd98a",
            dark: "#d99a28",
            light: "#ffe4a8",
            contrastText: "#5f1713",
        },
        background: {
            default: "#fff7ea",
            paper: "rgba(255, 250, 240, .84)",
        },
        text: {
            primary: "#4d3528",
            secondary: "#6d5547",
        },
        success: {
            main: "#285b33",
        },
        error: {
            main: "#8f241d",
        },
    },
    components: {
        MuiAppBar: {
            styleOverrides: {
                root: {
                    color: "#19110d",
                    background: "#fff3df",
                    boxShadow: "0 18px 46px rgba(95, 23, 19, .12)",
                },
            },
        },
    },
});

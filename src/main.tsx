import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.scss'
import {StoreProvider} from "./StoreProvider.tsx";
import {BrowserRouter} from "react-router";
import {config} from "./config.ts";
import {CssBaseline, ThemeProvider} from "@mui/material";
import {bahisTheme} from "./theme.ts";

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <ThemeProvider theme={bahisTheme}>
            <CssBaseline/>
            <StoreProvider>
                <BrowserRouter basename={config.baseUrl}>
                    <App/>
                </BrowserRouter>
            </StoreProvider>
        </ThemeProvider>
    </React.StrictMode>,
)

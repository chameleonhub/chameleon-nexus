import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.scss'
import {StoreProvider} from "./StoreProvider.tsx";
import {BrowserRouter} from "react-router";
import {config} from "./config.ts";

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <StoreProvider>
            <BrowserRouter basename={config.baseUrl}>
                <App/>
            </BrowserRouter>
        </StoreProvider>
    </React.StrictMode>,
)

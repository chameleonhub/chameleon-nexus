import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.scss'
import {StoreProvider} from "./StoreProvider.tsx";
import {BrowserRouter} from "react-router";

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <StoreProvider>
            <BrowserRouter basename="/static/frontend">
                <App/>
            </BrowserRouter>
        </StoreProvider>
    </React.StrictMode>,
)

import './App.scss'
import RootLayout from "./features/Layout.tsx";
import NotFound from "./features/NotFound.tsx";
import Dashboard from "./features/dashboard/Dashboard.tsx";
import {Routes, Route} from "react-router"

function App() {

    return (
        <>
            <Routes>
                <Route path="/" element={<RootLayout/>}/>
                <Route path="/dashboard" element={<Dashboard/>}/>
                <Route path="*" element={<NotFound/>}/>
            </Routes>

        </>
    )
}

export default App

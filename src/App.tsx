import './App.scss'
import RootLayout from "./features/Layout.tsx";
import NotFound from "./features/NotFound.tsx";
import Dashboard from "./features/dashboard/Dashboard.tsx";
import Summary from "./features/dashboard/Summary";
import User from "./features/users/User.tsx";
import {Permissions} from "./features/permissions/Permissions.tsx";
import DashboardLayout from "./features/dashboard/DashboardLayout.tsx";
import {Routes, Route} from "react-router"

function App() {

    return (
        <>
            <Routes>
                <Route path="/" element={<RootLayout/>}/>
                <Route path="/dash/home" element={
                    <DashboardLayout>
                        <Summary/>
                    </DashboardLayout>
                }/>
                <Route path="/dashboard" element={
                    <DashboardLayout>
                        <Dashboard/>
                    </DashboardLayout>
                }/>
                <Route path="/users" element={
                    <DashboardLayout>
                        <User/>
                    </DashboardLayout>
                }/>
                <Route path="/permissions" element={
                    <DashboardLayout>
                        <Permissions formId=""/>
                    </DashboardLayout>
                }/>
                <Route path="*" element={<NotFound/>}/>
            </Routes>

        </>
    )
}

export default App

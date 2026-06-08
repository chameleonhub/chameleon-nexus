import React from 'react';
import { Box } from '@mui/material';
import DashHead from './DashHead';
import Footer from "../footer/Footer.tsx";
import BackgroundMotifs from "../background/BackgroundMotifs.tsx";

interface DashboardLayoutProps {
    children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    return (
        <Box className="bahis-app" sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <BackgroundMotifs />
            <DashHead />
            <Box component="main" className="bahis-main" sx={{ flexGrow: 1 }}>
                {children}
            </Box>
            <Footer />
        </Box>
    );
};

export default DashboardLayout; 

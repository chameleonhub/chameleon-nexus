import React, { useState } from 'react';
import {
    AppBar,
    Box,
    Toolbar,
    Typography,
    Button,
    IconButton,
    Menu,
    MenuItem,
    Container,
    Tooltip,
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    Assessment as AssessmentIcon,
    People as PeopleIcon,
    Security as SecurityIcon,
    Description as DescriptionIcon,
    Menu as MenuIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router';
import Logo from "../../assets/logo.png";
import MotifStrip from "../background/MotifStrip";

const navigationItems = [
    {
        title: 'Forms',
        path: '/',
        icon: <DescriptionIcon />,
        description: 'Manage forms and permissions'
    },
    {
        title: 'Dashboard',
        path: '/dashboard',
        icon: <DashboardIcon />,
        description: 'View form data and analytics'
    },
    {
        title: 'Summary',
        path: '/dash/home',
        icon: <AssessmentIcon />,
        description: 'View dashboard summary'
    },
    {
        title: 'Users',
        path: '/users',
        icon: <PeopleIcon />,
        description: 'Manage users and groups'
    },
    {
        title: 'Permissions',
        path: '/permissions',
        icon: <SecurityIcon />,
        description: 'Manage user permissions'
    }
];

const DashHead: React.FC = () => {
    const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
    const navigate = useNavigate();
    const location = useLocation();

    const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElNav(event.currentTarget);
    };

    const handleCloseNavMenu = () => {
        setAnchorElNav(null);
    };

    const handleNavigation = (path: string) => {
        navigate(path);
        handleCloseNavMenu();
    };

    const isActiveRoute = (path: string) => {
        if (path === '/') {
            return location.pathname === '/';
        }
        return location.pathname.startsWith(path);
    };

    return (
        <AppBar position="static" elevation={0} className="bahis-header">
            <MotifStrip variant="header" />
            <Container maxWidth="xl">
                <Toolbar disableGutters>
                    <Box component='img' src={Logo} sx={{display: {xs: 'none', md: 'flex'}, mr: 1.25, height: '1.8rem'}}/>
                    <Typography
                        variant="h6"
                        noWrap
                        component="div"
                        sx={{
                            mr: 2,
                            display: { xs: 'none', md: 'flex' },
                            fontWeight: 900,
                            letterSpacing: '.14rem',
                            color: 'inherit',
                            textDecoration: 'none',
                        }}
                    >
                        BAHIS
                    </Typography>

                    <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
                        <IconButton
                            size="large"
                            aria-label="navigation menu"
                            aria-controls="menu-appbar"
                            aria-haspopup="true"
                            onClick={handleOpenNavMenu}
                            color="inherit"
                        >
                            <MenuIcon />
                        </IconButton>
                        <Menu
                            id="menu-appbar"
                            anchorEl={anchorElNav}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'left',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'left',
                            }}
                            open={Boolean(anchorElNav)}
                            onClose={handleCloseNavMenu}
                            sx={{
                                display: { xs: 'block', md: 'none' },
                                '& .MuiPaper-root': {
                                    minWidth: 200,
                                }
                            }}
                        >
                            {navigationItems.map((item) => (
                                <MenuItem 
                                    key={item.title} 
                                    onClick={() => handleNavigation(item.path)}
                                    sx={{
                                        backgroundColor: isActiveRoute(item.path) ? 'action.selected' : 'transparent',
                                        '&:hover': {
                                            backgroundColor: 'rgba(255, 217, 138, .28)',
                                        },
                                        borderLeft: isActiveRoute(item.path) ? '3px solid #8f241d' : '3px solid transparent',
                                        paddingLeft: 2,
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        {item.icon}
                                        <Box>
                                            <Typography variant="body1">{item.title}</Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {item.description}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </MenuItem>
                            ))}
                        </Menu>
                    </Box>

                    <Box component='img' src={Logo} sx={{display: {xs: 'flex', md: 'none'}, mr: 1, height: '1.7rem'}}/>
                    <Typography
                        variant="h5"
                        noWrap
                        component="div"
                        sx={{
                            mr: 2,
                            display: { xs: 'flex', md: 'none' },
                            flexGrow: 1,
                            fontWeight: 900,
                            letterSpacing: '.14rem',
                            color: 'inherit',
                            textDecoration: 'none',
                        }}
                    >
                        BAHIS
                    </Typography>

                    <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, gap: 1 }}>
                        {navigationItems.map((item) => (
                            <Tooltip key={item.title} title={item.description} arrow>
                                <Button
                                    onClick={() => handleNavigation(item.path)}
                                    sx={{
                                        my: 2,
                                        color: '#19110d',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 0.5,
                                        backgroundColor: isActiveRoute(item.path) ? 'rgba(255, 217, 138, .22)' : 'transparent',
                                        '&:hover': {
                                            backgroundColor: 'rgba(143, 36, 29, .08)',
                                        },
                                        borderRadius: 999,
                                        px: 2,
                                        py: 1,
                                        border: isActiveRoute(item.path) ? '1px solid rgba(143, 36, 29, .2)' : '1px solid transparent',
                                        transition: 'all 0.2s ease-in-out',
                                    }}
                                    startIcon={item.icon}
                                >
                                    {item.title}
                                </Button>
                            </Tooltip>
                        ))}
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
};

export default DashHead; 

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
    useTheme,
    useMediaQuery
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
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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
        <AppBar position="static" elevation={2}>
            <Container maxWidth="xl">
                <Toolbar disableGutters>
                    {/* Logo and Title */}
                    <Typography
                        variant="h6"
                        noWrap
                        component="div"
                        sx={{
                            mr: 2,
                            display: { xs: 'none', md: 'flex' },
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            letterSpacing: '.3rem',
                            color: 'inherit',
                            textDecoration: 'none',
                        }}
                    >
                        BAHIS DASH
                    </Typography>

                    {/* Mobile Menu */}
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
                                            backgroundColor: 'action.hover',
                                        },
                                        borderLeft: isActiveRoute(item.path) ? '3px solid #1976d2' : '3px solid transparent',
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

                    {/* Mobile Title */}
                    <Typography
                        variant="h5"
                        noWrap
                        component="div"
                        sx={{
                            mr: 2,
                            display: { xs: 'flex', md: 'none' },
                            flexGrow: 1,
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            letterSpacing: '.3rem',
                            color: 'inherit',
                            textDecoration: 'none',
                        }}
                    >
                        BAHIS
                    </Typography>

                    {/* Desktop Navigation */}
                    <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, gap: 1 }}>
                        {navigationItems.map((item) => (
                            <Tooltip key={item.title} title={item.description} arrow>
                                <Button
                                    onClick={() => handleNavigation(item.path)}
                                    sx={{
                                        my: 2,
                                        color: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 0.5,
                                        backgroundColor: isActiveRoute(item.path) ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                                        '&:hover': {
                                            backgroundColor: 'rgba(255, 255, 255, 0.15)',
                                        },
                                        borderRadius: 1,
                                        px: 2,
                                        py: 1,
                                        border: isActiveRoute(item.path) ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid transparent',
                                        transition: 'all 0.2s ease-in-out',
                                    }}
                                    startIcon={item.icon}
                                >
                                    {item.title}
                                </Button>
                            </Tooltip>
                        ))}
                    </Box>

                    {/* Right side content - can be extended with user menu, notifications, etc. */}
                    <Box sx={{ flexGrow: 0 }}>
                        {/* Add user menu, notifications, or other controls here */}
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
};

export default DashHead; 
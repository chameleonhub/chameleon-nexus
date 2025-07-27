import React from 'react';
import {Container, Typography, Button, Box} from '@mui/material';
import {useNavigate} from 'react-router';

const NotFound: React.FC = () => {
    const navigate = useNavigate();

    return (
        <Container
            maxWidth="sm"
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                textAlign: 'center',
            }}
        >
            <Box>
                <Typography variant="h1" color="primary" gutterBottom>
                    404
                </Typography>
                <Typography variant="h5" color="textSecondary" gutterBottom>
                    Oops! Page Not Found
                </Typography>
                <Typography variant="body1" color="textSecondary" sx={{mb: 4}}>
                    The page you're looking for doesn't exist or has been moved.
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => navigate('/')}
                    sx={{textTransform: 'none'}}
                >
                    Back to Home
                </Button>
            </Box>
        </Container>
    );
};

export default NotFound;
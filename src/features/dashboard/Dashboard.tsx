import React, {useState} from 'react';
import {Box, Autocomplete, TextField, Typography, CircularProgress, Paper} from '@mui/material';
import {styled} from '@mui/material/styles';
import {XForm} from "./xForm.model.ts";
import {useGetFormListQuery} from "./kcFormApiSlice.ts";

// Styled components for layout
const DashboardContainer = styled(Box)(({theme}) => ({
    display: 'flex',
    height: '100vh',
    padding: theme.spacing(2),
    gap: theme.spacing(2),
}));

const Sidebar = styled(Paper)(({theme}) => ({
    width: '30%',
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
}));

const MainContent = styled(Box)(({theme}) => ({
    flex: 1,
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.default,
}));


const Dashboard: React.FC = () => {
    const [selectedForm, setSelectedForm] = useState<XForm | null>(null);
    const {data: forms = [], error, isLoading} = useGetFormListQuery();

    return (
        <DashboardContainer>
            <Sidebar elevation={3}>
                <Typography variant="h6" gutterBottom>
                    Form List
                </Typography>
                {isLoading && <CircularProgress/>}
                {error && <Typography color="error">Error loading forms</Typography>}
                <Autocomplete
                    options={forms}
                    getOptionLabel={(form) => form.name}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Search Forms"
                            variant="outlined"
                            fullWidth
                        />
                    )}
                    renderOption={(props, form) => (
                        <li {...props}>
                            <Box>
                                <Typography variant="body1">{form.name}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {form.descriptionText}
                                </Typography>
                            </Box>
                        </li>
                    )}
                    onChange={(event, newValue) => setSelectedForm(newValue)}
                    sx={{mb: 2}}
                />
                {selectedForm && (
                    <Box>
                        <Typography variant="subtitle1">Selected Form Details:</Typography>
                        <Typography variant="body2">Form ID: {selectedForm.formID}</Typography>
                        <Typography variant="body2">Version: {selectedForm.version}</Typography>
                        <Typography variant="body2">
                            <a href={selectedForm.downloadUrl} target="_blank" rel="noopener noreferrer">
                                Download
                            </a>
                        </Typography>
                    </Box>
                )}
            </Sidebar>
            <MainContent>
                <Typography variant="h4">Dashboard</Typography>
                <Typography>Select a form from the dropdown to view details</Typography>
            </MainContent>
        </DashboardContainer>
    );
};

export default Dashboard;
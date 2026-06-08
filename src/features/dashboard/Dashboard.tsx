import React, { useState, useEffect } from 'react';
import { Box, Autocomplete, TextField, Typography, CircularProgress, Paper, Pagination } from '@mui/material';
import { styled } from '@mui/material/styles';
import { DataGrid } from '@mui/x-data-grid';
import { useGetFormDataQuery } from './kfApiSlice';
import { skipToken } from '@reduxjs/toolkit/query';
import { useGetFormsQuery } from './kcFormApiSlice';

const DashboardContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    minHeight: 'calc(100vh - 64px)',
    padding: theme.spacing(4, 3),
    gap: theme.spacing(2.5),
    [theme.breakpoints.down('md')]: {
        flexDirection: 'column',
        padding: theme.spacing(2),
    },
}));

const Sidebar = styled(Paper)(({ theme }) => ({
    width: '30%',
    minWidth: 320,
    padding: theme.spacing(3),
    [theme.breakpoints.down('md')]: {
        width: '100%',
        minWidth: 0,
    },
}));

const MainContent = styled(Box)(({ theme }) => ({
    flex: 1,
    padding: theme.spacing(3),
}));

const PAGE_SIZE = 10;

const Dashboard: React.FC = () => {
    const [page, setPage] = useState(1);
    const [selectedForm, setSelectedForm] = useState<any>(null);
    const [formSearch, setFormSearch] = useState('');
    const [formPage, setFormPage] = useState(1);

    // Fetch paginated forms
    const { data: forms, error: formsError, isLoading: formsLoading } = useGetFormsQuery();


    // Reset page to 1 when form changes
    useEffect(() => {
        setPage(1);
    }, [selectedForm]);

    // Fetch form data (submissions) for selected form
    const formId = selectedForm?.formID || selectedForm?.uid;
    const { data: formData, error: formDataError, isLoading: formDataLoading, refetch } = useGetFormDataQuery(
        formId ? { formId, limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE } : skipToken
    );
    const submissions: any[] = formData?.results || [];
    const submissionsCount = formData?.count || 0;

    useEffect(() => {
        if (formId) {
            refetch();
        }
    }, [selectedForm, formId, refetch]);


    // Generate columns for DataGrid based on first submission
    const columns = submissions[0]
        ? Object.keys(submissions[0]).map((key) => ({ field: key, headerName: key, flex: 1 }))
        : [];

    return (
        <DashboardContainer>
            <Sidebar elevation={3}>
                <Typography variant="h5" gutterBottom>
                    Form List
                </Typography>
                {formsLoading && <CircularProgress />}
                {formsError && <Typography color="error">Error loading forms</Typography>}
                <Autocomplete
                    options={forms}
                    getOptionLabel={(form: any) => form.name || form.uid}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Search Forms"
                            variant="outlined"
                            fullWidth
                            onChange={e => {
                                setFormSearch(e.target.value);
                                setFormPage(1);
                            }}
                        />
                    )}
                    renderOption={(props, form: any, index) => {
                        // Use a unique key: prefer form.formID, then form.uid, then form.name, then index
                        const uniqueKey = form.formID || form.uid || form.name || index;
                        const { key, ...rest } = props;
                        return (
                            <li key={uniqueKey} {...rest}>
                                <Box>
                                    <Typography variant="body1">{form.name}</Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {form.asset_type}
                                    </Typography>
                                </Box>
                            </li>
                        );
                    }}
                    onChange={(event, newValue) => {
                        setSelectedForm(newValue);
                    }}
                    sx={{ mb: 2 }}
                />
                {selectedForm && (
                    <Box mt={2}>
                        <Typography variant="subtitle1">Selected Form Details:</Typography>
                        <Typography variant="body2">Form ID: {selectedForm.formID || selectedForm.uid}</Typography>
                        <Typography variant="body2">Type: {selectedForm.asset_type}</Typography>
                        <Typography variant="body2">Created: {selectedForm.date_created}</Typography>
                    </Box>
                )}
            </Sidebar>
            <MainContent>
                <Typography variant="h4" gutterBottom>Dashboard</Typography>
                {selectedForm ? (
                    <>
                        <Typography variant="h6" gutterBottom>Form Data</Typography>
                        {formDataLoading && <CircularProgress />}
                        {formDataError && <Typography color="error">Error loading form data</Typography>}
                        <Box sx={{ height: 'auto', width: '100%' }}>
                            <DataGrid
                                rows={submissions.map((row, idx) => ({ id: row.id || idx, ...row }))}
                                columns={columns}
                                pageSizeOptions={[PAGE_SIZE]}
                                pagination
                                rowCount={submissionsCount}
                                paginationMode="server"
                                onPaginationModelChange={(model) => {
                                    if (model.page !== undefined) setPage(model.page + 1);
                                }}
                                paginationModel={{ page: page - 1, pageSize: PAGE_SIZE }}
                                loading={formDataLoading}
                                autoHeight={false}
                            />
                        </Box>
                        <Pagination
                            count={Math.ceil(submissionsCount / PAGE_SIZE)}
                            page={page}
                            onChange={(_, value) => setPage(value)}
                            sx={{ mt: 2 }}
                        />
                    </>
                ) : (
                    <Typography>Select a form from the dropdown to view details and data</Typography>
                )}
            </MainContent>
        </DashboardContainer>
    );
};

export default Dashboard;

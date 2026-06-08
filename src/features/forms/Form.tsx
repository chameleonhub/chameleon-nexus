import React, {useEffect, useState} from 'react';
import {Box, FormControl, InputLabel, MenuItem, Paper, Select, SelectChangeEvent, Typography} from "@mui/material";
import {useGetFormsQuery} from "./formApiSlice.ts";
import {Permissions} from "../permissions/Permissions.tsx";
import {setForms} from "./formSlice.ts";
import {useDispatch} from "react-redux";
import {FormType} from "./form.model.ts";
import ScrollToTopButton from './ScrollToTopButton.tsx';



function Form() {
    const [selectedFormId, setSelectedFormId] = useState('')
    const dispatch = useDispatch()


    // const formList: FormType[] = [] as FormType[]


    const {data: formsData} = useGetFormsQuery(null)
    const formList: FormType[] = formsData?.results || []
    // const formList: FormType[] = useMemo(() => formsData?.results, [formsData?.results])

    useEffect(() => {
        dispatch(setForms(formList))
    }, [dispatch, formList])

    const handleChange = (evt: SelectChangeEvent) => {
        setSelectedFormId(evt.target.value);
    }

    return (
        <main className="bahis-shell">
            <section className="bahis-hero">
                <span className="bahis-kicker">Access control</span>
                <Typography className="bahis-title" component="h1">
                    Manage BAHIS form permissions
                </Typography>
                <Typography className="bahis-copy">
                    Select a deployed form, assign permissions to users or Django groups, and save through Kobo's
                    permission system.
                </Typography>
            </section>

            <Paper sx={{p: {xs: 2.5, md: 3.5}, my: 3}}>
                <Box display="flex" flexDirection="column" gap={1}>
                    <Typography variant="h6">Select form</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Only deployed survey assets visible to your account are listed.
                    </Typography>
                    <FormControl fullWidth sx={{mt: 1.5}}>
                        <InputLabel id="form-list-label">Form List</InputLabel>
                        <Select
                            labelId="form-list-label"
                            label="Form List"
                            value={selectedFormId || ''}
                            onChange={handleChange}
                        >
                            {formList?.map((form) => (
                                <MenuItem key={form.uid || form.id}
                                          value={form.uid || form.id || ''}>{form.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>
            </Paper>
            <Permissions formId={selectedFormId}/>
            <ScrollToTopButton />
        </main>
    );
}

export default Form;

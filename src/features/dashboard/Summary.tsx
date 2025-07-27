import React, { useState, useMemo } from 'react';
import { useGetFormsQuery } from '../forms/formApiSlice';
import { useLazyGetFormDataQuery } from './kfApiSlice';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, CircularProgress, Box, Button
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs, { Dayjs } from 'dayjs';

const Summary: React.FC = () => {
  const { data: formsData, isLoading: formsLoading, error: formsError } = useGetFormsQuery(null);
  const forms = formsData?.results || [];
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [fetching, setFetching] = useState(false);
  const [summary, setSummary] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [trigger] = useLazyGetFormDataQuery();

  const handleFetch = async () => {
    setFetching(true);
    setError(null);
    if (!startDate || !endDate) {
      setError('Please select a date range.');
      setFetching(false);
      return;
    }
    try {
      const results: any[] = [];
      for (const form of forms) {
        // Fetch all submissions for this form in the date range (up to 1000 for demo)
        const { data } = await trigger({
          formId: form.uid,
          limit: 1000,
          offset: 0,
          start: startDate.format('YYYY-MM-DD'),
          end: endDate.format('YYYY-MM-DD'),
        }).unwrap();
        const submissions = data?.results || [];
        // Group by date
        const dateCounts: Record<string, number> = {};
        submissions.forEach((sub: any) => {
          const date = sub.date_created ? sub.date_created.slice(0, 10) : 'Unknown';
          dateCounts[date] = (dateCounts[date] || 0) + 1;
        });
        Object.entries(dateCounts).forEach(([date, count]) => {
          results.push({ formName: form.name, date, count });
        });
      }
      setSummary(results);
    } catch (e: any) {
      setError('Error fetching submission data.');
    }
    setFetching(false);
  };

  // Unique dates for table columns
  const uniqueDates = useMemo(() => {
    const set = new Set(summary.map((row) => row.date));
    return Array.from(set).sort();
  }, [summary]);

  // Group by form for table rows
  const formRows = useMemo(() => {
    const map: Record<string, Record<string, number>> = {};
    summary.forEach(({ formName, date, count }) => {
      if (!map[formName]) map[formName] = {};
      map[formName][date] = count;
    });
    return Object.entries(map);
  }, [summary]);

  return (
    <TableContainer component={Paper} sx={{ maxWidth: 1000, margin: '2rem auto', p: 2 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Form Submission Summary by Date
      </Typography>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2, gap: 2 }}>
          <DatePicker
            label="Start date"
            value={startDate}
            onChange={setStartDate}
          />
          <DatePicker
            label="End date"
            value={endDate}
            onChange={setEndDate}
          />
          <Button
            variant="contained"
            sx={{ ml: 2 }}
            onClick={handleFetch}
            disabled={fetching || formsLoading}
          >
            Filter
          </Button>
        </Box>
      </LocalizationProvider>
      {(formsLoading || fetching) && <CircularProgress sx={{ display: 'block', margin: '2rem auto' }} />}
      {(formsError || error) && <Typography color="error" align="center">{String(formsError || error)}</Typography>}
      {!formsLoading && !fetching && summary.length > 0 && (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Form Name</TableCell>
              {uniqueDates.map((date) => (
                <TableCell key={date} align="right">{date}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {formRows.map(([formName, dateMap]) => (
              <TableRow key={formName}>
                <TableCell>{formName}</TableCell>
                {uniqueDates.map((date) => (
                  <TableCell key={date} align="right">{dateMap[date] || 0}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      {!formsLoading && !fetching && summary.length === 0 && (
        <Typography align="center">No submissions found for the selected date range.</Typography>
      )}
    </TableContainer>
  );
};

export default Summary; 
import {Box, Container, Typography} from "@mui/material";
import MotifStrip from "../background/MotifStrip";

export default function Footer() {
    return (
        <Box component="footer" className="bahis-footer">
            <MotifStrip variant="footer" />
            <Container maxWidth="xl">
                <Typography variant="body2">
                    Developed by the Department of Livestock Services, Bangladesh Government, with support from FAO
                    Bangladesh ECTAD 2024.
                </Typography>
            </Container>
        </Box>
    );
}

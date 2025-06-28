import { useNavigate } from "react-router-dom";
import {
    Box, Typography, Grid, Card, CardActionArea, CardContent 
  } from "@mui/material";

function NavigateService() {
  const navigate = useNavigate();

  const handleSelect = (dashboard) => {
    if (dashboard === 1) navigate("/Dashboard");
    else navigate("/FineTuning");
  };

  return (
    <Box
    height="100vh"
    width="100vw"
    display="flex"
    justifyContent="center"
    alignItems="center"
    bgcolor="#f4f6f8"
  >
    <Box sx={{ maxWidth: 600, width: "100%", textAlign: "center", px: 2 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        Select a Service
      </Typography>

      <Grid container spacing={3} justifyContent="center">
        <Grid item xs={12} sm={6}>
          <Card
            sx={{
              borderRadius: 4,
              boxShadow: 4,
              transition: "0.3s",
              "&:hover": { transform: "scale(1.05)" },
            }}
          >
            <CardActionArea onClick={() => handleSelect(1)}>
              <CardContent>
                <Typography variant="h6" align="center">
                  RAG
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Card
            sx={{
              borderRadius: 4,
              boxShadow: 4,
              transition: "0.3s",
              "&:hover": { transform: "scale(1.05)" },
            }}
          >
            <CardActionArea onClick={() => handleSelect(2)}>
              <CardContent>
                <Typography variant="h6" align="center">
                  Fine Tuning Data Collection
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
      </Grid>
    </Box>
  </Box>
  );
}

export default NavigateService;

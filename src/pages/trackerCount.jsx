import React, { useState, useEffect } from "react";
import { Box, Typography} from "@mui/material";
import { useFinetuning } from "../context/fineTuningContext";
import { getFinetuningStats } from "../request/answerJson";

const TrackerCount  = () => {
  const [stats, setStats] = useState(0);
  const { outputOcr, setOutputOcr } = useFinetuning();

  useEffect(() => {
    const fetchStats = async () => {
        try {
            const response = await getFinetuningStats();
            console.log(response)
            setStats(response.total_count)
        } catch (error) {
            console.error("Error fetching stats:", error);
        }
    };
    fetchStats();
  }, []);


  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Typography variant="subtitle1">
          DataSet Size: <strong>{stats}</strong>
        </Typography>
      </Box>
    </Box>
  );
};
export default TrackerCount ;
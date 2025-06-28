import React, { useEffect, useState } from "react";
import {
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { getResourcesList, updatePdf, uploadPdf } from "../request/answerJson";

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [pdfBlob, setPdfBlob] = useState(null);
  const [extractedText, setExtractedText] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const docs = await getResourcesList();
      setData(docs);
    } catch (err) {
      console.error("Error fetching data", err);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setUploading(true);

    try {
      const text = await uploadPdf(file);
      setExtractedText(text);
      setPdfBlob(URL.createObjectURL(file));
      fetchData();
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setUploading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      await updatePdf(extractedText);
      alert("Update successful!");
    } catch (err) {
      console.error("Update failed", err);
      alert("Update failed!");
    }
  };

  return (
    <Box
      p={4}
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="100vh"
      width="100vw"
      bgcolor="#f4f6f8"
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">Upload PDF for RAG</Typography>
        <Tooltip title="Upload PDF">
          <IconButton color="primary" component="label">
            <UploadFileIcon />
            <input type="file" accept="application/pdf" hidden onChange={handleFileUpload} />
          </IconButton>
        </Tooltip>
      </Box>

      {uploading && <CircularProgress size={24} />}
      {pdfBlob && extractedText && (
        <Box>
          <Box display="flex" gap={2} justifyContent="center" mt={4}>
            <Paper sx={{ flex: 1, maxWidth: "50%", p: 2 }}>
              <Typography variant="h6" mb={1}>PDF Preview:</Typography>
              <embed src={pdfBlob} width="100%" height="400px" type="application/pdf" />
            </Paper>
            <Paper
              sx={{
                flex: 1,
                maxWidth: "50%",
                p: 2,
                overflowY: "auto",
                overflowX: "auto",
                maxHeight: "400px",
              }}
            >
              <Typography variant="h6" mb={1}>Extracted Text:</Typography>
              <Typography sx={{ whiteSpace: "pre-wrap" }}>{extractedText}</Typography>
            </Paper>
          </Box>
          <Box display="flex" justifyContent="flex-end" gap={2} mt={2} width="100%">
            <button
              onClick={() => {
                setPdfBlob(null);
                setExtractedText("");
              }}
              style={{
                padding: "8px 16px",
                backgroundColor: "#ccc",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Back
            </button>
            <button
              onClick={handleUpdate}
              style={{
                padding: "8px 16px",
                backgroundColor: "#1976d2",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Update
            </button>
          </Box>
        </Box>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Filename</TableCell>
              <TableCell>Date Uploaded</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.uuid}>
                <TableCell>{item.uuid}</TableCell>
                <TableCell>{item.resources_name}</TableCell>
                <TableCell>{item.timestamp}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Dashboard;

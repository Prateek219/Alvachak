import React, { useState, useEffect } from "react";
import { PlusCircle } from "lucide-react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  IconButton,
  Stack,
  Rating,
  TextField,
  CircularProgress,
  Tooltip,
  FormControl,
  InputLabel,
  Select
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import FeedbackEditor from "./TextEditor";
import { answerJson, saveHandwritingData } from "../request/answerJson";
import { useFinetuning } from "../context/fineTuningContext";
import { getAuth } from "firebase/auth";
import { FinetuningOcr } from "../context/initialState";
import { useNavigate } from "react-router-dom";
import TrackerCount from "./trackerCount";

const Finetuning = () => {
  const navigate = useNavigate();
  const { outputOcr, setOutputOcr } = useFinetuning();
  const [loading, setLoading] = useState(false);
  const [isPage1Expanded, setIsPage1Expanded] = useState(false);
  const [expandedImages, setExpandedImages] = useState({});

  const labels = {
    1: "Poor",
    2: "Average",
    3: "Good",
  };
  const [papers, setPapers] = useState([]);
  const [selectedPaper, setSelectedPaper] = useState('');

  useEffect(() => {
    const getPapers = async () => {
      const data = await fetchPaperTypes();
      setPapers(data);
    };
    getPapers();
  }, []);

  const handleChangePaper = (event) => {
    setSelectedPaper(event.target.value);
  };
  const [page1, setPage1] = useState(null);
  const [otherPages, setOtherPages] = useState([]);
  const [handwritingRating, setHandwritingRating] = useState(null);
  const [rows, setRows] = useState([
    { start: "", end: "", relatedText: "", feedback: "" },
  ]);

  const addRow = () => {
    setRows([...rows, { start: "", end: "", relatedText: "", feedback: "" }]);
  };

  const handlePage1Upload = (e) => {
    if (e.target.files[0]) {
      setPage1(e.target.files[0]); // Store the actual File object
    }
  };

  const handleOtherPageUpload = (e, index) => {
    const file = e.target.files[0];
    if (file) {
      const newPages = [...otherPages];
      newPages[index] = file; // Store the actual File object
      setOtherPages(newPages);
    }
  };

  const addNewPage = () => {
    setOtherPages([...otherPages, null]);
  };

  const deletePage = (index) => {
    const newPages = otherPages.filter((_, i) => i !== index);
    setOtherPages(newPages);
  };

  const handleMarksChange = (field) => (e) => {
    let value = e.target.value;
    if (field === 'total_marks') {
      // Allow only digits and a dot
      value = value.replace(/[^0-9.]/g, '');
      if (value === '.') {
        value = '0.';
      }
      const decimalCount = (value.match(/\./g) || []).length;
      if (decimalCount > 1) {
        const lastDotIndex = value.lastIndexOf('.');
        value = value.slice(0, lastDotIndex) + value.slice(lastDotIndex + 1);
      }
    } else {
      value = value.replace(/\D/g, '');
    }
  
    setOutputOcr(prev => ({
        ...prev,
        [field]: value === '' ? null : parseFloat(value)
    }));
  };

  const createImagePreview = (file) => {
    return URL.createObjectURL(file);
  };

  const handleSave = async () => {
    setLoading(true);
    const uploadedImages = [];

    if (page1) {
      uploadedImages.push(page1);
    }

    otherPages.forEach((page) => {
      if (page) {
        uploadedImages.push(page);
      }
    });

    if (uploadedImages.length === 0) {
      console.error("No images to upload");
      return;
    }

    try {
      const response = await answerJson(uploadedImages);
      console.log("Response from backend:", response);
      setOutputOcr({
        question: response.output.question || "",
        answer: response.output.answer || "",
        feedback: response.output.feedback || [],
        total_marks: response.output.total_marks || null,
        maximum_marks: response.output.maximum_marks || null,
        word_limit: response.output.word_limit || null,
      });
    } catch (error) {
      console.error("Error uploading images:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleHandwrtting = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      console.error("User not logged in");
      return;
    }

    const loginId = user.email;

    let handwritingString = "";
    if (handwritingRating === 1) {
      handwritingString = "Poor";
    } else if (handwritingRating === 2) {
      handwritingString = "Average";
    } else if (handwritingRating === 3) {
      handwritingString = "Good";
    } else {
      handwritingString = "Not rated";
    }

    const feedbackItems = outputOcr.feedback.map(item => ({
      concernedFeedback: item[0],
      relatedText: item[1]
    }));
  
    const updatedOutput = {
      question: outputOcr.question,
      answer: Array.isArray(outputOcr.answer)
        ? outputOcr.answer[0]?.text || ""
        : outputOcr.answer,
      feedback: feedbackItems,
      total_marks: parseFloat(outputOcr.total_marks),
      maximum_marks: parseFloat(outputOcr.maximum_marks),
      word_limit: parseFloat(outputOcr.word_limit),
      hand_writting_and_clarity: handwritingString,
      login_id: loginId,
    };
    
    setOutputOcr(updatedOutput);
    try {
      const response = await saveHandwritingData(updatedOutput);
      console.log("Data saved successfully!", response.data);
      setOutputOcr(FinetuningOcr);
      navigate("/NavigateService");
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };

  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };
  
  const toggleImageExpand = (index) => {
    setExpandedImages((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };
  
  return (
    <Box sx={{ 
      display: "flex", 
      justifyContent: "space-between",
      gap: 0,
      p: 0
    }}>
      <Box
        sx={{
          p: 1,
          minHeight: "100vh",
          width: "35%",
          backgroundColor: "#f5f7fa",
          borderRadius: 1,
          boxShadow: 1,
          overflowY: "auto",
          ml: 1
        }}
      >
        <Grid container justifyContent="center" direction="column" alignItems="center">
          <Grid item xs={12}>
            <Typography variant="h5" align="center" gutterBottom fontWeight="600">
              Upload Answer Images
            </Typography>

            {/* Page 1 Card */}
            <Card
              sx={{
                mb: 2,
                borderRadius: 2,
                boxShadow: 1,
                width: "100%",
              }}
            >
              <CardContent sx={{ p: 1 }}>
                <Typography variant="h6" gutterBottom>
                  Page 1 (Question & Answer Start)
                </Typography>
                <Box sx={{ mb: 1 }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePage1Upload}
                    style={{ marginBottom: "4px" }}
                  />
                </Box>
                {page1 && (
                  <Box sx={{ mt: 1 }}>
                    <Box
                      sx={{
                        position: "relative",
                        overflow: "visible",
                        height: "auto",
                      }}
                    >
                      <img
                        src={createImagePreview(page1)}
                        alt="Page 1 Preview"
                        style={{
                          maxWidth: isPage1Expanded ? "100%" : "80%",
                          borderRadius: 4,
                          border: "1px solid #ccc",
                          cursor: isPage1Expanded ? "zoom-out" : "zoom-in",
                          transition: "all 0.3s ease-in-out",
                          transformOrigin: "left top",
                        }}
                        onClick={() => setIsPage1Expanded(!isPage1Expanded)}
                      />
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Other Pages */}
            {otherPages.map((page, index) => (
              <Card
                key={index}
                sx={{
                  mb: 2,
                  borderRadius: 2,
                  boxShadow: 1,
                  width: "100%",
                }}
              >
                <CardContent sx={{ p: 1 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                    <Typography variant="h6">
                      Page {index + 2}
                    </Typography>
                    <Tooltip title="Delete this page">
                      <IconButton
                        onClick={() => deletePage(index)}
                        size="small"
                        sx={{
                          bgcolor: "#ffebee",
                          "&:hover": { bgcolor: "#fdecea" },
                        }}
                      >
                        <DeleteIcon fontSize="small" color="error" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Box sx={{ mb: 1 }}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleOtherPageUpload(e, index)}
                      style={{ marginBottom: "4px" }}
                    />
                  </Box>
                  {page && (
                    <Box sx={{ mt: 1 }}>
                      <Box
                        sx={{
                          position: "relative",
                          overflow: "visible",
                          height: "auto",
                        }}
                      >
                        <img
                          src={createImagePreview(page)}
                          alt={`Page ${index + 2} Preview`}
                          style={{
                            maxWidth: expandedImages[index] ? "100%" : "80%",
                            borderRadius: 4,
                            border: "1px solid #ccc",
                            cursor: expandedImages[index] ? "zoom-out" : "zoom-in",
                            transition: "all 0.3s ease-in-out",
                            transformOrigin: "left top",
                          }}
                          onClick={() => toggleImageExpand(index)}
                        />
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>
            ))}

            {/* Add New Page Button */}
            <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
              <Button
                variant="outlined"
                startIcon={<PlusCircle size={16} />}
                onClick={addNewPage}
                sx={{ 
                  borderRadius: 1, 
                  p: 1, 
                  borderColor: "#aaa",
                  borderStyle: "dashed",
                  "&:hover": {
                    borderColor: "#3f51b5",
                    backgroundColor: "#f0f4ff"
                  }
                }}
              >
                Add Page
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Middle Column - Feedback Editor */}
      <Box
        sx={{
          width: "45%",
          bgcolor: "white",
          borderRadius: 1,
          p: 1,
          boxShadow: 1,
          height: "fit-content",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
          mr: 0,
          ml: 0
        }}
      >
        <Typography variant="h6" gutterBottom sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>OCR Output (Human Review Required)</span>
          <TrackerCount />
        </Typography>
        
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" sx={{ flex: 1 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ flexGrow: 1 }}>
            <FeedbackEditor />
          </Box>
        )}
      </Box>

      {/* Right Column - Rating and Marks */}
      <Box
        sx={{
          width: "20%",
          backgroundColor: "#f5f7fa",
          borderRadius: 1,
          p: 1,
          boxShadow: 1,
          height: "fit-content",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column"
        }}
      >
        <Box>
          <Typography variant="h6" gutterBottom>
            Rate Handwriting
          </Typography>

          <Stack spacing={1} alignItems="center">
            <Rating
              name="handwriting-rating"
              max={3}
              value={handwritingRating}
              onChange={(event, newValue) => setHandwritingRating(newValue)}
              sx={{ gap: 2 }}
            />
            <Box display="flex" justifyContent="center" width="100%">
              {[1, 2, 3].map((value) => (
                <Box key={value} width="33.33%" textAlign="center">
                  <Typography variant="caption" sx={{ gap: 2 }}>
                    {labels[value]}
                  </Typography>
                </Box>
              ))}
            </Box>
            <Typography variant="body2" color="text.secondary">
              {handwritingRating === 1
                ? "Bad"
                : handwritingRating === 2
                ? "Average"
                : handwritingRating === 3
                ? "Good"
                : "Select a rating"}
            </Typography>

            <Button
              variant="contained"
              color="primary"
              onClick={handleSave}
              sx={{ mt: 1, width: "100%" }}
            >
              START REVIEW
            </Button>
          </Stack>
        </Box>

        <Box sx={{ mt: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleHandwrtting}
            sx={{ mt: 1, width: "100%" }}
          >
            Save
          </Button>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1,
            mt: 2,
            width: "100%"
          }}
        >
          <Typography variant="h6">Marks Alloted</Typography>

          <TextField
            label="Maximum Marks"
            variant="outlined"
            fullWidth
            value={outputOcr.maximum_marks}
            onChange={handleMarksChange('maximum_marks')}
            inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
            size="small"
          />

          <TextField
            label="Enter total marks awarded"
            variant="outlined"
            fullWidth
            value={outputOcr.total_marks}
            onChange={handleMarksChange('total_marks')}
            inputProps={{
              inputMode: "decimal",
              pattern: "[0-9]*(\\.[0-9]*)?",
            }}
            size="small"
          />
          
          <TextField
            label="Word Limit"
            variant="outlined"
            fullWidth
            value={outputOcr.word_limit}
            onChange={handleMarksChange('word_limit')}
            inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
            size="small"
          />
          <FormControl
            fullWidth
            variant="outlined"
            sx={{ minWidth: 240, marginTop: 2 }}
          >
            <InputLabel id="paper-select-label">Select Paper</InputLabel>
            <Select
              labelId="paper-select-label"
              id="paper-select"
              value={selectedPaper}
              onChange={handleChangePaper}
              label="Select Paper"
            >
              {papers.map((paper) => (
                <MenuItem key={paper} value={paper}>
                  {paper}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>
    </Box>
  );
};

export default Finetuning;
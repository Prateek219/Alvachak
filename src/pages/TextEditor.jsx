import React, { useRef, useState, useEffect } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Card,
  CardContent,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { useFinetuning } from "../context/fineTuningContext";

export default function FeedbackEditor() {
  const { outputOcr, setOutputOcr } = useFinetuning();
  const boxRef = useRef(null);
  const textFieldRef = useRef(null);
  const [selectionRange, setSelectionRange] = useState(null);
  const [open, setOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [feedbackList, setFeedbackList] = useState([]);
  const [rows, setRows] = useState([]);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [questionValue, setQuestionValue] = useState(outputOcr?.question || "");
  const [answerValue, setAnswerValue] = useState("");

  useEffect(() => {
    setQuestionValue(outputOcr?.question || "");
  }, [outputOcr?.question]);

  useEffect(() => {
    if (outputOcr?.answer[0]?.text) {
      const formatted = outputOcr.answer[0].text
        .replace(
          /\[(PARAGRAPH|HEADING|BULLET POINT TABLE|FLOWCHART|DIAGRAM)\]/g,
          "\n[$1]\n"
        )
        .trim();
      setAnswerValue(formatted);

      if (outputOcr.feedback?.length) {
        setFeedbackList(
          outputOcr.feedback.map((item) => ({
            start: 0,
            end: item[0].length,
            text: item[0],
            comment: item[1],
          }))
        );

        setRows(
          outputOcr.feedback.map((item) => ({
            relatedText: item[0],
            feedback: item[1],
          }))
        );
      }
    }
  }, [outputOcr]);

  const handleQuestionChange = (event) => {
    const newQuestion = event.target.value;
    setQuestionValue(newQuestion);
    setOutputOcr((prev) => ({
      ...prev,
      question: newQuestion,
    }));
  };

  const handleAnswerChange = (event) => {
    const newQuestion = event.target.value;
    setAnswerValue(newQuestion);
    setOutputOcr((prev) => ({
      ...prev,
      answer: newQuestion,
    }));
  };

  const handleContextMenu = (event) => {
    event.preventDefault();
    const selection = window.getSelection();
    const text = selection.toString();

    if (text) {
      setSelectionRange({ text });
      setMenuAnchor({ x: event.clientX, y: event.clientY });
    } else {
      setMenuAnchor(null);
    }
  };

  const handleMouseUp = (e) => {
    const selection = window.getSelection();
    const text = selection.toString();

    if (!text || selection.rangeCount === 0 || !textFieldRef.current) {
      setMenuAnchor(null);
      return;
    }

    const textarea = textFieldRef.current.querySelector("textarea");
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    setSelectionRange({ start, end, text });
    setMenuAnchor({ x: e.clientX, y: e.clientY });
  };

  const handleAddFeedback = () => {
    if (!selectionRange) return;

    const newFeedback = {
      start: selectionRange.start,
      end: selectionRange.end,
      text: selectionRange.text,
      comment,
    };

    const updatedFeedbackList = [...feedbackList, newFeedback];
    setFeedbackList(updatedFeedbackList);

    const updatedRows = [
      ...rows,
      {
        relatedText: selectionRange.text,
        feedback: comment,
      },
    ];
    setRows(updatedRows);

    const feedbackForAPI = updatedRows.map((row) => [
      row.relatedText,
      row.feedback,
    ]);
    setOutputOcr((prev) => ({
      ...prev,
      feedback: feedbackForAPI,
    }));

    setOpen(false);
    setComment("");
    setSelectionRange(null);
  };

  const handleAddEmptyFeedback = () => {
    const newFeedback = {
      start: 0,
      end: 0,
      text: "",
      comment: "",
    };

    const updatedFeedbackList = [...feedbackList, newFeedback];
    setFeedbackList(updatedFeedbackList);

    const updatedRows = [
      ...rows,
      {
        relatedText: "",
        feedback: "",
      },
    ];
    setRows(updatedRows);

    const feedbackForAPI = updatedRows.map((row) => [
      row.relatedText,
      row.feedback,
    ]);
    setOutputOcr((prev) => ({
      ...prev,
      feedback: feedbackForAPI,
    }));
  };

  const handleChange = (index, field) => (event) => {
    const newValue = event.target.value;

    const newRows = [...rows];
    newRows[index][field] = newValue;
    setRows(newRows);

    const newFeedbackList = [...feedbackList];
    if (field === "relatedText") {
      newFeedbackList[index].text = newValue;
    } else if (field === "feedback") {
      newFeedbackList[index].comment = newValue;
    }
    setFeedbackList(newFeedbackList);

    const feedbackForAPI = newRows.map((row) => [
      row.relatedText,
      row.feedback,
    ]);
    setOutputOcr((prev) => ({
      ...prev,
      feedback: feedbackForAPI,
    }));
  };

  const handleDelete = (index) => {
    const newRows = [...rows];
    newRows.splice(index, 1);
    setRows(newRows);

    const newFeedbackList = [...feedbackList];
    newFeedbackList.splice(index, 1);
    setFeedbackList(newFeedbackList);

    const feedbackForAPI = newRows.map((row) => [
      row.relatedText,
      row.feedback,
    ]);
    setOutputOcr((prev) => ({
      ...prev,
      feedback: feedbackForAPI,
    }));
  };

  return (
    <Box p={1} sx={{ width: "100%", margin: "0 auto" }}>
    <Card
      variant="outlined"
      sx={{ mb: 1.5, boxShadow: "0 1px 3px rgba(0,0,0,0.08)", width: "100%" }}
    >
      <CardContent sx={{ py: 1, "&:last-child": { pb: 1 } }}>
        <Typography
          variant="subtitle1"
          mb={0.5}
          sx={{ fontWeight: 600, color: "#2c3e50" }}
        >
          Question
        </Typography>

        <TextField
          value={questionValue}
          onChange={handleQuestionChange}
          inputRef={boxRef}
          multiline
          fullWidth
          size="small"
          minRows={1}
          variant="outlined"
          sx={{
            backgroundColor: "#f9f9f9",
            boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)",
            "& .MuiOutlinedInput-root": {
              borderRadius: 1,
              "&.Mui-focused": {
                borderColor: "#3f51b5",
                boxShadow: "0 0 0 2px rgba(63, 81, 181, 0.2)",
              },
            },
          }}
        />
      </CardContent>
    </Card>

    <Card
      variant="outlined"
      sx={{ mb: 1.5, boxShadow: "0 1px 3px rgba(0,0,0,0.08)", width: "100%" }}
    >
      <CardContent sx={{ py: 1, "&:last-child": { pb: 1 } }}>
        <Typography
          variant="subtitle1"
          mb={0.5}
          sx={{ fontWeight: 600, color: "#2c3e50" }}
        >
          Answer Editor{" "}
          <Typography component="span" variant="caption" color="text.secondary">
            (Select text to add feedback)
          </Typography>
        </Typography>

        <Box
          sx={{
            border: "1px solid #e0e0e0",
            p: 1,
            borderRadius: 1,
            backgroundColor: "#fafafa",
            boxShadow: "inset 0 1px 2px rgba(0,0,0,0.1)",
          }}
        >
          <TextField
            ref={textFieldRef}
            onMouseUp={handleMouseUp}
            multiline
            fullWidth
            minRows={6}
            value={answerValue}
            onChange={handleAnswerChange}
            variant="outlined"
            placeholder="Type your answer here..."
            sx={{
              fontFamily: "monospace",
              lineHeight: 1.4,
              "& .MuiOutlinedInput-root": {
                backgroundColor: "#fff",
              },
            }}
          />
        </Box>
      </CardContent>
    </Card>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: "0 8px 16px rgba(0,0,0,0.2)",
            minWidth: "400px",
          },
        }}
      >
        <DialogTitle
          sx={{
            backgroundColor: "#3f51b5",
            color: "white",
            fontWeight: 500,
          }}
        >
          Add Feedback
        </DialogTitle>
        <DialogContent sx={{ pt: 3, pb: 2 }}>
          <Typography variant="body1" gutterBottom sx={{ mb: 2 }}>
            Selected text:
          </Typography>
          <Paper
            elevation={0}
            variant="outlined"
            sx={{
              p: 2,
              mb: 3,
              backgroundColor: "#f5f7ff",
              borderColor: "#d0d9ff",
              maxHeight: "100px",
              overflow: "auto",
            }}
          >
            <Typography variant="body2" component="div">
              {selectionRange?.text}
            </Typography>
          </Paper>
          <TextField
            fullWidth
            multiline
            minRows={3}
            label="Your Feedback"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            variant="outlined"
            sx={{
              "& .MuiOutlinedInput-root": {
                "&:hover fieldset": {
                  borderColor: "#3f51b5",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#3f51b5",
                },
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setOpen(false)} sx={{ color: "#6c757d" }}>
            Cancel
          </Button>
          <Button
            onClick={handleAddFeedback}
            variant="contained"
            sx={{
              bgcolor: "#3f51b5",
              "&:hover": {
                bgcolor: "#303f9f",
              },
            }}
          >
            Add Feedback
          </Button>
        </DialogActions>
      </Dialog>

      <Card
        variant="outlined"
        sx={{ mb: 3, boxShadow: "0 2px 4px rgba(0,0,0,0.08)", width: "100%" }}
      >
        <CardContent>
          <Typography
            variant="h6"
            mb={2}
            sx={{
              fontWeight: 600,
              color: "#2c3e50",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span>Feedback Collection</span>
            <Box>
              <Tooltip title="Add empty feedback">
                <IconButton
                  color="primary"
                  size="small"
                  onClick={handleAddEmptyFeedback}
                  sx={{
                    ml: 1,
                    backgroundColor: "#e8eaf6",
                    "&:hover": {
                      backgroundColor: "#c5cae9",
                    },
                  }}
                >
                  <AddIcon />
                </IconButton>
              </Tooltip>
              {rows.length > 0 && (
                <Typography variant="body2" color="primary" component="span" sx={{ ml: 1 }}>
                  {rows.length} item{rows.length !== 1 ? "s" : ""} collected
                </Typography>
              )}
            </Box>
          </Typography>

          {rows.length === 0 ? (
            <Paper
              variant="outlined"
              sx={{
                p: 3,
                textAlign: "center",
                borderStyle: "dashed",
                borderColor: "#ccc",
                backgroundColor: "#fafafa",
              }}
            >
              <Typography color="text.secondary">
                No feedback collected yet. Select text in the editor above to
                add feedback or click the + button to add an empty entry.
              </Typography>
            </Paper>
          ) : (
            <Paper elevation={0} variant="outlined" sx={{ borderRadius: 1 }}>
              <Table sx={{ minWidth: 650, tableLayout: "fixed" }}>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                    <TableCell
                      width="40%"
                      sx={{
                        fontWeight: 600,
                        borderBottom: "2px solid #e0e0e0",
                      }}
                    >
                      Related Text
                    </TableCell>
                    <TableCell
                      width="40%"
                      sx={{
                        fontWeight: 600,
                        borderBottom: "2px solid #e0e0e0",
                      }}
                    >
                      Feedback
                    </TableCell>
                    <TableCell
                      width="20%"
                      align="center"
                      sx={{
                        fontWeight: 600,
                        borderBottom: "2px solid #e0e0e0",
                      }}
                    >
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row, index) => (
                    <TableRow
                      key={index}
                      sx={{
                        "&:nth-of-type(odd)": { backgroundColor: "#fafafa" },
                        "&:hover": { backgroundColor: "#f0f4ff" },
                      }}
                    >
                      <TableCell sx={{ verticalAlign: "top", p: 1 }}>
                        <TextField
                          value={row.relatedText}
                          onChange={handleChange(index, "relatedText")}
                          fullWidth
                          multiline
                          minRows={2}
                          placeholder="Related text here"
                          variant="outlined"
                          size="small"
                          sx={{
                            backgroundColor: "#ffffff",
                            "& .MuiOutlinedInput-root": {
                              "&:hover fieldset": {
                                borderColor: "#3f51b5",
                              },
                            },
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ verticalAlign: "top", p: 1 }}>
                        <TextField
                          value={row.feedback}
                          onChange={handleChange(index, "feedback")}
                          fullWidth
                          multiline
                          minRows={2}
                          placeholder="Feedback here"
                          variant="outlined"
                          size="small"
                          sx={{
                            backgroundColor: "#ffffff",
                            "& .MuiOutlinedInput-root": {
                              "&:hover fieldset": {
                                borderColor: "#3f51b5",
                              },
                            },
                          }}
                        />
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{ verticalAlign: "middle", p: 1 }}
                      >
                        <Button
                          variant="contained"
                          color="error"
                          onClick={() => handleDelete(index)}
                          startIcon={<DeleteIcon />}
                          sx={{
                            py: 0.5,
                            px: 1,
                            fontSize: "0.75rem",
                            "&:hover": {
                              backgroundColor: "#d32f2f",
                            },
                            whiteSpace: "nowrap",
                            zIndex: 10,
                            position: "relative"
                          }}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          )}
        </CardContent>
      </Card>

      <div onContextMenu={handleContextMenu} style={{ userSelect: "text" }}>
        <Menu
          open={Boolean(menuAnchor)}
          onClose={() => setMenuAnchor(null)}
          anchorReference="anchorPosition"
          anchorPosition={
            menuAnchor ? { top: menuAnchor.y, left: menuAnchor.x } : undefined
          }
          PaperProps={{
            sx: {
              borderRadius: 2,
              minWidth: 160,
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            },
          }}
        >
          <MenuItem
            onClick={() => {
              navigator.clipboard.writeText(selectionRange?.text || "");
              setMenuAnchor(null);
            }}
          >
            Copy
          </MenuItem>
          <MenuItem
            onClick={() => {
              setOpen(true);
              setMenuAnchor(null);
            }}
          >
            Add Feedback
          </MenuItem>
        </Menu>
      </div>
    </Box>
  );
}
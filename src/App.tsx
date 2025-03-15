import React, { useState } from "react";
import * as XLSX from "xlsx";
import { Container, Typography, Button, Box, Paper, Grid } from "@mui/material";
import { UploadFile, Visibility, Translate } from "@mui/icons-material";

interface Word {
    english: string;
    bangla: string;
}

const App: React.FC = () => {
    const [words, setWords] = useState<Word[]>([]);
    const [currentWord, setCurrentWord] = useState<{ word: string; translation: string } | null>(null);
    const [showTranslation, setShowTranslation] = useState(false);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: "array" });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1 });

            const wordList: Word[] = jsonData.slice(1).map((row) => ({
                english: row[0],
                bangla: row[1],
            })).filter(word => word.english && word.bangla);

            setWords(wordList);
            setCurrentWord(null);
            setShowTranslation(false);
        };
        reader.readAsArrayBuffer(file);
    };

    const showEnglishWord = () => {
        if (words.length === 0) return alert("Please upload a file first.");
        const randomIndex = Math.floor(Math.random() * words.length);
        const word = words[randomIndex];
        setCurrentWord({ word: word.english, translation: word.bangla });
        setShowTranslation(false);
    };

    const showBanglaWord = () => {
        if (words.length === 0) return alert("Please upload a file first.");
        const randomIndex = Math.floor(Math.random() * words.length);
        const word = words[randomIndex];
        setCurrentWord({ word: word.bangla, translation: word.english });
        setShowTranslation(false);
    };

    return (
        <Container maxWidth="sm" style={{ textAlign: "center", marginTop: "50px" }}>
            <Paper elevation={3} style={{ padding: "30px", borderRadius: "10px" }}>
                <Typography variant="h4" gutterBottom>
                    English to Bangla Trainer
                </Typography>

                <input
                    type="file"
                    accept=".xlsx"
                    onChange={handleFileUpload}
                    style={{ display: "none" }}
                    id="upload-file"
                />
                <label htmlFor="upload-file">
                    <Button
                        variant="contained"
                        color="primary"
                        component="span"
                        startIcon={<UploadFile />}
                        style={{ marginBottom: "20px" }}
                    >
                        Upload Excel File
                    </Button>
                </label>

                <Box mt={2} p={2} sx={{ bgcolor: "#f5f5f5", borderRadius: "10px" }}>
                    <Typography variant="h5" color="primary">
                        {currentWord ? currentWord.word : "Upload a file and select a word"}
                    </Typography>
                    {showTranslation && currentWord && (
                        <Typography variant="h6" color="secondary" mt={1}>
                            {currentWord.translation}
                        </Typography>
                    )}
                </Box>

                <Grid container spacing={2} mt={2}>
                    <Grid item xs={6}>
                        <Button
                            variant="contained"
                            color="secondary"
                            fullWidth
                            onClick={showEnglishWord}
                            startIcon={<Translate />}
                        >
                            Show English Word
                        </Button>
                    </Grid>
                    <Grid item xs={6}>
                        <Button
                            variant="contained"
                            color="secondary"
                            fullWidth
                            onClick={showBanglaWord}
                            startIcon={<Translate />}
                        >
                            Show Bangla Word
                        </Button>
                    </Grid>
                </Grid>

                <Button
                    variant="outlined"
                    color="secondary"
                    fullWidth
                    onClick={() => setShowTranslation(true)}
                    startIcon={<Visibility />}
                    disabled={!currentWord}
                    style={{ marginTop: "20px" }}
                >
                    Show Translation
                </Button>
            </Paper>
        </Container>
    );
};

export default App;

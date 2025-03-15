import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { Container, Typography, Button, Box, Paper, Grid, CircularProgress, Switch } from "@mui/material";
import { Visibility, Translate, Download } from "@mui/icons-material";

interface Word {
    english: string;
    bangla: string;
}

interface MissedWord {
    word: string;
    translation: string;
}

const App: React.FC = () => {
    const [words, setWords] = useState<Word[]>([]);
    const [currentWord, setCurrentWord] = useState<{ word: string; translation: string } | null>(null);
    const [showTranslation, setShowTranslation] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [missedWords, setMissedWords] = useState<MissedWord[]>([]);
    const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

    useEffect(() => {
        // Check for theme preference in localStorage
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme) {
            setIsDarkMode(savedTheme === "dark");
            document.documentElement.setAttribute("data-theme", savedTheme);
        } else {
            // Default to dark mode
            setIsDarkMode(true);
            document.documentElement.setAttribute("data-theme", "dark");
        }

        fetch("/Database/bangla_words.xlsx")
            .then((response) => response.arrayBuffer())
            .then((data) => {
                const workbook = XLSX.read(data, { type: "array" });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1 });

                const wordList: Word[] = jsonData.slice(1).map((row) => ({
                    english: row[0],
                    bangla: row[1],
                })).filter(word => word.english && word.bangla);

                setWords(wordList);
                setIsLoading(false);
            })
            .catch((error) => console.error("Error loading Excel file:", error));
    }, []);

    const toggleTheme = () => {
        const newTheme = isDarkMode ? "light" : "dark";
        setIsDarkMode(!isDarkMode);
        document.documentElement.setAttribute("data-theme", newTheme);
        localStorage.setItem("theme", newTheme); // Save theme preference in localStorage
    };

    const showEnglishWord = () => {
        if (words.length === 0) return;
        const randomIndex = Math.floor(Math.random() * words.length);
        const word = words[randomIndex];
        setCurrentWord({ word: word.english, translation: word.bangla });
        setShowTranslation(false);
    };

    const showBanglaWord = () => {
        if (words.length === 0) return;
        const randomIndex = Math.floor(Math.random() * words.length);
        const word = words[randomIndex];
        setCurrentWord({ word: word.bangla, translation: word.english });
        setShowTranslation(false);
    };

    const markAsMissed = () => {
        if (currentWord) {
            setMissedWords([
                ...missedWords,
                { word: currentWord.word, translation: currentWord.translation },
            ]);
            setCurrentWord(null); // Clear the current word
        }
    };

    const downloadMissedWords = () => {
        const ws = XLSX.utils.json_to_sheet(missedWords);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Missed Words");

        // Download the file
        XLSX.writeFile(wb, "missed_words.xlsx");
    };

    return (
        <Container maxWidth="sm" style={{ textAlign: "center", marginTop: "50px" }}>
            {/* Add CSS variable for the background color based on theme */}
            <Paper
                elevation={3}
                style={{
                    padding: "30px",
                    borderRadius: "10px",
                    backgroundColor: "var(--secondary-bg-color)" // Using the CSS variable for background color
                }}
            >
                {/* Heading with dynamic color based on theme */}
                <Typography
                    variant="h4"
                    gutterBottom
                    style={{
                        color: isDarkMode ? "white" : "black", // Set color based on theme
                    }}
                >
                    English to Bangla Trainer
                </Typography>

                {/* Dark Mode Toggle */}
                <Box display="flex" justifyContent="flex-end">
                    <Typography
                        style={{
                            color: isDarkMode ? "white" : "black", // Set color based on theme
                        }}
                    >
                        Dark Mode
                    </Typography>
                    <Switch checked={isDarkMode} onChange={toggleTheme} />
                </Box>

                <Box mt={2} p={2} sx={{
                    bgcolor: "var(--word-box-bg-color)", // Use CSS variable for background color
                    borderRadius: "10px",
                    minHeight: "100px",
                    display: "flex",
                    flexDirection: "column", // Stack word and translation vertically
                    justifyContent: "center",
                    alignItems: "center",
                }}>
                    {/* Display loading text while data is loading */}
                    {isLoading ? (
                        <CircularProgress />
                    ) : (
                        <>
                            <Typography variant="h5" color="primary" gutterBottom>
                                {currentWord ? currentWord.word : "Click a button to show a word"}
                            </Typography>
                            {showTranslation && currentWord && (
                                <Typography variant="h6" color="secondary" mt={1}>
                                    {currentWord.translation}
                                </Typography>
                            )}
                        </>
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

                {/* Mark missed word button */}
                <Button
                    variant="outlined"
                    color="error"
                    fullWidth
                    onClick={markAsMissed}
                    style={{ marginTop: "10px" }}
                >
                    Mark as Missed
                </Button>

                {/* Download missed words button */}
                {missedWords.length > 0 && (
                    <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        onClick={downloadMissedWords}
                        startIcon={<Download />}
                        style={{ marginTop: "20px" }}
                    >
                        Download Missed Words
                    </Button>
                )}
            </Paper>
        </Container>
    );
};

export default App;

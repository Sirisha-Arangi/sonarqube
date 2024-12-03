const express = require('express');
const multer = require('multer');
const axios = require('axios');
const { exec } = require('child_process');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });
const cors = require('cors');
app.use(cors());

// Replace with your SonarQube details
const SONARQUBE_URL = 'http://localhost:9000';  // SonarQube server URL
const SONARQUBE_TOKEN = 'sqa_e0f298468ece26062637a78f0d4c65d4cc4e2a72'; // SonarQube API token

// POST endpoint to upload code
app.post('/upload', upload.single('code'), (req, res) => {
    const projectKey = `project-${Date.now()}`;
    const sourcePath = path.join(__dirname, req.file.path);

    // Trigger SonarQube analysis
    exec(
        `sonar-scanner -Dsonar.projectKey=${projectKey} -Dsonar.sources=${sourcePath} -Dsonar.host.url=${SONARQUBE_URL} -Dsonar.login=${SONARQUBE_TOKEN}`,
        (error) => {
            if (error) {
                console.error(error);
                return res.status(500).json({ error: 'SonarQube analysis failed' });
            }
            res.json({ projectKey });
        }
    );
});

// GET endpoint to fetch results from SonarQube after analysis
app.get('/results/:projectKey', async (req, res) => {
    try {
        const response = await axios.get(
            `${SONARQUBE_URL}/api/project_analyses/search?project=${req.params.projectKey}`,
            {
                headers: {
                    Authorization: `Bearer ${SONARQUBE_TOKEN}`,
                },
            }
        );
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch analysis results' });
    }
});

// Start the backend server
const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});


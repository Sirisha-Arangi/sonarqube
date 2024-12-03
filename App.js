import React, { useState } from 'react';
import axios from 'axios';

function App() {
    const [file, setFile] = useState(null);
    const [projectKey, setProjectKey] = useState('');
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);

    // Handle file selection
    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    // Handle upload
    const handleUpload = async () => {
        if (!file) return;

        setLoading(true);
        const formData = new FormData();
        formData.append('code', file);

        try {
            // Upload file to the backend
            const uploadResponse = await axios.post('http://localhost:3001/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            const projectKey = uploadResponse.data.projectKey;
            setProjectKey(projectKey);

            // Poll SonarQube for results
            const fetchResults = async () => {
                const resultsResponse = await axios.get(
                    `http://localhost:3001/results/${projectKey}`
                );
                if (resultsResponse.data.analyses.length > 0) {
                    setResults(resultsResponse.data);
                    setLoading(false);
                } else {
                    setTimeout(fetchResults, 3000); // Retry in 3 seconds
                }
            };
            fetchResults();
        } catch (error) {
            console.error('Error uploading file or fetching results:', error);
            setLoading(false);
        }
    };

    return (
        <div>
            <h1>SonarQube Code Analysis</h1>
            <input type="file" onChange={handleFileChange} />
            <button onClick={handleUpload} disabled={loading}>
                {loading ? 'Uploading & Analyzing...' : 'Upload & Analyze'}
            </button>

            {results && (
                <div>
                    <h2>Analysis Results</h2>
                    <pre>{JSON.stringify(results, null, 2)}</pre>
                </div>
            )}
        </div>
    );
}

export default App;

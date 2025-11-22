const fs = require('fs');
const axios = require('axios');

// Path to results produced by Newman
const resultsPath = "E:/newman/newman-dd/results.json";

// Read newman results JSON file
let data;
try {
  data = JSON.parse(fs.readFileSync(resultsPath, "utf8"));
} catch (err) {
  console.error("ERROR: Failed reading results.json:", err.message);
  process.exit(1);
}

// Get API key from environment variable
const apiKey = process.env.DD_API_KEY;

if (!apiKey) {
  console.error("ERROR: Datadog API key missing. Set DD_API_KEY first.");
  process.exit(1);
}

// Use US5 logs endpoint
const DATADOG_URL = "https://http-intake.logs.us5.datadoghq.com/api/v2/logs";

axios.post(
  DATADOG_URL,
  [
    {
      ddsource: "newman",
      service: "postman-api-tests",
      message: "Newman Test Results",
      // include a small summary and the full payload as a field
      // to avoid extremely large single log entries you can slice or summarize if needed
      results: data
    }
  ],
  {
    headers: {
      "Content-Type": "application/json",
      "DD-API-KEY": apiKey
    },
    timeout: 15000
  }
)
.then(() => console.log("Logs sent successfully to Datadog!"))
.catch(err => {
  console.error("Error sending to Datadog:", err.response?.data || err.message || err);
});

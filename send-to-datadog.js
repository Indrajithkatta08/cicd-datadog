const fs = require('fs');
const axios = require('axios');

// Correct path (JSON)
const resultsPath = "results.json";

// Read newman results JSON file
let data;
try {
  data = JSON.parse(fs.readFileSync(resultsPath, "utf8"));
} catch (err) {
  console.error("ERROR: Failed reading results.json:", err.message);
  process.exit(1);
}

const apiKey = process.env.DD_API_KEY;

if (!apiKey) {
  console.error("ERROR: Datadog API key missing. Set DD_API_KEY.");
  process.exit(1);
}

const DATADOG_URL = "https://http-intake.logs.us5.datadoghq.com/api/v2/logs";

axios.post(
  DATADOG_URL,
  [
    {
      ddsource: "newman",
      service: "postman-api-tests",
      message: "Newman Test Results",
      results: data
    }
  ],
  {
    headers: {
      "Content-Type": "application/json",
      "DD-API-KEY": apiKey
    }
  }
)
.then(() => console.log("Logs sent successfully to Datadog!"))
.catch(err => {
  console.error("Error sending to Datadog:", err.response?.data || err.message);
});

const fs = require('fs');
const axios = require('axios');

// Path to results produced by Hoppscotch
const resultsPath = "results.json";

// Read results JSON
let data;
try {
  data = JSON.parse(fs.readFileSync(resultsPath, "utf8"));
} catch (err) {
  console.error("ERROR: Failed reading results.json:", err.message);
  process.exit(1);
}

// Get API key from environment
const apiKey = process.env.DD_API_KEY;

if (!apiKey) {
  console.error("ERROR: Datadog API key missing. Set DD_API_KEY first.");
  process.exit(1);
}

// US5 Datadog Logs endpoint
const DATADOG_URL = "https://http-intake.logs.us5.datadoghq.com/api/v2/logs";

axios.post(
  DATADOG_URL,
  [
    {
      ddsource: "hoppscotch",
      service: "api-tests",
      message: "Hoppscotch Test Results",
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

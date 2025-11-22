const fs = require('fs');
const axios = require('axios');

const resultsPath = "results.txt";

// Read the captured Hoppscotch output (TEXT)
let data;
try {
  data = fs.readFileSync(resultsPath, "utf8");
} catch (err) {
  console.error("ERROR: Failed reading results.txt:", err.message);
  process.exit(1);
}

// Get Datadog API key
const apiKey = process.env.DD_API_KEY;

if (!apiKey) {
  console.error("ERROR: Datadog API key missing.");
  process.exit(1);
}

const DATADOG_URL = "https://http-intake.logs.us5.datadoghq.com/api/v2/logs";

axios.post(
  DATADOG_URL,
  [
    {
      ddsource: "hoppscotch",
      service: "api-tests-hoppscotch",
      message: "Hoppscotch Test Results",
      test_output: data  // <-- plain text
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
  console.error("Error sending to Datadog:", err.response?.data || err.message);
});

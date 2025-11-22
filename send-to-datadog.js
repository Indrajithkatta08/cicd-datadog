const fs = require('fs');
const axios = require('axios');
const xml2js = require('xml2js');

// Path to Hoppscotch results
const resultsPath = "results.xml";

// Read XML
let xml;
try {
  xml = fs.readFileSync(resultsPath, "utf8");
} catch (err) {
  console.error("ERROR: Failed reading results.xml:", err.message);
  process.exit(1);
}

// Convert XML → JSON
let data;
xml2js.parseString(xml, { explicitArray: false }, (err, result) => {
  if (err) {
    console.error("ERROR: Failed parsing XML:", err.message);
    process.exit(1);
  }
  data = result;
});

// Get Datadog API key
const apiKey = process.env.DD_API_KEY;

if (!apiKey) {
  console.error("ERROR: Datadog API key missing. Set DD_API_KEY first.");
  process.exit(1);
}

const DATADOG_URL = "https://http-intake.logs.us5.datadoghq.com/api/v2/logs";

// Send to Datadog
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
    }
  }
)
.then(() => console.log("Logs sent successfully to Datadog!"))
.catch(err => {
  console.error("Error sending to Datadog:", err.response?.data || err.message || err);
});

const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const axios = require("axios");
const path = require("path");
const fs = require("fs"); // Added fs module import

// Configure middleware
app.use(bodyParser.urlencoded({ extended: false }));

// Configure JotForm API credentials
const jotformApiKey = "27f50030f5db987ecbf9f985f47076ec";
const jotformFormId = "231365209409051";
const jotformApiUrl = "https://api.jotform.com";

// Configure Callfire API credentials
const callFireUsername = "1956ac47dee2";
const callFirePassword = "db079bfb9bd610c4";
const callFireApiUrl = "https://api.callfire.com/v2";

// Function to get headers for Callfire API requests
function getHeaders() {
  const authHeader = `${callFireUsername}:${callFirePassword}`;
  const encodedAuthHeader = Buffer.from(authHeader).toString("base64");
  return {
    "Authorization": `Basic ${encodedAuthHeader}`,
    "Content-Type": "application/json",
  };
}

// Make a GET request with authentication headers
axios.get(callFireApiUrl + "/calls", { headers: getHeaders() })
  .then((response) => {
    // Handle the API response here
    console.log(response.data);
  })
  .catch((error) => {
    // Handle errors
    console.error(error);
  });

// Define route for the root URL
app.get("/", (req, res) => {
  res.send("Hello, Glitch!");
});

// Define route for JotForm form submission
app.post("/jotform-submission", upload.single("input_8"), async (req, res) => {
  // Log that the form submission is received
  console.log("Form submission received:", req.body);

  // Check if the file was received
  if (!req.file) {
    return res.status(400).json({ error: "Voicemail file is missing" });
  }

  // Extract form data from JotForm submission
  const areaCode = req.body["input_5_area"];
  const phoneNumber = req.body["input_5_phone"];
  const rvmDate = `${req.body["month_7"]}/${req.body["day_7"]}/${req.body["year_7"]}`;
  const rvmTime = `${req.body["hour_7"]}:${req.body["min_7"]} ${req.body["ampm_7"]}`;
  const quantity1RVMCalls = parseInt(req.body["input_17_1000"]);
  const quantity5RVMCalls = parseInt(req.body["input_17_1001"]);
  const quantity10RVMCalls = parseInt(req.body["input_17_1002"]);
  const quantity20RVMCalls = parseInt(req.body["input_17_1003"]);
  const quantity25RVMCalls = parseInt(req.body["input_17_1004"]);

  // Perform any necessary validation on the form data

  // Download and process the voicemail file
  const voicemailUrl = req.body["input_8"]; // Get the URL from the webhook data
  const voicemailFileName = `${Date.now()}_voicemail.mp3`; // Generate a unique file name
  const voicemailFilePath = path.join("uploads", voicemailFileName);

  try {
    await downloadAndProcessVoicemail(voicemailUrl, voicemailFilePath);

  // Call function to schedule RVM
  await sendOutboundCall(
      areaCode,
      phoneNumber,
      voicemailFilePath,
      rvmDate,
      rvmTime,
      quantity1RVMCalls,
      quantity5RVMCalls,
      quantity10RVMCalls,
      quantity20RVMCalls,
      quantity25RVMCalls
    );

    // Delete the voicemail file after processing
    fs.unlinkSync(voicemailFilePath);
    
    res.status(200).json({ message: "RVM scheduled successfully" });
  } catch (error) {
    // Handle errors that occur during voicemail processing or scheduling
  console.error("Failed to schedule RVM:", error);

  // Delete the voicemail file if an error occurs during processing or scheduling
  try {
    fs.unlinkSync(voicemailFilePath);
  } catch (unlinkError) {
    console.error("Failed to delete voicemail file:", unlinkError);
  }
    res.status(500).json({ error: "Failed to schedule RVM" });
  }
});

// Function to download and process the voicemail file
async function downloadAndProcessVoicemail(voicemailUrl, voicemailFilePath) {
  try {
    const response = await axios.get(voicemailUrl, { responseType: "stream" });
    const writer = fs.createWriteStream(voicemailFilePath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });
  } catch (error) {
    console.error("Failed to download voicemail file:", error);
    throw error;
  }
}

// Function to schedule RVM for Package 1
async function scheduleRVMForPackage1(payload) {
  try {
    const response = await axios.post(callFireApiUrl + "/calls", payload, {
      headers: getHeaders(),
    });
    console.log("RVM scheduled for Package 1:", response.data);
  } catch (error) {
    console.error("Failed to schedule RVM for Package 1:", error.message);
    throw error;
  }
}

// Function to schedule RVM for Package 5
async function scheduleRVMForPackage5(payload) {
  try {
    const response = await axios.post(callFireApiUrl + "/calls", payload, {
      headers: getHeaders(),
    });
    console.log("RVM scheduled for Package 5:", response.data);
  } catch (error) {
    console.error("Failed to schedule RVM for Package 5:", error.message);
    throw error;
  }
}

// Function to schedule RVM for Package 10
async function scheduleRVMForPackage10(payload) {
  try {
    const response = await axios.post(callFireApiUrl + "/calls", payload, {
      headers: getHeaders(),
    });
    console.log("RVM scheduled for Package 10:", response.data);
  } catch (error) {
    console.error("Failed to schedule RVM for Package 10:", error.message);
    throw error;
  }
}

// Function to schedule RVM for Package 20
async function scheduleRVMForPackage20(payload) {
  try {
    const response = await axios.post(callFireApiUrl + "/calls", payload, {
      headers: getHeaders(),
    });
    console.log("RVM scheduled for Package 20:", response.data);
  } catch (error) {
    console.error("Failed to schedule RVM for Package 20:", error.message);
    throw error;
  }
}

// Function to schedule RVM for Package 25
async function scheduleRVMForPackage25(payload) {
  try {
    const response = await axios.post(callFireApiUrl + "/calls", payload, {
      headers: getHeaders(),
    });
    console.log("RVM scheduled for Package 25:", response.data);
  } catch (error) {
    console.error("Failed to schedule RVM for Package 25:", error.message);
    throw error;
  }
}

// Function to schedule RVM based on the selected packages
async function sendOutboundCall(
  areaCode,
  phoneNumber,
  voicemailFilePath,
  rvmDate,
  rvmTime,
  quantity1RVMCalls,
  quantity5RVMCalls,
  quantity10RVMCalls,
  quantity20RVMCalls,
  quantity25RVMCalls
) {
  // Form the complete phone number in E.164 format
  const phone_number_with_area_code = `+1${areaCode}${phoneNumber}`;

  // Read and encode the uploaded voicemail file data to base64
  const fileData = fs.readFileSync(voicemailFilePath);
  const audio_url = "data:audio/mp3;base64," + fileData.toString("base64"); 

  // Use Axios to make API request to schedule RVM call
  const endpoint = `${callFireApiUrl}/calls`; // Replace with the actual API endpoint
  const url = endpoint;

  let payload = { 
    audio: audio_url,
    phoneNumber: phone_number_with_area_code, // The phone number in E.164 format to send the RVM
    customData: {
      name: "My Call",
      fromNumber: "1234567890",
      recipients: [
        {
          phoneNumber: "1234567891"
        }
      ],
      message: "This is my call message.",
      rvmDate: rvmDate,
      rvmTime: rvmTime,
    } 
 };

  // Schedule RVMs based on the selected packages and their quantities
  if (quantity1RVMCalls > 0) {
    // For Package 1, schedule only one RVM
    for (let i = 0; i < quantity1RVMCalls; i++) {
      await scheduleRVMForPackage1({ ...payload });
      console.log("RVM scheduled successfully for Package 1");
    }
  }

  if (quantity5RVMCalls > 0) {
    // For Package 5, schedule 5 RVMs
    for (let i = 0; i < quantity5RVMCalls; i++) {
      await scheduleRVMForPackage5({ ...payload });
      console.log("RVM scheduled successfully for Package 5");
    }
  }

  if (quantity10RVMCalls > 0) {
    // For Package 10, schedule 10 RVMs
    for (let i = 0; i < quantity10RVMCalls; i++) {
      await scheduleRVMForPackage10({ ...payload });
      console.log("RVM scheduled successfully for Package 10");
    }
  }

  if (quantity20RVMCalls > 0) {
    // For Package 20, schedule 20 RVMs
    for (let i = 0; i < quantity20RVMCalls; i++) {
      await scheduleRVMForPackage20({ ...payload });
      console.log("RVM scheduled successfully for Package 20");
    }
  }

  if (quantity25RVMCalls > 0) {
    // For Package 25, schedule 25 RVMs
    for (let i = 0; i < quantity25RVMCalls; i++) {
      await scheduleRVMForPackage25({ ...payload });
      console.log("RVM scheduled successfully for Package 25");
    }
  }

// Handle the case where no packages are selected
  if (
    quantity1RVMCalls === 0 &&
    quantity5RVMCalls === 0 &&
    quantity10RVMCalls === 0 &&
    quantity20RVMCalls === 0 &&
    quantity25RVMCalls === 0
  ) {
    console.log("No packages selected. No RVMs scheduled.");
  }
}

// Start the server
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

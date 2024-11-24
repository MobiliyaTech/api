const express = require("express");
const app = express();
const cors = require("cors");

const userRoutes = require("../api/V1/routes/userRoutes");
const frontendRoutes = require("../api/V1/routes/frontendRoutes");

const adminRoutes = require("../api/V1/routes/adminRoutes");
const counselorRoutes = require("../api/V1/routes/counselorRoutes");
const testRoutes = require("../api/V1/routes/adminRoutes");
const timeslotRoutes =require("../api/V1/routes/adminRoutes");
const bookingsRoutes = require("../api/V1/routes/adminRoutes");

// Set up middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cors());

// Set up API Base Url
const API_VERSION = process.env.API_VERSION;
let API_BASE_URL;
switch (process.env.ENVIRONMENT) {
  case "local":
    API_BASE_URL = process.env.API_BASE_URL_LOCAL;
    break;
  case "uat":
    API_BASE_URL = process.env.API_BASE_URL_UAT;
    break;
  case "spt":
    API_BASE_URL = process.env.API_BASE_URL_SPT;
    break;
  case "production":
    API_BASE_URL = process.env.API_BASE_URL_PRODUCTION;
    break;
  default:
    API_BASE_URL = process.env.API_BASE_URL_PRODUCTION;
}

// Set up routes
app.use(`/${API_VERSION}`, userRoutes);
app.use(`/${API_VERSION}/admin`, adminRoutes);
app.use(`/${API_VERSION}/counselor`, counselorRoutes);
app.use(`/${API_VERSION}/test`, testRoutes);
app.use(`/${API_VERSION}/time-slot`, timeslotRoutes);
app.use(`/${API_VERSION}/`, frontendRoutes);
app.use(`/${API_VERSION}/`, bookingsRoutes);

// Set up port
app.listen(process.env.PORT, () => {
  console.log(`Server is running on ${API_BASE_URL}`);
});

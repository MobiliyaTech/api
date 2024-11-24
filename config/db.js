const { Pool } = require("pg");
const dotenv = require('dotenv');
dotenv.config();

let pool;
switch (process.env.ENVIRONMENT) {
  case "local":
    pool = new Pool({
      user: "postgres",
      host: "localhost",
      database: "RectifyDB",
      password: "postgres",
      port: 5432,
    });
    break;
  case "uat":
  case "spt":
  case "production":
    pool = new Pool({
      user: "rectifyyou",
      host: "rds-rectifyyou.cxuuqosusoqs.ap-south-1.rds.amazonaws.com",
      database: "rds-rectifyyou",
      password: "rectifyDB24you",
      port: 5432,
      ssl: { rejectUnauthorized: true },
    });
    break;
  default:
    console.error("Invalid ENVIRONMENT specified in environment variables");
    process.exit(1);
}

// Check database connection
pool.connect((err, client, release) => {
  if (err) {
    console.error("Error connecting to the database:", err.stack);
    process.exit(1); // Exit if the database connection fails
  } else {
    console.log("Connected to the database successfully");
    release(); // Release the client back to the pool
  }
});

// Handle errors on idle clients
pool.on("error", (err) => {
  console.error("Unexpected error on idle client:", err);
  process.exit(-1);
});

module.exports = pool;

const express = require("express");
const cors = require("cors"); // Optional: for enabling CORS
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const app = express();
const routes = require("./routes");
const PORT = process.env.PORT || 5500; // Choose the port you want to use

// Middlewares
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? "https://mdnevaluacionexpress.netlify.app"
        : "http://localhost:5173",
    credentials: true,
  })
); // Enable CORS
app.use(express.json()); // Parse JSON bodies
app.use(cookieParser()); // Parse cookies
app.use(bodyParser.json()); // Parse JSON bodies
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(routes);

// Define a simple route
app.get("/", (req, res) => {
  res.send("Hello from Express!");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});

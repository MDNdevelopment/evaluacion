const express = require("express");
const cors = require("cors"); // Optional: for enabling CORS
const app = express();
const routes = require("./routes");
const PORT = process.env.PORT || 5500; // Choose the port you want to use

// Middleware
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON bodies
app.use(routes);

// Define a simple route
app.get("/", (req, res) => {
  res.send("Hello from Express!");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

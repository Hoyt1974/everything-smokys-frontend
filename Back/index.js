const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Endpoint to accept business data
app.post('/api/businesses', (req, res) => {
  const { name, description, location, email, url } = req.body;

  const imageUrl = req.body.imageUrl || ""; // fallback in case it's missing
  


  const slug = name.toLowerCase().replace(/\s+/g, '-');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 60); // 60-day trial

  const newBusiness = {
    name,
    slug,
    description,
    location,
    email,
    imageUrl,
    url, // ✅ add this
    createdAt: new Date().toISOString(),
    trialExpiresAt: expiresAt.toISOString()
  };
  

  const filePath = path.join(__dirname, 'businesses.json');
  let businesses = [];

  if (fs.existsSync(filePath)) {
    businesses = JSON.parse(fs.readFileSync(filePath));
  }

  businesses.push(newBusiness);
  fs.writeFileSync(filePath, JSON.stringify(businesses, null, 2));
  res.send(`
    <html>
      <head>
        <meta http-equiv="refresh" content="4; url=/businesses" />
        <style>
          body {
            font-family: Arial, sans-serif;
            text-align: center;
            padding: 100px 20px;
            background-color: #fff;
          }
          h2 {
            font-size: 2em;
            color: #333;
          }
          p {
            margin-top: 20px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <h2>Thanks, ${name} is now live on Everything Smokys! 🎉</h2>
        <p>Redirecting you to all businesses...</p>
      </body>
    </html>
  `);
  

  // res.send(`<h2>Thanks, ${name} is now live on Everything Smokys! 🎉</h2>`);
});
console.log("✅ Server starting... just before /businesses route");

// Endpoint to serve the business directory
app.get('/businesses', (req, res) => {
  try {
    const filePath = path.join(__dirname, 'businesses.json');
    console.log("📁 File path:", filePath);

    if (!fs.existsSync(filePath)) {
      console.log("📁 businesses.json does not exist");
      return res.send('<h2>No businesses have signed up yet.</h2>');
    }

    const businesses = JSON.parse(fs.readFileSync(filePath));
    console.log("✅ Parsed businesses.json");

    

    res.send(`
      <html>
        <head>
          <title>Local Business Directory | Everything Smokys</title>
          <link rel="stylesheet" href="/styles.css">
        </head>
        <body>
          <h1 style="text-align:center;">Business Directory</h1>
          // <ul>${businessList}</ul> 
          <ul>${businesses}</ul>

        </body>
      </html>
    `);
  } catch (error) {
    console.error('🔥 Error in /businesses route:', error);
    res.status(500).send('<h2>Something went wrong while loading businesses.</h2>');
  }
});

// Final line to start the server
app.listen(PORT, () => {
  console.log(`🔥 Backend running on http://localhost:${PORT}`);
});

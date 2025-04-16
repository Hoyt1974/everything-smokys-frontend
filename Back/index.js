const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors'); // <-- ADD THIS

const app = express();
const PORT = 3000;

app.use(cors()); // <-- AND THIS

const cors = require('cors');
app.use(cors());
// Middleware to serve static files
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Endpoint to accept business data
app.post('/api/businesses', (req, res) => {
  const { name, description, location, email, ImageUrl, url } = req.body;

  const imageUrl = req.body.imageUrl || ""; // fallback in case it's missing
  

  const slug = name.toLowerCase().replace(/\s+/g, '-');
  const createdAt = new Date();
  const expireAt = new Date();
  expireAt.setDate(createdAt.getDate() + 60); // 60-day trial
  
  const newBusiness = {
    name,
    slug,
    description,
    location,
    email,
    imageUrl: imageUrl || "",
    url,
    createdAt: createdAt.toISOString(),
    trialExpireAt: expireAt.toISOString()
  };
  

  const filePath = path.join(__dirname, 'businesses.json');
  let businesses = [];

  if (fs.existsSync(filePath)) {
    businesses = JSON.parse(fs.readFileSync(filePath));
  }

  businesses.push(newBusiness);
  fs.writeFileSync(filePath, JSON.stringify(businesses, null, 2));
  
  
  

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
    
    const businessList = businesses.map(biz => `
      <li>
        <a href="${biz.url}" target="_blank">${biz.name}</a>
        <img src="${biz.imageUrl}" alt="${biz.name} logo" class="thumb"/>
        <div class="biz-info">
          <h3>${biz.name}</h3>
          <p>${biz.description}</p>
        </div>
      </li>
    `).join('');
    
    

    

    res.send(`
      <html>
        <head>
          <title>Local Business Directory | Everything Smokys</title>
          <link rel="stylesheet" href="/styles.css">
        </head>
        <body>
          <h1 style="text-align:center;">Business Directory</h1>
          <ul>${businessList}</ul> 
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

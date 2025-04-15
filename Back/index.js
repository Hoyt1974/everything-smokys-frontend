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
  const { name, description, location, email, imageUrl, url } = req.body;
  const slug = name.toLowerCase().replace(/\s+/g, '-');
  const createdAt = new Date();
  const trialExpireAt = new Date(createdAt);
  trialExpireAt.setDate(trialExpireAt.getDate() + 60);

  const newBusiness = {
    name,
    slug,
    description,
    location,
    email,
    imageUrl: imageUrl || '',
    url,
    createdAt: createdAt.toISOString(),
    trialExpireAt: trialExpireAt.toISOString()
  };

  const filePath = path.join(__dirname, 'businesses.json');
  let businesses = [];

  if (fs.existsSync(filePath)) {
    businesses = JSON.parse(fs.readFileSync(filePath));
  }

  businesses.unshift(newBusiness);
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
});

// Endpoint to serve the business directory
app.get('/businesses', (req, res) => {
  try {
    const filePath = path.join(__dirname, 'businesses.json');
    if (!fs.existsSync(filePath)) {
      return res.send('<h2>No businesses have signed up yet.</h2>');
    }

    const businesses = JSON.parse(fs.readFileSync(filePath));
    const businessList = businesses.map(biz => `
      <li>
        <a href="${biz.url}" target="_blank">
          <img src="${biz.imageUrl}" alt="${biz.name} logo" class="thumb"/>
          <div class="biz-info">
            <h3>${biz.name}</h3>
            <p>${biz.description}</p>
          </div>
        </a>
      </li>
    `).join('');

    res.send(`
      <html>
        <head>
          <title>Local Business Directory | Everything Smokys</title>
          <link rel="stylesheet" href="/styles.css" />
        </head>
        <body>
          <h1 style="text-align:center;">Business Directory</h1>
          <ul>${businessList}</ul>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('❌ Error in /businesses route:', error);
    res.status(500).send('<h2>Something went wrong while loading businesses.</h2>');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});


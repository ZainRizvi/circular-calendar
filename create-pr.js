const https = require('https');

const options = {
  hostname: 'api.github.com',
  path: '/repos/ZainRizvi/circular-calendar/pulls',
  method: 'POST',
  headers: {
    'User-Agent': 'Node.js Script',
    'Content-Type': 'application/json',
    'Authorization': 'token YOUR_GITHUB_TOKEN' // Replace with your token
  }
};

const data = JSON.stringify({
  title: 'Add unit tests for library functions',
  body: 'This PR adds comprehensive unit tests for all exported functions and classes in the library files located in /app/src/lib/.\n\n- Tests for all classes in primitives.ts\n- Tests for functions and constants in month.ts\n- Additional tests for PathElement class in svg.ts\n- Fixed existing tests in svg.test.ts\n\nThe tests now also use real implementations where possible, and mock SVG.js only where necessary.',
  head: 'cursor/add-unit-tests-for-library-functions-d820',
  base: 'master'
});

const req = https.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  
  res.on('data', (chunk) => {
    console.log(JSON.parse(chunk));
  });
});

req.on('error', (e) => {
  console.error(`Error: ${e.message}`);
});

req.write(data);
req.end();
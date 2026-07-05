const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => {
    console.log(`BROWSER LOG: [${msg.type()}] ${msg.text()}`);
  });
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

  try {
    await page.goto('http://localhost:5173', { waitUntil: 'load', timeout: 5000 });
    await new Promise(r => setTimeout(r, 2000));
    const html = await page.$eval('#root', el => el.innerHTML);
    if (!html || html.trim() === '') {
      console.log('CRITICAL: #root is EMPTY! App crashed without error boundary!');
    } else {
      console.log('#root length:', html.length);
    }
  } catch (err) {
    console.log('Navigation Note:', err.message);
  }
  
  await browser.close();
})();

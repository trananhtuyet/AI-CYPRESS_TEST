#!/usr/bin/env node
// Quick debug script for website analyzer

require('dotenv').config();
const puppeteer = require('puppeteer');
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function test() {
    console.log('🔍 Testing Website Analyzer Setup...\n');

    // Check environment variables
    console.log('1️⃣  Environment Check:');
    console.log(`   - GEMINI_API_KEY: ${process.env.GEMINI_API_KEY ? '✅ SET' : '❌ MISSING'}`);
    console.log(`   - PORT: ${process.env.PORT || 3000}`);

    // Test GenAI initialization
    console.log('\n2️⃣  Google AI Initialization:');
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        console.log('   ✅ Google AI initialized successfully');
        
        // Test API call
        console.log('\n3️⃣  Testing Gemini API call...');
        const result = await model.generateContent('Say "Hello" in one word');
        console.log('   ✅ Gemini API responded:', result.response.text());
    } catch (error) {
        console.log('   ❌ Error:', error.message);
    }

    // Test Puppeteer
    console.log('\n4️⃣  Testing Puppeteer:');
    try {
        const browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        await page.goto('https://example.com', { timeout: 10000, waitUntil: 'domcontentloaded' });
        const title = await page.title();
        const html = await page.content();
        console.log(`   ✅ Puppeteer works - Page title: ${title}`);
        console.log(`   ✅ Content length: ${html.length} characters`);
        await browser.close();
    } catch (error) {
        console.log('   ❌ Error:', error.message);
    }

    console.log('\n✅ Debug test complete!');
}

test().catch(console.error);

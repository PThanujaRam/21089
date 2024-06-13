const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;
const WINDOW_SIZE = 10;
const TEST_SERVER_URL = "http://20.244.56.144/test";  
const API_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzE4MjYxNTU3LCJpYXQiOjE3MTgyNjEyNTcsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6ImI2MzlkM2QzLTY1YmEtNDczMy04MzBiLTgzNWZjNTdjNjc0MyIsInN1YiI6IjIxMDAwMzEwODljc2VoQGdtYWlsLmNvbSJ9LCJjb21wYW55TmFtZSI6IktMVW5pdmVyc2l0eSIsImNsaWVudElEIjoiYjYzOWQzZDMtNjViYS00NzMzLTgzMGItODM1ZmM1N2M2NzQzIiwiY2xpZW50U2VjcmV0IjoiSnpQeU9rT0xybVVrcXVoayIsIm93bmVyTmFtZSI6IlRoYW51amEgUmFtIFBhZGFsYSIsIm93bmVyRW1haWwiOiIyMTAwMDMxMDg5Y3NlaEBnbWFpbC5jb20iLCJyb2xsTm8iOiIyMTAwMDMxMDg5In0.ISBA6QAl37Hv2Ui2HPryM7y5wdGd5E08uAccHfUJwZ4";
let window = [];

const isPrime = (n) => {
    if (n <= 1) return false;
    if (n <= 3) return true;
    if (n % 2 === 0 || n % 3 === 0) return false;
    let i = 5;
    while (i * i <= n) {
        if (n % i === 0 || n % (i + 2) === 0) return false;
        i += 6;
    }
    return true;
};

const isFibonacci = (n) => {
    if (n < 0) return false;
    const isPerfectSquare = (x) => {
        const s = Math.floor(Math.sqrt(x));
        return s * s === x;
    };
    const x1 = 5 * n * n + 4;
    const x2 = 5 * n * n - 4;
    return isPerfectSquare(x1) || isPerfectSquare(x2);
};

const isEven = (n) => n % 2 === 0;

const getNumbersFromTestServer = async () => {
    try {
        const response = await axios.get(TEST_SERVER_URL, {
            headers: { 'Authorization': `Bearer ${API_TOKEN}` },
            timeout: 500
        });
        return response.data;
    } catch (error) {
        return [];
    }
};

const filterAndStoreNumbers = (numbers, numberType) => {
    const filteredNumbers = [];

    for (const number of numbers) {
        if (numberType === 'p' && isPrime(number)) {
            filteredNumbers.push(number);
        } else if (numberType === 'f' && isFibonacci(number)) {
            filteredNumbers.push(number);
        } else if (numberType === 'e' && isEven(number)) {
            filteredNumbers.push(number);
        } else if (numberType === 'r') {
            filteredNumbers.push(number);
        }
    }


    const uniqueNumbers = Array.from(new Set(filteredNumbers));


    const prevWindow = [...window];
    window = [...window, ...uniqueNumbers].slice(-WINDOW_SIZE);

    return { prevWindow, currentWindow: window };
};

app.get('/numbers/:numberid', async (req, res) => {
    const start = Date.now();

    const numberid = req.params.numberid;
    const numbers = await getNumbersFromTestServer();
    const { prevWindow, currentWindow } = filterAndStoreNumbers(numbers, numberid);

    const avg = currentWindow.length ? (currentWindow.reduce((sum, num) => sum + num, 0) / currentWindow.length).toFixed(2) : 0;

    
    if (Date.now() - start > 500) {
        return res.status(500).json({ error: "Request took too long" });
    }

    res.json({
        numbers: numbers,
        windowPrevState: prevWindow,
        windowCurrState: currentWindow,
        avg: parseFloat(avg)
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

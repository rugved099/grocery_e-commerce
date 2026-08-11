// backend/controllers/price.controller.js

const axios = require('axios');

// Predefined mock prices for fallback when API key is missing or API call fails
const MOCK_VEGETABLE_PRICES = {
    tomato: 35.0,
    potato: 25.0,
    onion: 30.0,
    spinach: 20.0,
    carrot: 40.0,
    cabbage: 25.0,
    cauliflower: 35.0,
    okra: 45.0,
    brinjal: 30.0,
    cucumber: 20.0,
    peas: 50.0,
    garlic: 120.0,
    ginger: 80.0
};

exports.getNationalAveragePrice = async (req, res) => {
    const vegetableName = req.params.vegetableName || '';
    const apiKey = process.env.DATA_GOV_API_KEY;

    // Helper to get fallback price
    const getFallbackPrice = () => {
        const key = vegetableName.toLowerCase();
        if (MOCK_VEGETABLE_PRICES[key]) {
            return MOCK_VEGETABLE_PRICES[key];
        }
        // Return a reasonable fallback price if vegetable is unknown
        return 40.0;
    };

    // If API key is not configured, immediately use fallback
    if (!apiKey) {
        console.log(`DATA_GOV_API_KEY not configured. Using fallback price for ${vegetableName}.`);
        return res.json({
            vegetable: vegetableName,
            nationalAverage: getFallbackPrice().toFixed(2),
            isMock: true
        });
    }

    try {
        const externalApiUrl = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${apiKey}&format=json&limit=500`;

        const response = await axios.get(externalApiUrl);
        const data = response.data;

        if (!data || !data.records) {
            throw new Error("Invalid API response format");
        }

        // Let's find all records that match our vegetable name.
        const matchingRecords = data.records.filter(record => 
            record.commodity && record.commodity.toLowerCase() === vegetableName.toLowerCase()
        );

        if (matchingRecords.length === 0) {
            console.log(`No national price data found for ${vegetableName} from API. Using fallback.`);
            return res.json({
                vegetable: vegetableName,
                nationalAverage: getFallbackPrice().toFixed(2),
                isMock: true
            });
        }

        // Calculate the average of the "modal_price" (most common price)
        const prices = matchingRecords.map(record => parseFloat(record.modal_price)).filter(price => !isNaN(price) && price > 0);
        
        if (prices.length === 0) {
            console.log(`No valid price entries found for ${vegetableName} from API. Using fallback.`);
            return res.json({
                vegetable: vegetableName,
                nationalAverage: getFallbackPrice().toFixed(2),
                isMock: true
            });
        }
        
        const sum = prices.reduce((acc, price) => acc + price, 0);
        const averagePrice = sum / prices.length;

        // The prices from the API are often per Quintal (100kg). We must convert to per Kg.
        const averagePricePerKg = averagePrice / 100;

        res.json({
            vegetable: vegetableName,
            nationalAverage: averagePricePerKg.toFixed(2)
        });

    } catch (error) {
        console.error("Price Controller Error, falling back to mock price:", error.message);
        res.json({
            vegetable: vegetableName,
            nationalAverage: getFallbackPrice().toFixed(2),
            isMock: true
        });
    }
};
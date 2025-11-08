// backend/controllers/price.controller.js

const axios = require('axios');

exports.getNationalAveragePrice = async (req, res) => {
    try {
        const vegetableName = req.params.vegetableName;
        const apiKey = process.env.DATA_GOV_API_KEY;

        // The specific API endpoint from data.gov.in. This may vary.
        const externalApiUrl = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${apiKey}&format=json&limit=500`;

        const response = await axios.get(externalApiUrl);
        const data = response.data;

        // The data from this API is complex. We need to process it.
        // Let's find all records that match our vegetable name.
        const matchingRecords = data.records.filter(record => 
            record.commodity.toLowerCase() === vegetableName.toLowerCase()
        );

        if (matchingRecords.length === 0) {
            return res.status(404).json({ msg: `No national price data found for ${vegetableName}` });
        }

        // Calculate the average of the "modal_price" (most common price)
        const prices = matchingRecords.map(record => parseFloat(record.modal_price)).filter(price => !isNaN(price) && price > 0);
        
        if (prices.length === 0) {
            return res.status(404).json({ msg: `No valid price entries found for ${vegetableName}` });
        }
        
        const sum = prices.reduce((acc, price) => acc + price, 0);
        const averagePrice = sum / prices.length;

        // The prices from the API are often per Quintal (100kg). We must convert to per Kg.
        const averagePricePerKg = averagePrice / 100;

        // Send a simple, clean response back to our frontend
        res.json({
            vegetable: vegetableName,
            nationalAverage: averagePricePerKg.toFixed(2)
        });

    // NEW, CORRECTED CODE
} catch (error) {
    console.error("Price Controller Error:", error);
    res.status(500).json({ msg: "Could not retrieve national price data." });
}
};
const fetch    = require('node-fetch');

// retrieve comppany profile from IEX API
const getData = async (symbol) => {
    
    let url  = 'https://cloud.iexapis.com/';
        url += process.env.IEXCLOUD_API_VERSION;
        url += '/stock/' +symbol+ '/company?token=';
        url += process.env.IEXCLOUD_PUBLIC_KEY
    
    try {
        const response = await fetch(url);
        const data     = await response.text();
        if (data == 'Unknown symbol') {
            return false;
        } else {
            return JSON.parse(data);
        }

    } catch (error) {
        console.log(error);
    }
};

module.exports = getData;

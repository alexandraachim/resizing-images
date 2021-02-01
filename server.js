const { getApp } = require('./app');
const port = 3000;

getApp().listen(port, () => {
    console.log(`App running on port ${port}`);
});


// const express = require('express');
// const app = express();


// app.get('/', (req,res)={

// })
// app.listen(8080)

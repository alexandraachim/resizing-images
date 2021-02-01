const { getApp } = require('./app');
const port = 3000;

getApp().listen(port, () => {
    console.log(`App running on port ${port}`);
});

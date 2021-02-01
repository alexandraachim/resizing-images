const multer = require('multer');
const express = require('express');

const fs = require('fs');
const resizingImage = require('./helpers/resize')
const root = process.cwd()
console.log({root});
const imputDir = `${root}/input`

const storage = multer.diskStorage({
    destination: function (req, file, cb) {

        cb(null, imputDir)
    },
    filename: function (req, file, cb){
        const timestamp = Date.now();
        let type = ''
        if (file.mimetype === "image/jpeg") {
            type = "jpg";
        }
        cb(null, 'image-' + timestamp + type)
    }
})

const upload = multer({ storage: storage });

const tasks = JSON.parse(fs.readFileSync('./tasks/taskprocess.json', 'utf-8'));

const getApp = () => {
    const app = express();
    app.post('/task', upload.single('file'), async (req, res) => {
        
        console.log(req.file);  

        if(!req.file) {
           return res.status(404).send('Image not found!')
        }
        const file = req.file;
        resizingImage(800, file, tasks);
        resizingImage(1024, file, tasks);
     
        res.status(200).send('Image saved!');
    });
    
    
    app.get('/task/:taskId', async (req, res) => {
    
        const taskId = req.params.taskId * 1;
    
        const array = tasks.images
        const task = array.find(elem=> elem.id === taskId)
        if(!task){
            res.status(404).send('Task not found!')
        }   
        res.status(200).send(task)
    });
    
    app.get('/', async (req, res) => {
      
        res.status(201).send(tasks)
    });

    return app;
}


module.exports = { getApp };
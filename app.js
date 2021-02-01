const express = require('express');
const sharp = require('sharp');
const multer = require('multer');
const crypto = require('crypto');
const fs = require('fs');


const app = express();
const port = 3000;


app.get('/', (req, res) => {


    res.status(200).send('WORKING');
});


const storage = multer.diskStorage({
    destination: function (req, file, cb) {

        cb(null, `./output`)
    },
    filename: function (req, file, cb) {
        console.log({file});
        let type = '';
        if (file.mimetype === "image/jpeg") {
            type = "jpg";
        }
        cb(null, 'image')
    }
})
const upload = multer({ storage: storage })


app.post('/task', upload.single('file'), async (req, res) => {

    const date = new Date()
    if(!req.file) {
        res.status(400).send('Image not found')
    }

    const file = req.file;
    const width = req.body.width * 1;
    console.log({file});
    
    const path = file.path;
    const originalName = file.originalname;
    const newName = crypto.createHash('md5').update(originalName).digest('hex');
    const folderName = originalName.split('.')[0];
    console.log({folderName});
    // console.log(originalName);
    // console.log({newName});    
    // console.log({path});

    const dir = `./output/${folderName}/${width}`;
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, {recursive: true});   
    }

    const originalImage = await sharp(path)
    .toFile(
        `./output/originals/${originalName}`);
    console.log(originalImage);
    
    const modifiedImage = await sharp(path)
    .resize(width)
    .toFile(
        `${dir}/${newName}.jpg`);    
    console.log({modifiedImage});

    const tasks = await fs.readFile('tasks/taskprocess.json');
    console.log({tasks});
    const newId = tasks[tasks.length - 1].id + 1
    console.log(newId);
    console.log('newId', newId);
    const info = [{
        'id': newId,
        'path': path,
        'date': date,
        'original': originalImage,
        'modified': modifiedImage
    }]
    console.log({info});

    await fs.writeFile('./tasks/taskprocess.json', JSON.stringify(info), (err)=>{
        if(err) {
           return err
        }
        console.log('fileWritten', file);
    })

    res.status(200).send(info);
});


app.get('/task/:id', async (req, res) => {
    console.log(req.params.id);
    const tasks = await fs.readFile('tasks/taskprocess.json', 'utf-8' ,(err, data ) => {

        console.log(data);
        return data
    });

    res.status(200).send(tasks)
});




app.listen(port, () => {
    console.log(`App running on port ${port}`);
});
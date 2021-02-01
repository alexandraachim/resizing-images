const express = require('express');
const sharp = require('sharp');
const multer = require('multer');
const crypto = require('crypto');
const fs = require('fs');

const app = express();
const port = 3000;

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
const upload = multer({ storage: storage });

const tasks = JSON.parse(fs.readFileSync('./tasks/taskprocess.json', 'utf-8'));
app.post('/task', upload.single('file'), async (req, res) => {

    const date = new Date()
    if(!req.file) {
        res.status(400).send('Image not found')
    }

    const file = req.file;
    const width = req.body.width * 1;
    //console.log({file});
    
    const path = file.path;
    const originalName = file.originalname;
    const newName = crypto.createHash('md5').update(originalName).digest('hex');
    const folderName = originalName.split('.')[0];
    //console.log({folderName});
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
    //console.log(originalImage);
    
    const modifiedImage = await sharp(path)
    .resize(width)
    .toFile(
        `${dir}/${newName}.jpg`);    
   // console.log({modifiedImage});
 
    const newId = Object.keys(tasks.images).length + 1;
    console.log({newId});
    const info = {
        'id': newId,
        'path': path,
        'date': date,
        'original': originalImage,
        'modified': modifiedImage
    };

    console.log({info});
    tasks.images = [...tasks.images, info]

    await fs.writeFile('./tasks/taskprocess.json', JSON.stringify(tasks), (err)=>{
        if(err) {
           return err
        }
        console.log('fileWritten', file);
    })

    res.status(200).send(info);
});


app.get('/task/:taskId', async (req, res) => {

    const taskId = req.params.taskId * 1;
    console.log({taskId});
    
    console.log(tasks.images);
    const array = tasks.images
   const task = array.find(elem=> elem.id === taskId)

    console.log('task', task);


    res.status(200).send(task)
});




app.listen(port, () => {
    console.log(`App running on port ${port}`);
});
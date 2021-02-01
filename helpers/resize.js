const fs = require('fs');
const crypto = require('crypto');
const sharp = require('sharp');


const date = new Date()

const resizingImage = async (width, file, tasks) => {
   
    const path = file.path;
    const originalName = file.originalname;
    const newName = crypto.createHash('md5').update(originalName).digest('hex');
    const folderName = originalName.split('.')[0];

    const originalImage = await sharp(path)
        .toFile(`./output/originals/${originalName}`);
        
    const dir = `./output/${folderName}/${width}`;
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, {recursive: true});   
    }
 
    const modifiedImage = await sharp(path)
        .resize(width)
        .toFile(`${dir}/${newName}.jpg`);
 
    const newId = Object.keys(tasks.images).length + 1;
    const info = {
        'id': newId,
        'newName': newName,
        'path': path,
        'date': date,
        'original': originalImage,
        'modified': modifiedImage
    };
     
    tasks.images = [...tasks.images, info]
     
    await fs.writeFile('./tasks/taskprocess.json', JSON.stringify(tasks), (err)=>{
        if(err) {
            return err
        }
    })
} 

module.exports = resizingImage;
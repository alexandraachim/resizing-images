const fs = require('fs');
const crypto = require('crypto');
const sharp = require('sharp');

const date = new Date();
const resizingImage = async (width, file, tasks) => {

    const dirOutput = `${process.cwd()}/output`;
    if (!fs.existsSync(dirOutput)){
        fs.mkdirSync(dirOutput, {recursive: true});   
    }

    const dirOriginals = `${dirOutput}/originals`;
    if (!fs.existsSync(dirOriginals)){
        fs.mkdirSync(dirOriginals, {recursive: true});   
    }
   
    const path = file.path;
    const originalName = file.originalname;
    const newName = crypto.createHash('md5').update(originalName).digest('hex');
    const folderName = originalName.split('.')[0];
    console.log(process.cwd());
   

    const originalImage = await sharp(path)
        .toFile(`${dirOriginals}/${originalName}`);

    const dir = `${dirOutput}/${folderName}/${width}`;
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, {recursive: true});   
    }
 
    const modifiedImage = await sharp(path)
        .resize(width)
        .toFile(`${dir}/${newName}.jpg`);

    const newId = tasks.images.length + 1;
    let status;
    const task = tasks.images.filter(elem => elem.id === newId - 1)
    if(task) {
        status = 'completed'
    } else {
        status = 'pending'
    }

    const info = {
        'id': newId,
        'newName': newName,
        'inputPath': path,
        'timestamp': date,
        'original': originalImage,
        'outputPath': dir,
        'modified': modifiedImage,
        'status': status
    };
     console.log({info});
    tasks.images = [...tasks.images, info]
     
    await fs.writeFile('./tasks/taskprocess.json', JSON.stringify(tasks), (err)=>{
        if(err) {
            return err
        }
    })
    return info;
} 

module.exports = resizingImage;
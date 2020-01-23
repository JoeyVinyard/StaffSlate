const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const htmlpdf = require('html-pdf');
const fs = require('fs');
const path = require('path');
const os = require('os');

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cors({
    origin: "http://localhost:4200"
}));

app.post('/pdf', function (req, res) {
    const html = req.body.data;
    const tmpDirPath = fs.mkdtempSync(os.tmpdir()+path.sep);
    const tempHtmlPath = path.join(tmpDirPath,"tmp.html");
    const tempPdfPath = path.join(tmpDirPath,"tmp.pdf"); 
    fs.appendFileSync(tempHtmlPath,html);
    htmlpdf.create(html, {"format": "Letter", "orientation": "landscape"}).toBuffer((err, buffer) => {
        console.log("Success");
        if(err) throw err;
        res.send(buffer);
    })
});
 
app.listen(3000)
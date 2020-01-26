const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const htmlpdf = require('html-pdf');
const merge = require('easy-pdf-merge');
const fs = require('fs');
const path = require('path');
const os = require('os');

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cors({
    origin: "http://localhost:4200"
}));

app.post('/pdf', function (req, res) {
    const htmlData = req.body.data;
    const tmpDirPath = fs.mkdtempSync(os.tmpdir()+path.sep);
    
    let pdfPromises = [];

    htmlData.forEach((html, i) => {
        pdfPromises.push(
            new Promise((resolve,reject) => {
                htmlpdf.create(html, {"format": "Letter", "orientation": "landscape"}).toFile(path.join(tmpDirPath,`${i}.pdf`), (err, resp) => {
                    if(err) {
                        reject(err);
                    } else {
                        resolve(resp.filename);
                    }
                });
            })
        );
    });

    Promise.all(pdfPromises).then((pdfFileLocs) => {
        const tempPdfPath = path.join(tmpDirPath,"tmp.pdf"); 
        merge(pdfFileLocs, tempPdfPath, (err) => {
            if(err) {
                res.status(400).end("Failed to merge pdfs");
                console.error(err);
            } else {
                let f = fs.readFileSync(tempPdfPath);
                res.send(f);
            }
        })
    }).catch((err) => {
        throw err;
    });
    // const tempHtmlPath = path.join(tmpDirPath,"tmp.html");
    // fs.appendFileSync(tempHtmlPath,html);
    // htmlpdf.create(html, {"format": "Letter", "orientation": "landscape"}).toBuffer((err, buffer) => {
    //     console.log("Success");
    //     if(err) throw err;
    //     res.send(buffer);
    // })
});
 
app.listen(process.env.PORT || 3000)
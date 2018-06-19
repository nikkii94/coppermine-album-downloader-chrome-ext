import JSZip from 'jszip';
import FileSaver from 'file-saver';
import fs from 'fs';
import axios from 'axios';
import { apply, eachSeries } from "async";


class JSZipExample {

    constructor() {
        this.images = [];
        this.imgFolder = null;
        this.imgPromiseStack = null;
    }

    execute(imgDataArray, zipFileName, urlFromDownload, callBackSuccess, callBackError) {

        if( imgDataArray.length > 1000 ){
            callBackError({'message': 'Too much image! Please try to download album with less than 1000 pictures!'});
        }else{

            let limit = 500;

            this.imgData = imgDataArray;
            this.parts = Math.ceil(imgDataArray.length / limit);

            let newArr = imgDataArray.reduce((all,one,i) => {
                const ch = Math.floor(i/limit);
                all[ch] = [].concat((all[ch]||[]),one);
                return all
            }, []);
            let i = 0;

            eachSeries(newArr, (part, next) => {
                /* create new zip file */
                let zip = new JSZip();
                let zipName = '';

                if(newArr.length === 1) {
                    zipName = zipFileName;
                    i++;
                }else{
                    zipName = zipFileName+'_part'+i++;
                }

                callBackSuccess({'message': 'Downloading part '+ i + '/ '+ this.parts});

                this.createFile(zip, part.length, zipName, urlFromDownload)
                    .then((zip) => this.createFolder(zip))
                    .then((zip) => this.getAndCreateImages(zip, part))
                    .then((zip, imgPromiseStack) => this.render(zip, imgPromiseStack, zipName, i, callBackSuccess, callBackError))
                    .then((zip) => { next(); })
            });

        }



    }

    createFile(zip, fileNumber, albumTitle, url) {

        return new Promise ( (resolve, reject) => {

            const fileName = 'ReadMe.txt';
            const content = `Coppermine Album downloader.
        
            This file contains ${fileNumber} images downloaded from ${url} -> ${albumTitle} album.
            Enjoy your images. ^^ 
      
            ****************************
      
             Thank you for using this extension!
             You can find me on twitter: https://twitter.com/nixxdev
          `;
            zip.file(fileName, content);
            resolve(zip);
        });

    }

    createFolder(zip) {

        return new Promise ( (resolve, reject) => {
            const folderName = 'images';
            this.imgFolder = zip.folder(folderName);
            resolve(zip);
        });

    }

    getAndCreateImages(zip, imgData) {

        return new Promise ( (resolve, reject) => {

            this.imgPromiseStack = imgData.map((item, i) => {
                const extension = item.substring(item.lastIndexOf('.')+1, item.length);

                return new Promise((resolve) => {
                    axios.get(item, {
                        responseType: 'arraybuffer'
                    })
                    .then(({data}) => {
                        this.imgFolder.file(`image${i+1}.${extension}`, data);
                        resolve();
                    }).catch((error) => {
                        console.log(error);
                        resolve();
                    });

                });

            });
            resolve(zip, this.imgPromiseStack);
        });

    }

    render(zip, imgPromiseStack, fileName, part,  callBackSuccess, callBackError) {

        return new Promise ( (resolve, reject) => {

            let zipFileName = fileName || 'images.zip';
            zipFileName = (zipFileName.includes('.zip')) ? zipFileName : `${zipFileName}.zip`;

            Promise.all(this.imgPromiseStack).then( () => {

                zip.generateAsync({type: "blob"})
                    .then((content) => {
                        FileSaver.saveAs(content, zipFileName);
                        if( part < this.parts){
                            //callBackSuccess({'message': 'Downloading part '+ parseInt(part)+1 + '/ '+ this.parts});
                        }else{
                            callBackSuccess();
                        }
                        resolve(zip);

                    });

            });
        });

    }

}

const obj = new JSZipExample();

const renderImgAsZip = {
    execute: obj.execute
};
renderImgAsZip.execute = renderImgAsZip.execute.bind(obj);

export default renderImgAsZip

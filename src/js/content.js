import 'jquery';
import 'babel-polyfill';
import request from 'request';
import renderImgAsZip from './filesaver';

import '../scss/content.scss';

const url = window.location.href; // window.location.origin + window.location.pathname - http://example.com/gallery/thumbnails.php
const baseUrl = window.location.origin + (window.location.pathname).substring(0, window.location.pathname.indexOf('thumbnails.php')); //  http://example.com/gallery/

let pagesToVisit = [];
let pagesVisited = [];
let numPagesVisited = 0;
let album = '';
let $body = null;

let thumbImages = [];
let fullImages = [];

const close = () => {
    $('#cpg-downloader-overlay').remove();
};

const crawl = () => {

    let nextPage = pagesToVisit.pop();

    if(nextPage !== undefined){
        if (nextPage in pagesToVisit) {
            // We've already visited this page, so repeat the crawl
            crawl();
        } else {
            // New page we haven't visited
            visitPage(nextPage, crawl);
        }
    }else{

        createBigImageLinks();

    }

};

const visitPage = (url, callback) => {

    // Add page to our set
    pagesVisited[url] = true;
    numPagesVisited++;


    // Make the request
    request(url, function(error, response, body) {

        if(error){
            console.log(error);
        }

        if(response.statusCode !== 200) {
            callback();
            return;
        }

        $body = $(body);

        if(album === ''){

            let albumTitle =  $(body).find('.maintable:first-of-type .tableh1 > .statlink > a:last-of-type').text();

            if(albumTitle === '' || albumTitle === undefined){
                albumTitle =  $(body).find('.maintable:first-of-type > tbody > tr> .tableh1').first().text();
            }
            album = albumTitle;
        }

        collectThumbs();
        collectGalleryLinks();
        callback();
    });
};

const collectGalleryLinks = () => {

    let current = $($body).find('td.navmenu').closest('tr').find('.tableb.tableb_alternate');
    let next = $(current).nextAll('.navmenu').first().find('a');

    if($(next).length > 0){
        pagesToVisit.push(baseUrl + $(next).attr('href'));
    }

};

const collectThumbs = () => {

    let thumbs = $($body).find('img[class="image thumbnail"]');

    thumbs.each(function(){
        thumbImages.push($(this).attr('src'));
    });

    return (thumbs.length > 0);
};

const createBigImageLinks = () => {

    for(let i=0; i<thumbImages.length; i++){
        fullImages.push(baseUrl + thumbImages[i].replace('/thumb_', '/'));

    }

    renderImgAsZip.execute(fullImages, album, url, function(success){

        if( typeof success === 'object' && success.hasOwnProperty('message')) {
            $('#cpg-downloader-overlay').html('<p>'+success.message+'</p>');
        }else{
            $('#cpg-downloader-overlay').html('<p>Done! Thank you for using this extension! ^^ <br> <button id="closeButtonCEX">Close</button> </p>');
            $('#closeButtonCEX').on('click', close);
        }

    }, function(error){
        $('#cpg-downloader-overlay').html('<p>'+error.message+'<br> <button id="closeButtonCEX">Close</button> </p>');
        $('#closeButtonCEX').on('click', close);
    });

};

(async function ($) {

    let extUrl = chrome.extension.getURL("content.css");
    $('head').append('<link rel="stylesheet" href="'+extUrl+'">');

    if(window.location.href.indexOf('thumbnails.php?album=') < 0 ){

        $('#cpg-downloader-overlay').html('<p> Can\'t run on this page! <button id="closeButtonCEX">Close</button> </p>');
        $('#closeButtonCEX').on('click', close);

    }else{

        $('body').append('<div id="cpg-downloader-overlay">Downloading...</div>');

        chrome.runtime.sendMessage({
            action: 'updateIcon',
            value: false
        });

        pagesToVisit.push(url);
        crawl();
    }

})(jQuery);






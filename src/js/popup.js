import 'jquery';
import 'babel-polyfill';

import "../scss/popup.scss";


const run = () => {

    $('#run').addClass('animated fadeOut').hide();
    $('#load').removeClass('hidden').addClass('animated fadeIn');

    chrome.tabs.executeScript({
        file: './content.js'
    },function(results){});
    chrome.tabs.executeScript(null, {
        code: "console.log('Injected.')"
    });
};

document.getElementById('run').addEventListener('click', run);


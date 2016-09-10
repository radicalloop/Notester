'use strict';

const {
    app,
    BrowserWindow,
} = require('electron');

let mainWindow;


app.on('ready', function() {
    mainWindow = new BrowserWindow({
        height: 650,
        width: 1000
    });

    mainWindow.webContents.openDevTools();
    mainWindow.loadURL('file://' + __dirname + '/app/index.html');

    // electronLocalshortcut.register(mainWindow, 'Delete', () => {
    //     console.log('Delete is pressed');
    // });

    // Check whether a shortcut is registered.
    //console.log(electronLocalshortcut.isRegistered('Delete'));

});

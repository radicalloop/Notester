'use strict';

const electron = require('electron');
const app      = electron.app;

const BrowserWindow = electron.BrowserWindow;

let mainWindow;

app.on('ready', function() {
    mainWindow = new BrowserWindow({
        height: 650,
        width: 1000
    });

    mainWindow.webContents.openDevTools();

    mainWindow.loadURL('file://' + __dirname + '/app/index.html');
});
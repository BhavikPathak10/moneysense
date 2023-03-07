const {app, BrowserWindow} = require('electron')
    const url = require("url");
    const path = require("path");
    const jsonServer = require("json-server");

    let mainWindow
    let splash

    function createWindow () {
       const server = jsonServer.create();
       const router = jsonServer.router(path.join(__dirname, `db.json`));
       const middlewares = jsonServer.defaults();
       server.use(middlewares);
       server.use(router);
       server.listen(3000, () => {  console.log('JSON Server is running')  });

      mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        show:false,
        autoHideMenuBar:true,
        icon:__dirname+`/dist/passbook-app/assets/images/logo_1.ico`,
        webPreferences: {
          nodeIntegration: true
        },
      })

      splash = new BrowserWindow({width: 800, height: 500, transparent: false, frame: false, alwaysOnTop: true});
      splash.loadURL(`file://${__dirname}/splash.html`);

      mainWindow.loadURL(
        url.format({
          pathname: path.join(__dirname, `/dist/passbook-app/index.html`),
          protocol: "file:",
          slashes: true
        })
      );
      // Open the DevTools.
      //mainWindow.webContents.openDevTools()
        
      mainWindow.on("ready-to-show",()=>{
        mainWindow.maximize();
        setTimeout(()=>{
          mainWindow.show();
          splash.close(0);
        },1200);
      })
      
      mainWindow.on('closed', function () {
        mainWindow = null;
      })
    }

    app.on('ready', createWindow)

    app.on('window-all-closed', function () {
      /* if (process.platform !== 'darwin') */ app.quit()
    })

    app.on('activate', function () {
      if (mainWindow === null) createWindow()
    })
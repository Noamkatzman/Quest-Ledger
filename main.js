const { app, BrowserWindow, ipcMain, Notification, Tray, Menu, nativeImage, dialog } = require("electron");
const path = require("path");
const fs = require("fs");

const APP_ID = "com.questledger.app";
const dataFile = () => path.join(app.getPath("userData"), "ledger.json");
const iconPath = path.join(__dirname, "build", "icon.png");

let win = null;
let tray = null;
let quitting = false;
let toldAboutTray = false;

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on("second-instance", showWindow);
  app.whenReady().then(start);
}

function start() {
  app.setAppUserModelId(APP_ID); // needed for Windows notifications
  Menu.setApplicationMenu(null);
  createWindow();
  createTray();
}

function createWindow() {
  const startedHidden = process.argv.includes("--hidden");
  win = new BrowserWindow({
    width: 1180,
    height: 860,
    minWidth: 380,
    minHeight: 500,
    show: false,
    title: "Quest Ledger",
    icon: iconPath,
    backgroundColor: "#10131F",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      backgroundThrottling: false // keep reminders ticking while hidden in the tray
    }
  });
  win.loadFile(path.join(__dirname, "app", "index.html"));
  win.once("ready-to-show", () => { if (!startedHidden) win.show(); });

  // Closing the window hides it to the tray so reminders keep working.
  win.on("close", (e) => {
    if (quitting) return;
    e.preventDefault();
    win.hide();
    if (!toldAboutTray) {
      toldAboutTray = true;
      notify("Quest Ledger is still running", "It's in the system tray so your reminders keep working. Right-click the tray icon to quit.");
    }
  });

  // Open outside links in the real browser.
  win.webContents.setWindowOpenHandler(({ url }) => {
    require("electron").shell.openExternal(url);
    return { action: "deny" };
  });
}

function createTray() {
  const img = nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 });
  tray = new Tray(img);
  tray.setToolTip("Quest Ledger");
  tray.on("click", showWindow);
  refreshTrayMenu();
}

function refreshTrayMenu() {
  const startup = app.getLoginItemSettings().openAtLogin;
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: "Open Quest Ledger", click: showWindow },
    { type: "separator" },
    { label: "Start with Windows", type: "checkbox", checked: startup, click: (item) => setStartup(item.checked) },
    { type: "separator" },
    { label: "Quit", click: () => { quitting = true; app.quit(); } }
  ]));
}

function setStartup(on) {
  app.setLoginItemSettings({ openAtLogin: on, args: ["--hidden"] });
  refreshTrayMenu();
  if (win) win.webContents.send("startup-changed", on);
}

function showWindow() {
  if (!win) return;
  if (win.isMinimized()) win.restore();
  win.show();
  win.focus();
}

function notify(title, body) {
  if (!Notification.isSupported()) return;
  const n = new Notification({ title, body, icon: iconPath });
  n.on("click", showWindow);
  n.show();
}

// ---------- IPC ----------
ipcMain.on("ledger:load", (e) => {
  try { e.returnValue = fs.readFileSync(dataFile(), "utf8"); }
  catch { e.returnValue = null; }
});

ipcMain.handle("ledger:save", async (_e, json) => {
  // Write to a temp file first, then swap it in, so a crash never corrupts your save.
  const file = dataFile();
  const tmp = file + ".tmp";
  await fs.promises.writeFile(tmp, json, "utf8");
  await fs.promises.rename(tmp, file);
  return true;
});

ipcMain.on("notify", (_e, { title, body }) => notify(title, body));

ipcMain.handle("startup:get", () => app.getLoginItemSettings().openAtLogin);
ipcMain.handle("startup:set", (_e, on) => { setStartup(!!on); return !!on; });

ipcMain.handle("backup:export", async (_e, json) => {
  const stamp = new Date().toISOString().slice(0, 10);
  const { canceled, filePath } = await dialog.showSaveDialog(win, {
    title: "Save a backup",
    defaultPath: path.join(app.getPath("documents"), `quest-ledger-backup-${stamp}.json`),
    filters: [{ name: "Quest Ledger backup", extensions: ["json"] }]
  });
  if (canceled || !filePath) return false;
  await fs.promises.writeFile(filePath, json, "utf8");
  return true;
});

ipcMain.handle("backup:import", async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog(win, {
    title: "Restore a backup",
    properties: ["openFile"],
    filters: [{ name: "Quest Ledger backup", extensions: ["json"] }]
  });
  if (canceled || !filePaths.length) return null;
  return fs.promises.readFile(filePaths[0], "utf8");
});

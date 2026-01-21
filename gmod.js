// gmod.js
// Fonctions que GMod appelle automatiquement dans le loading screen.
// Ne change pas les noms : ils doivent être globales.

window.GameDetails = function(servername, serverurl, mapname, maxplayers, steamid, gamemode){
  window.__gmod = window.__gmod || {};
  window.__gmod.servername = servername || "";
  window.__gmod.mapname = mapname || "";
  window.__gmod.maxplayers = maxplayers || 0;
  window.__gmod.steamid = steamid || "";
  window.__gmod.gamemode = gamemode || "";
  window.__gmod.serverurl = serverurl || "";
  // Tu peux afficher ces infos si tu veux plus tard.
};

window.SetFilesTotal = function(total){
  window.__gmod = window.__gmod || {};
  window.__gmod.total = Number(total) || 0;
};

window.SetFilesNeeded = function(needed){
  window.__gmod = window.__gmod || {};
  window.__gmod.needed = Number(needed) || 0;
  window.__gmod.downloaded = Math.max(0, (window.__gmod.total || 0) - (window.__gmod.needed || 0));
};

window.DownloadingFile = function(fileName){
  window.__gmod = window.__gmod || {};
  window.__gmod.currentFile = fileName || "";
  // On incrémente un peu "downloaded" de façon safe, car GMod ne donne pas le delta précis
  // et SetFilesNeeded est appelé de temps en temps.
  window.__gmod.downloaded = Math.min(window.__gmod.total || 0, (window.__gmod.downloaded || 0) + 1);
};

window.SetStatusChanged = function(status){
  window.__gmod = window.__gmod || {};
  window.__gmod.status = status || "";
};

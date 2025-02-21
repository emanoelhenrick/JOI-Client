"use strict";const a=require("electron");a.contextBridge.exposeInMainWorld("ipcRenderer",{on(...e){const[i,n]=e;return a.ipcRenderer.on(i,(t,...r)=>n(t,...r))},off(...e){const[i,...n]=e;return a.ipcRenderer.off(i,...n)},send(...e){const[i,...n]=e;return a.ipcRenderer.send(i,...n)},invoke(...e){const[i,...n]=e;return a.ipcRenderer.invoke(i,...n)},getMetadata:()=>a.ipcRenderer.invoke("get-metadata"),updateVod:async e=>await a.ipcRenderer.invoke("update-vod",e),updateSeries:async e=>await a.ipcRenderer.invoke("update-series",e),updateLive:async e=>await a.ipcRenderer.invoke("update-live",e),authenticateUser:async e=>await a.ipcRenderer.invoke("authenticate-user",e),fetchTmdbTrending:async e=>await a.ipcRenderer.invoke("fetch-tmdb-trending",e),addPlaylistToMeta:async e=>await a.ipcRenderer.invoke("add-playlist-to-meta",e),editPlaylistInfo:async e=>await a.ipcRenderer.invoke("edit-playlist-info",e),removePlaylist:async e=>await a.ipcRenderer.invoke("remove-playlist",e),getLocalVodPlaylist:async e=>await a.ipcRenderer.invoke("get-local-vod-playlist",e),getLocalSeriesPlaylist:async e=>await a.ipcRenderer.invoke("get-local-series-playlist",e),getLocalLivePlaylist:async e=>await a.ipcRenderer.invoke("get-local-live-playlist",e),getPlaylistInfo:async e=>await a.ipcRenderer.invoke("get-playlist-info",e),getVodInfo:async e=>await a.ipcRenderer.invoke("get-vod-info",e),getSerieInfo:async e=>await a.ipcRenderer.invoke("get-serie-info",e),getUserData:async e=>await a.ipcRenderer.invoke("get-user-data",e),updateUserData:async e=>await a.ipcRenderer.invoke("update-user-data",e),changeCurrentPlaylist:async e=>await a.ipcRenderer.invoke("change-current-playlist",e),updatedAtPlaylist:async e=>await a.ipcRenderer.invoke("updated-at-playlist",e),createProfile:async e=>await a.ipcRenderer.invoke("create-profile",e),switchProfile:async e=>await a.ipcRenderer.invoke("switch-profile",e),renameProfile:async e=>await a.ipcRenderer.invoke("rename-profile",e),removeProfile:async e=>await a.ipcRenderer.invoke("remove-profile",e),launchVLC:async e=>await a.ipcRenderer.invoke("launch-vlc",e),getVLCState:async e=>await a.ipcRenderer.invoke("get-vlc-state",e),removeAllListeners:e=>a.ipcRenderer.removeAllListeners(e)});

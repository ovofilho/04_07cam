import { JsonPipe } from '@angular/common';
import { toBase64String } from '@angular/compiler/src/output/source_map';
import { Injectable } from '@angular/core';

import { Plugins, CameraResultType, Capacitor, FilesystemDirectory, 
  CameraPhoto, CameraSource } from '@capacitor/core';
import { Platform } from '@ionic/angular';

const { Camera, Filesystem, Storage } = Plugins;

@Injectable({
  providedIn: 'root'
})
export class PhotoService {

  public photos: Photo[] = [];

  

  private PHOTO_STORAGE: string = "photos";
  private platform: Platform;

  constructor(platform: Platform) {
    this.platform = platform;
   }

  public async addNewToGallery() {
    // Take a photo

    if (this.platform.is('android')){
      var qualidade = 50;
    }
    else {
      var qualidade = 100;
    }

    const capturedPhoto = await Camera.getPhoto({
      resultType: CameraResultType.Uri, 
      source: CameraSource.Camera, 
      
      quality: qualidade 

    });



    /*this.photos.push({
      filepath: "em breve...",
      webviewPath: capturedPhoto.webPath
    })*/

    Storage.set({
      key: this.PHOTO_STORAGE,
      value: JSON.stringify(this.photos)
    });

    const savedImageFile = await this.savePicture(capturedPhoto);
    this.photos.push(savedImageFile);
  }

  public async removerUltimo(){
    await this.photos.pop();
  }


    public async loadSaved(){
    const photoList = await Storage.get({key: this.PHOTO_STORAGE  });
    this.photos = JSON.parse(photoList.value) || [];

    if(!this.platform.is('hybrid')){
      for (let photo of this.photos) {
        const readFile = await Filesystem.readFile({
          path: photo.filepath,
          directory: FilesystemDirectory.Data
        });
        photo.webviewPath = 'data:image/jpeg;base64,${readFile.data}' ;
      }

    }

    
  }

  private async savePicture(cameraPhoto: CameraPhoto) {
    const base64Data = await this.readAsBase64(cameraPhoto);
    
    const fileName = new Date().getTime() + '.jpeg';
    const savedFile = await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: FilesystemDirectory.Data

    });

    if(this.platform.is('hybrid')){
      return {
        filepath: savedFile.uri,
        webviewPath: Capacitor.convertFileSrc(savedFile.uri),
      };
    }
    else{
      return { 
        filepath: fileName,
        webviewPath: cameraPhoto.webPath
      }

    }

   
  }

  private async readAsBase64(cameraPhoto: CameraPhoto) {

    if (this.platform.is('hybrid')){
      const file = await Filesystem.readFile({
        path: cameraPhoto.path
      });
      return file.data;
    }
    else {
      const response = await fetch(cameraPhoto.webPath!);
      const blob = await response.blob();
      return await this.convertBlobToBase64(blob) as string;

    }
   

  }

  convertBlobToBase64 = (blob: Blob) => new Promise((resolve,reject) => {
    const reader = new FileReader;
    reader.onerror = reject;
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.readAsDataURL(blob);

  });
}

export interface Photo{
  filepath: string;
  webviewPath: string;

}
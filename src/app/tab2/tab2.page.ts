import { Component } from '@angular/core';
import { PhotoService } from '../services/photo.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {

  constructor(public photoService: PhotoService) {}

  addPhotoToGallery(){
    this.photoService.addNewToGallery();
  }

  removerDaGaleria(){
    this.photoService.removerUltimo();
  }



  async ngOnInit(){
    await this.photoService.loadSaved();
  }

}

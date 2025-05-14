import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MediaAttachment } from '../../models/media.model';
import { CommonModule } from '@angular/common';
import { MATERIAL_MODULES } from '../material-imports';

@Component({
  selector: 'app-image-dialog',
  standalone:true,
  imports: [CommonModule, MATERIAL_MODULES],
  templateUrl: './image-dialog.component.html',
  styleUrls: ['./image-dialog.component.scss']
})

export class ImageDialogComponent {
  currentIndex: number;
  mediaList: MediaAttachment[];

  constructor(@Inject(MAT_DIALOG_DATA) public data: { mediaList: MediaAttachment[], currentIndex: number }) {
    this.mediaList = data.mediaList;
    this.currentIndex = data.currentIndex;
  }

  get currentImage(): MediaAttachment {
    return this.mediaList[this.currentIndex];
  }

  previousImage(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    }
  }

  nextImage(): void {
    if (this.currentIndex < this.mediaList.length - 1) {
      this.currentIndex++;
    }
  }
  
  // verhindert dass man das bild mit rechtsklick groß anzeigen lassen kann, um Missbrauch vorzubeugen 
  disableRightClick(event: MouseEvent) {
    event.preventDefault();
  }
  
}

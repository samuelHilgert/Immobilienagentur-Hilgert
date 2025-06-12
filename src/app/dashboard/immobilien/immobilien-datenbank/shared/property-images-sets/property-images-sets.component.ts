import { Component, Input, OnInit } from '@angular/core';
import { ImmobilienService } from '../../../../../services/immobilien.service';
import { Immobilie } from '../../../../../models/immobilie.model';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../../services/auth.service';
import { MediaService } from '../../../../../services/media.service';
import { MediaAttachment } from '../../../../../models/media.model';
import { MATERIAL_MODULES } from '../../../../../shared/material-imports';
import { MatDialog } from '@angular/material/dialog';
import { ImageDialogComponent } from '../../../../../shared/image-dialog/image-dialog.component';

@Component({
  selector: 'app-property-images-sets',
  standalone: true,
  imports: [CommonModule, RouterModule, MATERIAL_MODULES],
  templateUrl: './property-images-sets.component.html',
  styleUrl: './property-images-sets.component.scss',
})
export class PropertyImagesSetsComponent implements OnInit {
  @Input() immobilienId!: string;
  immobilie?: Immobilie;
  isAdmin = false;
  isLoading = true;
  media: MediaAttachment[] = [];
  mediaFloorPlans: MediaAttachment[] = [];

  constructor(
    private immobilienService: ImmobilienService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private mediaService: MediaService,
    private dialog: MatDialog
  ) {}

  async ngOnInit() {
    this.immobilienId = this.route.snapshot.paramMap.get('externalId') || '';
    if (!this.immobilienId) return;

    this.authService.isAdmin().subscribe(async (isAdmin) => {
      this.isAdmin = isAdmin;
      if (!isAdmin) {
        console.warn(
          '⛔ Zugriff verweigert – nur Admins dürfen Anfragen laden'
        );
        return;
      }

      try {
        // 🔍 Kunden mit Rolle "Interessent" und Anfrage zur Immobilie
        // const allCustomers = await this.customerService.getAllCustomers();

        // const interessenten = allCustomers.filter(
        //   (c) =>
        //     c.roles?.includes(CustomerRole.Interessent) &&
        //     c.buyerData?.angefragteImmobilienIds?.includes(this.immobilienId)
        // );

        // // 🔢 Sortieren nach Erstellungsdatum (neueste zuerst)
        // this.customer = interessenten.sort(
        //   (a, b) =>
        //     new Date(b.creationDate || '').getTime() -
        //     new Date(a.creationDate || '').getTime()
        // );

        // 🏠 Immobilie laden
        this.immobilie = await this.immobilienService.getImmobilieById(
          this.immobilienId
        );

        console.log('propertyType', this.immobilie.propertyType);
        this.isLoading = false;

        await this.loadMedia();
      
      } catch (error) {
        console.error('❌ Fehler beim Laden der Daten:', error);
        this.isLoading = false;
      }
    });
  }

  openDialog(selectedItem: MediaAttachment): void {
    const index = this.media.findIndex(m => m.id === selectedItem.id);
    this.dialog.open(ImageDialogComponent, {
      data: {
        mediaList: this.media,
        currentIndex: index
      },
      width: '90vw',
      maxWidth: '800px'
    });
  }  

async deleteImage(mediaId: string) {
  await this.mediaService.deleteMedia(mediaId);
  this.media = await this.mediaService.getMediaForProperty(this.immobilienId);
}

async markAsTitleImage(mediaId: string) {
  await this.mediaService.setTitleImage(mediaId, this.immobilienId);
  this.media = await this.mediaService.getMediaForProperty(this.immobilienId);
}

async updateDescription(mediaId: string, newDesc: string) {
  await this.mediaService.updateDescription(mediaId, newDesc);
}

private async loadMedia() {
  const allMedia = await this.mediaService.getMediaForProperty(this.immobilienId);
  this.media = allMedia.filter(m => m.category !== 'FLOOR_PLAN');
  this.mediaFloorPlans = allMedia.filter(m => m.category === 'FLOOR_PLAN');
}

async onFileSelected(event: Event) {
  const input = event.target as HTMLInputElement;
  if (!input.files || !input.files.length) return;

  const file = input.files[0];
  const type = file.type.startsWith('image') ? 'image' : 'video';

  try {
    const result = await this.mediaService.uploadMedia(file, this.immobilienId, type);
    if (result.success) {
      // Bildliste neu laden
      this.loadMedia(); // ← Existierende Methode zum Neuladen
    }
  } catch (error) {
    console.error('Fehler beim Hochladen des Mediums:', error);
  }
}

async onFloorPlanSelected(event: Event) {
  const input = event.target as HTMLInputElement;
  if (!input.files || !input.files.length) return;

  const file = input.files[0];

  try {
    const result = await this.mediaService.uploadMedia(file, this.immobilienId, 'image', 'FLOOR_PLAN');
    if (result.success) {
      this.loadMedia(); // Grundrisse neu laden
    }
  } catch (error) {
    console.error('Fehler beim Hochladen des Grundrisses:', error);
  }
}


}

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
  mediaVideos: MediaAttachment[] = [];

  constructor(
    private immobilienService: ImmobilienService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private mediaService: MediaService,
    private dialog: MatDialog
  ) {}

  /**
   * Lifecycle method called when the component is initialized.
   * Loads the property and checks if the user is an admin.
   */
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

  /**
   * Opens a full-screen dialog for the selected media item.
   * @param selectedItem The selected MediaAttachment object to preview
   */
  openDialog(selectedItem: MediaAttachment): void {
    const index = this.media.findIndex((m) => m.id === selectedItem.id);
    this.dialog.open(ImageDialogComponent, {
      data: {
        mediaList: this.media,
        currentIndex: index,
      },
      width: '90vw',
      maxWidth: '800px',
    });
  }

  /**
   * Deletes a media item (image, video, or floor plan) by its ID.
   * @param mediaId The ID of the media item to delete
   */
  async deleteImage(mediaId: string) {
    await this.mediaService.deleteMedia(mediaId);
    this.media = await this.mediaService.getMediaForProperty(this.immobilienId);
  }

  /**
   * Marks a media item as the title image for the property.
   * @param mediaId The ID of the image to set as the title image
   */
  async markAsTitleImage(mediaId: string) {
    await this.mediaService.setTitleImage(mediaId, this.immobilienId);
    this.media = await this.mediaService.getMediaForProperty(this.immobilienId);
  }

  /**
   * Marks a media item as the alternative title image.
   * @param mediaId The ID of the image to set as the alternative title image
   */
  async markAsAltTitleImage(mediaId: string) {
    await this.mediaService.setAltTitleImage(mediaId, this.immobilienId);
    this.media = await this.mediaService.getMediaForProperty(this.immobilienId);
  }

  /**
   * Updates the description of a given media item.
   * @param mediaId The ID of the media item
   * @param newDesc The new description text
   */
  async updateDescription(mediaId: string, newDesc: string) {
    await this.mediaService.updateDescription(mediaId, newDesc);
  }

  /**
   * Loads all media associated with the property and separates them
   * into images, videos, and floor plans based on type and category.
   */
  private async loadMedia() {
    const allMedia = await this.mediaService.getMediaForProperty(
      this.immobilienId
    );

    // Bilder – HIER wird sortiert
    this.media = allMedia
      .filter((m) => m.category !== 'FLOOR_PLAN' && m.type === 'image')
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

    // Grundrisse
    this.mediaFloorPlans = allMedia
      .filter((m) => m.category === 'FLOOR_PLAN')
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

    // Videos
    this.mediaVideos = allMedia
      .filter((m) => m.category !== 'FLOOR_PLAN' && m.type === 'video')
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }

  /**
   * Handles the upload of an image or video.
   * Automatically determines the media type based on MIME type.
   * @param event The file input change event
   */
  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || !input.files.length) return;

    const file = input.files[0];
    const type = file.type.startsWith('image') ? 'image' : 'video';

    try {
      const result = await this.mediaService.uploadMedia(
        file,
        this.immobilienId,
        type
      );
      if (result.success) {
        // Bildliste neu laden
        this.loadMedia(); // ← Existierende Methode zum Neuladen
      }
    } catch (error) {
      console.error('Fehler beim Hochladen des Mediums:', error);
    }
  }

  /**
   * Handles the upload of a floor plan image.
   * @param event The file input change event
   */
  async onFloorPlanSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || !input.files.length) return;

    const file = input.files[0];

    try {
      const result = await this.mediaService.uploadMedia(
        file,
        this.immobilienId,
        'image',
        'FLOOR_PLAN'
      );
      if (result.success) {
        this.loadMedia(); // Grundrisse neu laden
      }
    } catch (error) {
      console.error('Fehler beim Hochladen des Grundrisses:', error);
    }
  }

  /**
   * Updates the sortOrder of images and persists it to the backend.
   */
  async updateMediaSortOrder() {
    const sortedMedia = this.media.map((item, index) => ({
      id: item.id!,
      sortOrder: index,
    }));

    try {
      await this.mediaService.updateMediaSortOrder(
        this.immobilienId,
        sortedMedia
      );
    } catch (error) {
      console.error('Error updating sort order:', error);
    }
  }

  // Bild manuell position zuweisen
  onSortOrderChange(item: MediaAttachment, event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input?.value;

    const newValue = parseInt(value, 10);
    if (value === '' || isNaN(newValue)) return;

    item.sortOrder = newValue;

    this.mediaService
      .updateMediaSortOrder(this.immobilienId, [
        { id: item.id!, sortOrder: newValue },
      ])
      .then(() => {
        this.media.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
      })
      .catch((err) => {
        console.error('Fehler beim Aktualisieren der Position:', err);
      });
  }

  // Grundriss Position manuell einstellen
  onFloorPlanSortOrderChange(item: MediaAttachment, event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input?.value;

    const newValue = parseInt(value, 10);
    if (value === '' || isNaN(newValue)) return;

    item.sortOrder = newValue;

    this.mediaService
      .updateMediaSortOrder(this.immobilienId, [
        { id: item.id!, sortOrder: newValue },
      ])
      .then(() => {
        this.mediaFloorPlans.sort(
          (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
        );
      })
      .catch((err) => {
        console.error('Fehler beim Aktualisieren der Grundriss-Position:', err);
      });
  }
}

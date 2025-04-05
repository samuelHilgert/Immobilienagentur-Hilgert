// src/app/services/pagination.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PaginationService<T> {
  private items: T[] = [];
  private _currentPage = 0;
  private _itemsPerPage = 8;

  setData(items: T[], itemsPerPage: number = 8): void {
    this.items = items;
    this._itemsPerPage = itemsPerPage;
    this._currentPage = 0;
  }

  get currentPage(): number {
    return this._currentPage;
  }

  get itemsPerPage(): number {
    return this._itemsPerPage;
  }

  get totalPages(): number {
    return Math.ceil(this.items.length / this._itemsPerPage);
  }

  get paginatedItems(): T[] {
    const start = this._currentPage * this._itemsPerPage;
    const end = start + this._itemsPerPage;
    return this.items.slice(start, end);
  }

  getRangeEnd(): number {
    const end = (this._currentPage + 1) * this._itemsPerPage;
    return end > this.items.length ? this.items.length : end;
  }

  getRangeStart(): number {
    return this._currentPage * this._itemsPerPage + 1;
  }

  goToNextPage(): void {
    if (this._currentPage < this.totalPages - 1) {
      this._currentPage++;
    }
  }

  goToPreviousPage(): void {
    if (this._currentPage > 0) {
      this._currentPage--;
    }
  }
}

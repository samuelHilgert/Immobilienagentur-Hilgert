// src/app/services/mail.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ExposeAnfrage } from '../models/expose-anfrage.model';

@Injectable({
  providedIn: 'root',
})
export class MailService {
  private functionUrl = 'https://us-central1-hilgert-immobilien.cloudfunctions.net/sendExposeMail';

  constructor(private http: HttpClient) {}

  sendExposeMail(anfrage: ExposeAnfrage) {
    return this.http.post(this.functionUrl, anfrage);
  }
}

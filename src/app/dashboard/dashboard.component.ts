import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { NgModel } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HeaderDashboardComponent } from './header-dashboard/header-dashboard.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterModule, NgIf, HeaderDashboardComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})

export class DashboardComponent {
  routerActive : boolean = false;

}

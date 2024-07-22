import { Component } from '@angular/core';
import { ActivationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-main-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class MainLayoutComponent {
  title!: string;
  routerSub: Subscription;

  constructor(private router: Router,) {
    // Get and dispaly title route and componet title

    this.routerSub = this.router.events.subscribe(event => {
      if (event instanceof ActivationEnd) {
        let title = event.snapshot.data['title'];
        if (title){
          this.title = title
        }
        return
      }

    })
   }
}

import { Component } from '@angular/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-un-subscription',
  templateUrl: './un-subscription.component.html',
  styleUrls: ['./un-subscription.component.scss']
})
export class UnSubscriptionComponent  {
  subscription = new Subscription()

  constructor() { }

  ngOnDestroy() {
    this.subscription.unsubscribe()
}

}

/*** Angular core modules ***/
import { AfterViewInit, Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

/*** Services ***/
import { MyServicesService } from '../Services/MyServices.service';
import { NotificationMessageModel } from '../../../Shared/Model/NotificationMessage.Model';
import {
  ResourceService,
  SendEvent,
} from '../../../Shared/Services/Resoucre.Service';
import { Utils } from '../../../Utils/Utils';
import { AuthService } from 'src/app/Core/Services/AuthService';
import { AlertModel } from '../../../Shared/Model/Alert.Model';
import { constants } from 'src/app/Shared/Constants';
import { TranslationKeys } from 'src/app/Utils/translation-keys';

@Component({
  selector: 'app-myservicelist',
  styleUrls: ['./MyServices.Component.scss'],
  templateUrl: './MyServices.Component.html',
  host: { '(window:scroll)': 'getSrollPosition($event)' },
})
export class MyServicesComponent implements AfterViewInit {
  resources: any;
  isSpinning: boolean = false;
  apiCall: boolean = true;
  notification = new NotificationMessageModel();
  servicesList: any = [];
  alert = new AlertModel();
  groupsAndServices: any = [];
  pageOffset: any = 0;
  isCallFromExternal: boolean= false;
  loader: boolean= false;


  constructor(
    private service: MyServicesService,
    private resourceService: ResourceService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loader = true;
    this.resources = this.resourceService.getResouceData();
    this.resourceService.languageChange.subscribe((event) => {
      if (event.direction === 'down') {
        this.isSpinning = false;
        this.resourceService
          .reloadResouces(TranslationKeys.services)
          .subscribe((res) => {
            this.isSpinning = true;
            var model = new SendEvent();
            model.direction = 'up';
            this.resourceService.languageChange.next(model);
          });
      }
    });
    
    this.route.params.subscribe((param) => {
      if (param && param.id) {
        this.isCallFromExternal = true;
        //this.proceedToProfile(param.id)
      }else{
        this.getGroupServices();
      }      
    });   
  }

  getGroupServices(){
    this.service.get('GetGroups').subscribe((res) => {
      if(res){
        this.groupsAndServices = Utils.parse(res);      
      }
    });
  }
  getSrollPosition(event) {
    this.pageOffset = window.pageYOffset;
  }
  getPostion(i) {
    var id = this.groupsAndServices[i].id;
    const el1 = document.getElementById(id);
    if (i == 0) window.scroll(0, 0);
    else
      window.scroll({
        top: el1.offsetTop,
        left: 0,
        behavior: 'smooth',
      });
  }
  ngAfterViewInit() {
    this.apiCall = false;
  }

  public createAppplication(event): any {
    debugger
    if (!this.authService.isAuthenticated()) {
      this.alert.show = true;
      this.alert.type = 'error';
      let message = this.resources.find(
        (x) =>
          x.category.toLowerCase() == 'alerts' &&
          x.key.toLowerCase() == 'loginerror'
      );
      this.alert.message = message ? message.value : constants.loginErrorEng;
      this.alert.errorNumber = '404';

      this.router.navigate(['/signin']);
      // this.authService.login();
      return;
    }
    this.apiCall = true;
    //First check permission for this service
    const requestParams = { ServiceId: event.Id, StageActionId: '' };
    this.service.getData('Services/CheckPermission', requestParams).subscribe(
      (response) => {
        if (response && response.permission == true) {
          if (response.needProfile) this.proceedToProfile(event.Id);
          else this.proceedToNewApplication(event.Id);
        } else {
          this.apiCall = false;
          this.alert.show = true;
          this.alert.type = 'error';
          let message = this.resources.find(
            (x) =>
              x.category.toLowerCase() == 'alerts' &&
              x.key.toLowerCase() == 'permissionerror'
          );
          this.alert.message = message
            ? message.value
            : constants.permissionErrorEng;
          this.alert.errorNumber = '404';
        }
      },
      (error) => {
        this.apiCall = false;
        this.alert.show = true;
        this.alert.type = 'error';
        this.alert.message = error;
        this.alert.errorNumber = '404';
      }
    );
  }

  private proceedToNewApplication(Id): void {
    const inputRequest = {
      ServiceID: Id,
      ParentApplication: null,
      ProfileAppId: null,
      recordId:null
    };
    this.service.post('Application', inputRequest).subscribe((result) => {
      if (result && result.addApplicationResult.status == 200) {
        this.router.navigate([
          `/create/application/${result.addApplicationResult.id}/`,
        ]);
        this.apiCall = false;
      } else {
        this.alert.show = true;
        this.alert.type = 'error';
        this.alert.message = result.addApplicationResult.errorMessage;
        this.alert.errorNumber = '404';
        this.apiCall = false;
      }
    });
  }
  private proceedToProfile(serviceId): void {
    this.router.navigate([`/create/profile/${serviceId}`]);
  }
}

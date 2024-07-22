/* angular core modules */
import { Injectable } from '@angular/core';
/* rxjs */
import { BehaviorSubject, Observable, Subject, throwError } from 'rxjs';
import { User, UserManager, UserManagerSettings, WebStorageStateStore } from 'oidc-client';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, RouterStateSnapshot } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd';
import { SharedHttpService } from 'src/app/Shared/Services/http.Services';
export class PassEvent {
  loaded: string;
  value:boolean
}
@Injectable()
export class AuthService {
  private _authNavStatusSource = new BehaviorSubject<boolean>(false);
  // Observable navItem stream
  authNavStatus$ = this._authNavStatusSource.asObservable();
  public isResponseBySSO: Subject<PassEvent> = new Subject<PassEvent>();
  static _user: User;
  static _userManager: UserManager;

  private static get UserManager() {
    if (this._userManager == null) {
      this._userManager = new UserManager(this.getClientSettings);
      this._userManager.events.addUserLoaded(args => {
        this.UserManager.getUser().then(user => {
          this._user = user;
        });
      });
    }
    return this._userManager;
  }

  private static set User(value: User) {
    this._user = value;
    localStorage.setItem('user', JSON.stringify(this._user));
  }

  private static get User(): User {
    if (this._user == null) {
      this._user = JSON.parse(localStorage.getItem('user'));
    }
    return this._user;
  }

  private static get getClientSettings(): UserManagerSettings {
    return {
      authority: environment.authUrl,
      client_id: environment.clientId,
      redirect_uri: `${environment.clientRoot}/signin-callback`,
      scope: "openid profile",
      response_type: "code",
      post_logout_redirect_uri: `${environment.clientRoot}/signout-callback`,
      automaticSilentRenew: true,
      silent_redirect_uri: `${environment.clientRoot}/renew-callback`,
      accessTokenExpiringNotificationTime: 60
    }
  }
  private APIUrl: string = environment.apiGateway;
  private httpObj: any;
  constructor(
    private http: HttpClient, 
    private router: Router, 
    private notification: NzNotificationService) {
    this.fetchUser();
  }
  public updateUser(endPoint: string): Observable<any> {
    this.httpObj = new SharedHttpService(this.APIUrl, this.http, endPoint);
    return this.httpObj.post();
}

  fetchUser() {
    AuthService.UserManager.getUser().then(user => {
      AuthService.User = user;

      this._authNavStatusSource.next(this.isAuthenticated());
    });
  }

  login(retUrl: string = '') {
    AuthService.UserManager.signinRedirect({
      extraQueryParams: {
        lang: this.getCurrentCulture(),
        baseUrl: window.location.origin
      }
    }).then((user)=>{
      var model = new PassEvent();
      model.value = true;
      this.isResponseBySSO.next(model);
    }).catch(error=>{
      var model = new PassEvent();
      model.value = false;
      this.isResponseBySSO.next(model);
    })
  }

  getCurrentCulture(): string {
    let languageId = localStorage.getItem('selectedLanguage') !=null ? JSON.parse(localStorage.getItem('selectedLanguage')).id : 1;

    if (languageId === 1) {
      return 'en-US';
    }

    return 'ar-AE';
  }

  async completeAuthentication() {
    await AuthService.UserManager.signinRedirectCallback();
  }
 
  async renewAuthentication() {
    AuthService.UserManager.signinSilentCallback();
  }

  isAuthenticated(): boolean {
    return AuthService.User != null;
    // return AuthService.User != null && !AuthService.User.expired;
  }

  isAuthenticationExpired(): boolean {
    if (AuthService.User) {
      // this.signout();
      return AuthService.User.expired;
    } else {
      return true;
    }
  }

  get Loggedin(): boolean {
    return AuthService.User != null;
  }

  getLatestToken() {
    return AuthService.UserManager.getUser();
  }

  get authorizationHeaderValue(): any {
    return `${AuthService.User.token_type} ${AuthService.User.access_token}`;
  }

  get name(): string {
    return AuthService.User != null ? AuthService.User.profile.FullName : '';
  }
  get getLoginUserId(): any {
    return AuthService.User != null ? AuthService.User.profile : '';
  }

  get getRole(): any {
    return AuthService.User != null ? AuthService.User.profile?.role : false;
  }

  isAdmin(): boolean {
    // return AuthService.User != null ? AuthService.User.profile.role.some(x => (x).toLowerCase() == "admin") : false;
    return AuthService.User != null ? AuthService.User.profile?.role?.includes('Admin') : false;
  }

  async signout() {
    await AuthService.UserManager.signoutRedirect();
    this.completeSignout();
  }

  completeSignout() {
    localStorage.clear();
    sessionStorage.clear();
    AuthService.UserManager.clearStaleState();
    AuthService.User = null;
    this._authNavStatusSource.next(this.isAuthenticated());
  }

  private handleError(error: any) {

    var applicationError = error.headers.get('Application-Error');

    // either application-error in header or model error in body
    if (applicationError) {
      return throwError(applicationError);
    }

    var modelStateErrors: string = '';

    // for now just concatenate the error descriptions, alternative we could simply pass the entire error response upstream
    for (var key in error.error) {
      if (error.error[key]) modelStateErrors += error.error[key].description + '\n';
    }

    modelStateErrors = modelStateErrors = '' ? null : modelStateErrors;
    return throwError(modelStateErrors || 'Server error');
  }

  public notify(type, title, message) {
    this.notification.create(type, title, message);
  }

}
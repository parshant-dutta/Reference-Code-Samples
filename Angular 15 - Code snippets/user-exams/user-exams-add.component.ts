import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';

import { UserExamService } from '../../../../services/entities/user-exam.service';
import { NotifyService } from '../../../../services/notify/notify.service';
import { BreadcrumbService } from '../../../../services/breadcrumb/breadcrumb-service';
import { UserExam } from '../../../../domain/authorizations/UserExam';
import { UserFullNamePicker } from '../../../../interface/userPicker/userFullNamePicker';
import { ValidationService } from '../../../../services/validation/validation.service';
import { LightUser } from 'app/domain/LightUser';
import { RegulatoryBodyPicker } from 'app/interface/searchInputStructure/regulatory-body-picker';
import { RegulatoryBody } from '../../../../domain/masterData/regulatoryAuthority/RegulatoryBody';
import { ExamsSearchStructure } from 'app/interface/searchInputStructure/exams-search-structure';
import { Exam } from '../../../../domain/masterData/exam/Exam';
import { SearchinputComponent } from '../../../../components/searchinput/searchinput.component';
import { EnumService } from '../../../../services/entities/enum.service';
import { SimpleDataObject } from '../../../../domain';
import { AppRoutes } from '../../../../constant/url/AppRoutes';
import { Global } from '../../../../constant/Global';
import { UserExamsPermissions } from '../../../../constant/permissions/authorizations/user_exams-permissions';
import { I18Service } from '../../../../services';
import { DatepickerComponent } from '../../../../components/datepicker/datepicker.component';
import { CanComponentDeactivate } from '../../../../services/router/router-deactivate-listener.service';
import { CommonNotifyService } from '../../../../services/notify/common-notify.service';
import { DisableUserInteractionService } from '../../../../services/disableuserinteraction/disable-user-interation.service';
@Component({
	selector: 'app-user-exams-add',
	templateUrl: './user-exams-add.component.html'
})
export class UserExamsAddComponent implements OnInit , CanComponentDeactivate, OnDestroy {
	public edit: any;

	@ViewChild('userExamsForm', { static: true }) public userExamsForm: ElementRef;
	public userExamsFormId: string;

	@ViewChild('examSearchInput') public examSearchInput: SearchinputComponent;
	@ViewChild('dateReceivedComponent', { static: true })
	public dateReceivedComponent: DatepickerComponent;

	public title: string;

	public model: UserExam = new UserExam();
	public userPicker: UserFullNamePicker = new UserFullNamePicker();
	public regulatoryBodyPicker: RegulatoryBodyPicker = new RegulatoryBodyPicker();
	public examsSearchStructure: ExamsSearchStructure = new ExamsSearchStructure();
	public finraExamStatuses: Observable<Array<SimpleDataObject>>;
	public userExamStatuses: Observable<Array<SimpleDataObject>>;
	public waiverStatuses: Observable<Array<SimpleDataObject>>;
	public waiverReasons: Observable<Array<SimpleDataObject>>;
	public canEdit: boolean;
	public showBeginDate: boolean;
	public showEndDate: boolean;
	public permission: string;
	public management: boolean;

	public isSubmittingFrom: boolean = false;
	public showLeavePage: boolean = false;
	public leavePage: Subject<boolean> = new Subject();

	constructor(
		private activeRoute: ActivatedRoute,
		private userExamService: UserExamService,
		private notificationService: NotifyService,
		private commonNotifyService: CommonNotifyService,
		private enumService: EnumService,
		private router: Router,
		public breadcrumbService: BreadcrumbService,
		private interaction: DisableUserInteractionService,
		private i18: I18Service,
		private validationService: ValidationService
	) {
		this.userExamsFormId = validationService.generateFormId('add-user-exam-form-');
	}

	public ngOnInit(): void {
		this.edit = this.activeRoute.snapshot.data['edit'];
		this.management = Boolean(this.activeRoute.snapshot.data['management']);
		this.loadModel();
		this.loadDropDownLists();
	}

	private loadModel(): void {
		this.activeRoute.data.subscribe((resolverData) => {
			if (resolverData.detail) {
				this.model = new UserExam(resolverData.detail);
				this.model.regulatoryBody = new RegulatoryBody({id: this.model.exam.regulatoryBodyId, shortName: this.model.exam.regBodyShortName});
				if (this.management) {
					this.title = `${this.i18.getMessageValue('label.breadcrumb.edit')} ${this.model.user.fullName} (${this.model.exam.name})`;
				} else {
					this.title = `${this.i18.getMessageValue('label.breadcrumb.edit')} ${this.model.exam.name} (${this.model.exam.regBodyShortName})`;
				}

				this.breadcrumbService.addBreadcrumbTitle(this.router, this.title);
			} else {
				this.title = this.i18.getMessageValue(this.activeRoute.snapshot.data['title']);
				this.breadcrumbService.addBreadcrumb(this.activeRoute, this.router);
			}
			this.managePermissions(resolverData);
		});
	}

	private managePermissions(resolverData): void {
		if (this.edit) {
			this.permission = this.management ? 'updateUserExam' : 'editMyExamination';
		} else {
			this.permission = this.management ? 'createUserExam' : 'createMyExamination';
		}

		if (!resolverData.permissions[this.permission]) {
			this.notificationService.showError('', this.i18.getMessageValue('errors.accessDenied'));
			this.router.navigate([AppRoutes.MY_OVERVIEW]);
		}
		this.canEdit = resolverData.permissions[UserExamsPermissions[Global.UPDATE]];

		this.showBeginDate = !resolverData.permissions[UserExamsPermissions['hideBeginDate']] || this.management;
		this.showEndDate = !resolverData.permissions[UserExamsPermissions['hideEndDate']] || this.management;
	}

	private loadDropDownLists(): void {
		this.finraExamStatuses = this.enumService.getFinraExamStatus()
			.pipe(map(enumObj => {
				const enumMapArray = this.enumService.getSimpleDataObjectsArray(enumObj);
				this.addEmptyElement(enumMapArray);

				return enumMapArray;
			}));
		this.userExamStatuses = this.enumService.getUserExamStatus()
			.pipe(map(enumObj => {
				const enumMapArray = this.enumService.getSimpleDataObjectsArray(enumObj);
				this.addEmptyElement(enumMapArray);

				return enumMapArray;
			}));
		this.waiverStatuses = this.enumService.getWaiverStatus()
			.pipe(map(enumObj => {
				const enumMapArray = this.enumService.getSimpleDataObjectsArray(enumObj);
				this.addEmptyElement(enumMapArray);

				return enumMapArray;
			}));
		this.waiverReasons = this.enumService.getWaiverReason()
			.pipe(map(enumObj => {
				const enumMapArray = this.enumService.getSimpleDataObjectsArray(enumObj);
				this.addEmptyElement(enumMapArray);

				return enumMapArray;
			}));
	}

	private addEmptyElement(list: Array<SimpleDataObject>): void {
		this.i18.getMessageValue('label.placeholder.selection');
		list.splice(0, 0,
			new SimpleDataObject('', this.i18.getMessageValue('label.placeholder.selection')
		));
	}

	public userSelected(user): void {
		this.model.user = new LightUser({id: user.id, fullName: user.fullName});
	}

	public regulatoryBodySelected(regulatoryBody): void {
		this.model.regulatoryBody = regulatoryBody ? new RegulatoryBody(regulatoryBody) : null;
		this.model.exam = regulatoryBody ? new Exam() : null;
		if (this.examSearchInput) {
			this.examSearchInput.clean();
		}

	}

	public examBodySelected(exam): void {
		if (exam) {
			this.model.exam = new Exam(exam);
			// Fix for inconsistent structures
			this.model.exam.regulatoryBodyId = exam.regulatoryBodyId;
			this.model.exam.regBodyShortName = exam.regBodyShortName;
		} else {
			this.model.exam = null;
		}
	}

	public setFinraExamStatus(finraStatus: SimpleDataObject): void {
		if (finraStatus && finraStatus.id) {
			this.model.finraExamStatus = finraStatus.id;
		} else {
			this.model.finraExamStatus = null;
		}
	}

	public setUserExamStatus(userExamStatus: SimpleDataObject): void {
		if (userExamStatus && userExamStatus.id) {
			this.model.status = userExamStatus.id;
		} else {
			this.model.status = null;
		}
	}

	public setWaiverStatus(waiverStatus: SimpleDataObject): void {
		if (waiverStatus && waiverStatus.id) {
			this.model.waiverStatus = waiverStatus.id;
		} else {
			this.model.waiverStatus = null;
		}
	}

	public setWaiverReason(waiverReason: SimpleDataObject): void {
		if (waiverReason && waiverReason.id) {
			this.model.waiverReason = waiverReason.id;
		} else {
			this.model.waiverReason = null;
		}
	}

	public datePropertyChange(property, value): void {
		if (value) {
			this.model[property] = value.from;
		} else {
			this.model[property] = null;
		}
	}

	public save(): void {
		if (this.validationService.validateForm(this.userExamsFormId, this.userExamsForm)) {
			this.interaction.disableUserInteraction(true);
			this.isSubmittingFrom = true;
			this.userExamService.save(this.model, this.management).subscribe(() => {
				this.interaction.enableUserInteractionAndRemoveNotification();
				this.commonNotifyService.showNotificationCreateOrUpdateSuccess('label.userExams.name', this.edit);
				this.redirectToListingPage();
			}, () => {
				this.interaction.enableUserInteractionAndRemoveNotification();
				this.notificationService.showError('Error', this.i18.getMessageValue('error.internal'));
				this.redirectToListingPage();
			});
		}
	}

	public cancel(): void {
		if (this.breadcrumbService.breadcrumbs.length > 0) {
			this.router.navigate([this.breadcrumbService.breadcrumbs[(this.breadcrumbService.breadcrumbs.length - 2)].link]);
		}
	}

	public redirectToListingPage(): void {
		const url = this.management ? AppRoutes.KYE_INDIVIDUAL_EXAMS : AppRoutes.MY_EXAMINATIONS;
		this.router.navigate([`/${url}`]);
	}

	public modalLeavePage(canLeave: boolean): void {
		this.showLeavePage = false;
		this.leavePage.next(canLeave);
	}

	public canDeactivate(): (Observable<boolean> | Promise<boolean> | boolean) {
		this.showLeavePage = !this.isSubmittingFrom;

		return this.isSubmittingFrom || this.leavePage.asObservable();
	}

	public ngOnDestroy(): void {
		this.leavePage.unsubscribe();
	}

}

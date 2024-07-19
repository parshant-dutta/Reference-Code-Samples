import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, Observable, of, Subject } from 'rxjs';
import { catchError, filter, finalize, map, switchMap, tap } from 'rxjs/operators';

import { BreadcrumbService } from '../../../../services/breadcrumb/breadcrumb-service';
import { AppRoutes } from '../../../../constant/url/AppRoutes';
import { UserFullNamePicker } from '../../../../interface/userPicker/userFullNamePicker';
import { I18Service } from '../../../../services';
import { ValidationService } from '../../../../services/validation/validation.service';
import { ValidationFn, Validators } from '../../../../services/validation';
import { CanComponentDeactivate } from '../../../../services/router/router-deactivate-listener.service';
import { CommonNotifyService } from '../../../../services/notify/common-notify.service';
import { DisableUserInteractionService } from '../../../../services/disableuserinteraction/disable-user-interation.service';
import { Branch } from '../../../../domain/authorizations/branch';
import { BranchService } from '../../../../services/entities/branch.service';
import { SimpleObject } from '../../../../interface/SimpleObject';
import { EnumService } from '../../../../services/entities/enum.service';
import { SimpleDataObject } from '../../../../domain';
import { BranchPicker } from '../../../../interface/searchInputStructure/branch-picker';
import { CompanyLegalEntityService } from '../../../../services/entities/company-legal-entity.service';
import { LightUser } from 'app/domain/LightUser';
import { MessageBusService } from 'app/components-m/entity-page-container/templates/embeddable-pages-template/services/message-bus/message-bus.service';
import { EmbeddablePagesEvents } from 'app/components-m/entity-page-container/templates/embeddable-pages-template/EmbeddablePagesEvents';
import { EntityType } from 'app/enum/entityType/EntityType';
import { CustomFieldsService } from 'app/services/custom-fields/custom-fields.service';
import { DateObject } from 'app/interface/Datepicker';
import { UserPicker } from 'app/interface/userPicker/UserPicker';
import { BranchCleArlLink } from 'app/domain/authorizations/branch-cle-arl-link';
import { StaticTableData, StaticTableModel } from 'app/components/m-table/models/extended-models/static-table.model';
import { ExtendedTableModelFactoryService } from 'app/components/m-table/models/extended-models/extended-table-model-factory.service';
import { CompanyLegalEntityArl } from 'app/domain/authorizations/CompanyLegalEntityArl';
import { ActionEvent } from 'app/components/m-table/models/m-table.interface';
import { ModelValidator } from 'app/services/validation/validators/service-validator';
import { AddressTypeMap } from '../../../../components-m/address/service/address-type-map';
import { getProductType } from 'app/shared/utils/url-helpers/url-helpers';
import { AddressEntityLinkType } from '../../../../components-m/modal-add-address/modal-add-address.component';
import { AddressEntityLink } from '../../../../interface/AddressEntityLink';
import { BranchAddressLink } from '../../../../interface/BranchAddressLink';
import { CompanyLegalEntityArlsOfMasterPicker } from '../../../../interface/searchInputStructure/company-legal-entity-arls-of-master-picker';
import { BranchCleArlRepService } from '../service/branch-cle-arl-rep.service';

@Component({
	selector: 'm-branch-add',
	templateUrl: './branch-add.component.html'
})
export class BranchAddComponent implements OnInit , CanComponentDeactivate, OnDestroy  {

	@ViewChild('branchForm', { static: true }) public branchForm: ElementRef;
	public branchFormId: string;
	@ViewChild('leaLinkForm', { static: false }) public leaLinkForm: ElementRef;
	public leaLinkFormId: string;

	public model: Branch = new Branch();
	public permission: string;
	public title: string;
	public edit: boolean;
	public hasSubBranches = false;
	public branchTypes: Array<SimpleObject>;
	public branchActivities: Array<SimpleObject>;
	public userPickerStructure: UserFullNamePicker = new UserFullNamePicker();
	public branchPickerStructure: BranchPicker = new BranchPicker();
	public searchInputPrimaryManager: UserPicker = new UserPicker();
	public legalEntityAuthorizationPicker: CompanyLegalEntityArlsOfMasterPicker = new CompanyLegalEntityArlsOfMasterPicker();
	public isSubmittingFrom = false;
	public showLeavePage = false;
	public leavePage: Subject<boolean> = new Subject();
	public validators: Validators = new Validators();
	public uniqueNameValidator: ValidationFn;
	public hasCustomFields = false;
	public leaLink: BranchCleArlLink = new BranchCleArlLink();
	public editedLeaId: string = null;
	public isProcessingLeaLink = false;
	public showAssociateLeaModal = false;
	public showConfirmDeleteLeaModal = false;
	public leaLinkTableModel: StaticTableModel = null;
	public branchCleArlAction: typeof BranchCleArlLinkTableAction = BranchCleArlLinkTableAction;
	public currentLeaTableAction: BranchCleArlLinkTableAction = null;
	public uniqueLeaValidator: ValidationFn;
	public uniqueBranchName: ValidationFn;
	private leaTableStaticModel: StaticTableData = null;
	public addressTypeMap: AddressTypeMap = AddressTypeMap.BRANCH;
	public noPrimaryAddressExistErrorLabel = 'table.addresses.error.noPrimaryAddress';
	public showFinra = false;
	public leaLinks: Array<BranchCleArlLink> = [];
	public currentBranchAddresses: Array<AddressEntityLink> = [];
	public shouldOpenConfirmationModalOnAdd = false;
	public shouldOpenConfirmationModalOnUpdate = false;
	public newlyAddedAddress: BranchAddressLink;
	public updatedAddress: BranchAddressLink;
	public finraBranchRegulatorIdType: string = null;

	constructor(
		private activeRoute: ActivatedRoute,
		private branchService: BranchService,
		private commonNotifyService: CommonNotifyService,
		private legalEntityService: CompanyLegalEntityService,
		private router: Router,
		private i18: I18Service,
		private interaction: DisableUserInteractionService,
		private enumService: EnumService,
		private breadcrumbService: BreadcrumbService,
		private validationService: ValidationService,
		private messageBusService: MessageBusService,
		private tableModelFactory: ExtendedTableModelFactoryService,
		private customFieldsService: CustomFieldsService,
		private branchCleArlRepService: BranchCleArlRepService
	) {
		this.leaLinkTableModel = this.tableModelFactory.getStaticTableModelInstance();
		this.branchFormId = this.validationService.generateFormId('add-branch-form-');
		this.leaLinkFormId = this.validationService.generateFormId('lea-link-form-');
		this.uniqueNameValidator = this.validators.service(this.branchService, this.model, this.i18.getMessageValue('errorMessage.branch.uniqueName'));
		this.leaTableStaticModel = {
			body: [],
			headers: [
				{
					relation: 'legalEntityName',
					label: this.i18.getMessageValue('label.branch.legalEntity.short.name'),
					display: true
				},
				{
					relation: 'legalEntityAuthorizationCode',
					label: this.i18.getMessageValue('label.branch.legalEntity.regulatory.lea.code'),
					display: true
				},
				{
					relation: 'regulatoryCodeName',
					label: this.i18.getMessageValue('label.branch.legalEntity.regulatory.body.code.name'),
					display: true
				},
				{
					relation: 'legalEntityAuthorizationName',
					label: this.i18.getMessageValue('label.branch.legalEntity.regulatory.lea.name'),
					display: true
				},
				{
					relation: 'regulatorBodyName',
					label: this.i18.getMessageValue('label.branch.legalEntity.regulatory.body.name'),
					display: true
				},
				{
					relation: 'legalEntityAuthorizationNumber',
					label: this.i18.getMessageValue('label.branch.legalEntity.lea.regulatory.identifier'),
					display: true
				},
				{
					relation: 'branchRegulatorId',
					label: this.i18.getMessageValue('label.branch.legalEntity.branch.regulatory.identifier'),
					display: true
				},
				{
					relation: 'subBranch',
					label: this.i18.getMessageValue('label.branch.legalEntity.branch.sub.branch'),
					display: true
				}
			],
			rowActionButtons: [
				{ id: BranchCleArlLinkTableAction.EDIT, label: this.i18.getMessageValue('action.edit'), icon: 'fa-pencil' },
				{ id: BranchCleArlLinkTableAction.REMOVE, label: this.i18.getMessageValue('label.delete'), icon: 'fa-trash' }
			]
		};
		this.uniqueLeaValidator = new ModelValidator(
			() => this.checkUniqueLink(),
			null,
			this.i18.getMessageValue('label.branch.legalEntity.error.already.associated')
		);
		this.uniqueBranchName = new ModelValidator(
			() => this.isBranchDifferent(),
			null,
			this.i18.getMessageValue('errorMessage.branch.edit.branchCanNotSameAsOsjbranch')
		);
	}

	public ngOnInit(): void {
		this.edit = this.activeRoute.snapshot.data.edit;
		if (this.edit) {
			this.loadModel();
		} else {
			this.title = this.i18.getMessageValue(this.activeRoute.snapshot.data.title);
			this.breadcrumbService.addBreadcrumb(this.activeRoute, this.router);
			this.loadLeaLinksTable();
			this.branchService.getBranchRegulatorIdType().subscribe(data => this.finraBranchRegulatorIdType = data.finraBranchRegulatorIdType);
		}
		this.loadDropdownData();
		this.managePermissions();
		this.setupCustomFields();
		this.populateCustomFields();
	}

	public ngOnDestroy(): void {
		this.leavePage.unsubscribe();
	}

	public setPrimaryManager(event: LightUser): void {
		this.model.primaryBranchManagerId = event?.id;
		this.model.primaryBranchManager = event?.fullName;
	}

	public supervisoryJurisdictionChanged(event: string): void {
		this.model.officeSupervisoryJurisdiction = event === 'yes';
		if (this.model.officeSupervisoryJurisdiction) {
			this.model.osjBranchId = null;
			this.model.osjBranchName = null;
		}
	}

	public subBranch(event: string): void {
		this.leaLink.subBranch = event === 'yes';
	}

	public branchSelectedChange(event: any): void {
		this.model.osjBranchId = event?.id;
		this.model.osjBranchName = event?.name;
	}

	private isBranchDifferent(): Observable<boolean> {
		return of(this.model.name !== this.model.osjBranchName);
	}

	public changeActivities(event: Array<SimpleObject>): void {
		this.model.branchActivities = event;
	}

	public setBranchType(branchType: SimpleDataObject): void {
		this.model.branchType = branchType?.id;
	}

	public loadAdditionalOsjPersons(user: Array<any>): void {
		if (user) {
			this.model.osjPersons = user.map(attendee => new LightUser({ id: attendee.id, fullName: attendee.fullName || attendee.value }));
		}
	}

	public dateFromChange(fromDate: DateObject): void {
		if (fromDate) {
			this.model.fromDate = fromDate.from;
		}
	}

	public toDateChange(toDate: DateObject): void {
		if (toDate) {
			this.model.toDate = toDate.from;
		}
	}

	public onLegalEntityAuthorizationSelected(event: CompanyLegalEntityArl): void {
		this.hasSubBranches = event?.hasSubBranches;
		this.leaLink = new BranchCleArlLink({
			leaId: event?.id,
			legalEntityName: event?.cleName,
			regulatorBodyName: event?.regulatoryBodyName,
			regulatoryCodeName: event?.rbCode,
			legalEntityAuthorizationCode: event?.authorizationCode,
			legalEntityAuthorizationName: event?.leArlName,
			legalEntityAuthorizationNumber: event?.cleRegId,
			hasSubBranches:  event?.hasSubBranches,
			branchRegulatorId: this.leaLink.branchRegulatorId,
			subBranch: this.leaLink.subBranch,
			branchRegulatorIdLabel: event?.branchRegulatorIdLabel,
			legalEntityAuthorizationNumberLabel: event?.legalEntityAuthorizationNumberLabel
		});
	}

	public onLegalEntityAuthorizationValidation(): void {
		this.validationService.validateFormAsync(this.leaLinkFormId, this.leaLinkForm)
			.pipe(filter(valid => valid))
			.subscribe(() => this.processLeaLinkAction(this.currentLeaTableAction));
	}

	public onDeleteLegalEntityAuthorization(): void {
		this.processLeaLinkAction(BranchCleArlLinkTableAction.REMOVE);
	}

	public onBranchCleArlLinkTableAction(action: BranchCleArlLinkTableAction, event?: ActionEvent): void {
		this.currentLeaTableAction = action;
		switch (this.currentLeaTableAction) {
			case BranchCleArlLinkTableAction.ADD:
				this.leaLink = new BranchCleArlLink();
				this.showAssociateLeaModal = true;
				break;
			case BranchCleArlLinkTableAction.EDIT:
				this.editedLeaId = event.rowData.leaId;
				const idx = this.getLeaLinkIndexById(event.rowData.leaId);
				this.leaLink = new BranchCleArlLink(this.model.leaLinks[idx]);
				this.hasSubBranches = this.model.leaLinks[idx].hasSubBranches;
				this.showAssociateLeaModal = true;
				break;
			case BranchCleArlLinkTableAction.REMOVE:
				this.leaLink = new BranchCleArlLink({ leaId: event.rowData.leaId });
				this.showConfirmDeleteLeaModal = true;
				break;
		}
	}

	public save(): void {
		if (this.primaryAddressNotExist()) {
			this.validationService.validateFormAsync(this.branchFormId, this.branchForm);
			this.commonNotifyService.showNotificationError(this.noPrimaryAddressExistErrorLabel);
		} else {
			this.validationService.validateFormAsync(this.branchFormId, this.branchForm)
				.pipe(filter(validationResult => validationResult))
				.pipe(tap(() => this.interaction.disableUserInteraction()))
				.pipe(finalize(() => {
					this.interaction.enableUserInteraction();
					this.isSubmittingFrom = false;
				}))
				.pipe(catchError(err => {
					this.commonNotifyService.showNotificationGeneralError();
					throw err;
				}))
				.pipe(switchMap(() => this.branchService.save(this.model)))
				.subscribe(success => {
					this.commonNotifyService.showNotificationCreateOrUpdateSuccess('label.branch', this.edit);
					this.isSubmittingFrom = true;
					const route = getProductType() === 'admin' ? AppRoutes.ADMIN_FIRM_DATA_BRANCHES : AppRoutes.KYE_BRANCHES;
					this.router.navigate([`${route}/${AppRoutes.VIEW}/${success.id}`]);
				});
		}
	}

	public modalLeavePage(): void {
		this.showLeavePage = false;
		this.leavePage.next(true);
	}

	public canDeactivate(): (Observable<boolean> | Promise<boolean> | boolean) {
		this.showLeavePage = !this.isSubmittingFrom;
		return this.isSubmittingFrom || this.leavePage.asObservable();
	}

	public getLegalEntityAuthorizationNumberLabel(): string {
		return this.leaLink.legalEntityAuthorizationNumberLabel != null
			? this.leaLink.legalEntityAuthorizationNumberLabel
			: this.i18.getMessageValue('label.branch.legalEntity.lea.regulatory.identifier');
	}

	public getBranchRegulatorIdLabel(): string {
		return this.leaLink.branchRegulatorIdLabel != null
			? this.leaLink.branchRegulatorIdLabel
			: this.i18.getMessageValue('label.branch.legalEntity.branch.regulatory.identifier');
	}

	public onAddressListChange(newAddresses: Array<AddressEntityLink>): void {
		this.branchCleArlRepService.getBranchCleArlReps(this.model.id)
			.subscribe(associatedReps => {
				if (this.edit && associatedReps && associatedReps.length > 0) {
					if (newAddresses.length > this.model.addresses.length) {
						this.handleAddAddress(newAddresses);
					} else if (newAddresses.length === this.model.addresses.length) {
						this.handleUpdateAddress(newAddresses);
					} else {
						this.handleDeleteAddress(newAddresses);
					}
				} else {
					this.model.addresses = newAddresses.map(newAddress => this.getBranchAddressLinkFromAddressEntityLink(newAddress));
				}
			});
	}

	public closeConfirmModalOnAdd(): void {
		this.changeBranchAddressInformationOnAdd();
		this.shouldOpenConfirmationModalOnAdd = false;
	}

	public markAddBranchAddressToRep(): void {
		this.newlyAddedAddress.shouldAddAddressToReps = true;
		this.closeConfirmModalOnAdd();
	}

	public closeConfirmModalOnUpdate(): void {
		this.changeBranchAddressInformationOnUpdate();
		this.shouldOpenConfirmationModalOnUpdate = false;
	}

	public markUpdateRepAddress(): void {
		this.updatedAddress.shouldUpdateRepsAddress = true;
		this.closeConfirmModalOnUpdate();
	}

	private checkRegulatorTypeExistence(regulatorIdType: string): boolean {
			return this.leaLinks.some((leaLink) => leaLink.branchRegulatorIdLabel === regulatorIdType);
		}

	private loadModel(): void {
		this.activeRoute.data.subscribe((resolverData) => {
			if (resolverData.detail?.data) {
				this.model = new Branch(resolverData.detail.data);
				this.currentBranchAddresses = this.model.addresses.map(addr => addr.addressEntityLink);
				this.leaLinks =  this.model.leaLinks;
				this.showFinra = this.checkRegulatorTypeExistence(this.model.finraRegulatorBranchIdentifierType);
				this.title = `${this.i18.getMessageValue('label.breadcrumb.edit')} ${this.model.name}`;
				this.breadcrumbService.addBreadcrumbTitle(this.router, this.title);
				this.loadLeaLinksTable();
			}
		});
	}

	private managePermissions(): void {
		this.permission = this.activeRoute.snapshot.data.permission;
		this.activeRoute.data.subscribe((resolverData) => {
			if (!resolverData.permissions[this.permission]) {
				this.router.navigate([AppRoutes.URL_NOT_AUTHORIZED]);
			}
		});
	}

	private setupCustomFields(): void {
		this.customFieldsService.getCustomFields(EntityType.BRANCH.toString()).subscribe(customFields =>
			this.hasCustomFields = customFields && customFields.length !== 0);
		this.messageBusService.emit(EmbeddablePagesEvents.ON_LOAD, {
			readOnly: false,
			entityType: EntityType.BRANCH
		}, BranchAddComponent.name);
	}

	private populateCustomFields(): void {
		this.model.entityType = EntityType.BRANCH;
		this.messageBusService.emit(EmbeddablePagesEvents.MODEL_LOADED, {
			model: this.model,
			entityType: EntityType.BRANCH
		}, BranchAddComponent.name);
	}

	private loadDropdownData(): void {
		forkJoin({
			branchTypes: this.enumService.getBranchTypes()
				.pipe(map(this.enumService.getSimpleDataObjectsArray)),
			branchActivities: this.enumService.getBranchActivities()
				.pipe(map(this.enumService.getSimpleDataObjectsArray)) }
		).subscribe(
			data => {
				this.branchTypes = data.branchTypes;
				this.branchActivities = data.branchActivities;
			},
			() => {
				this.commonNotifyService.showNotificationGeneralError();
			}
		);
	}

	private processLeaLinkAction(action: BranchCleArlLinkTableAction): void {
		let idx = null;
		switch (action) {
			case BranchCleArlLinkTableAction.ADD:
				this.model.leaLinks.push(this.leaLink);
				this.showAssociateLeaModal = false;
				this.leaLinks =  this.model.leaLinks;
				this.showFinra = this.checkRegulatorTypeExistence(this.finraBranchRegulatorIdType);
				break;
			case BranchCleArlLinkTableAction.EDIT:
				idx = this.getLeaLinkIndexById(this.leaLink.leaId);
				this.model.leaLinks[idx] = this.leaLink;
				this.showAssociateLeaModal = false;
				break;
			case BranchCleArlLinkTableAction.REMOVE:
				idx = this.getLeaLinkIndexById(this.leaLink.leaId);
				this.model.leaLinks.splice(idx, 1);
				this.showConfirmDeleteLeaModal = false;
				break;
		}
		this.hasSubBranches = false;
		this.loadLeaLinksTable();
	}

	private loadLeaLinksTable(): void {
		this.leaLinkTableModel = this.tableModelFactory.getStaticTableModelInstance();
		const tableData: StaticTableData = {
			...this.leaTableStaticModel,
			body: this.model.leaLinks?.length > 0 ? this.model.leaLinks : []
		};
		this.leaLinkTableModel.loadStaticData(tableData);
	}

	private getLeaLinkIndexById(id: string): number {
		return this.model.leaLinks.findIndex(link => link.leaId === id);
	}

	private checkUniqueLink(): Observable<boolean> {
		const duplicate =
			this.model
				.leaLinks
				.some(lea => lea.leaId === this.leaLink.leaId
					&& (this.currentLeaTableAction === BranchCleArlLinkTableAction.ADD
						|| (this.currentLeaTableAction === BranchCleArlLinkTableAction.EDIT && this.leaLink.leaId !== this.editedLeaId)));
		return of(!duplicate);
	}

	private primaryAddressNotExist(): boolean {
		let exist = false;
		for (const primaryAddressEntityLinkType of this.addressTypeMap.primaryAddressEntityLinkTypes) {
			if (!exist) {
				exist = !this.model.addresses.some(address => address.addressEntityLink.addressType === AddressEntityLinkType[primaryAddressEntityLinkType]);
			}
		}
		return exist;
	}

	private handleAddAddress(newAddresses: Array<AddressEntityLink>): void {
		this.newlyAddedAddress = new BranchAddressLink();
		this.newlyAddedAddress.addressEntityLink = newAddresses[newAddresses.length - 1];
		this.shouldOpenConfirmationModalOnAdd = true;
	}

	private handleUpdateAddress(newAddresses: Array<AddressEntityLink>): void {
		this.updatedAddress = new BranchAddressLink();
		this.updatedAddress.addressEntityLink = newAddresses.filter(address => this.isAddressChanged(address))[0];
		this.shouldOpenConfirmationModalOnUpdate = true;
	}

	private isAddressChanged(address: AddressEntityLink): boolean {
		const originalAddress = this.model.addresses.find(addr => addr.addressEntityLink.id === address.id);
		return originalAddress.addressEntityLink.occupiedFrom !== address.occupiedFrom ||
			originalAddress.addressEntityLink.occupiedTo !== address.occupiedTo;
	}

	private handleDeleteAddress(newAddresses: Array<AddressEntityLink>): void {
		this.model.addresses = this.model.addresses.filter(address => this.addressPresent(address.addressEntityLink, newAddresses));
	}

	private addressPresent(address: AddressEntityLink, newAddresses: Array<AddressEntityLink>): boolean {
		return newAddresses.findIndex(addr => addr.id === address.id) !== -1;
	}

	private changeBranchAddressInformationOnAdd(): void {
		this.model.addresses.push(this.newlyAddedAddress);
	}

	private changeBranchAddressInformationOnUpdate(): void {
		const index = this.model.addresses.findIndex(address => address.addressEntityLink.id === this.updatedAddress.addressEntityLink.id);
		this.model.addresses[index] = this.updatedAddress;
	}

	private getBranchAddressLinkFromAddressEntityLink(newAddress: AddressEntityLink): BranchAddressLink {
		const branchAddressLink: BranchAddressLink = new BranchAddressLink();
		branchAddressLink.addressEntityLink = newAddress;
		return branchAddressLink;
	}
}

enum BranchCleArlLinkTableAction {
	ADD = 'ADD',
	EDIT = 'EDIT',
	REMOVE = 'REMOVE'
}

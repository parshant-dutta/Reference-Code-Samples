import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, filter, finalize, map, switchMap, tap } from 'rxjs/operators';
import { forkJoin, of } from 'rxjs';

import { BreadcrumbService } from '../../../../services/breadcrumb/breadcrumb-service';
import { AppRoutes } from '../../../../constant/url/AppRoutes';
import { I18Service } from '../../../../services';
import { DisableUserInteractionService } from '../../../../services/disableuserinteraction/disable-user-interation.service';
import { getProductType, pathAsBase64 } from 'app/shared/utils/url-helpers/url-helpers';
import { TertiaryNavigationMenuItem } from '../../../../interface/TertiaryNavigationMenuItem';
import { CommonNotifyService } from '../../../../services/notify/common-notify.service';
import { ActionEvent, TableConfigObject } from '../../../../components/m-table/models/m-table.interface';
import { PageTableModel } from '../../../../components/m-table/models/extended-models/page-table.model';
import { AppAPI } from '../../../../constant/url/AppAPI';
import { ExtendedTableModelFactoryService } from '../../../../components/m-table/models/extended-models/extended-table-model-factory.service';
import { Branch } from '../../../../domain/authorizations/branch';
import { BranchService } from '../../../../services/entities/branch.service';
import { SimpleObject } from '../../../../interface/SimpleObject';
import { EnumService } from '../../../../services/entities/enum.service';
import { Status } from '../../../../components/status/interfaces/status.interface';
import { BranchPermissions } from '../../../../constant/permissions/authorizations/branch-permissions';
import { DualListSelectionModalConfiguration } from '../../../../components/dual-list-selection-modal/interfaces/dual-list-selection-modal.interfaces';
import { UserGroupPicker } from '../../../../interface/userPicker/userGroupPicker';
import { GroupsBranchStructure } from '../../../../interface/searchInputStructure/groups-branch-structure';
import { Group } from '../../../../domain/Group';
import { NotifyService } from '../../../../services/notify/notify.service';
import { BranchCleArlRep } from '../domain/branch-cle-arl-rep';
import { MTableFilterType } from 'app/components/m-table/models/enum/m-table-filter-type';
import { LookupType } from '../../../../enum/lookup-type/LookupType';
import { CommentService } from '../../../../services/comment/comment.service';
import { TableService } from 'app/services/table/table.service';
import { MessageBusService } from 'app/components-m/entity-page-container/templates/embeddable-pages-template/services/message-bus/message-bus.service';
import { EmbeddablePagesEvents } from 'app/components-m/entity-page-container/templates/embeddable-pages-template/EmbeddablePagesEvents';
import { EntityType } from 'app/enum/entityType/EntityType';
import { CustomFieldsService } from 'app/services/custom-fields/custom-fields.service';
import { MTableRowClickEvent } from 'app/components/m-table/models/row-click/m-table-row-click-event.model';
import { StaticTableData, StaticTableModel } from 'app/components/m-table/models/extended-models/static-table.model';
import { AddressTypeMap } from '../../../../components-m/address/service/address-type-map';
import { BranchCleArlLinkPicker } from '../../../../interface/searchInputStructure/branch-cle-arl-link-picker';
import { UserFullNamePicker } from '../../../../interface/userPicker/userFullNamePicker';
import { ValidationService } from '../../../../services/validation/validation.service';
import { BranchCleArlRepService } from '../service/branch-cle-arl-rep.service';
import { BranchUserAddress } from '../../../../domain/authorizations/branch-user-address';
import { StatusI18Enums } from '../../../../enum/i18/status-i18-enums';
import { BranchCleArlLink } from 'app/domain/authorizations/branch-cle-arl-link';

@Component({
	selector: 'm-branch-view',
	templateUrl: './branch-view.component.html'
})
export class BranchViewComponent implements OnInit, AfterViewInit {

	@ViewChild('branchCleArlRepForm') public branchCleArlRepForm: ElementRef;
	@ViewChild('deleteRepForm') public deleteRepForm: ElementRef;

	public branchCleArlRepFormId: string;
	public deleteRepFormId: string;

	public model: Branch = new Branch();
	public title: string;
	public permissions: BranchPermissions = null;
	public branchTypes: Array<SimpleObject>;
	public branchActivities: Array<SimpleObject>;
	public tertNavConfig: Array<TertiaryNavigationMenuItem>;
	public statusBar: Array<Status> = [];
	public branchCleArlRep: BranchCleArlRep = new BranchCleArlRep();
	public cleArlReps:  Array<BranchCleArlRep> = [];
	public showBranchCleArlRepPopup = false;
	public branchCleArlRepPopupActions: typeof BranchCleArlRepModalAction = BranchCleArlRepModalAction;
	public branchCleArlRepPopupAction: BranchCleArlRepModalAction;
	public branchCleArlLinkPicker: BranchCleArlLinkPicker = new BranchCleArlLinkPicker();
	public userPicker: UserFullNamePicker = new UserFullNamePicker();
	public showAssociateGroupPopup = false;
	public showAddCommentPopup = false;
	public addCommentUrl: string = AppAPI.COMMENTS_REQUEST.addComment();
	public repDualListPickerConfig: DualListSelectionModalConfiguration;
	public groupDualListConfig: DualListSelectionModalConfiguration;
	public userGroupPicker: UserGroupPicker = new UserGroupPicker();
	public groupPicker: GroupsBranchStructure;
	public commentClassificationConfigEnabled = false;
	public commentClassifications: Array<SimpleObject>;
	public readonly customFieldEvent: string = BranchViewComponent.name;
	public hasCustomFields = false;
	public leaLinkTableModel: StaticTableModel = null;
	public deleteModalTemplate: DeleteModalTemplateContent = null;
	public showConfirmDelete = false;
	public showGroupMember = false;
	public setToDateOnDeleteRep = true;
	public toDateStringOnDeletedRep: string = null;
	public showConfirmAddAssociatedRep = false;
	public selectedGroupName: string = null;
	public addressTypeMap: AddressTypeMap = AddressTypeMap.BRANCH;
	public legalEntityAuthorizationNumberLabel: string = null;
	public branchRegulatorIdLabel: string = null;
	private path: string = null;
	public showFinra = false;
	public leaLinks: Array<BranchCleArlLink> = [];
	private activeCleArlRep: string = null;

	public historyTable: PageTableModel = null;
	public tableConfig: TableConfigObject = {
		columnToggle: true,
		columnResize: true,
		multiLine: true,
		inlineFilters: false
	};
	public commentsTable: PageTableModel = null;
	public commentsTableConfig: TableConfigObject = {
		columnToggle: true,
		columnResize: true,
		multiLine: true,
		inlineFilters: true
	};
	public repTable: PageTableModel = null;
	public repTableConfig: TableConfigObject = {
		columnToggle: true,
		columnResize: true,
		multiLine: true,
		inlineFilters: true,
		advancedSearch: true,
		scheduledReportsButton: false
	};
	public groupTable: PageTableModel = null;
	public groupTableConfig: TableConfigObject = {
		columnToggle: true,
		columnResize: true,
		multiLine: true,
		inlineFilters: true,
		advancedSearch: true,
		scheduledReportsButton: false
	};
	public membersTable: PageTableModel = null;
	public membersTableConfig: TableConfigObject = {
		columnToggle: true,
		columnResize: true,
		inlineFilters: true,
		hideViewOpenInTabAction: true,
		advancedSearch: true,
		scheduledReportsButton: false
	};
	public branchUserAddressTableModel: PageTableModel = null;
	public branchUserAddressTableModelConfig: TableConfigObject = {
		columnToggle: true,
		columnResize: true,
		multiLine: true,
	};
	public hasBranchUserAddress: boolean;
	public branchUserAddressCount: number;
	public branchUserAddress: BranchUserAddress;

	private productType: string = null;

	constructor(private activeRoute: ActivatedRoute,
				private branchService: BranchService,
				private branchCleArlRepService: BranchCleArlRepService,
				private router: Router,
				private interaction: DisableUserInteractionService,
				private validationService: ValidationService,
				private commonNotifyService: CommonNotifyService,
				private notifyService: NotifyService,
				private breadcrumbService: BreadcrumbService,
				private i18: I18Service,
				private enumService: EnumService,
				private tableModelFactory: ExtendedTableModelFactoryService,
				private tableService: TableService,
				private commentService: CommentService,
				private cd: ChangeDetectorRef,
				private messageBusService: MessageBusService,
				private customFieldsService: CustomFieldsService) {

		this.historyTable = this.tableModelFactory.getPageTableModelInstance();
		this.commentsTable = this.tableModelFactory.getPageTableModelInstance();
		this.repTable = this.tableModelFactory.getPageTableModelInstance();
		this.groupTable = this.tableModelFactory.getPageTableModelInstance();
		this.membersTable = this.tableModelFactory.getPageTableModelInstance();
		this.branchUserAddressTableModel = this.tableModelFactory.getPageTableModelInstance();
		this.branchCleArlRepFormId = this.validationService.generateFormId('branch-cle-arl-rep-form-');
		this.deleteRepFormId = this.validationService.generateFormId('delete-rep-form-');

		this.repDualListPickerConfig = {
			extraFieldsConfiguration: [],
			searchPickerRelationName: 'fullName',
			filterPickerRelationName: 'id'
		};
		this.groupDualListConfig = {
			extraFieldsConfiguration: [],
			searchPickerRelationName: 'name'
		};
	}

	public ngOnInit(): void {
		this.productType = getProductType();
		this.initUiFields();
		this.loadModel();
		this.initLegalEntityAuthorizationNumberLabel();
		this.initBranchRegulatorIdLabel();
	}

	public ngAfterViewInit(): void {
		this.initTertNavConfig();
		this.initTertiaryTables();
		this.cd.detectChanges();
	}

	public edit(): void {
		this.path = this.productType === 'admin' ? AppRoutes.ADMIN_FIRM_DATA_BRANCHES : AppRoutes.KYE_BRANCHES;
		this.router.navigate([
			`/${this.path}/${AppRoutes.EDIT}/${this.model.id}`,
			{ pageFrom: pathAsBase64() }
		]);
	}

	public commentAdded(): void {
		this.commentsTable.refreshData();
		this.historyTable.refreshData();
	}

	public attachmentsChanged(attachments: number, reloadHistory: boolean): void {
		this.refreshBadge('ATTACHMENTS', attachments);
		if (reloadHistory) {
			this.historyTable.refreshData();
		}
	}

	public handleDeleteActionTableClick(entity: string, event: ActionEvent): void {
		if (event.button === 'delete') {
			this.showConfirmDeleteModal(entity, event.rowData.id, event.rowData.groupId);
		}
	}

	public handleBranchRepActionClick(event: ActionEvent): void {
		switch (event.button) {
			case 'delete':
				this.showConfirmDeleteModal('REP', event.rowData.id, event.rowData.groupId);
				break;
			case 'update':
				this.openBranchCleArlRepModal(BranchCleArlRepModalAction.UPDATE, event.rowData);
				break;
		}
	}

	public async showConfirmDeleteModal(entity = 'BRANCH', id?: string, groupId?: string): Promise<void> {
		switch (entity) {
			case 'BRANCH':
				this.deleteModalTemplate = {
					entity,
					id: this.model.id,
					title: 'label.branch.delete',
					message: 'label.branch.delete.information',
					hasBranchAddress: false
				};
				break;
			case 'REP': {
				let hasBranchAddress = false;
				await this.branchCleArlRepService.checkIfRepHasBranchAddress(id)
					.then(result => hasBranchAddress = result);
				this.deleteModalTemplate = {
					entity,
					id,
					title: 'label.branch.rep.action.delete',
					message: 'label.rep.delete.information',
                    hasBranchAddress: hasBranchAddress
				};
				break;
			}
			case 'GROUP':
				this.deleteModalTemplate = {
					entity,
					id: groupId,
					title: 'label.branch.group.remove.title',
					message: 'label.branch.group.remove.information',
					hasBranchAddress: false
				};
				break;
			default:
				this.deleteModalTemplate = null;
		}
		this.showConfirmDelete = !!this.deleteModalTemplate;
	}

	public onDelete(): void {
		switch (this.deleteModalTemplate?.entity) {
			case 'BRANCH':
				this.deleteBranch();
				break;
			case 'REP': {
				this.validationService.validateFormAsync(this.deleteRepFormId, this.deleteRepForm)
					.pipe(filter(valid => valid))
					.subscribe(() => {
						this.deleteBranchCleArlRep(this.deleteModalTemplate.id, this.toDateStringOnDeletedRep);
					});
				break;
			}
			case 'GROUP':
				this.removeGroupAssociation(this.deleteModalTemplate.id);
				break;
		}
	}

	public associateGroups(selectedGroups: Array<Group>): void {
		this.interaction.disableUserInteraction();
		this.branchService
			.associateGroupToBranch(this.model.id, selectedGroups.map(group => group.id))
			.pipe(catchError((err) => {
				this.commonNotifyService.showNotificationGeneralError();
				throw err;
			}))
			.pipe(finalize(() => this.interaction.enableUserInteraction()))
			.subscribe(() => {
				this.notifyService.showSimpleSuccess(this.i18.getMessageValue('label.branch.group.associate.success'));
				this.showAssociateGroupPopup = false;
				this.groupTable.refreshData();
				this.historyTable.refreshData();
			});
	}

	public showGroupMemberModal(event: MTableRowClickEvent): void {
		this.tableService.getExportTableConfig().subscribe(data => {
			this.membersTableConfig.configValues = data;
			this.membersTable = this.tableModelFactory.getPageTableModelInstance();
			const tableSettings = {
				url: AppAPI.ADMIN_GROUP_REQUEST.concat('/members/list'),
				parameters: {
					groupId: event.data.groupId,
					excludedActions: true
				},

			};
			this.membersTable.loadConfig(tableSettings);
			this.selectedGroupName = event.data.name;
			this.showGroupMember = true;
		});
	}

	private initTertNavConfig(): void {
		this.tertNavConfig = [
			{
				id: 'DETAILS',
				label: this.i18.getMessageValue('action.view'),
			},
			{
				id: 'REPS',
				label: this.i18.getMessageValue('label.branch.reps')
			},
			{
				id: 'GROUPS',
				label: this.i18.getMessageValue('label.branch.group.associate'),
				active: this.permissions?.viewGroupsInBranches
			},
			{
				id: 'COMMENTS',
				label: this.i18.getMessageValue('label.comments')
			},
			{
				id: 'ATTACHMENTS',
				label: this.i18.getMessageValue('title.viewAttachments')
			},
			{
				id: 'HISTORY',
				label: this.i18.getMessageValue('title.viewHistory')
			}
		];
	}

	private initUiFields(): void {
		this.loadBranchDropdownFields();
		this.loadClassificationModalConfiguration();
		this.setupCustomFields();
	}

	private loadBranchDropdownFields(): void {
		forkJoin({
				branchTypes: this.enumService.getBranchTypes()
					.pipe(map(this.enumService.getSimpleDataObjectsArray)),
				branchActivities: this.enumService.getBranchActivities()
					.pipe(map(this.enumService.getSimpleDataObjectsArray))
			}
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

	private setupCustomFields(): void {
		this.customFieldsService
			.getCustomFields(EntityType.BRANCH.toString())
			.subscribe(customFields => this.hasCustomFields = customFields?.length !== 0);
		this.messageBusService.emit(EmbeddablePagesEvents.ON_LOAD, {
			readOnly: false,
			entityType: EntityType.BRANCH
		}, BranchViewComponent.name);
	}

	private loadClassificationModalConfiguration(): void {
		this.branchService.getTableConfig()
			.pipe(tap((branchTableConfig) => this.commentClassificationConfigEnabled = branchTableConfig.configurations?.enableKYECommentsClassification))
			.pipe(switchMap(() => this.commentClassificationConfigEnabled ? this.commentService.getCommentClassifications(LookupType.KYE_COMMENTS_CLASSIFICATION) : of([])))
			.subscribe(data => this.commentClassifications = data);
	}

	private checkRegulatorTypeExistence(regulatorIdType: string): boolean {
		return this.leaLinks.some((leaLink) => leaLink.branchRegulatorIdLabel === regulatorIdType);
	}

	private loadModel(): void {
		this.activeRoute.data
			.pipe(tap((resolverData) => {
				this.permissions = resolverData.permissions;
				if (!this.permissions.viewBranch) {
					this.router.navigate([AppRoutes.MY_OVERVIEW]);
				}
			}))
			.subscribe((resolverData) => {
				this.model = new Branch(resolverData.detail.data);
				this.leaLinks = this.model.leaLinks;
				this.showFinra = this.checkRegulatorTypeExistence(this.model.finraRegulatorBranchIdentifierType);
				this.loadUsersWithSameResidentialAddressAsBranchAddress();
				this.loadLeaLinks();
				this.groupPicker = new GroupsBranchStructure();
				(this.groupPicker as any)['extraFilter'] = this.model.id;
				this.model.entityType = EntityType.BRANCH;
				this.initTitleAndStatusBar();
				this.populateCustomFields();
			});
	}

	private initTitleAndStatusBar(): void {
		this.title = this.model.name;
		this.breadcrumbService.addBreadcrumbTitle(this.router, this.title);
		this.statusBar.push({ icon: 'fa-clock-o', labelKey: 'label.creationDate', text: this.model.createdOn });
		this.statusBar.push({
			icon: 'fa-user',
			labelKey: 'label.createdBy',
			text: this.model.createdBy,
			userPopupId: this.model.createdById,
			customizedPopup: true
		});
	}

	private populateCustomFields(): void {
		this.messageBusService.emit(this.customFieldEvent, {
			model: this.model,
			readOnly: true,
			entityType: EntityType.BRANCH
		}, BranchViewComponent.name);
	}

	private initTertiaryTables(): void {
		this.initRepsTable();
		this.initHistoryTable();
		this.initCommentsTable();
		this.initGroupTable();
	}

	private initRepsTable(): void {
		this.tableService.getExportTableConfig().subscribe(data => {
			this.repTableConfig.configValues = data;
			const repTableSettings = {
				url: AppAPI.REP_REQUEST.list(),
				parameters: {
					branchId: this.model.id
				},
				defaultFilters: [
					{
						relation: 'status',
						value: ['Y'],
						type: MTableFilterType.MULTI_SELECT
					}
				]
			};
			this.repTable.loadConfig(repTableSettings);
			this.repTable.total$.subscribe(total => this.refreshBadge('REPS', total));
			this.fetchBranchCleArlReps();
		});
	}

	private initHistoryTable(): void {
		const tableSettings = {
			url: AppAPI.HISTORY_REQUEST.viewHistory(),
			parameters: {
				entityId: this.model.id,
				entityType: EntityType.BRANCH.toString(),
				productType: this.productType
			}
		};
		this.historyTable.loadConfig(tableSettings);
		this.historyTable.total$.subscribe(total => this.refreshBadge('HISTORY', total));
	}

	private initCommentsTable(): void {
		const commentsTableSettings = {
			url: AppAPI.COMMENTS_REQUEST.viewComments(),
			parameters: {
				entityId: this.model.id,
				entityType: EntityType.BRANCH.toString(),
				productType: this.productType
			}
		};
		this.commentsTable.loadConfig(commentsTableSettings);
		this.commentsTable.total$.subscribe(total => this.refreshBadge('COMMENTS', total));
	}

	private initGroupTable(): void {
		this.tableService.getExportTableConfig().subscribe(data => {
			this.groupTableConfig.configValues = data;
			if (this.permissions?.viewGroupsInBranches) {
				const tableSettings = {
					url: AppAPI.GROUP_BRANCH_REQUEST.list(),
					parameters: {
						branchId: this.model.id
					}
				};
				if (this.permissions?.associateGroupsWithBranches) {
					const actionButtons = [
						{ id: 'delete', label: this.i18.getMessageValue('label.delete'), icon: 'fa-trash' }
					];
					this.groupTable.setTableActions({ actionButtons: [actionButtons] });
				}
				this.groupTable.loadConfig(tableSettings);
				this.groupTable.total$.subscribe(total => this.refreshBadge('GROUPS', total));
			}
		});
	}

	private refreshBadge(id: string, quantity: number): void {
		this.tertNavConfig = this.tertNavConfig.map(tertNavElement => {
			if (tertNavElement.id === id) {
				tertNavElement.badge = quantity > 0 ? quantity : 0;
			}
			return tertNavElement;
		});
	}

	private deleteBranch(): void {
		this.interaction.disableUserInteraction();
		this.branchService.delete(this.model.id)
			.pipe(finalize(() => this.interaction.enableUserInteraction()))
			.pipe(catchError((error) => {
				this.commonNotifyService.showNotificationGeneralError();
				throw error;
			}))
			.subscribe(() => {
				this.commonNotifyService.showNotificationDeletedSuccess();
				this.showConfirmDelete = false;
				this.deleteModalTemplate = null;
				this.path = this.productType === 'admin' ? AppRoutes.ADMIN_FIRM_DATA_BRANCHES : AppRoutes.KYE_BRANCHES;
				this.router.navigate([`/${this.path}`]);
			});
	}

	private deleteBranchCleArlRep(repId: string, date: string): void {
		this.interaction.disableUserInteraction();
		this.branchCleArlRepService.deleteBranchCleArlRep(repId, date)
			.pipe(finalize(() => this.interaction.enableUserInteraction()))
			.pipe(catchError((error) => {
				this.commonNotifyService.showNotificationGeneralError();
				throw error;
			}))
			.subscribe(() => {
				this.commonNotifyService.showNotificationDeletedSuccess();
				this.historyTable.refreshData();
				this.repTable.refreshData();
                this.fetchBranchCleArlReps();
				this.resetModals();
			});
	}

	private removeGroupAssociation(groupId: string): void {
		this.interaction.disableUserInteraction();
		this.branchService.removeGroupFromBranch(this.model.id, groupId)
			.pipe(finalize(() => this.interaction.enableUserInteraction()))
			.pipe(catchError(error => {
				this.commonNotifyService.showNotificationGeneralError();
				throw error;
			}))
			.subscribe(() => {
				this.commonNotifyService.showNotificationDeletedSuccess();
				this.historyTable.refreshData();
				this.groupTable.refreshData();
				this.showConfirmDelete = false;
				this.deleteModalTemplate = null;
			});
	}

	public initLegalEntityAuthorizationNumberLabel(): void {
		this.legalEntityAuthorizationNumberLabel = this.model.leaLinks[0].legalEntityAuthorizationNumberLabel != null
			? this.model.leaLinks[0].legalEntityAuthorizationNumberLabel
			: this.i18.getMessageValue('label.branch.legalEntity.lea.regulatory.identifier');
	}

	public initBranchRegulatorIdLabel(): void {
		this.branchRegulatorIdLabel = this.model.leaLinks[0].branchRegulatorIdLabel != null
			? this.model.leaLinks[0].branchRegulatorIdLabel
			: this.i18.getMessageValue('label.branch.legalEntity.branch.regulatory.identifier');
	}

	private loadUsersWithSameResidentialAddressAsBranchAddress(): void {
		this.branchService.getUsersWithSameAddress(this.model.id).subscribe(response => {
			this.hasBranchUserAddress = response.total > 0;
			this.branchUserAddressCount = response.total;
			if (this.branchUserAddressCount === 1) {
				this.branchUserAddress = response.body[0];
				this.branchUserAddress.userAddressType = this.i18.getEnumValue(StatusI18Enums.ADDRESS_ENTITY_LINK_TYPE, this.branchUserAddress.userAddressType);
				this.branchUserAddress.branchAddressType = this.i18.getEnumValue(StatusI18Enums.ADDRESS_ENTITY_LINK_TYPE, this.branchUserAddress.branchAddressType);
			} else {
				const branchUserAddressTableSettings = {
					url: AppAPI.BRANCH_REQUEST.concat('/users-with-same-address'),
					parameters: {
						branchId: this.model.id
					}
				};
				this.branchUserAddressTableModel.loadConfig(branchUserAddressTableSettings);
			}
		});
	}

	private loadLeaLinks(): void {
		if (this.model.leaLinks?.length > 1) {
			this.leaLinkTableModel = this.tableModelFactory.getStaticTableModelInstance();
			const tableData: StaticTableData = {
				body: this.model.leaLinks,
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
			};
			this.leaLinkTableModel.loadStaticData(tableData);
		}
	}

	public openBranchCleArlRepModal(action: BranchCleArlRepModalAction, rowToUpdate?: SelectedBranchRepToUpdate): void {
		this.branchCleArlRepPopupAction = action;
		if (this.branchCleArlRepPopupAction === BranchCleArlRepModalAction.ADD) {
			this.branchCleArlRep = new BranchCleArlRep();
		} else if (this.branchCleArlRepPopupAction === BranchCleArlRepModalAction.UPDATE && rowToUpdate) {
			this.branchCleArlRep = this.createBranchRep(rowToUpdate);
		}
		this.showBranchCleArlRepPopup = true;
	}

	private createBranchRep(rowToUpdate: SelectedBranchRepToUpdate): BranchCleArlRep {
		const branchCleArlRep = new BranchCleArlRep();
		this.activeCleArlRep = rowToUpdate.id;
		branchCleArlRep.id = rowToUpdate.id;
		branchCleArlRep.linkId = rowToUpdate.linkId;
		branchCleArlRep.userId = rowToUpdate.userId;
		if (rowToUpdate.occupiedFrom !== '-') {
			branchCleArlRep.occupiedFrom = rowToUpdate.occupiedFrom;
		}
		if (rowToUpdate.occupiedTo !== '-') {
			branchCleArlRep.occupiedTo = rowToUpdate.occupiedTo;
		}
		branchCleArlRep.linkText = `${rowToUpdate.cleName} ${rowToUpdate.masterLeArlCode} ${rowToUpdate.regulatorBodyCode}`;
		branchCleArlRep.userText = rowToUpdate.userFullName;
		return branchCleArlRep;
	}

	public onBranchCleArlLinkSelected($event: { id: string, cleName: string, legalEntityARLCodeName: string, regulatorCodeName: string }): void {
		this.branchCleArlRep.linkId = $event?.id;
		this.branchCleArlRep.linkText = `${$event?.cleName} ${$event?.legalEntityARLCodeName} ${$event?.regulatorCodeName}`;
	}

	public onUserSelected($event: { id: string, fullName: string }): void {
		this.branchCleArlRep.userId = $event?.id;
		this.branchCleArlRep.userText = $event?.fullName;
	}

	public onBranchCleArlRepModalSubmit(): void {
		this.validationService.validateFormAsync(this.branchCleArlRepFormId, this.branchCleArlRepForm)
			.pipe(filter(valid => valid))
			.subscribe(() => {
				if (this.isBranchCleArlRepValid()) {
					switch (this.branchCleArlRepPopupAction) {
						case BranchCleArlRepModalAction.ADD:
							this.associateRepToBranchCleArl();
							break;
						case BranchCleArlRepModalAction.UPDATE:
							this.updateBranchCleArlRep();
							break;
					}
				} else {
					this.notifyService.showSimpleWarning(this.i18.getMessageValue('notification.text.error.userIsAlreadyAssociatedWithBranch',
							[this.branchCleArlRep.userText, this.branchCleArlRep.linkText]));
				}
			});
	}

	private associateRepToBranchCleArl(): void {
		this.interaction.disableUserInteraction();
		this.branchCleArlRepService.associateRepToBranchCleArl(this.branchCleArlRep)
			.pipe(finalize(() => this.interaction.enableUserInteraction()))
			.pipe(catchError((error) => {
				if (error) {
					if (error.errors) {
						this.notifyService.showSimpleCombinedErrors(error.errors);
					} else if ('noAddressMatch' in error) {
						this.showConfirmAddAssociatedRep = true;
						this.branchCleArlRep.shouldAddBranchAddressToRep = true;
					}
				} else {
					this.commonNotifyService.showNotificationGeneralError();
				}
				throw error;
			}))
			.subscribe(() => this.repIsAddedToBranch());
	}

	public onOccupiedFromChange(event : { from: string}): void {
		if(Date.parse(event.from) > Date.parse(this.branchCleArlRep.occupiedTo))
			this.branchCleArlRep.occupiedTo = null;
	}

	public onConfirmAddAssociatedRep(): void {
		this.interaction.disableUserInteraction();
		this.branchCleArlRepService.addAssociatedRep(this.branchCleArlRep)
			.pipe(finalize(() => this.interaction.enableUserInteraction()))
			.pipe(catchError(error => {
				this.commonNotifyService.showNotificationGeneralError();
				throw error;
			}))
			.subscribe(() => this.repIsAddedToBranch());
	}

	private updateBranchCleArlRep(): void {
		this.interaction.disableUserInteraction();
		this.branchCleArlRepService.updateBranchCleArlRep(this.branchCleArlRep)
			.pipe(finalize(() => this.interaction.enableUserInteraction()))
			.pipe(catchError((error) => {
				if (error && error.errors) {
					this.notifyService.showSimpleCombinedErrors(error.errors);
				} else {
					this.commonNotifyService.showNotificationGeneralError();
				}
				throw error;
			}))
			.subscribe(() => this.repIsAddedToBranch());
	}

	private repIsAddedToBranch(): void {
		this.notifyService.showSimpleSuccess(this.i18.getMessageValue('label.branch.reps.added'));
		this.historyTable.refreshData();
		this.repTable.refreshData();
        this.fetchBranchCleArlReps();
        this.resetModals();
	}

	public resetModals(): void {
		this.showConfirmDelete = false;
		this.setToDateOnDeleteRep = true;
		this.showBranchCleArlRepPopup = false;
		this.showConfirmAddAssociatedRep = false;
		this.toDateStringOnDeletedRep = null;
		this.deleteModalTemplate = null;
        this.activeCleArlRep = null;
	}

	public onChangeShowDate(option: string): void {
		if (option === 'no') {
			this.toDateStringOnDeletedRep = null;
		}
		this.setToDateOnDeleteRep = option === 'yes';
	}

	private fetchBranchCleArlReps(): void {
		this.branchCleArlRepService.getBranchCleArlReps(this.model.id)
			.subscribe(reps => this.cleArlReps = reps);
	}

	public onCancelAddRepModal(): void {
		this.showBranchCleArlRepPopup = false;
	}

	public isBranchCleArlRepValid(): boolean {
		return !this.cleArlReps
		  .some(rep => this.branchCleArlRep.userId === rep.userId
					&& this.branchCleArlRep.linkId === rep.linkId
					&& this.activeCleArlRep !== rep.id
					&& this.areDatesOverlapped(rep, this.branchCleArlRep));
	}

	private areDatesOverlapped(existingRep: BranchCleArlRep, newRep: BranchCleArlRep): boolean {
		const existingFrom = this.getNullableFromDate(existingRep.occupiedFrom);
		const existingTo = this.getNullableToDate(existingRep.occupiedTo);
		const newFrom = this.getNullableFromDate(newRep.occupiedFrom);
		const newTo = this.getNullableToDate(newRep.occupiedTo);
		return existingFrom <= newTo && existingTo >= newFrom;
	}

	private getNullableFromDate(occupiedFrom: string): Date {
		if (!occupiedFrom || occupiedFrom === '-') {
			return new Date(new Date().setFullYear(new Date().getFullYear() - 1000));
		}
		return new Date(occupiedFrom);
	}

	private getNullableToDate(occupiedTo: string): Date {
		if (!occupiedTo || occupiedTo === '-') {
			return new Date(new Date().setFullYear(new Date().getFullYear() + 1000));
		}
		return new Date(occupiedTo);
	}
}

interface DeleteModalTemplateContent {
	id: string;
	entity: 'BRANCH' | 'REP' | 'GROUP';
	title: string;
	message: string;
	hasBranchAddress: boolean;
}

interface SelectedBranchRepToUpdate {
	id: string;
	userId: string;
	userFullName: string;
	linkId: string;
	cleName: string;
	masterLeArlCode: string;
	regulatorBodyCode: string;
	occupiedFrom: string;
	occupiedTo: string;
}

enum BranchCleArlRepModalAction {
	ADD = 'ADD',
	UPDATE = 'UPDATE',
}

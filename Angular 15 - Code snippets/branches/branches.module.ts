import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { MPipesModule } from '../../../pipes/m-pipes.module';
import { BusinessEntitySearchModule } from '../../../components-m/business-entity-search/business-entity-search.module';
import { TextInputModule } from '../../../components/textinput/textinput.module';
import { DropdownModule } from '../../../components/dropdown/dropdown.module';
import { SimpleTableModule } from '../../../components/simple-table/simple-table.module';
import { ModalModule } from '../../../components/modal/modal.module';
import { FloatingBarModule } from '../../../components/floating-bar/floating-bar.module';
import { TertiaryNavModule } from '../../../components/tertiary-nav/tertiary-nav.module';
import { ButtonGroupModule } from '../../../components/button-group/button-group.module';
import { SearchinputModule } from '../../../components/searchinput/searchinput.module';
import { BasePermissionResolverService } from 'app/resolver/base-permission-resolver.service';
import { RouterDeactivateListener } from '../../../services/router/router-deactivate-listener.service';
import { TwoOptionButtonModule } from '../../../components/two-option-button/two-option-button.module';
import { ReturnToListModule } from 'app/components/floating-bar/return-to-list/return-to-list.module';
import { MTableModule } from 'app/components/m-table/m-table.module';
import { BranchListComponent } from './list/branch-list.component';
import { BranchViewComponent } from './view/branch-view.component';
import { BranchAddComponent } from './add/branch-add.component';
import { BranchService } from '../../../services/entities/branch.service';
import { BranchResolverService } from '../../../resolver/authorizations/branch-resolver.service';
import { StatusModule } from '../../../components/status/status.module';
import { ModalAddCommentModule } from '../../../components-m/modal-add-comment/modal-add-comment.module';
import { AttachmentTableModule } from '../../../components-m/attachment-table/attachment-table.module';
import { DualListSelectionModalModule } from '../../../components/dual-list-selection-modal/dual-list-selection-modal.module';
import { MCustomHistoryFieldModule } from '../../../components/m-custom-history-field/m-custom-history-field.module';
import { CustomFieldsModule } from 'app/embeddable-pages/shared/custom-fields/custom-fields.module';
import { CLASS_LOOKUP_TABLE } from 'app/components-m/entity-page-container/templates/embeddable-pages-template/tokens';
import { classLookupTable } from 'app/embeddable-pages/class-lookup-table';
import { DatePickerModule } from 'app/components/datepicker/datepicker.module';
import { UserPopupModule } from 'app/components/user-popup/user-popup.module';
import { AddressModule } from '../../../components-m/address/address.module';
import { AddressViewModule } from '../../../components-m/address/address-view/address-view.module';
import { InfoBoxModule } from '../../../components/info-box/info-box.module';

const routerConfig: Routes = [
	{
		path: '',
		component: BranchListComponent,
		data: {
			title: 'label.branches',
			permission: 'viewBranch',
		}
	},
	{
		path: 'view/:id',
		component: BranchViewComponent,
		data: {
			permission: 'viewBranch',
			service: BranchService,
			gaCategory: 'View'
		},
		resolve: {
			detail: BranchResolverService,
			permissions: BasePermissionResolverService
		}
	},
	{
		path: 'add',
		component: BranchAddComponent,
		data: {
			title: 'label.branch.add',
			permission: 'createBranch',
			service: BranchService,
			gaCategory: 'Add'
		},
		canDeactivate: [RouterDeactivateListener],
		resolve: { permissions: BasePermissionResolverService }
	},
	{
		path: 'edit/:id',
		component: BranchAddComponent,
		data: {
			permission: 'updateBranch',
			service: BranchService,
			edit: true,
			gaCategory: 'Edit'
		},
		canDeactivate: [RouterDeactivateListener],
		resolve: {
			detail: BranchResolverService,
			permissions: BasePermissionResolverService
		}
	},
];

@NgModule({
	declarations: [
		BranchListComponent,
		BranchViewComponent,
		BranchAddComponent
	],
	exports: [
		RouterModule
	],
	providers: [
		{
			provide: CLASS_LOOKUP_TABLE,
			useValue: classLookupTable
		}
	],
	imports: [
		CommonModule,
		FormsModule,
		RouterModule.forChild(routerConfig),
		MPipesModule,
		BusinessEntitySearchModule,
		TextInputModule,
		DropdownModule,
		SimpleTableModule,
		SearchinputModule,
		ModalModule,
		FloatingBarModule,
		TertiaryNavModule,
		ButtonGroupModule,
		SearchinputModule,
		TwoOptionButtonModule,
		ReturnToListModule,
		MTableModule,
		StatusModule,
		ModalAddCommentModule,
		AttachmentTableModule,
		DualListSelectionModalModule,
		MCustomHistoryFieldModule,
		DatePickerModule,
		CustomFieldsModule,
		UserPopupModule,
		AddressModule,
		AddressViewModule,
        InfoBoxModule
	]
})
export class BranchesModule { }

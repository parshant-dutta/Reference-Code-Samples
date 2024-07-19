import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { UserExamsListComponent } from './list/user-exams-list.component';
import { UserExamsViewComponent } from './view/user-exams-view.component';
import { UserExamsResolverService } from '../../../resolver/authorizations/user-exams-resolver.service';
import { UserExamsAddComponent } from './add/user-exams-add.component';
import { PipesModule } from '../../../pipes/pipes.module';
import { SearchinputModule } from '../../../components/searchinput/searchinput.module';
import { TextInputModule } from '../../../components/textinput/textinput.module';
import { DatePickerModule } from '../../../components/datepicker/datepicker.module';
import { DropdownModule } from '../../../components/dropdown/dropdown.module';
import { FloatingBarModule } from '../../../components/floating-bar/floating-bar.module';
import { TertiaryNavModule } from '../../../components/tertiary-nav/tertiary-nav.module';
import { WorkflowActionButtonModule } from '../../../components/workflow-action-button/workflow-action-button.module';
import { SimpleTableModule } from '../../../components/simple-table/simple-table.module';
import { ModalModule } from '../../../components/modal/modal.module';
import { PaginatedSimpleTableModule } from 'app/components/paginated-simple-table/paginated-simple-table.module';
import { RouterDeactivateListener } from '../../../services/router/router-deactivate-listener.service';
import { UserExamsPermissionResolverService } from '../../../resolver/authorizations/user-exams-permission-resolver.service';
import { ReturnToListModule } from 'app/components/floating-bar/return-to-list/return-to-list.module';
import { ModalAddCommentModule } from '../../../components/modal-add-comment/modal-add-comment.module';
import { TableModule } from 'app/components/table/table.module';
import { UserExamAppointmentAddModule } from '../user-exam-appointments/add/user-exam-appointment-add.module';
import { AttachmentTableModule } from '../../../components/attachment-table/attachment-table.module';
import {
	CustomHistoryFieldModule
} from '../../../components/custom-history-field/custom-history-field.module';

const routerConfig = [
	{
		path: '',
		component: UserExamsListComponent
	},
	{
		path: 'view/:id',
		component: UserExamsViewComponent,
		data: {
			gaCategory: 'View'
		},
		resolve: {
			detail: UserExamsResolverService,
			permissions: UserExamsPermissionResolverService
		}
	},
	{
		path: 'add',
		component: UserExamsAddComponent,
		data: {
			title: 'label.userExams.add',
			gaCategory: 'Add'
		},
		canDeactivate: [RouterDeactivateListener],
		resolve: {
			permissions: UserExamsPermissionResolverService
		}
	},
	{
		path: 'edit/:id',
		component: UserExamsAddComponent,
		data: {
			edit: true,
			gaCategory: 'Edit'
		},
		canDeactivate: [RouterDeactivateListener],
		resolve: {
			detail: UserExamsResolverService,
			permissions: UserExamsPermissionResolverService
		}
	}
];

@NgModule({
	declarations: [
		UserExamsListComponent,
		UserExamsViewComponent,
		UserExamsAddComponent
	],
	exports: [
		RouterModule
	],
	imports: [
		CommonModule,
		FormsModule,
		RouterModule.forChild(routerConfig),
		PipesModule,
		SearchinputModule,
		TextInputModule,
		DatePickerModule,
		DropdownModule,
		FloatingBarModule,
		TertiaryNavModule,
		WorkflowActionButtonModule,
		SimpleTableModule,
		ModalModule,
		PaginatedSimpleTableModule,
		ReturnToListModule,
		ModalAddCommentModule,
		TableModule,
		UserExamAppointmentAddModule,
		AttachmentTableModule,
		CustomHistoryFieldModule
	]
})

export class UserExamsModule { }

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AppRoutes } from '../../../../constant/url/AppRoutes';
import { BreadcrumbService } from '../../../../services/breadcrumb/breadcrumb-service';
import { I18Service } from '../../../../services';
import { ListingTableConfig, TableConfigObject } from 'app/components/m-table/models/m-table.interface';
import { ListingTableModel } from '../../../../components/m-table/models/extended-models/listing-table.model';
import { BranchService } from '../../../../services/entities/branch.service';
import { MTableRowClickEvent } from 'app/components/m-table/models/row-click/m-table-row-click-event.model';
import { getProductType } from 'app/shared/utils/url-helpers/url-helpers';

@Component({
	selector: 'app-branch-list',
	templateUrl: './branch-list.component.html'
})
export class BranchListComponent implements OnInit {
	public permission: any;
	public configValues: any;
	public data: any;
	public title: string;
	public canAddNew: boolean;
	private path: string = null;

	public branchesTable: ListingTableModel = new ListingTableModel();
	public tableConfig: TableConfigObject = {
		columnToggle: true,
		columnResize: true,
		inlineFilters: true,
		advancedSearch: true,
		actionButtonsAppearOnHover: true
	};

	constructor(
		private branchService: BranchService,
		private i18: I18Service,
		private router: Router,
		private activeRoute: ActivatedRoute,
		breadcrumbService: BreadcrumbService
	) {
		this.path = getProductType() === 'admin' ? AppRoutes.ADMIN_FIRM_DATA_BRANCHES : AppRoutes.KYE_BRANCHES;
		breadcrumbService.clear();
		breadcrumbService.addBreadcrumb(activeRoute, router);
	}

	public ngOnInit(): void {
		this.title = this.activeRoute.snapshot.data['title'];
		this.permission = this.activeRoute.snapshot.data['permission'];
		this.branchService.getTableConfig().subscribe(data => {
			this.data = data.table;
			this.configValues = data.configurations;
			const permissions = data.permissions;
				if (!permissions[this.permission]) {
					this.router.navigate([AppRoutes.URL_NOT_AUTHORIZED]);
				}
				if (permissions &&
					permissions['createBranch']) {
						this.canAddNew = true;
				}
			this.branchesTable.loadConfig(<ListingTableConfig>data.table);
			this.tableConfig.configValues =  this.configValues;
		});

	}

	public tableRowClick(row: MTableRowClickEvent): void {
		row.navigate(`/${this.path}/${AppRoutes.VIEW}/${row.data.id}`);
	}

	public create(): void {
		this.router.navigate([`/${this.path}/${AppRoutes.ADD}`]);
	}
}

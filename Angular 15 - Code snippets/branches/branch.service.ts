import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ValidationService } from '../validation/interfaces/validation-service';
import { PermissionResolverService } from '../permission-resolver-service.interface';
import { AppAPI } from 'app/constant/url/AppAPI';
import { Branch } from '../../domain/authorizations/branch';
import { BranchPermissions } from '../../constant/permissions/authorizations/branch-permissions';
import { getProductType } from 'app/shared/utils/url-helpers/url-helpers';
import { PaginatedSimpleTableResponse } from '../../components/m-table/models/m-table.interface';

@Injectable({ providedIn: 'root' })
export class BranchService implements ValidationService, PermissionResolverService {

	constructor(private http: HttpClient) {

	}

	public getTableConfig(): Observable<any> {
		return this.http.get<any>(`${AppAPI.BRANCH_REQUEST.config()}/?productType=${getProductType()}`);
	}

	public findById(id: string): Observable<Branch> {
		return this.http.get<Branch>(AppAPI.BRANCH_REQUEST.view(id));
	}

	public save(model: Branch): Observable<any> {
		return this.http.post<any>(model.id ? AppAPI.BRANCH_REQUEST.update() : AppAPI.BRANCH_REQUEST.create(), model);
	}

	public getPermissions(): Observable<BranchPermissions> {
		return this.http.get<BranchPermissions>(AppAPI.BRANCH_REQUEST.permissions());
	}

	public validate(model: Branch): Observable<boolean> {
		return this.http.post<boolean>(AppAPI.BRANCH_REQUEST.validate(), model);
	}

	public delete(id: string): Observable<any> {
		return this.http.post(AppAPI.BRANCH_REQUEST.delete(id), { id });
	}

	public associateGroupToBranch(branchId: string, groupIds: Array<string>): Observable<void> {
		return this.http.post<void>(AppAPI.GROUP_BRANCH_REQUEST.concat('/associate-group'), { branchId, groupIds });
	}

	public removeGroupFromBranch(branchId: string, groupId: string): Observable<void> {
		return this.http.post<void>(AppAPI.GROUP_BRANCH_REQUEST.concat('/remove-group'), { branchId, groupId });
	}

	public getUsersWithSameAddress(branchId: string): Observable<PaginatedSimpleTableResponse> {
		return this.http.post<PaginatedSimpleTableResponse>(AppAPI.BRANCH_REQUEST.concat('/users-with-same-address'), { branchId: branchId });
	}

	public getBranchRegulatorIdType(): Observable<any> {
		return this.http.get<any>(AppAPI.BRANCH_REQUEST.concat('/getFinraBranchRegulatorIdType'));
	}
}


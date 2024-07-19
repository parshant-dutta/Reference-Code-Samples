import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { StringHelper } from '../../helper/StringHelper';
import { tap, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { AppAPI } from '../../constant/url/AppAPI';

@Injectable({ providedIn: 'root' })
export class I18Service {

	private messageBundle: object;

	constructor(private http: HttpClient) {}

	public load(): Observable<void> {
		return this.http.get<any>(AppAPI.CONFIGURATION.res('messageBundle'))
			.pipe(tap(data => this.messageBundle = data))
			.pipe(map(() => null));
	}

	public getEnumValue(namespace: string, enumValue: string): string {
		return this.getMessageValue(namespace + '.' + enumValue);
	}

	public getMessageValue(messageKey: string, parameters?: any): string {
		const value: string = this.messageBundle[messageKey];

		if (!StringHelper.isEmpty(value)) {
			return this.interpolateStringWith(value, parameters);
		} else {
			if (messageKey !== "") {
				console.log("Key not found : " + messageKey);
			}

			return `???${messageKey}???`; // only while development phase
		}
	}

	public hasMessageValue(messageKey: string): boolean {
		return this.messageBundle[messageKey] !== undefined;
	}

	private interpolateStringWith(message: string, parameters?: any): string {
		if (parameters === 'undefined' || parameters === null) {
			return message;
		}
		if (Array.isArray(parameters)) {
			for (let i = 0; i < parameters.length; i++) {
				const old = `\\{${i}\\}`;
				message = message.replace(new RegExp(old, 'g'), parameters[i]);
			}
		} else {
			message = message.replace(new RegExp(`\\{${0}\\}`, 'g'), parameters);
		}

		return message;
	}

}

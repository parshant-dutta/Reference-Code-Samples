import { Pipe, PipeTransform } from '@angular/core';
import { UserService } from 'app/services/user/user.service';
import { environment } from 'environments/environment';
import { intlFormat, isValid } from 'date-fns';
import { zonedTimeToUtc } from 'date-fns-tz';
import { DateService } from 'app/services/date/date.service';
import { stringContainsIsoDateRegex, stringContainsLegacyDateRegex, stringStartsWithIsoDateRegex, stringStartsWithLegacyDateRegex, legacyDateTimeRegex, isoDateTimeRegex, stringContainsIsoDateTimeRegex } from 'app/helper/date-time-helpers/date-time-helper';

@Pipe({
	name: 'userDateFormat'
})
export class UserDateFormatPipe implements PipeTransform {

	constructor(
		private user: UserService,
		private dateService: DateService
	) {}

	public transform(value: string | Date, showOnlyDate?: boolean): any {

		if (value instanceof Date) {
			if (!environment.production) {
				console.warn('UserDateFormatPipe expects to receive a date in a string format in the servers timezone');
			}
			return this.dateService.formatIntlDate(value);
		}
		if (value) {
			if (showOnlyDate && this.isDateTime(value)) {
				const utcDateTime: Date = zonedTimeToUtc(value, this.user.serverTimeZoneId);
				return this.dateService.formatIntlDate(utcDateTime); // removes midnight from the string so no risk of date changing from localisation
			}
			if (this.isDateStringRange(value)) {
				return this.getFormattedDateStringRange(value);
			} else if (this.isValidDate(value)) {
				if (this.isDateTime(value)) {
					const utcDateTime: Date = zonedTimeToUtc(new Date(value), this.user.serverTimeZoneId); // new Date(value) is necessary otherwise zonedTimeToUtc can return an invalid time
					return this.dateService.formatIntlDateTime(utcDateTime);
				} else {
					const dateOnly: Date = this.getDateFromLegacyOrIsoString(value); // zoned from userTimezoneId to prevent conversion. Value could be YYYY-MM-DD or YYYY-MM-DDT00:00:00
					return this.dateService.formatIntlDate(dateOnly);
				}
			}
		}

		return value;
	}

	public isDateStringRange(value: any): boolean {
		if (typeof value !== 'string') {
			return false;
		}
		const isoMatch = value.match(stringContainsIsoDateRegex);  // matches 'YYYY-MM-DD' format
		const legacyMatch = value.match(stringContainsLegacyDateRegex);  // matches 'MMM DD, YYYY' format

		if (
			isoMatch &&
			isoMatch.length === 2
		) {
			return true;
		} else if (
			legacyMatch &&
			legacyMatch.length === 2
		) {
			return true;
		} else {
			return false;
		}
	}

	public isValidDate(value): boolean {
		return (
				value.match(stringStartsWithIsoDateRegex) || // matches YYYY-MM-DD format
				value.match(stringStartsWithLegacyDateRegex) // matches 'MMM DD, YYYY' format
			);
	}

	public isLegacyDateFormat(value: string): boolean {
		return value.match(stringStartsWithLegacyDateRegex) !== null;
	}

	public isLegacyDateTimeFormat(value: string): boolean {
		return value.match(legacyDateTimeRegex) !== null;
	}

	public isIsoDateTimeFormat(value: string): boolean {
		return value.match(isoDateTimeRegex) !== null;
	}

	/*
		this method is required based on the findings that if your TZ is anything other than GTM, such as America/New_York
		For Example:
		new Date('Jan 1,2020');
		// outputs:  Wed Jan 01 2020 00:00:00 GMT-0500 (Eastern Standard Time)

		new Date('2020-01-01');
		// outputs:  Tue Dec 31 2019 19:00:00 GMT-0500 (Eastern Standard Time)
	*/
	private getDateFromLegacyOrIsoString(value: string): Date {
		if (!this.isValidDate(value)) {
			return;
		}
		if (this.isLegacyDateFormat(value)) {
			return zonedTimeToUtc(new Date(value), this.user.usersCurrentTimeZoneId); // new Date(value) is necessary otherwise zonedTimeToUtc can return an invalid time
		} else {
			return zonedTimeToUtc(value, this.user.usersCurrentTimeZoneId);
		}
	}

	public isDateTime(value: string): boolean {
		if (value.match(legacyDateTimeRegex) && // Matches MMM DD, YYYY 00:00:00 (no millis or timezone context)
			value.split(' ')[3].match(/00:00:00/) === null) {
			return true;
		} else if (
			value.match(isoDateTimeRegex) && // Matches YYYY-MM-DDT00:00:00 (no millis or timezone context)
			value.split('T')[1].match(/00:00:00/) === null // if it's midnight this function will return false
		) {
			return true;
		} else {
			return false;
		}
	}

	public getFormattedDateStringRange(value: string): string {
		const isoDateTime = value.match(stringContainsIsoDateTimeRegex);
		const isoDate = value.match(stringContainsIsoDateRegex); // matches YYYY-MM-DD format
		const legacyMatch = value.match(stringContainsLegacyDateRegex);  // matches 'MMM DD, YYYY' format
		if (isoDateTime) {
			return `${this.dateService.formatIntlDate(zonedTimeToUtc(new Date(isoDateTime[0]), this.user.serverTimeZoneId))} - ${this.dateService.formatIntlDate(zonedTimeToUtc(new Date(isoDateTime[1]), this.user.serverTimeZoneId))}`;
		} else if (isoDate) {
			return `${this.dateService.formatIntlDate(new Date(isoDate[0]))} - ${this.dateService.formatIntlDate(new Date(isoDate[1]))}`;
		} else if (legacyMatch) {
			return `${this.dateService.formatIntlDate(zonedTimeToUtc(new Date(legacyMatch[0]), this.user.usersCurrentTimeZoneId))} - ${this.dateService.formatIntlDate(zonedTimeToUtc(new Date(legacyMatch[1]), this.user.usersCurrentTimeZoneId))}`;
		} else {
			return value;
		}
	}

}

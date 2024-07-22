import { Component, Input, OnInit } from '@angular/core';
import { ConstraintTypeEnum } from '../../ConstraintTypeEnum';

@Component({
  selector: 'app-information',
  templateUrl: './information.component.html',
  styleUrls: ['./information.component.scss']
})
export class InformationComponent implements OnInit {
  @Input() fieldData: any;
  @Input() form: FormData;
  @Input() controlName: string;
  constraintTypeEnum: ConstraintTypeEnum;
  constructor() { }

  ngOnInit(): void {
  }

}

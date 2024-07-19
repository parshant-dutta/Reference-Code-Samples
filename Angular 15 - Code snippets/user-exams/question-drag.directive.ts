import { Directive, ElementRef, OnInit, Input, HostListener } from '@angular/core';
import { QuestionnaireDraggerService } from '../service/questionnaire-dragger.service';

@Directive({
	selector: '[questionDrag]'
})
export class QuestionDragDirective implements OnInit {


	@Input() public iRow: number;
	@Input() public iCol: number;
	@Input() public ignoreDrag: boolean = false;

	private draggingThisInstance: boolean;
	private dragging: boolean;
	private isDroppingOnSameRow: boolean;

	constructor(
		public el: ElementRef,
		private dragger: QuestionnaireDraggerService
	) {}

	public ngOnInit() {
		this.el.nativeElement.classList.add("grab-handle");

		this.dragger.dragState$.subscribe(dragState => {

			const {newRowIndex, newColIndex, dragging, originalRowIndex, originalColIndex} = dragState;
			this.dragging = dragging;
			this.isDroppingOnSameRow = this.iRow === originalRowIndex && originalRowIndex === newRowIndex;

			if (this.isDraggingThisInstance(originalRowIndex, originalColIndex)) {
				this.addClass("dragged-card-original-position");
			}

			if (!this.dragging) {
				this.removeDraggingClass();
			}

			if (newRowIndex === this.iRow && this.dragger.rowHasAvailableSpace(this.iRow) && newColIndex === null && this.isLastColumnInRow()) {
				this.addClass("dragged-over-last-column");
			} else {
				this.removeClass("dragged-over-last-column");
			}

		});
	}

	private isLastColumnInRow(): boolean {
		return this.dragger.getNumColumns(this.iRow) === this.iCol + 1;
	}

	private isDraggingThisInstance(originalRowIndex: number, originalColIndex: number): boolean {
		return typeof this.iRow !== undefined && typeof this.iCol !== undefined // handles new questions which don't have a row or col
			&& this.iRow === originalRowIndex
			&& this.iCol === originalColIndex;
	}

	@HostListener('mousedown', ['$event'])
	public startDrag(mouseEvent: MouseEvent) {
		if (!this.ignoreDrag) {
			const {clientX, clientY} = mouseEvent;
			this.dragger.startQuestionDrag(clientX, clientY, this.iRow, this.iCol, this.el.nativeElement);
		}
	}

	@HostListener('mouseenter')
	public onDragOverQuestion() {

		if (this.dragging) {

			if (!this.dragger.rowHasAvailableSpace(this.iRow)) {
			} else {
				this.addClass("drag-over-card");
				this.dragger.onDragOverQuestion(this.iRow, this.iCol);
			}

		}
	}



	@HostListener('mouseleave')
	public onDragLeaveQuestion() {
		if (this.dragging) {
			this.dragger.onLeaveQuestion();
			this.removeClass("drag-over-card");
		}
	}

	private removeDraggingClass() {
		this.removeClass("drag-over-card");
		this.removeClass("dragged-card-original-position");
	}

	private addClass(cssClass: string) {
		this.el.nativeElement.classList.add(cssClass);
	}

	private removeClass(cssClass: string) {
		this.el.nativeElement.classList.remove(cssClass);
	}
}

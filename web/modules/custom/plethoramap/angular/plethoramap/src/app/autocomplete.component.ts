import { Component, ElementRef, OnInit, Input, Output, EventEmitter, ViewChild, Renderer } from '@angular/core'; 
import {PlethoraMapConfigService} from './plethoramap.config.service'; 
@Component({
    selector: 'autocomplete',
    moduleId: module.id,
    host: {
        '(document:click)': 'handleClick($event)',
    },
    templateUrl: './autocomplete.component.html'
})
export class AutocompleteComponent implements OnInit {
    //input
    @Input() data: string[] = [];
    @Input() title: string = '';
    @Input() placeholder: string = '';
    @Input() query: string = '';
    @Input() selectedItem: string = '';
    @Input() clearButtonLabel: string = '';
    @Input() noResultsMessage: string = '';
    @Input() noResultsMessageMobile: string = '';
    @Input() autoFocus: string = 'false';
    @Input() submitButtonLabel: string = 'GO';
    //output
    @Output() valueChange = new EventEmitter();
    @Output() clearEvent = new EventEmitter();
    @Output() cancelEvent = new EventEmitter();
    @ViewChild('queryBox') queryBoxElementRef;
    @ViewChild('clearButton') clearButtonElementRef;
 
    constructor(
            public elementRef: ElementRef,
            private config: PlethoraMapConfigService,
            private _renderer: Renderer) {
    } 
    ngOnInit() {
        if (this.autoFocus && this.autoFocus === "true"){
            this.focusOnQueryBox();
        }
    }
    get queryNoHTML():string {
        //return this.query;
        if (!this.query) return this.query;
        //console.log("query: " + this.query);
        var val = this.query.split('<p>')[0];
        //console.log("queryNoHTML: " + val);
        return val;
    }
    set queryNoHTML(value:string) {
        this.query = value;
    }
    public userHasTyped: boolean = false;
    public filteredList: { label: string, value: string }[] = [];
    public filteredListItemIndex: number = 0;
    public get showNoResultsMessage(): boolean {
        if (!this.userHasTyped) return false;
        if (!this.query) return false;
        if (!this.data || !this.data.length) return false;
        if (this.showSuggestions) return false;
        return this.selectedItem != this.query; //case sensitivity should not matter at this point...
    }
    public get noResultsMessageWithTokens(): string {
        var desktop = this.noResultsMessage || '';
        if (desktop) desktop = '<div class="text desktop">' + desktop.replace('{{query}}', this.query) + '</div>';
        var mobile = this.noResultsMessageMobile || '';
        if (mobile) mobile = '<div class="text mobile">' + mobile.replace('{{query}}', this.query) + '</div>';
        return desktop + mobile;
    }
    get activeItem(): string {
        if (this.filteredList.length && this.filteredListItemIndex > -1 && this.filteredListItemIndex < this.filteredList.length) {
            return this.filteredList[this.filteredListItemIndex].value;
        }
        return null;
    }
    get showSuggestions(): boolean {
        return this.filteredList.length > 0 && (!this.selectedItem || this.selectedItem != this.query);
    }
    filter() {
        this.filteredListItemIndex = 0;
        var trimmedQuery = this.query.trim();
        if (trimmedQuery) {
//console.log('autocomplete, filtering this.data (shown below) with query ' + trimmedQuery);
//console.log(this.data);
            var queryLength = trimmedQuery.length;
            var trimmedQueryLC = trimmedQuery.toLowerCase();
            this.filteredList = [];
            for(let item of this.data){
                var index = item.toLowerCase().indexOf(trimmedQueryLC);
                if (index > -1){
                    this.filteredList.push({
                        label: item.substr(0, index) + '<strong>' + item.substr(index, queryLength) + '</strong>' + item.substr(index + queryLength),
                        value: item
                    });
                }
            }
            /*
            this.filteredList = this.data.filter(function(el) {
                return el.toLowerCase().indexOf(this.query.toLowerCase()) > -1;
            }.bind(this)); */
        } else {
            this.filteredList = [];
        }
    }
    highlightMatches(item:string){
       return item.toLowerCase().replace(this.query.toLowerCase(), '<strong>' + this.query.toLowerCase() + '</strong>')
    }
    select(item:string) {
        console.log("select(" + item + ")");
        //var prevItem = this.selectedItem;
        var me = this;
        this.selectedItem = item;
        this.query = this.selectedItem;
        this.filteredList = [];
        //if (this.selectedItem != prevItem){
        this.valueChange.emit({
            value: this.selectedItem
        });
        if (this.clearButtonElementRef && this.clearButtonElementRef.nativeElement) this.focusOnClearButton();
        else this.focusOnQueryBox();
        //}
    } 
    cancel() {
        console.log("cancel()");
        this.select(this.selectedItem);
        this.cancelEvent.emit({
            value: this.selectedItem
        });
        this.focusOnQueryBox();
    }
    onClearButtonClick() {
        console.log("onClearButtonClick()");
        this.clear();
    }
    clear() {
        console.log("clear()");
        this.select("");
        this.clearEvent.emit({
            value: this.selectedItem
        });
        this.focusOnQueryBox();
    }
    get showClearButton():boolean{
        return !!this.clearButtonLabel && !!this.query;
    }
    handleClick(event) {
        if (this.showSuggestions) {
            var clickedComponent = event.target;
            var inside = false;
            do {
                if (clickedComponent === this.elementRef.nativeElement) {
                    inside = true;
                }
                clickedComponent = clickedComponent.parentNode;
            } while (clickedComponent);
            if (!inside) {
                console.log("not inside???");
                this.cancel();
            }
        }
    }
    updateFilter() {
        console.log("updateFilter()");
        if (!this.query) {
            this.clear();
        }
        else {
            this.userHasTyped = true;
            this.filter();
        }
    }
    focusOn(elementRef, delay: number = 1) {
        var me = this;
        setTimeout(
            function() {
                if (elementRef && elementRef.nativeElement) me._renderer.invokeElementMethod(elementRef.nativeElement, 'focus', []);
            }, delay);
    }
    focusOnClearButton() {
        console.log("focusOnClearButton()");
        this.focusOn(this.clearButtonElementRef);
    }
    focusOnQueryBox() {
        console.log("focusOnQueryBox()");
        this.focusOn(this.queryBoxElementRef);
    }
    onSubmit(event) {
        console.log("autocomplete: onSubmit()");
        var me = this;
        setTimeout(
            function() {
                if (me.query) {
                    if (me.activeItem) {
                        me.select(me.activeItem);
                    }
                    else {
                        me.focusOnClearButton(); //probably no matching elements message is showing...
                    }
                }
                else {
                    me.select("");
                }
            }, 1);
        event.preventDefault();
        return false;
    }
    onKeyDown(event: any) {
        console.log("key down: ");
        console.log(event.code);
        //console.log(event);
        //this.suppress = "";
        switch (event.code) {
            case "ArrowUp":
                //console.log("upppppp");
                if (this.filteredListItemIndex > 0) this.filteredListItemIndex--;
                event.preventDefault();
                return false;
            case "ArrowDown":
                //console.log("down......");
                if (this.filteredListItemIndex < this.filteredList.length - 1) this.filteredListItemIndex++;
                event.preventDefault();
                return false;
            case "Enter":
                //console.log("enter......");
                //this.onSubmit();
                //event.preventDefault();
                return;
            case "Escape":
                console.log("escape......");
                this.cancel();
                event.preventDefault();
                return false;
            default:
                //console.log(event.code);
                break;
        }
    }
    onKeyUp(event: any) {
        console.log("key up: ");
        console.log(event.code);
        //console.log(event);
        switch (event.code) {
            case "ArrowUp":
            case "ArrowDown":
            case "ArrowLeft":
            case "ArrowRight":
            case "Enter":
            case "Escape":
            case "Tab":
                return;
            default:
                console.log("default key up handling: will call updateFilter...");
                var me = this;
                setTimeout(function() {
                    me.updateFilter();
                }, 1);
                break;
        }
    }
}

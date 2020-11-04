import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { Observable } from "rxjs";
import { first, startWith, map } from 'rxjs/operators';
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
  MatSnackBarRef
} from '@angular/material/snack-bar';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ThemePalette } from '@angular/material/core';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';

import SignaturePad from 'signature_pad';

import { ApiService } from '../../services/api.service';
import { DialogContentExampleDialog } from 'src/app/dialogs';
import { ConfirmationDialog } from '../../dialogs';
import * as config from '../../app.config.json';

const darkTheme = {
  container: {
    bodyBackgroundColor: '#424242',
    buttonColor: '#fff'
  },
  dial: {
    dialBackgroundColor: '#32393D'
  },
  clockFace: {
    clockFaceBackgroundColor: '#32393D',
    clockHandColor: '#7375f8',
    clockFaceTimeInactiveColor: '#fff'
  }
};
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  horizontalPosition: MatSnackBarHorizontalPosition = 'start';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';
  darkTheme = darkTheme;
  auth: boolean = false;
  signatureForm: FormGroup;
  step: number = 1;
  startTime: string;
  option;
  typeMapLocation;
  editLocation = [];
  endTime: string;
  shiftScheduleForm: FormGroup;
  shiftInfoForm: FormGroup;
  divisions: any[];
  npc: any[];
  purposes: any[];
  ranks: any[];
  division: any;
  // username = JSON.parse(window.localStorage.getItem('currentUser')).UserName;
  username = 'Ryan';
  // loginToken = JSON.parse(window.localStorage.getItem('currentUser')).LoginToken;
  loginToken = 'c9f842259b1e440a8510db83034d0b7f';
  isLoading: boolean = false;
  loadinColor: ThemePalette = 'accent';
  loaderMode: ProgressSpinnerMode = 'indeterminate';
  otherPurposeChosen: boolean = false;
  signature: any;
  shiftCreationFail: boolean = false;
  dmFields: any;
  confirmationDialog;

  //Filter for autocomplete configuration
  filteredDivision: Observable<string[]>;
  filteredNPC: Observable<string[]>;


  constructor(public dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private route: Router,
    private formBuilder: FormBuilder,
    private apiService: ApiService) { }

  ngOnInit(): void {
    // const lookupsToFetch = [config.divisionLookupName, config.NPCLookupName, config.purposeLookupName, config.rankLookupName];
    // this.apiService.getLookups(lookupsToFetch, this.loginToken)
    //   .subscribe((res: any) => {
    //     if (res.data && res.data.length > 0) {
    //       this.divisions = config.divisionDropdown;
    //       this.npc = res.data[1].values;
    //       this.purposes = res.data[2].values;
    //       this.ranks = res.data[3].values;
    //     }
    //   });
    this.divisions = config.divisionDropdown;
    this.npc = config.npcDropdown;
    this.purposes = config.purposesDropdown;
    this.ranks = config.rankDropdown;
    this.buildForms();
    localStorage.getItem('authentication') === 'true' ? this.auth = true : this.auth = false;
    this.unauthorizedNavigation();

  }

  addAddress(event: Event, index: any) {
    const schedules = this.shiftScheduleForm.get('schedules') as FormArray;
    schedules.controls[index].get('location').setValue(event.toString());
    schedules.controls[index].get('coordinates').setValue(event.toString());
  }
  toggleDisable(index: any, isEditing: boolean) {
    const schedules = this.shiftScheduleForm.get('schedules') as FormArray;
    schedules.controls[index].get('location')[isEditing ? 'enable' : 'disable']();
  }
  openMapDialog(index: any) {
    const schedules = this.shiftScheduleForm.get('schedules') as FormArray;

    const dialogRef = this.dialog.open(DialogContentExampleDialog);
    dialogRef.afterClosed().subscribe(result => {

      if (result != undefined && result.location != undefined && result.coordinates != undefined) {
        schedules.controls[index].get('location').setValue(result.location.toString());
        schedules.controls[index].get('coordinates').setValue(result.coordinates.toString());
      }
    });
  }
  openSelectedMapLocation(index) {
    const schedules = this.shiftScheduleForm.get('schedules') as FormArray;
    let data = { data: schedules.controls[index].get('coordinates').value }
    // let data = {data:[11558584.587592864,149314.65873857454 ]}
    const dialogRef = this.dialog.open(DialogContentExampleDialog, data);
    dialogRef.afterClosed().subscribe(result => {

      if (result != undefined && result.location != undefined && result.coordinates != undefined) {
        schedules.controls[index].get('location').setValue(result.location.toString());
        schedules.controls[index].get('coordinates').setValue(result.coordinates.toString());
      }
    });
  }
  openCustomSnackBar(message: string, action: string, className: string) {

    this._snackBar.open(message, action, {
      duration: 2000,
      verticalPosition: 'bottom',
      horizontalPosition: 'center',
      panelClass: [className],
    });
  }
  openSnackBar() {
    this._snackBar.openFromComponent(PizzaPartyComponent, {
      duration: 5 * 1000,
      data: 'some data',
    });
  }
  openErrorSnackBar(error: any) {
    this._snackBar.openFromComponent(ShiftErrorComponent, {
      duration: 5 * 1000,
      panelClass: ['mat-toolbar', 'mat-warn']
    });
  }
  submitShift() {
    this.isLoading = true;
    const signatureElement = document.getElementById('signatureCanvas');
    const canvas = document.querySelector('canvas');
    const signaturePad = new SignaturePad(canvas);
    this.signatureForm.value.signature = signaturePad.toDataURL(); // save image as PNG
    const jsonData = {
      "division": this.shiftInfoForm.controls.division.value ? this.shiftInfoForm.controls.division.value.Key : '',
      "npc": this.shiftInfoForm.controls.npc.value ? this.shiftInfoForm.controls.npc.value.Key : '',
      "teamName": this.shiftInfoForm.controls.teamName.value,
      "driverName": this.shiftInfoForm.controls.driverName.value,
      "patrolMan": this.shiftInfoForm.controls.patrolMan.value,
      "sector": this.shiftInfoForm.controls.sector.value,
      "callSign": this.shiftInfoForm.controls.callSign.value,
      "shiftTime": this.shiftInfoForm.controls.shiftTime.value,
      "schedules": this.shiftScheduleForm.value.schedules,
      "signature": this.signatureForm.value.signature,
      "rank": this.signatureForm.value.rank ? this.signatureForm.value.rank.Key : ''
    };
    // this.apiService.insertBulk(jsonData, this.loginToken)
    //   .subscribe((res: any) => {
    //     if (res && res.code == 200) {
    this.openSnackBar();
    this.buildForms();
    this.step = 1;
    //   } else {
    //     this.shiftCreationFail = true;
    //     this.openErrorSnackBar(res);
    //     this.isLoading = false;
    //   }
    // }, (msg: any) => {
    //   this.shiftCreationFail = true;
    //   this.isLoading = false;
    //   this.openErrorSnackBar(msg);
    // });
  }
  // navigate to login page if unauthorized access
  unauthorizedNavigation() {
    !this.auth ? this.route.navigate(['/login']) : this.route.navigate(['']);
  }

  onOptionSelected(index, optionIndex, purposes) {
    if (optionIndex == purposes.length + 1) {
      this.option[index] = true
    }
    else {
      this.option[index] = false
    }
  }
  buildForms() {
    this.option = [];
    // FIRST STEP SHIFT INFO FORM
    this.shiftInfoForm = this.formBuilder.group({
      division: [null, [Validators.required]],
      npc: [null],
      teamName: ['', [Validators.required]],
      driverName: ['', [Validators.required]],
      patrolMan: ['', [Validators.required]],
      sector: ['', [Validators.required]],
      callSign: ['', [Validators.required]],
      shiftDate: ['', [Validators.required]],
      shiftTime: ['', [Validators.required]]
    });

    this.filteredDivision = this.shiftInfoForm.get('division').valueChanges.pipe(
      // startWith(''),
      map(value => {
        if (this.divisions.indexOf(value) > -1 === false){
          this.shiftInfoForm.get('division').setErrors({ 'incorrect': true });
          this.openCustomSnackBar("Please choose a division from the list", 'Close', 'red-snackbar');

        }
        return this._filterDivision(value)
      })
    );
    this.filteredNPC = this.shiftInfoForm.get('npc').valueChanges.pipe(
      startWith(''),
      map(value => {
        if (this.npc.indexOf(value) > -1 === false)
          this.shiftInfoForm.get('npc').setErrors({ 'incorrect': true });
        return this._filterNPC(value)
      })
    )
    this.onChangeShiftTime();

    // SECOND STEP SHIFT SCHEDULE INFO FORM
    this.shiftScheduleForm = this.formBuilder.group({
      schedules: this.formBuilder.array([
        this.getShiftSchedule()
      ])
    });

    // THIRD STEP SHIFT INFO FORM
    this.signatureForm = this.formBuilder.group({
      signature: ['', [Validators.required]],
      teamName: ['', [Validators.required]],
      rank: [null, [Validators.required]]
    });
  }
  private _filterDivision(value: string): string[] {
    const filterValue = this._normalizeValue(value);
    return this.divisions.filter(street => this._normalizeValue(street).includes(filterValue));
  }
  private _filterNPC(value: string): string[] {
    const filterValue = this._normalizeValue(value);
    return this.npc.filter(npc => this._normalizeValue(npc).includes(filterValue));
  }
  private _normalizeValue(value: string): string {
    return value.toLowerCase().replace(/\s/g, '');
  }
  // Method to build a schedule form
  private getShiftSchedule() {
    return this.formBuilder.group({
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      location: [''],
      coordinates: [''],
      purpose: [null, Validators.required],
      reasonDeviation: [''],
    });

  }


  /**
   * Add new schedule row into form
   */
  addShiftSchedule() {
    const control = this.shiftScheduleForm.controls.schedules as FormArray;
    control.push(this.getShiftSchedule());
    this.setScheduleTime(control.length - 1);
  }




  /**
 * Remove schedule row from form on click delete button
 */
  openConfirmationDialog(index: number) {
    const confirmationDialog = this.dialog.open(ConfirmationDialog);
    confirmationDialog.afterClosed().subscribe(result => {
      if (result != undefined && result != false) {
        const control = this.shiftScheduleForm.controls.schedules as FormArray;
        control.removeAt(index);
        // schedules.controls[index].get('location').setValue(result.toString());
        // schedules.controls[index].get('coordinates').setValue(result.toString());
      }
    });

  }

  setScheduleTime(index) {
    let timeShift = this.shiftInfoForm.controls.shiftTime.value;
    let schedules = this.shiftScheduleForm.get('schedules') as FormArray;

    var startTime = schedules.value[index - 1].startTime
    var endTime = schedules.value[index - 1].endTime

    var startHours = parseInt(startTime.split(':')[0]);
    var endHours = parseInt(endTime.split(':')[0]);
    if (endHours == 24) {
      endHours = 0;
    }
    if (timeShift == 'day' && endHours == 20) {
      endHours = 8;
    }
    if (timeShift == 'night' && endHours == 8) {
      endHours = 20;
    }

    schedules.controls[index].get('startTime').setValue("" + ('0' + endHours).slice(-2) + ":00");
    schedules.controls[index].get('endTime').setValue("" + ('0' + (endHours + 1)).slice(-2) + ":00");

  }

  //  On click of shift time radio select
  onChangeShiftTime() {
    this.shiftInfoForm.get('shiftTime').valueChanges.subscribe(val => {
      let schedules = this.shiftScheduleForm.get('schedules') as FormArray;

      schedules.controls[0].get('startTime').setValue(val == 'day' ? '08:00' : '20:00')
      schedules.controls[0].get('endTime').setValue(val == 'day' ? '09:00' : '21:00')

      for (var i = 1; i < schedules.controls.length; i++) {
        var startTime = schedules.value[i - 1].startTime;
        var endTime = schedules.value[i - 1].endTime;
        // var startTime = schedules.controls[i].get('startTime').value
        // var endTime = schedules.controls[i].get('endtime').value
        var startHours = parseInt(startTime.split(':')[0]);
        var endHours = parseInt(endTime.split(':')[0]);
        if (endHours == 24) {
          endHours = 0;
        }
        schedules.controls[i].get('startTime').setValue("" + ('0' + endHours).slice(-2) + ":00");
        schedules.controls[i].get('endTime').setValue("" + ('0' + (endHours + 1)).slice(-2) + ":00");
      }
    });
  }
  openEditDialog(index, value) {
    const dialogRef = this.dialog.open(EditLocationDialog, {
      width: '500px',
      data: { location: value, closed: false }
    });
    // const dialogRef = this.dialog.open(EditLocationDialog);

    dialogRef.afterClosed().subscribe(result => {
      if (result && !result.closed) {
        let schedules = this.shiftScheduleForm.get('schedules') as FormArray;
        schedules.controls[index].get('location').setValue(result.location);
        // schedules.controls[index].get('coordinates').setValue('');
      }
    });
  }
  // openLocationDialog(index){
  //   const dialogRef = this.dialog.open(EditLocationDialog, {
  //     width: '500px',
  //     data: {location: "", closed: false}
  //   });
  //   // const dialogRef = this.dialog.open(EditLocationDialog);

  //   dialogRef.afterClosed().subscribe(result => {
  //     if(result && !result.closed){
  //       this.typeMapLocation[index] = true;
  //       let schedules = this.shiftScheduleForm.get('schedules') as FormArray;
  //       schedules.controls[index].get('location').setValue(result.location);
  //       // schedules.controls[index].get('coordinates').setValue('');
  //     }
  //   });
  // }
}

@Component({
  selector: 'edit-location-dialog',
  templateUrl: 'edit-location-dialog.html',
  styleUrls: ['./edit-location-dialog.component.css']

})
export class EditLocationDialog {

  constructor(
    public dialogRef: MatDialogRef<EditLocationDialog>,
    @Inject(MAT_DIALOG_DATA) public data) { }

  onNoClick(): void {
    this.data.closed = true;
    this.dialogRef.close(this.data);
  }

}

@Component({
  selector: 'snack-bar-component-example-snack',
  template: `<button class="btn waves-effect
  closebtn"
  (click)="snackBarRef.dismiss()">x</button>
  <span class="example-pizza-party">
    Shift Created  successfully !
  </span>
  <p class="note">You can view it on map or "Shift" data model.</p>`,
  styles: [`
    .example-pizza-party {
      color: white;
      font-weight: 550;
      font-size: 18px;
    }
    .note{
      color:white;
      margin-bottom: 0px;

    }
    .closebtn{
      padding: 0 0 0 0;
      margin: -8px;
      right: -3px;
      width: 20px;
      height:20px;
      color:white;
      font-weight: 550;
      float:right;
      border:none;
      box-shadow:none
    }
  `],
})
export class PizzaPartyComponent {
  constructor(
    public snackBarRef: MatSnackBarRef<PizzaPartyComponent>) { }

}

@Component({
  selector: 'snack-bar-error-component',
  template: `<button class="btn waves-effect
  closebtn"
  (click)="snackBarRef.dismiss()">x</button>
  <span class="example-pizza-party">
    Error in Shift Creation!
  </span>
  <p class="note"></p>`,
  styles: [`
    .example-pizza-party {
      color: white;
      font-weight: 550;
      font-size: 18px;
    }
    .note{
      color:white;
      margin-bottom: 0px;

    }
    .closebtn{
      padding: 0 0 0 0;
      margin: -8px;
      right: -3px;
      width: 20px;
      height:20px;
      color:white;
      font-weight: 550;
      float:right;
      border:none;
      box-shadow:none
    }
  `],
})
export class ShiftErrorComponent {
  constructor(
    public snackBarRef: MatSnackBarRef<ShiftErrorComponent>) { }
}



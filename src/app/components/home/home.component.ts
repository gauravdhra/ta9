import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { Observable } from "rxjs";
import { first } from 'rxjs/operators';
import { MatSnackBar, 
   MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,MatSnackBarRef
 } from '@angular/material/snack-bar';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DialogContentExampleDialog } from 'src/app/dialogs/map-dialog/map-dialog.component';

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
  horizontalPosition: MatSnackBarHorizontalPosition = 'end';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';

  darkTheme = darkTheme
  auth: boolean = false;
  signatureForm: FormGroup;
  step: number = 1
  startTime: string;
  option;
  editLocation = [];
  endTime: string;
  shitScheduleForm: FormGroup
  shiftInfoForm: FormGroup;
  constructor(public dialog: MatDialog,private _snackBar: MatSnackBar, private route: Router, private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.buildForms();
    localStorage.getItem('authentication') === 'true' ? this.auth = true : this.auth = false;
    this.unauthorizedNavigation();
  }
  addAddress(event,index){
    let schedules = this.shitScheduleForm.get('schedules') as FormArray
    schedules.controls[index].get('location').setValue(event.toString())
  }
  toggleDisable(index,isEditing){
    let schedules = this.shitScheduleForm.get('schedules') as FormArray
    schedules.controls[index].get('location')[isEditing ? 'enable' : 'disable']();

  }
  openMapDialog(index){
    let schedules = this.shitScheduleForm.get('schedules') as FormArray

    const dialogRef = this.dialog.open(DialogContentExampleDialog);
    dialogRef.afterClosed().subscribe(result => {
      if(result != undefined && (typeof result)=='string')
      schedules.controls[index].get('location').setValue(result.toString())
      console.log(`Dialog result: ${result}`);
    });

  }
  openSnackBar() {
    this._snackBar.openFromComponent(PizzaPartyComponent, {
      duration: 5 * 1000,
      data: 'some data',
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,

    });
  }
  submitShift(){
    this.buildForms()
    this.openSnackBar()
    this.step = 1
  }
  // navigate to login page if unauthorized access
  unauthorizedNavigation() {
    !this.auth ? this.route.navigate(['/login']) : this.route.navigate([''])
  }
  onOptionSelected(index,optionIndex){
    if(optionIndex == 5){
    this.option[index] =  true
    }
    else{
      this.option[index] =false
    }
  }
  buildForms() {
    this.option = []
    // FIRST STEP SHIFT INFO FORM
    this.shiftInfoForm = this.formBuilder.group({
      'division': ['', [Validators.required]],
      'npc': [''],
      'teamName': ['', [Validators.required]],
      'driverName': ['', [Validators.required]],
      'patrolMan': ['', [Validators.required]],
      'sector': ['', [Validators.required]],
      'callSign': ['', [Validators.required]],
      'shiftTime': ['', [Validators.required]],
    });
    this.onChangeShiftTime()

    // SECOND STEP SHIFT SCHEDULE INFO FORM
    this.shitScheduleForm = this.formBuilder.group({
      schedules: this.formBuilder.array([
        this.getShiftSchedule()
      ])
    });

    // THIRD STEP SHIFT INFO FORM
    this.signatureForm = this.formBuilder.group({
      'signature': ['abc', [Validators.required]],
      'teamName': ['', [Validators.required]],
      'rank': ['', [Validators.required]]
    });
  }


  // Method to build a schedule form
  private getShiftSchedule() {
    return this.formBuilder.group({
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      location: ['',Validators.required],
      purpose: ['', Validators.required],
      reasonDeviation: [''],
    });

  }



  /**
   * Add new schedule row into form
   */
  addShiftSchedule() {
    const control = <FormArray>this.shitScheduleForm.controls['schedules'];
    control.push(this.getShiftSchedule());
    this.setScheduleTime(control.length - 1)
  }


  /**
 * Remove schedule row from form on click delete button
 */
  removeShiftSchedule(i: number) {
    const control = <FormArray>this.shitScheduleForm.controls['schedules'];
    control.removeAt(i);
  }

  setScheduleTime(index) {
    let timeShift = this.shiftInfoForm.controls.shiftTime.value
    let schedules = this.shitScheduleForm.get('schedules') as FormArray

    var startTime = schedules.value[index - 1].startTime
    var endTime = schedules.value[index - 1].endTime

    var startHours = parseInt(startTime.split(':')[0]);
    var endHours = parseInt(endTime.split(':')[0]);
    if (endHours == 24) {
      endHours = 0

    }
    if (timeShift == 'day' && endHours == 20) {
      endHours = 8
    };
    if (timeShift == 'night' && endHours == 8) {
      endHours = 20;
    }

    schedules.controls[index].get('startTime').setValue("" + ('0' + endHours).slice(-2) + ":00")
    schedules.controls[index].get('endTime').setValue("" + ('0' + (endHours + 1)).slice(-2) + ":00")

  }

  //  On click of shift time radio select
  onChangeShiftTime() {
    this.shiftInfoForm.get('shiftTime').valueChanges.subscribe(val => {
      let schedules = this.shitScheduleForm.get('schedules') as FormArray

      schedules.controls[0].get('startTime').setValue(val == 'day' ? '08:00' : '20:00')
      schedules.controls[0].get('endTime').setValue(val == 'day' ? '09:00' : '21:00')

      for (var i = 1; i < schedules.controls.length; i++) {
        var startTime = schedules.value[i - 1].startTime
        var endTime = schedules.value[i - 1].endTime
        // var startTime = schedules.controls[i].get('startTime').value
        // var endTime = schedules.controls[i].get('endtime').value
        var startHours = parseInt(startTime.split(':')[0]);
        var endHours = parseInt(endTime.split(':')[0]);
        if (endHours == 24) {
          endHours = 0

        }
        schedules.controls[i].get('startTime').setValue("" + ('0' + endHours).slice(-2) + ":00")
        schedules.controls[i].get('endTime').setValue("" + ('0' + (endHours + 1)).slice(-2) + ":00")

      }
    });
  }
  openEditDialog(index,value){
    const dialogRef = this.dialog.open(EditLocationDialog, {
      width: '250px',
      data: {location: value,closed:false}
    });
    // const dialogRef = this.dialog.open(EditLocationDialog);

    dialogRef.afterClosed().subscribe(result => {
      if(result && !result.closed){
        let schedules = this.shitScheduleForm.get('schedules') as FormArray
        schedules.controls[index].get('location').setValue(result.location)
      }
    });
  }
}






@Component({
  selector: 'edit-location-dialog',
  templateUrl: 'edit-location-dialog.html'  
})
export class EditLocationDialog {

  constructor(
    public dialogRef: MatDialogRef<EditLocationDialog>,
    @Inject(MAT_DIALOG_DATA) public data) {}

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
</span><p class="note">You can view it on map or "Shift" data mode.</p>`,
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

  close(){
    alert('hi')
  }
 }



import {FormGroup} from "@angular/forms";

export function ConfirmedValidator(controlName: string, matchingControlName: string){
  return (FormGroup: FormGroup) => {
    const control= FormGroup.controls[controlName];
    const matchingControl= FormGroup.controls[matchingControlName];
    if(matchingControl.errors){
      return;
    }
    if(control.value !== matchingControl.value){
      matchingControl.setErrors({confirmedValidator: true});
    }
    else {
      matchingControl.setErrors(null)
    }
  }
}

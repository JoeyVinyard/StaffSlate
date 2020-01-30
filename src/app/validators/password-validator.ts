import { FormControl, ValidationErrors } from '@angular/forms';

export class PasswordValidator {
    public static strong(control: FormControl): ValidationErrors {
        let hasNumber = /\d/.test(control.value);
        let hasUpper = /[A-Z]/.test(control.value);
        let hasLower = /[a-z]/.test(control.value);
        let long = control.value.length >= 8
        if(!long || !hasNumber || !hasUpper || !hasLower) {
            return {
                tooShort: !long,
                needsNumber: !hasNumber,
                needsUpper: !hasUpper,
                needsLower: !hasLower
            };
        }
        return null;
    }
}

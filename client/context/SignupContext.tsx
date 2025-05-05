import React, { createContext, useContext, useReducer, ReactNode } from 'react';

export interface SignupFormFields {
    // step 1 fields: basic info
    email: string;
    firstName: string;
    lastName: string;
    preferredName: string;
    password: string;
    confirmPassword: string;

    // step 2 fields: academic info
    courseOfStudy: string;
    yearOfEntry: string;
    yearOfGraduation: string;

    // step 3 fields: interests for group mapping
    interests: string[];
};

export type ValidationFlags = {
    [K in keyof SignupFormFields]: boolean;
};

// for all fields except interests (string array), the value is a string
type FormAction = 
    | { field: Exclude<keyof SignupFormFields, 'interests'>; value: string }
    | { field: 'interests'; value: string[] };
  
type ValidationAction = { 
    field: keyof ValidationFlags; 
    value: boolean 
};

// empty initial states
export const initialForm: SignupFormFields = {
    // step 1
    email: '',
    firstName: '',
    lastName: '',
    preferredName: '',
    password: '',
    confirmPassword: '',
    courseOfStudy: '',
    yearOfEntry: '',
    yearOfGraduation: '',
    interests: []
};

// initial validation state - all invalid except optional interests
export const initialValidation: ValidationFlags = {
    email: false,
    firstName: false,
    lastName: false,
    preferredName: false,
    password: false,
    confirmPassword: false,
    courseOfStudy: false,
    yearOfEntry: false,
    yearOfGraduation: false,
    interests: true
};

// validator functions for each field - each returns true if field is valid otherwise false
export const validators: { 
    [K in keyof SignupFormFields]?: (value: any, form?: SignupFormFields) => boolean 
} = {
    email: (val) => /^[\w.%+-]+@[\w.-]+\.[a-zA-Z]{1,}$/.test(val),
    firstName: (val) => val.length > 1,
    lastName: (val) => val.length > 1,
    preferredName: (val) => val.length > 1,
    password: (val) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(val),
    confirmPassword: (val, form) => val === form?.password && val.length > 0,
    courseOfStudy: (val) => val.length > 0,
    yearOfEntry: (val) => /^\d{4}$/.test(val) && parseInt(val) >= 2000 && parseInt(val) <= new Date().getFullYear(),
    yearOfGraduation: (val, form) => {
        if (!/^\d{4}$/.test(val)) return false;
        const entryYear = form?.yearOfEntry ? parseInt(form.yearOfEntry) : 0;
        const gradYear = parseInt(val);
        return gradYear >= entryYear && gradYear <= entryYear + 10;
    },
    interests: (val) => true // optional field so always true
};

// reducer function for form state - updates form with new values while preserving other fields
function formReducer(state: SignupFormFields, action: FormAction): SignupFormFields {
    return { ...state, [action.field]: action.value };
}

// reducer function for validation state - updates validation flags while preserving other flags
function validationReducer(state: ValidationFlags, action: ValidationAction): ValidationFlags {
    return { ...state, [action.field]: action.value };
}
  
interface SignupContextProps {
    currentStep: number;
    setCurrentStep: (step: number) => void;
    form: SignupFormFields;
    valid: ValidationFlags;
    handleChange: (field: keyof SignupFormFields, value: string) => void;
    isStepValid: (step: number) => boolean;
    setInterests: (interests: string[]) => void;
};
  
const SignupContext = createContext<SignupContextProps | undefined>(undefined);

interface SignupProviderProps {
    children: ReactNode;
};

// signup provider wraps multi-step signup to manage signup form state
export function SignupProvider({ children }: SignupProviderProps) {
    const [currentStep, setCurrentStep] = React.useState(1);
    const [form, dispatchForm] = useReducer(formReducer, initialForm);
    const [valid, dispatchValid] = useReducer(validationReducer, initialValidation);
  
    // handle field changes and validation
    const handleChange = (field: keyof SignupFormFields, value: any) => {
        dispatchForm({ field, value } as FormAction);
      
        const validate = validators[field];
        if (validate) {
        const isValid = validate(value, { ...form, [field]: value });
        dispatchValid({ field, value: isValid });
        }
    };

    // specific method to update interests
    const setInterests = (interests: string[]) => {
        handleChange('interests', interests);
    };
  
    // check if all fields in a specific step are valid
    const isStepValid = (step: number): boolean => {
        switch (step) {
            case 1:
                return valid.email && valid.firstName && valid.lastName && 
                        valid.preferredName && valid.password && valid.confirmPassword;
            case 2:
                return valid.courseOfStudy && valid.yearOfEntry && valid.yearOfGraduation;
            case 3:
                return true;
            default:
                return false;
        }
    };
  
    const value = {
        currentStep,
        setCurrentStep,
        form,
        valid,
        handleChange,
        isStepValid,
        setInterests
    };
  
    return <SignupContext.Provider value={value}>{children}</SignupContext.Provider>
}

// hook to use the signup context
export function useSignup() {
    const context = useContext(SignupContext);
    if (context === undefined) {
        throw new Error('useSignup must be used within a SignupProvider');
    }
    return context;
}
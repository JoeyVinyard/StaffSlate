export interface UserInfo {
    firstName: string;
    lastName: string;
    email: string;
    confirmed: boolean;
    locations: {
        key: string;
        label: string;
    }[];
}

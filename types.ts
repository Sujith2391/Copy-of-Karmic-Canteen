export enum UserRole {
  EMPLOYEE = 'employee',
  ADMIN = 'admin',
  MAIN_ADMIN = 'main_admin',
}

export enum MealType {
  BREAKFAST = 'Breakfast',
  LUNCH = 'Lunch',
  SNACKS = 'Snacks',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
}

export interface DailyMenu {
  date: string;
  [MealType.BREAKFAST]: MenuItem[];
  [MealType.LUNCH]: MenuItem[];
  [MealType.SNACKS]: MenuItem[];
}

export interface MealConfirmation {
  userId: string;
  date: string;
  // Initial opt-in
  [MealType.BREAKFAST]: boolean;
  [MealType.LUNCH]: boolean;
  [MealType.SNACKS]: boolean;
  // Reconfirmation status
  breakfastReconfirmed?: boolean;
  lunchReconfirmed?: boolean;
  snacksReconfirmed?: boolean;
  // Work from home status
  wfh?: boolean;
}

export interface ConsolidatedReport {
    date: string;
    mealType: MealType;
    confirmed: number; // Initial opt-in
    reconfirmed: number; // Final count after reconfirmation window
    pickedUp: number;
}

export interface EmployeeConfirmationDetails extends User {
    confirmation: MealConfirmation;
}
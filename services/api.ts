import { User, UserRole, DailyMenu, MealType, MealConfirmation, ConsolidatedReport, MenuItem, EmployeeConfirmationDetails } from '../types';
import { db, collection, doc, getDoc, getDocs, updateDoc, onSnapshot, addDoc, deleteDoc } from './firebase';

// --- API FUNCTIONS (Refactored for Firestore-like API) ---

export const getAllUsers = async (): Promise<User[]> => {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    return usersSnapshot.docs.map(doc => doc.data() as User);
}

export const getEmployees = async (): Promise<User[]> => {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const allUsers = usersSnapshot.docs.map(doc => doc.data() as User);
    return allUsers.filter(user => user.role === UserRole.EMPLOYEE);
}

export const getMenuForDay = async (dayOfWeek: number): Promise<DailyMenu> => {
    const menuDocRef = doc(db, 'weeklyMenu', String(dayOfWeek));
    const menuSnap = await getDoc(menuDocRef);

    if (!menuSnap.exists()) {
        throw new Error(`Menu for day ${dayOfWeek} not found`);
    }

    const today = new Date();
    const targetDate = new Date();
    targetDate.setDate(today.getDate() - today.getDay() + dayOfWeek);
    const dateString = targetDate.toISOString().split('T')[0];
    
    const menuTemplate = menuSnap.data();
    const menu: DailyMenu = {
        date: dateString,
        [MealType.BREAKFAST]: menuTemplate?.[MealType.BREAKFAST] || [],
        [MealType.LUNCH]: menuTemplate?.[MealType.LUNCH] || [],
        [MealType.SNACKS]: menuTemplate?.[MealType.SNACKS] || [],
    };
    return menu;
};

export const getMenuForToday = (): Promise<DailyMenu> => {
  const dayOfWeek = new Date().getDay();
  return getMenuForDay(dayOfWeek);
};

const getTodaysDateString = () => new Date().toISOString().split('T')[0];
const getTomorrowsDateString = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
};

const getConfirmationForDate = async (userId: string, date: string): Promise<MealConfirmation> => {
    const confirmationId = `${userId}-${date}`;
    const confirmationDocRef = doc(db, 'confirmations', confirmationId);
    const confirmationSnap = await getDoc(confirmationDocRef);

    if (confirmationSnap.exists()) {
        return confirmationSnap.data() as MealConfirmation;
    }

    // If no confirmation exists for the date, return a default new one.
    return {
        userId,
        date,
        [MealType.BREAKFAST]: false,
        [MealType.LUNCH]: false,
        [MealType.SNACKS]: false,
        breakfastReconfirmed: false,
        lunchReconfirmed: false,
        snacksReconfirmed: false,
        wfh: false,
    };
};

export const getUserConfirmation = async (userId: string): Promise<MealConfirmation> => {
  const date = getTodaysDateString();
  return getConfirmationForDate(userId, date);
};

export const getTomorrowsConfirmation = async (userId: string): Promise<MealConfirmation> => {
    const date = getTomorrowsDateString();
    return getConfirmationForDate(userId, date);
};

export const setWfhForTomorrow = async (userId: string, wfhStatus: boolean): Promise<MealConfirmation> => {
    const date = getTomorrowsDateString();
    const confirmationId = `${userId}-${date}`;
    const confirmationDocRef = doc(db, 'confirmations', confirmationId);
    
    const currentConfirmation = await getConfirmationForDate(userId, date);
    
    let payloadUpdate: Partial<MealConfirmation> = { wfh: wfhStatus };

    // If setting WFH to true, automatically opt-out of all meals for that day.
    if (wfhStatus) {
        payloadUpdate = {
            ...payloadUpdate,
            [MealType.BREAKFAST]: false,
            [MealType.LUNCH]: false,
            [MealType.SNACKS]: false,
            breakfastReconfirmed: false,
            lunchReconfirmed: false,
            snacksReconfirmed: false,
        };
    }

    const finalPayload = { ...currentConfirmation, ...payloadUpdate };

    await updateDoc(confirmationDocRef, finalPayload);
    const updatedDoc = await getDoc(confirmationDocRef);
    return updatedDoc.data() as MealConfirmation;
};


export const updateConfirmation = async (userId: string, mealType: MealType, status: boolean): Promise<MealConfirmation> => {
  const date = getTodaysDateString();
  const confirmationId = `${userId}-${date}`;
  const confirmationDocRef = doc(db, 'confirmations', confirmationId);

  // Firestore's `update` can create a document if it doesn't exist via `set` with merge.
  // Our simulator's `updateDoc` mimics this behavior.
  const currentConfirmation = await getUserConfirmation(userId);
  const payload = { ...currentConfirmation, [mealType]: status };

  if (!status) {
    if (mealType === MealType.BREAKFAST) payload.breakfastReconfirmed = false;
    if (mealType === MealType.LUNCH) payload.lunchReconfirmed = false;
    if (mealType === MealType.SNACKS) payload.snacksReconfirmed = false;
  }
  
  await updateDoc(confirmationDocRef, payload);
  const updatedDoc = await getDoc(confirmationDocRef);
  return updatedDoc.data() as MealConfirmation;
};

export const reconfirmMeal = async (userId: string, mealType: MealType): Promise<MealConfirmation> => {
    const date = getTodaysDateString();
    const confirmationId = `${userId}-${date}`;
    const confirmationDocRef = doc(db, 'confirmations', confirmationId);
    
    const reconfirmKey = `${mealType.toLowerCase()}Reconfirmed` as keyof MealConfirmation;
    await updateDoc(confirmationDocRef, { [reconfirmKey]: true });

    const updatedDoc = await getDoc(confirmationDocRef);
    return updatedDoc.data() as MealConfirmation;
};

export const getConsolidatedReport = async (): Promise<ConsolidatedReport[]> => {
    const confirmationsSnapshot = await getDocs(collection(db, 'confirmations'));
    const todaysConfirmations = confirmationsSnapshot.docs
        .map(d => d.data() as MealConfirmation)
        .filter(c => c.date === getTodaysDateString());

    const report: ConsolidatedReport[] = [];
    const mealTypes = [MealType.BREAKFAST, MealType.LUNCH, MealType.SNACKS];

    mealTypes.forEach(mealType => {
        const confirmed = todaysConfirmations.filter(c => c[mealType]).length;
        
        let reconfirmed = 0;
        if (mealType === MealType.BREAKFAST) reconfirmed = todaysConfirmations.filter(c => c[mealType] && c.breakfastReconfirmed).length;
        if (mealType === MealType.LUNCH) reconfirmed = todaysConfirmations.filter(c => c[mealType] && c.lunchReconfirmed).length;
        if (mealType === MealType.SNACKS) reconfirmed = todaysConfirmations.filter(c => c[mealType] && c.snacksReconfirmed).length;
        
        const pickedUp = Math.floor(reconfirmed * (0.95 + Math.random() * 0.05)); 
        
        report.push({
            date: getTodaysDateString(),
            mealType,
            confirmed,
            reconfirmed,
            pickedUp
        });
    });

    return report;
}

export const getEmployeeConfirmations = async (): Promise<EmployeeConfirmationDetails[]> => {
    const [employees, confirmationsSnapshot] = await Promise.all([
        getEmployees(),
        getDocs(collection(db, 'confirmations'))
    ]);
    const todaysConfirmations = confirmationsSnapshot.docs
        .map(d => d.data() as MealConfirmation)
        .filter(c => c.date === getTodaysDateString());

    const details = employees.map(employee => {
        let confirmation = todaysConfirmations.find(c => c.userId === employee.id);

        if (!confirmation) {
            confirmation = {
                userId: employee.id,
                date: getTodaysDateString(),
                [MealType.BREAKFAST]: false,
                [MealType.LUNCH]: false,
                [MealType.SNACKS]: false,
                breakfastReconfirmed: false,
                lunchReconfirmed: false,
                snacksReconfirmed: false,
            };
        }
        
        return { ...employee, confirmation };
    });
    return details;
};

// New function for real-time updates on the admin dashboard
export const onDashboardUpdate = (callback: (data: { report: ConsolidatedReport[], details: EmployeeConfirmationDetails[] }) => void) => {
    // When confirmations change, recalculate everything.
    const unsubConfirmations = onSnapshot(collection(db, 'confirmations'), async () => {
        const [report, details] = await Promise.all([
            getConsolidatedReport(),
            getEmployeeConfirmations()
        ]);
        callback({ report, details });
    });

    // In a real app, you might also listen to user or menu collection changes.
    return unsubConfirmations; // Return the unsubscribe function
};


export const getWasteAnalytics = async (): Promise<ConsolidatedReport[]> => {
    // This function can remain as is, as it's meant to show historical (mock) data.
    // In a real app, this would query a collection of historical reports.
    const mockHistoricalData: Omit<ConsolidatedReport, 'reconfirmed'>[] = [
        { date: 'Day 1', mealType: MealType.LUNCH, confirmed: 150, pickedUp: 142 },
        { date: 'Day 2', mealType: MealType.LUNCH, confirmed: 145, pickedUp: 140 },
        { date: 'Day 3', mealType: MealType.LUNCH, confirmed: 160, pickedUp: 155 },
        { date: 'Day 4', mealType: MealType.LUNCH, confirmed: 152, pickedUp: 148 },
        { date: 'Day 5', mealType: MealType.LUNCH, confirmed: 155, pickedUp: 145 },
    ];
    const historicalWithReconfirmed = mockHistoricalData.map(d => ({
        ...d,
        reconfirmed: Math.floor(d.confirmed * (0.9 + Math.random() * 0.05))
    }))
    return historicalWithReconfirmed;
}

export const updateMenuItem = async (dayOfWeek: number, mealType: MealType, item: MenuItem): Promise<DailyMenu> => {
  const menuDocRef = doc(db, 'weeklyMenu', String(dayOfWeek));
  const menuSnap = await getDoc(menuDocRef);
  if (menuSnap.exists()) {
    const dayMenu = menuSnap.data();
    const mealItems = dayMenu[mealType] as MenuItem[];
    const itemIndex = mealItems.findIndex(i => i.id === item.id);
    if (itemIndex > -1) {
      mealItems[itemIndex] = item;
      await updateDoc(menuDocRef, { [mealType]: mealItems });
    }
  }
  return getMenuForDay(dayOfWeek);
}

export const addMenuItem = async (dayOfWeek: number, mealType: MealType, item: Omit<MenuItem, 'id'>): Promise<DailyMenu> => {
  const menuDocRef = doc(db, 'weeklyMenu', String(dayOfWeek));
  const menuSnap = await getDoc(menuDocRef);
  if (menuSnap.exists()) {
    const dayMenu = menuSnap.data();
    const mealItems = dayMenu[mealType] as MenuItem[];
    const newItem = { ...item, id: `item-${Date.now()}`};
    mealItems.push(newItem);
    await updateDoc(menuDocRef, { [mealType]: mealItems });
  }
  return getMenuForDay(dayOfWeek);
}

export const deleteMenuItem = async (dayOfWeek: number, mealType: MealType, itemId: string): Promise<DailyMenu> => {
  const menuDocRef = doc(db, 'weeklyMenu', String(dayOfWeek));
  const menuSnap = await getDoc(menuDocRef);
  if (menuSnap.exists()) {
    const dayMenu = menuSnap.data();
    let mealItems = dayMenu[mealType] as MenuItem[];
    mealItems = mealItems.filter(item => item.id !== itemId);
    await updateDoc(menuDocRef, { [mealType]: mealItems });
  }
  return getMenuForDay(dayOfWeek);
}

// --- USER CRUD FUNCTIONS ---

export const addUser = async (userData: Omit<User, 'id' | 'email'>): Promise<void> => {
    const nameParts = userData.name.split(' ');
    if (nameParts.length < 2) throw new Error("Full name required.");

    let domain;
    switch (userData.role) {
        case UserRole.MAIN_ADMIN:
            domain = '@hr.karmic.com';
            break;
        case UserRole.ADMIN:
            domain = '@canteen.karmic.com';
            break;
        default: // EMPLOYEE
            domain = '@karmic.com';
    }

    const email = `${nameParts[0].toLowerCase()}.${nameParts[1].toLowerCase()}${domain}`;
    const newUser = { ...userData, email };
    await addDoc(collection(db, 'users'), newUser);
};

export const updateUser = async (userId: string, updatedData: Partial<User>): Promise<void> => {
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, updatedData);
};

export const deleteUser = async (userId: string): Promise<void> => {
    const userDocRef = doc(db, 'users', userId);
    await deleteDoc(userDocRef);
};

// Real-time listener for user management
export const onUsersUpdate = (callback: (users: User[]) => void) => {
    const unsub = onSnapshot(collection(db, 'users'), (snapshot) => {
        const users = snapshot.docs.map((doc: any) => doc.data() as User);
        callback(users);
    });
    return unsub;
};
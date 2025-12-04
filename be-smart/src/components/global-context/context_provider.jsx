
import { useState, createContext, useContext } from 'react';
import {useLocalStorage} from "usehooks-ts"

// global context component
export const UserContext = createContext();

export function UserProvider({children}){
    // user state variables for user context
    const [user, setUser] = useLocalStorage("user", null);
    // isLoading is false since useLocalStorage is synchronous
    const isLoading = false;

    // represents the provider at top of tree allowing accessing
    // to global variables to children components
    return(
        <UserContext.Provider value={{user, setUser, isLoading}}>
            {children}
        </UserContext.Provider>
    );
}
export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
}
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut 
} from "firebase/auth";
import { auth } from "../firebase";

export const signupVolunteer = async (email, password) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    } catch (error) {
        throw error;
    }
};

export const loginVolunteer = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    } catch (error) {
        throw error;
    }
};

export const logout = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        throw error;
    }
};

import { onIdTokenChanged } from "firebase/auth";

let cachedToken = null;

// Listen for token changes (login, logout, token refresh)
onIdTokenChanged(auth, async (user) => {
    if (user) {
        cachedToken = await user.getIdToken();
    } else {
        cachedToken = null;
    }
});

export const getToken = () => cachedToken;

'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: 'admin' | 'staff' | 'student';
  isPaid: boolean;
  isBlocked?: boolean;
  readNotifications?: string[];
  bookmarkedFiles?: string[];
  completedFiles?: string[];
  createdAt?: string;
}

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, pass: string) => Promise<void>;
  signUp: (email: string, pass: string, name: string) => Promise<void>;
  logOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  deviceIds: string[];
  addDevice: () => void;
  removeDevice: (id: string) => void;
}

const AuthContext = createContext<AuthContextType>({
  firebaseUser: null,
  userProfile: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  logOut: async () => {},
  refreshProfile: async () => {},
  deviceIds: [],
  addDevice: () => {},
  removeDevice: () => {},
});

function getDeviceId(): string {
  const ua = navigator.userAgent || '';
  const platform = navigator.platform || 'unknown';
  return `${platform}-${ua}`;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [deviceIds, setDeviceIds] = useState<string[]>([]);

  const addDevice = useCallback(() => {
    const myDeviceId = getDeviceId();
    setDeviceIds((prev) => {
      if (prev.includes(myDeviceId)) return prev;
      const next = [...prev, myDeviceId];
      if (next.length > 2) {
        next.shift();
      }
      return next;
    });
  }, []);

  const removeDevice = useCallback((id: string) => {
    setDeviceIds((prev) => prev.filter((d) => d !== id));
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!auth.currentUser) return;
    const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
    if (userDoc.exists()) {
      setUserProfile(userDoc.data() as UserProfile);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            setUserProfile(userDoc.data() as UserProfile);
          } else {
            const defaultProfile: UserProfile = {
              uid: user.uid,
              email: user.email || '',
              name: user.displayName || 'New User',
              role: 'student',
              isPaid: false,
              isBlocked: false,
              readNotifications: [],
              bookmarkedFiles: [],
              completedFiles: [],
              createdAt: new Date().toISOString(),
            };
            await setDoc(userDocRef, defaultProfile);
            setUserProfile(defaultProfile);
          }
          // Track the current device (keep the two most recent devices).
          const myDeviceId = getDeviceId();
          setDeviceIds((prev) => (prev.includes(myDeviceId) ? prev : [...prev, myDeviceId].slice(-2)));
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
        setDeviceIds([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Keep the profile live so admin changes (isBlocked, isPaid, role) apply immediately.
  useEffect(() => {
    if (!firebaseUser) return;
    const unsubscribeProfile = onSnapshot(
      doc(db, 'users', firebaseUser.uid),
      (userDoc) => {
        if (userDoc.exists()) {
          setUserProfile(userDoc.data() as UserProfile);
        }
      },
      (error) => console.error('Live profile listener failed:', error),
    );
    return () => unsubscribeProfile();
  }, [firebaseUser]);

  const signIn = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
    addDevice();
  };

  const signUp = async (email: string, pass: string, name: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    const user = cred.user;
    const newProfile: UserProfile = {
      uid: user.uid,
      email: user.email || email,
      name,
      role: 'student',
      isPaid: false,
      isBlocked: false,
      readNotifications: [],
      bookmarkedFiles: [],
      completedFiles: [],
      createdAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'users', user.uid), newProfile);
    setUserProfile(newProfile);
    addDevice();
  };

  const logOut = async () => {
    await signOut(auth);
    setUserProfile(null);
    setDeviceIds([]);
  };

  return (
    <AuthContext.Provider
      value={{ firebaseUser, userProfile, loading, signIn, signUp, logOut, refreshProfile, deviceIds, addDevice, removeDevice }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

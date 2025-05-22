import {AuthState, LoginCredentials, RegisterData} from "../types/auth.types.ts";
import {create} from "zustand/react";
import {persist} from "zustand/middleware";
import axiosInstance from "../utils/axios.ts";

interface AuthStore extends AuthState {
    login: (credentials: LoginCredentials) => Promise<void>;
    register: (userData: RegisterData) => Promise<void>;
    logout: () => void;
    clearError: () => void;
    initAuth: () => void;
}

export const useAuthStore = create<AuthStore>()(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,

            login: async (credentials: LoginCredentials) => {
                try {
                    set({ isLoading: true, error: null });
                    const response = await axiosInstance.post('/auth/login', credentials);
                    const { user, access_token } = response.data;

                    set({
                        user,
                        token: access_token,
                        isAuthenticated: true,
                        isLoading: false,
                    });

                    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
                } catch (error: any) {
                    set({
                        isLoading: false,
                        error: error.response?.data?.detail || 'Failed to login',
                    });
                }
            },

            register: async (userData: RegisterData) => {
                try {
                    set({ isLoading: true, error: null });
                    const response = await axiosInstance.post('/auth/register', userData);
                    const { user, access_token } = response.data;

                    set({
                        user,
                        token: access_token,
                        isAuthenticated: true,
                        isLoading: false,
                    });

                    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

                } catch (error: any) {
                    set({
                        isLoading: false,
                        error: error.response?.data?.detail || 'Failed to register',
                    });
                }
            },

            logout: () => {
                delete axiosInstance.defaults.headers.common['Authorization'];

                set({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                });
            },

            clearError: () => set({ error: null }),

            initAuth: () => {
                const state = get();
                if (state.token) {
                    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
                }
            }
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
            onRehydrateStorage: () => (state) => {
                if (state) {
                    state.initAuth();
                }
            }
        }
    )
);
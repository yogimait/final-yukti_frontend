import { type ReactNode, useEffect } from 'react';
import { Provider } from 'react-redux';
import { store, useAppSelector, useAppDispatch } from '@/store';
import { getCurrentUser } from '@/store/auth.slice';
import { SocketProvider } from '@/providers';

interface ProvidersProps {
    children: ReactNode;
}

// Theme provider to sync theme with document
function ThemeProvider({ children }: { children: ReactNode }) {
    const theme = useAppSelector((state) => state.ui.theme);

    useEffect(() => {
        const root = document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
    }, [theme]);

    return <>{children}</>;
}

// Auth provider to restore session on startup
function AuthProvider({ children }: { children: ReactNode }) {
    const dispatch = useAppDispatch();
    const { token, user } = useAppSelector((state) => state.auth);

    useEffect(() => {
        // If token exists but user is null, restore session
        if (token && !user) {
            dispatch(getCurrentUser());
        }
    }, [dispatch, token, user]);

    return <>{children}</>;
}

// Inner providers that need Redux
function InnerProviders({ children }: ProvidersProps) {
    return (
        <ThemeProvider>
            <AuthProvider>
                <SocketProvider>{children}</SocketProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}

// Main providers wrapper
export function Providers({ children }: ProvidersProps) {
    return (
        <Provider store={store}>
            <InnerProviders>{children}</InnerProviders>
        </Provider>
    );
}


// Niwas — Global State Management
import { createContext, useContext, useReducer, useCallback, useEffect, useRef } from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import sampleProperties from '../data/properties';
import { apiRequest } from '../api/client';
import { firebaseAuth } from '../config/firebase';

const AppContext = createContext(null);

const initialState = {
  properties: sampleProperties,
  users: [],
  reports: [],
  user: null,
  authLoading: true,
  authDialogOpen: false,
  apiStatus: 'connecting',
  apiError: '',
  savedProperties: [],
  propertyNotes: {},
  toasts: [],
  filters: {
    listingType: 'buy',
    city: '',
    search: '',
    priceMin: '',
    priceMax: '',
    propertyType: '',
    bedrooms: '',
    verifiedOnly: false,
    availableToday: false,
    ownerVerified: false,
    documentsChecked: false,
    sortBy: 'relevance',
  },
  reportSubmissions: [],
};

function loadSavedState() {
  const savedState = window.localStorage.getItem('niwas-state');
  if (!savedState) return initialState;

  try {
    const parsedState = JSON.parse(savedState);
    return {
      ...initialState,
      savedProperties: Array.isArray(parsedState.savedProperties)
        ? parsedState.savedProperties
        : initialState.savedProperties,
      propertyNotes: parsedState.propertyNotes && typeof parsedState.propertyNotes === 'object'
        ? parsedState.propertyNotes
        : {},
    };
  } catch {
    return initialState;
  }
}

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_PROPERTIES':
      return { ...state, properties: action.payload };

    case 'SET_USERS':
      return { ...state, users: action.payload };

    case 'SET_REPORTS':
      return { ...state, reports: action.payload };

    case 'SET_API_STATUS':
      return { ...state, apiStatus: action.payload.status, apiError: action.payload.error || '' };

    case 'SET_USER':
      return { ...state, user: action.payload, authLoading: false };

    case 'SET_AUTH_DIALOG':
      return { ...state, authDialogOpen: action.payload };

    case 'SET_SAVED_DATA':
      return {
        ...state,
        savedProperties: action.payload.savedProperties,
        propertyNotes: action.payload.propertyNotes,
      };

    case 'TOGGLE_SAVE_PROPERTY': {
      const id = action.payload;
      const saved = state.savedProperties.includes(id)
        ? state.savedProperties.filter((pid) => pid !== id)
        : [...state.savedProperties, id];
      return { ...state, savedProperties: saved };
    }

    case 'REMOVE_SAVED_PROPERTY':
      return {
        ...state,
        savedProperties: state.savedProperties.filter((id) => id !== action.payload),
      };

    case 'SET_PROPERTY_NOTE':
      return {
        ...state,
        propertyNotes: { ...state.propertyNotes, [action.payload.id]: action.payload.note },
      };

    case 'ADD_TOAST': {
      const toast = action.payload;
      return { ...state, toasts: [...state.toasts, toast] };
    }

    case 'REMOVE_TOAST':
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.payload),
      };

    case 'SET_FILTERS':
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
      };

    case 'RESET_FILTERS':
      return {
        ...state,
        filters: { ...initialState.filters, listingType: state.filters.listingType },
      };

    case 'SUBMIT_REPORT':
      return {
        ...state,
        reportSubmissions: [...state.reportSubmissions, action.payload],
      };

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, undefined, loadSavedState);
  const noteTimers = useRef(new Map());
  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    dispatch({ type: 'ADD_TOAST', payload: { id, message, type } });
    setTimeout(() => dispatch({ type: 'REMOVE_TOAST', payload: id }), 4000);
  }, []);

  useEffect(() => {
    let active = true;
    apiRequest('/properties').then(({ items }) => {
      if (!active) return;
      dispatch({ type: 'SET_PROPERTIES', payload: items });
      dispatch({ type: 'SET_API_STATUS', payload: { status: 'online' } });
    }).catch((error) => {
      if (!active) return;
      dispatch({ type: 'SET_API_STATUS', payload: { status: 'offline', error: error.message } });
    });

    if (!firebaseAuth) {
      dispatch({ type: 'SET_USER', payload: null });
      return () => { active = false; };
    }

    const unsubscribe = onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
      if (!active) return;
      if (!firebaseUser || !firebaseUser.emailVerified) {
        dispatch({ type: 'SET_USER', payload: null });
        dispatch({ type: 'SET_SAVED_DATA', payload: { savedProperties: [], propertyNotes: {} } });
        return;
      }

      try {
        const { user } = await apiRequest('/auth/me');
        if (!active) return;
        dispatch({ type: 'SET_USER', payload: user });
        const { items } = await apiRequest('/users/me/saved');
        if (!active) return;
        dispatch({
          type: 'SET_SAVED_DATA',
          payload: {
            savedProperties: items.map((item) => item._id),
            propertyNotes: Object.fromEntries(items.map((item) => [item._id, item.note || ''])),
          },
        });
      } catch (error) {
        if (!active) return;
        dispatch({ type: 'SET_USER', payload: null });
        addToast(`Could not connect your Firebase account to Niwas: ${error.message}`, 'error');
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [addToast]);

  useEffect(() => {
    window.localStorage.setItem('niwas-state', JSON.stringify({
      savedProperties: state.savedProperties,
      propertyNotes: state.propertyNotes,
    }));
  }, [state.savedProperties, state.propertyNotes]);

  const toggleSaveProperty = useCallback((id) => {
    const wasSaved = state.savedProperties.includes(id);
    dispatch({ type: 'TOGGLE_SAVE_PROPERTY', payload: id });
    if (state.user && state.apiStatus === 'online') {
      apiRequest(`/users/me/saved/${encodeURIComponent(id)}`, { method: wasSaved ? 'DELETE' : 'PUT' })
        .catch((error) => addToast(`Could not update saved homes: ${error.message}`, 'error'));
    }
  }, [state.savedProperties, state.user, state.apiStatus, addToast]);

  const setPropertyNote = useCallback((id, note) => {
    dispatch({ type: 'SET_PROPERTY_NOTE', payload: { id, note } });
    if (state.user && state.apiStatus === 'online') {
      clearTimeout(noteTimers.current.get(id));
      noteTimers.current.set(id, setTimeout(() => {
        apiRequest(`/users/me/saved/${encodeURIComponent(id)}/note`, {
          method: 'PUT',
          body: JSON.stringify({ note }),
        }).catch((error) => addToast(`Could not save your note: ${error.message}`, 'error'));
      }, 500));
    }
  }, [state.user, state.apiStatus, addToast]);

  const removeSavedProperty = useCallback((id) => {
    dispatch({ type: 'REMOVE_SAVED_PROPERTY', payload: id });
    if (state.user && state.apiStatus === 'online') {
      apiRequest(`/users/me/saved/${encodeURIComponent(id)}`, { method: 'DELETE' })
        .catch((error) => addToast(`Could not remove saved home: ${error.message}`, 'error'));
    }
  }, [state.user, state.apiStatus, addToast]);

  const removeToast = useCallback((id) => {
    dispatch({ type: 'REMOVE_TOAST', payload: id });
  }, []);

  const setFilters = useCallback((filters) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  }, []);

  const resetFilters = useCallback(() => {
    dispatch({ type: 'RESET_FILTERS' });
  }, []);

  const submitReport = useCallback(async (report) => {
    if (!state.user) throw new Error('Sign in with Firebase before submitting a report.');
    const { report: savedReport } = await apiRequest(`/properties/${encodeURIComponent(report.propertyId)}/reports`, {
      method: 'POST',
      body: JSON.stringify({ reason: report.reason, details: report.details }),
    });
    dispatch({ type: 'SUBMIT_REPORT', payload: savedReport });
    return savedReport;
  }, [state.user]);

  const signOut = useCallback(async () => {
    if (firebaseAuth) await firebaseSignOut(firebaseAuth);
    dispatch({ type: 'SET_USER', payload: null });
    dispatch({ type: 'SET_SAVED_DATA', payload: { savedProperties: [], propertyNotes: {} } });
  }, []);

  const openAuthDialog = useCallback(() => dispatch({ type: 'SET_AUTH_DIALOG', payload: true }), []);
  const closeAuthDialog = useCallback(() => dispatch({ type: 'SET_AUTH_DIALOG', payload: false }), []);

  const isPropertySaved = useCallback(
    (id) => state.savedProperties.includes(id),
    [state.savedProperties]
  );

  return (
    <AppContext.Provider
      value={{
        ...state,
        signOut,
        openAuthDialog,
        closeAuthDialog,
        toggleSaveProperty,
        setPropertyNote,
        updatePropertyNote: setPropertyNote,
        removeSavedProperty,
        addToast,
        removeToast,
        setFilters,
        resetFilters,
        submitReport,
        isPropertySaved,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export default AppContext;

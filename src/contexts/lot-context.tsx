"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Lot } from '@/types/marketplace';

export type LotDraft = Partial<Omit<Lot, 'id' | 'createdAt' | 'status' | 'quality' | 'fpoDetails' | 'selectedBuyerId' | 'offerDetails' | 'logisticsDetails' | 'paymentDetails' | 'grievanceDetails'>>;

interface LotContextType {
  currentLot: Lot | null;
  lotHistory: Lot[];
  currentLotDraft: LotDraft;
  
  setCurrentLot: (lotOrUpdater: Lot | null | ((prev: Lot | null) => Lot | null)) => void;
  updateLotStatus: (status: string) => void;
  updateOffer: (offerUpdate: Partial<Lot['offerDetails']>) => void;
  updateLogistics: (logisticsUpdate: Partial<Lot['logisticsDetails']>) => void;
  updatePayment: (paymentUpdate: Partial<Lot['paymentDetails']>) => void;
  updateGrievance: (grievanceUpdate: Partial<Lot['grievanceDetails']>) => void;
  updateAggregation: (fpoUpdate: Partial<Lot['fpoDetails']>) => void;
  
  updateDraft: (updates: Partial<LotDraft>) => void;
  clearDraft: () => void;
  clearLot: () => void;
  switchLot: (lotId: string) => void;
  deleteLot: (lotId: string) => void;
  resetAll: () => void;
  
  isHydrated: boolean;
}

const LotContext = createContext<LotContextType | undefined>(undefined);

export function LotProvider({ children }: { children: ReactNode }) {
  const [currentLot, setCurrentLotState] = useState<Lot | null>(null);
  const [lotHistory, setLotHistory] = useState<Lot[]>([]);
  const [currentLotDraft, setCurrentLotDraft] = useState<LotDraft>({});
  const [isHydrated, setIsHydrated] = useState(false);

  // Initial load from localStorage
  useEffect(() => {
    try {
      const storedLot = localStorage.getItem('krishisetu_current_lot');
      if (storedLot) setCurrentLotState(JSON.parse(storedLot));
      
      const storedHistory = localStorage.getItem('krishisetu_lot_history');
      if (storedHistory) setLotHistory(JSON.parse(storedHistory));

      const storedDraft = localStorage.getItem('krishisetu_lot_draft');
      if (storedDraft) setCurrentLotDraft(JSON.parse(storedDraft));
    } catch (e) {
      console.error('Failed to parse from local storage', e);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Sync currentLot to localStorage AND lotHistory
  useEffect(() => {
    if (!isHydrated) return;
    
    if (currentLot) {
      localStorage.setItem('krishisetu_current_lot', JSON.stringify(currentLot));
      
      // Update history automatically if current lot changes
      setLotHistory(prev => {
        const index = prev.findIndex(l => l.id === currentLot.id);
        const newHistory = [...prev];
        if (index >= 0) {
          newHistory[index] = currentLot;
        } else {
          newHistory.unshift(currentLot);
        }
        localStorage.setItem('krishisetu_lot_history', JSON.stringify(newHistory));
        return newHistory;
      });
    } else {
      localStorage.removeItem('krishisetu_current_lot');
    }
  }, [currentLot, isHydrated]);

  // Sync draft to localStorage
  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem('krishisetu_lot_draft', JSON.stringify(currentLotDraft));
  }, [currentLotDraft, isHydrated]);

  // Use callback for setCurrentLot to allow functional updates
  const setCurrentLot = useCallback((lotOrUpdater: Lot | null | ((prev: Lot | null) => Lot | null)) => {
    setCurrentLotState(prev => {
      const next = typeof lotOrUpdater === 'function' ? lotOrUpdater(prev) : lotOrUpdater;
      return next;
    });
  }, []);

  const updateDraft = (updates: Partial<LotDraft>) => {
    setCurrentLotDraft(prev => ({ ...prev, ...updates }));
  };

  const clearDraft = () => {
    setCurrentLotDraft({});
  };

  const updateLotStatus = useCallback((status: string) => {
    setCurrentLotState(prev => prev ? { ...prev, status } : null);
  }, []);

  const updateOffer = useCallback((offerUpdate: Partial<Lot['offerDetails']>) => {
    setCurrentLotState(prev => prev ? { ...prev, offerDetails: { ...prev.offerDetails, ...offerUpdate } as Lot['offerDetails'] } : null);
  }, []);

  const updateLogistics = useCallback((logisticsUpdate: Partial<Lot['logisticsDetails']>) => {
    setCurrentLotState(prev => prev ? { ...prev, logisticsDetails: { ...prev.logisticsDetails, ...logisticsUpdate } as Lot['logisticsDetails'] } : null);
  }, []);

  const updatePayment = useCallback((paymentUpdate: Partial<Lot['paymentDetails']>) => {
    setCurrentLotState(prev => prev ? { ...prev, paymentDetails: { ...prev.paymentDetails, ...paymentUpdate } as Lot['paymentDetails'] } : null);
  }, []);

  const updateGrievance = useCallback((grievanceUpdate: Partial<Lot['grievanceDetails']>) => {
    setCurrentLotState(prev => prev ? { ...prev, grievanceDetails: { ...prev.grievanceDetails, ...grievanceUpdate } as Lot['grievanceDetails'] } : null);
  }, []);

  const updateAggregation = useCallback((fpoUpdate: Partial<Lot['fpoDetails']>) => {
    setCurrentLotState(prev => prev ? { ...prev, fpoDetails: { ...prev.fpoDetails, ...fpoUpdate } as Lot['fpoDetails'] } : null);
  }, []);

  const clearLot = useCallback(() => {
    setCurrentLotState(null);
  }, []);

  const switchLot = useCallback((lotId: string) => {
    setLotHistory(prev => {
      const target = prev.find(l => l.id === lotId);
      if (target) {
        setCurrentLotState(target);
      }
      return prev;
    });
  }, []);

  const deleteLot = useCallback((lotId: string) => {
    setLotHistory(prev => {
      const newHistory = prev.filter(l => l.id !== lotId);
      localStorage.setItem('krishisetu_lot_history', JSON.stringify(newHistory));
      return newHistory;
    });
    setCurrentLotState(prev => prev?.id === lotId ? null : prev);
  }, []);

  const resetAll = useCallback(() => {
    setCurrentLotState(null);
    setLotHistory([]);
    setCurrentLotDraft({});
    localStorage.removeItem('krishisetu_current_lot');
    localStorage.removeItem('krishisetu_lot_history');
    localStorage.removeItem('krishisetu_lot_draft');
  }, []);

  return (
    <LotContext.Provider
      value={{
        currentLot,
        lotHistory,
        currentLotDraft,
        setCurrentLot,
        updateLotStatus,
        updateOffer,
        updateLogistics,
        updatePayment,
        updateGrievance,
        updateAggregation,
        updateDraft,
        clearDraft,
        clearLot,
        switchLot,
        deleteLot,
        resetAll,
        isHydrated,
      }}
    >
      {children}
    </LotContext.Provider>
  );
}

export function useLot() {
  const context = useContext(LotContext);
  if (context === undefined) {
    throw new Error('useLot must be used within a LotProvider');
  }
  return context;
}

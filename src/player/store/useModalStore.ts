// src/player/store/useModalStore.ts

import React from 'react';
import { create } from 'zustand';

// Define the shape of the data passed to openModal
interface OpenModalOptions {
    width?: number;
}

interface ModalState {
    isOpen: boolean;
    content: React.ReactNode | null;
    triggerRef: React.RefObject<HTMLElement> | null;
    width?: number; // <-- ADD this property
    openModal: (
        content: React.ReactNode,
        triggerRef: React.RefObject<HTMLElement>,
        options?: OpenModalOptions // <-- UPDATE to use options object
    ) => void;
    closeModal: () => void;
}

export const useModal = create<ModalState>((set) => ({
    isOpen: false,
    content: null,
    triggerRef: null,
    width: undefined, // Default state
    openModal: (content, triggerRef, options) =>
        set({
            isOpen: true,
            content,
            triggerRef,
            width: options?.width, // <-- SET the width from options
        }),
    closeModal: () =>
        set({
            isOpen: false,
            content: null,
            triggerRef: null,
            width: undefined, // <-- RESET the width on close
        }),
}));

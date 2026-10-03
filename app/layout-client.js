"use client"
import { Suspense } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import HotkeyHandler from '@articles-media/articles-dev-box/HotkeyHandler';
import GlobalClientModals from '@/components/UI/GlobalClientModals';
import DarkModeHandler from "@articles-media/articles-dev-box/DarkModeHandler";
import { useStore } from '@/hooks/useStore';
import GlobalBody from '@articles-media/articles-dev-box/GlobalBody';
import ToontownModeHandler from '@articles-media/articles-dev-box/ToontownModeHandler';

export default function LayoutClient() {

    return (
        <>
            <GlobalBody />
            <DarkModeHandler
                useStore={useStore}
            />
            <ToontownModeHandler 
                useStore={useStore}
            />
            <Suspense>
                <HotkeyHandler useStore={useStore} useHotkeys={useHotkeys} />
                <GlobalClientModals />
            </Suspense>
        </>
    );
}

"use client"
import { useState, useEffect, useContext, useRef } from 'react';

import Link from 'next/link'
import dynamic from 'next/dynamic'

import ArticlesButton from '@/components/UI/Button';
import useFullscreen from '@articles-media/articles-dev-box/useFullscreen';
import { useStore } from '@/hooks/useStore';
import classNames from 'classnames';
import GameMenu from '@articles-media/articles-dev-box/GameMenu';
import LeftPanelContent from '@/components/UI/LeftPanel';

const GameCanvas = dynamic(() => import('@/components/Game/GameCanvas'), {
    ssr: false,
});

export default function ParkourGamePage(props) {

    const sceneKey = useStore((state) => state.sceneKey);
    const showMenu = useStore((state) => state.showMenu);
    const sidebar = useStore((state) => state.sidebar);

    return (
        <div
            className={classNames(
                `${process.env.NEXT_PUBLIC_GAME_KEY}-game-page`,
                {
                    'menu-open': showMenu,
                    'fullscreen': useFullscreen().isFullscreen,
                    'show-sidebar': sidebar,
                }
            )}
            id={`${process.env.NEXT_PUBLIC_GAME_KEY}-game-page`}
        >

            <GameMenu
                useStore={useStore}
                LeftPanelContent={LeftPanelContent}
                menuBarConfig={{
                    style: "Corner Button",
                    menuBarButtonPosition: "Left"
                }}
                sidebarConfig={{
                    style: "Static Panel",
                }}
            />

            {/* Game Board */}
            <div className='game-content'>

                <div className='canvas-three-wrap' id="game-canvas">

                    <GameCanvas
                        key={sceneKey}
                    />

                </div>

            </div>

        </div>
    )
}
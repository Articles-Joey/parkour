"use client"
import { useState, useEffect, useContext, useRef } from 'react';

import Link from 'next/link'
import dynamic from 'next/dynamic'

// import ROUTES from '@/components/constants/routes';

import ArticlesButton from '@/components/UI/Button';
import useFullscreen from '@/hooks/useFullScreen';
import { useParkourStore } from '@/hooks/useParkourStore';
import { Dropdown, DropdownButton } from 'react-bootstrap';

// const InviteModal = dynamic(
//     () => import('@/components/UI/InviteModal'),
//     { ssr: false }
// )

// const InfoModal = dynamic(
//     () => import('@/components/UI/InfoModal'),
//     { ssr: false }
// )

// const SettingsModal = dynamic(
//     () => import('@/components/Games/SettingsModal'),
//     { ssr: false }
// )

const GameCanvas = dynamic(() => import('@/components/Game/GameCanvas'), {
    ssr: false,
});

// const GameCanvasOld = dynamic(() => import('../components/GameCanvasOld'), {
//     ssr: false,
// });

export default function ParkourGamePage(props) {

    const { isFullscreen, requestFullscreen, exitFullscreen } = useFullscreen();

    const [map, setMap] = useState("New");

    const [sceneKey, setSceneKey] = useState(0);

    const reloadScene = () => {
        setSceneKey((prevKey) => prevKey + 1);
    };

    const {
        resetCheckpoints,
        cameraMode,
        setCameraMode,
        debug,
        setDebug
    } = useParkourStore(state => ({
        resetCheckpoints: state.resetCheckpoints,
        cameraMode: state.cameraMode,
        setCameraMode: state.setCameraMode,
        debug: state.debug,
        setDebug: state.setDebug,
    }));

    const position = useParkourStore((state) => state.position);
    const checkpoints = useParkourStore((state) => state.checkpoints);
    const api = useParkourStore((state) => state.api);
    // const resetCheckpoints = useParkourStore((state) => state.resetCheckpoints);

    return (
        <div className="parkour-game-page" id={'parkour-game-page'}>

            <div className="menu-bar">
                <ArticlesButton>
                    Menu
                </ArticlesButton>
            </div>

            <div className="mobile-menu">

            </div>

            <div className='menu-card p-2'>

                <div className='d-flex'>

                    <Link href={'/'} className='w-50'>
                        <ArticlesButton
                            small
                            className="w-100"
                        >
                            <i className="fad fa-sign-out fa-rotate-180"></i>
                            <span>Leave Game</span>
                        </ArticlesButton>
                    </Link>

                    <ArticlesButton
                        small
                        className="w-50"
                        active={isFullscreen}
                        onClick={() => {
                            if (isFullscreen) {
                                exitFullscreen()
                            } else {
                                requestFullscreen('parkour-game-page')
                            }
                        }}
                    >
                        {isFullscreen && <span>Exit </span>}
                        {!isFullscreen && <span><i className='fad fa-expand'></i></span>}
                        <span>Fullscreen</span>
                    </ArticlesButton>

                </div>

                <div className='d-flex'>

                    <ArticlesButton
                        small
                        className="w-50"
                        onClick={() => {
                            reloadScene()
                        }}
                    >
                        {/* <i className="fad fa-map fa-rotate-180"></i> */}
                        <span>Reload Game</span>
                    </ArticlesButton>

                    <ArticlesButton
                        small
                        className="w-50"
                    >
                        <i className="fad fa-map fa-rotate-180"></i>
                        <span>Checkpoints</span>
                    </ArticlesButton>

                </div>

                <div className='d-flex mb-3'>

                    <div className='w-50'>
                        <DropdownButton
                            variant="articles w-100"
                            size='sm'
                            id="dropdown-basic-button"
                            className="dropdown-articles"
                            title={
                                <span>
                                    <i className="fad fa-bug"></i>
                                    <span>Debug </span>
                                    <span>{debug ? 'On' : 'Off'}</span>
                                </span>
                            }
                        >

                            <div style={{ maxHeight: '600px', overflowY: 'auto', width: '200px' }}>

                                {[
                                    false,
                                    true
                                ]
                                    .map(location =>
                                        <Dropdown.Item
                                            key={location}
                                            onClick={() => {
                                                setDebug(location)
                                            }}
                                            className="d-flex justify-content-between"
                                        >
                                            {location ? 'True' : 'False'}
                                        </Dropdown.Item>
                                    )}

                            </div>

                        </DropdownButton>
                    </div>

                    <div className='w-50'>
                        <DropdownButton
                            variant="articles w-100"
                            size='sm'
                            id="dropdown-basic-button"
                            className="dropdown-articles"
                            title={
                                <span>
                                    <i className="fad fa-camera"></i>
                                    <span>Camera</span>
                                </span>
                            }
                        >

                            <div style={{ maxHeight: '600px', overflowY: 'auto', width: '200px' }}>

                                {[
                                    {
                                        name: 'Free',
                                    },
                                    {
                                        name: 'Player',
                                    }
                                ]
                                    .map(location =>
                                        <Dropdown.Item
                                            key={location.name}
                                            active={cameraMode == location.name}
                                            onClick={() => {
                                                setCameraMode(location.name)
                                                // setShowMenu(false)
                                            }}
                                            className="d-flex justify-content-between"
                                        >
                                            <i className="fad fa-camera"></i>
                                            {location.name}
                                        </Dropdown.Item>
                                    )}

                            </div>

                        </DropdownButton>
                    </div>

                </div>

                <div className="card">

                    <div className="card-header flex-header">
                        <div>Debug</div>
                        <div
                            className="badge bg-articles badge-hover"
                            onClick={() => {
                                resetCheckpoints()
                            }}
                        >
                            <i className="fad fa-redo me-0"></i>
                        </div>
                    </div>

                    <div className="card-body p-1  d-flex justify-content-center border-bottom">

                        <ArticlesButton
                            small
                            onClick={() => {
                                api.position.set(
                                    0,
                                    5,
                                    0,
                                );
                            }}
                        >
                            Start
                        </ArticlesButton>

                        {[...Array(4)].map((obj, i) => {

                            let checkpoint = checkpoints.find(obj => obj.name == (i + 1))

                            return (
                                <ArticlesButton
                                    key={i}
                                    small
                                    // disabled={checkpoint?.locked}
                                    onClick={() => {
                                        console.log("Teleport to checkpoint", checkpoint?.location)
                                        api.position.set(
                                            checkpoint?.location[0],
                                            checkpoint?.location[1],
                                            checkpoint?.location[2],
                                        );
                                    }}
                                >
                                    {i + 1}
                                </ArticlesButton>
                            )
                        })}

                        <ArticlesButton
                            small
                            disabled
                        >
                            End
                        </ArticlesButton>

                    </div>

                    <div className="card-body border-bottom">
                        <div>{position[0].toFixed(2)}</div>
                        <div>{position[1].toFixed(2)}</div>
                        <div>{position[2].toFixed(2)}</div>
                    </div>

                    <div className="card-body">
                        {checkpoints.map((checkpoint, i) => {
                            return (
                                <div
                                    key={i}
                                    className='mb-2'
                                >
                                    <div className='small'>{checkpoint.name}</div>
                                    <div>{checkpoint.locked ? 'Locked' : 'Unlocked'}</div>
                                </div>
                            )
                        })}
                    </div>

                </div>

            </div>

            {/* Game Board */}
            <div className='game-content'>

                <div className='canvas-three-wrap' id="canvas-three-wrap">

                    <GameCanvas
                        key={sceneKey}
                    />

                </div>

            </div>

        </div>
    )
}
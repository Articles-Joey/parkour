"use client"
import { useEffect, useContext, useState } from 'react';

import Image from 'next/image'
import Link from 'next/link'
import dynamic from 'next/dynamic'

import ArticlesButton from '@/components/UI/Button';

import { useSocketStore } from '@/hooks/useSocketStore';
import { useStore } from '@/hooks/useStore';

import useUserDetails from '@articles-media/articles-dev-box/useUserDetails';
import useUserToken from '@articles-media/articles-dev-box/useUserToken';
import NicknameInput from '@articles-media/articles-dev-box/NicknameInput';
import GameMenuPrimaryButtonGroup from '@articles-media/articles-dev-box/GameMenuPrimaryButtonGroup';
import SessionButton from '@articles-media/articles-dev-box/SessionButton';
import { GamepadKeyboard, PieMenu } from '@articles-media/articles-gamepad-helper';
const ReturnToLauncherButton = dynamic(() =>
    import('@articles-media/articles-dev-box/ReturnToLauncherButton'),
    { ssr: false }
);
const GameScoreboard = dynamic(() =>
    import('@articles-media/articles-dev-box/GameScoreboard'),
    { ssr: false }
);
const Ad = dynamic(() =>
    import('@articles-media/articles-dev-box/Ad'),
    { ssr: false }
);

export default function CannonGameLobbyPage() {

    const {
        socket,
    } = useSocketStore(state => ({
        socket: state.socket,
    }));

    const darkMode = useStore((state) => state.darkMode)
    const toggleDarkMode = useStore((state) => state.toggleDarkMode)

    useEffect(() => {

        if (socket.connected) {
            socket.emit('join-room', `game:${process.env.NEXT_PUBLIC_GAME_KEY}-landing`);
        }

        return function cleanup() {
            socket.emit('leave-room', `game:${process.env.NEXT_PUBLIC_GAME_KEY}-landing`);
        };

    }, [socket.connected]);

    const {
        data: userToken,
        error: userTokenError,
        isLoading: userTokenLoading,
        mutate: userTokenMutate
    } = useUserToken(
        process.env.NEXT_PUBLIC_GAME_PORT
    );

    const {
        data: userDetails,
        error: userDetailsError,
        isLoading: userDetailsLoading,
        mutate: userDetailsMutate
    } = useUserDetails({
        token: userToken
    });

    return (

        <div className="landing-page">

            <div className='background-wrap'>
                <Image
                    src={`${process.env.NEXT_PUBLIC_CDN}games/Parkour/parkour-background.jpg`}
                    alt=""
                    fill
                    style={{ objectFit: 'cover', objectPosition: 'center', filter: 'blur(10px)' }}
                />
            </div>

            <div className="container d-flex flex-column-reverse flex-lg-row justify-content-center align-items-center py-3">

                <div
                    style={{ "width": "20rem" }}
                >

                    <div
                        className="card card-articles card-sm mb-3"
                    >

                        {/* <div style={{ position: 'relative', height: '200px' }}>
                            <Image
                                src={Logo}
                                alt=""
                                fill
                                style={{ objectFit: 'cover' }}
                            />
                        </div> */}

                        <div className='card-header d-flex align-items-center'>

                            <NicknameInput
                                useStore={useStore}
                            />

                        </div>

                        <div className="card-body">

                            {/* <div className="fw-bold mb-1 small text-center">
                                {lobbyDetails.players.length || 0} player{lobbyDetails.players.length > 1 && 's'} in the lobby.
                            </div> */}

                            <div className='small fw-bold'>Official Maps</div>

                            <div className="servers mb-3">

                                {[
                                    {
                                        name: "Beginner",
                                        description: "Learn the basics",
                                        ready: true
                                    },
                                    {
                                        name: "Intermediate",
                                        description: "Heating up",
                                        ready: false
                                    },
                                    {
                                        name: "Advanced",
                                        description: "You shall not pass",
                                        ready: false
                                    },
                                    {
                                        name: "Expert",
                                        description: "You shall not pass",
                                        ready: false
                                    }
                                ].map(map_obj => {

                                    return (
                                        <div key={map_obj.name} className="server">

                                            <div className='d-flex justify-content-between align-items-center w-100 mb-2'>
                                                {map_obj.name}
                                            </div>

                                            <Link
                                                className={``}
                                                href={{
                                                    pathname: `/play`,
                                                    query: {
                                                        map: map_obj.name
                                                    }
                                                }}
                                            >
                                                <ArticlesButton
                                                    className="px-5"
                                                    small
                                                    disabled={map_obj.ready === false}
                                                >
                                                    Play
                                                </ArticlesButton>
                                            </Link>

                                        </div>
                                    )
                                })}

                            </div>

                            <div className='small fw-bold'>Submitted Maps</div>
                            <div className='small'>Coming soon...</div>

                            {/* <div className='small fw-bold  mt-3 mb-1'>Or</div> */}

                            {/* <div className='d-flex'>
    
                                <ArticlesButton
                                    className={`w-50`}
                                    onClick={() => {
                                        // TODO
                                        alert("Coming Soon!")
                                    }}
                                >
                                    <i className="fad fa-robot"></i>
                                    Practice
                                </ArticlesButton>
    
                                <ArticlesButton
                                    className={`w-50`}
                                    onClick={() => {
                                        setShowPrivateGameModal(prev => !prev)
                                    }}
                                >
                                    <i className="fad fa-lock"></i>
                                    Private Game
                                </ArticlesButton>
    
                            </div> */}

                            {/* <IsDev className={'mt-3'}>
                                <div>
                                    <ArticlesButton
                                        className="w-50"
                                        variant='warning'
                                        onClick={() => {
                                            socket.emit('game:four-frogs:reset', '');
                                        }}
                                    >
                                        Reset Server
                                    </ArticlesButton>
                                </div>
                            </IsDev> */}

                        </div>

                        <div className="card-footer d-flex flex-wrap justify-content-center">

                            <GameMenuPrimaryButtonGroup
                                useStore={useStore}
                                type="Landing"
                            />

                        </div>

                    </div>

                    <SessionButton
                        port={process.env.NEXT_PUBLIC_GAME_PORT}
                        friendsButton={true}
                    />

                    <ReturnToLauncherButton />

                </div>

                <GameScoreboard
                    game={process.env.NEXT_PUBLIC_GAME_NAME}
                    style="Default"
                    darkMode={darkMode ? true : false}
                    prepend={
                        <>
                            {/* <div
                                style={{
                                    width: '100%',
                                    height: '200px',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}
                            >
                                <RotatingMascot />
                            </div> */}
                        </>
                    }
                />

                <Ad
                    style="Default"
                    section={"Games"}
                    section_id={process.env.NEXT_PUBLIC_GAME_NAME}
                    darkMode={darkMode ? true : false}
                    user_ad_token={userToken}
                    userDetails={userDetails}
                    userDetailsLoading={userDetailsLoading}
                />

                {/* <Ad section={"Games"} section_id={game_name} /> */}

            </div>
        </div>
    );
}
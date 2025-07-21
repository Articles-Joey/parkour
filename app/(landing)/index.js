"use client"
import { useEffect, useContext, useState } from 'react';

import Image from 'next/image'
import Link from 'next/link'
import dynamic from 'next/dynamic'

// import { useSelector, useDispatch } from 'react-redux'

// import ROUTES from 'components/constants/routes'

import ArticlesButton from '@/components/UI/Button';
// import SingleInput from '@/components/Articles/SingleInput';
import { useLocalStorageNew } from '@/hooks/useLocalStorageNew';
// import IsDev from '@/components/IsDev';
// import { ChromePicker } from 'react-color';
import { useSocketStore } from '@/hooks/useSocketStore';

// const Ad = dynamic(() => import('components/Ads/Ad'), {
//     ssr: false,
// });

const InfoModal = dynamic(
    () => import('@/components/UI/InfoModal'),
    { ssr: false }
)

const SettingsModal = dynamic(
    () => import('@/components/UI/SettingsModal'),
    { ssr: false }
)

// const PrivateGameModal = dynamic(
//     () => import('@/components/UI/PrivateGameModal'),
//     { ssr: false }
// )

const game_key = 'parkour'
const game_name = 'Parkour'

export default function CannonGameLobbyPage() {

    const {
        socket,
    } = useSocketStore(state => ({
        socket: state.socket,
    }));

    // const userReduxState = useSelector((state) => state.auth.user_details)
    const userReduxState = false

    const [nickname, setNickname] = useLocalStorageNew("game:nickname", userReduxState.display_name)

    const [showInfoModal, setShowInfoModal] = useState(false)
    const [showSettingsModal, setShowSettingsModal] = useState(false)
    const [showPrivateGameModal, setShowPrivateGameModal] = useState(false)

    const [lobbyDetails, setLobbyDetails] = useState({
        players: [],
        games: [],
    })

    // useEffect(() => {

    //     setShowInfoModal(localStorage.getItem('game:four-frogs:rulesAnControls') === 'true' ? true : false)

    //     // if (userReduxState._id) {
    //     //     console.log("Is user")
    //     // }

    //     socket.on('game:four-frogs-landing-details', function (msg) {
    //         console.log('game:four-frogs-landing-details', msg)

    //         if (JSON.stringify(msg) !== JSON.stringify(lobbyDetails)) {
    //             setLobbyDetails(msg)
    //         }
    //     });

    //     return () => {
    //         socket.off('game:four-frogs-landing-details');
    //     };

    // }, [])

    // useEffect(() => {

    //     localStorage.setItem('game:four-frogs:rulesAnControls', showInfoModal)

    // }, [showInfoModal])

    // useEffect(() => {

    //     if (socket.connected) {
    //         socket.emit('join-room', 'game:four-frogs-landing');
    //     }

    //     return function cleanup() {
    //         socket.emit('leave-room', 'game:four-frogs-landing')
    //     };

    // }, [socket.connected]);

    return (

        <div className="cannon-landing-page">

            {showInfoModal &&
                <InfoModal
                    show={showInfoModal}
                    setShow={setShowInfoModal}
                />
            }

            {showSettingsModal &&
                <SettingsModal
                    show={showSettingsModal}
                    setShow={setShowSettingsModal}
                />
            }

            {/* {showPrivateGameModal &&
                <PrivateGameModal
                    show={showPrivateGameModal}
                    setShow={setShowPrivateGameModal}
                />
            } */}

            <div className='background-wrap'>
                <Image
                    src={`${process.env.NEXT_PUBLIC_CDN}games/Parkour/parkour-background.jpg`}
                    alt=""
                    fill
                    style={{ objectFit: 'cover', objectPosition: 'center', filter: 'blur(10px)' }}
                />
            </div>

            <div className="container d-flex flex-column-reverse flex-lg-row justify-content-center align-items-center">

                <div
                    className="card card-articles card-sm mb-3 mb-lg-0"
                    style={{ "width": "20rem" }}
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

                        <div className="flex-grow-1">

                            <div className="form-group articles mb-0">
                                <label htmlFor="nickname">Nickname</label>
                                {/* <SingleInput
                                    value={nickname}
                                    setValue={setNickname}
                                    noMargin
                                /> */}
                                <input
                                    type="text"
                                    className="form-control"
                                    id="nickname"
                                    value={nickname}
                                    onChange={(e) => setNickname(e.target.value)}
                                    placeholder="Enter your nickname"
                                />
                            </div>

                            <div className='mt-1' style={{ fontSize: '0.8rem' }}>Visible to all players</div>

                        </div>
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
                        <div className='small'>Coming soon, ability to submit your own maps via a GitHub commit! ETA Summer 2025.</div>

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

                        <ArticlesButton
                            className={`w-50`}
                            small
                            onClick={() => {
                                setShowSettingsModal(prev => !prev)
                            }}
                        >
                            <i className="fad fa-cog"></i>
                            Settings
                        </ArticlesButton>

                        <ArticlesButton
                            className={`w-50`}
                            small
                            onClick={() => {
                                setShowInfoModal({
                                    game: game_name
                                })
                            }}
                        >
                            <i className="fad fa-info-square"></i>
                            Rules & Controls
                        </ArticlesButton>

                        <Link href={'/'} className='w-50'>
                            <ArticlesButton
                                className={`w-100`}
                                small
                                onClick={() => {

                                }}
                            >
                                <i className="fad fa-sign-out fa-rotate-180"></i>
                                Leave Game
                            </ArticlesButton>
                        </Link>

                        <ArticlesButton
                            className={`w-50`}
                            small
                            onClick={() => {
                                setShowInfoModal({
                                    game: game_name
                                })
                            }}
                        >
                            <i className="fad fa-users"></i>
                            Credits
                        </ArticlesButton>

                    </div>

                </div>

                {/* <Ad section={"Games"} section_id={game_name} /> */}

            </div>
        </div>
    );
}
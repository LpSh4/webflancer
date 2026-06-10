import {NavLink, useLocation, Link} from "react-router";
import {useState, useEffect} from "react";
import {UserCard} from "../../../features/user/shared/components/UserCard";
import {navItems} from "~/shared/components/sidebar/NavItems";
import {LuMenu, LuX} from "react-icons/lu";
import type {UserProfile} from "../../../features/user/shared/model";

interface SidebarProps {
    user: UserProfile;
}

export function Sidebar({user}: SidebarProps) {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        setIsOpen(false);
    }, [location.pathname]);

    const toggleSidebar = () => setIsOpen(!isOpen);

    return (
        <>
            <button
                id="global-burger-btn"
                onClick={toggleSidebar}
                className="lg:hidden fixed top-5 left-4 sm:left-6 z-[200] w-10 h-10 flex items-center justify-center bg-[#0d1930]/80 border border-blue-500/20 hover:bg-blue-900/40 rounded-xl text-blue-400 shadow-lg backdrop-blur-md transition-all cursor-pointer"
            >
                {isOpen ? <LuX size={22}/> : <LuMenu size={22}/>}
            </button>

            {isOpen && (
                <div
                    className="fixed inset-0 bg-[#020817]/80 backdrop-blur-sm z-[170] lg:hidden animate-in fade-in duration-200"
                    onClick={toggleSidebar}
                />
            )}

            <aside className={`
                fixed inset-y-0 left-0 z-[180] 
                w-64 sm:w-72 lg:w-64 xl:w-72
                bg-[#020817] sm:bg-transparent sm:glass-panel border-r border-white/5 
                flex flex-col transition-all duration-300 ease-in-out
                lg:relative lg:translate-x-0
                ${isOpen ? "translate-x-0 shadow-[0_0_50px_rgba(0,0,0,0.5)]" : "-translate-x-full"}
            `}>
                <Logo/>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <Nav closeMenu={() => setIsOpen(false)} role={user.role}/>
                </div>

                <div className="p-4 sm:p-6 lg:p-4 xl:p-6 mt-auto transition-all duration-300">
                    <Link to={'/users/me'} onClick={() => setIsOpen(false)}>
                        <UserCard user={user}/>
                    </Link>
                </div>
            </aside>
        </>
    );
}

function Logo() {
    return (
        <div
            className="h-16 sm:h-20 flex items-center px-6 sm:px-8 lg:px-6 xl:px-8 border-b border-white/5 lg:border-transparent shrink-0 transition-all duration-300">
            <div
                className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20 mr-3 shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                          d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
            </div>
            <span
                className="text-lg sm:text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-400 tracking-tighter uppercase truncate">
                OnboardMe
            </span>
        </div>
    );
}

function Nav({closeMenu, role}: { closeMenu: () => void, role: string }) {
    const location = useLocation();

    // 🔥 Фильтруем массив пунктов меню по роли пользователя
    const filteredItems = navItems.filter(item => item.allowedRoles.includes(role));

    return (
        <nav className="px-3 sm:px-4 lg:px-3 xl:px-4 py-4 sm:py-6 space-y-1 transition-all duration-300">
            <div className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">
                Навигация
            </div>

            {filteredItems.map((item) => {
                const isManualActive = item.activePattern
                    ? location.pathname.startsWith(item.activePattern)
                    : false;

                return (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        end={!item.activePattern}
                        onClick={closeMenu}
                        className={({isActive}) => {
                            const active = isActive || isManualActive;
                            return `flex items-center gap-3 px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl transition-all font-medium group cursor-pointer ${
                                active
                                    ? "bg-blue-600/10 text-blue-400 shadow-lg shadow-blue-900/20"
                                    : "text-slate-400 hover:text-white hover:bg-white/5"
                            }`;
                        }}
                    >
                        {({isActive}) => {
                            const active = isActive || isManualActive;
                            return (
                                <>
                                    <div
                                        className={`w-5 h-5 flex items-center justify-center transition-colors shrink-0 ${active ? "text-blue-400" : "text-slate-500 group-hover:text-blue-400"}`}>
                                        {item.icon}
                                    </div>
                                    <span className="text-sm sm:text-base truncate">{item.label}</span>
                                </>
                            );
                        }}
                    </NavLink>
                );
            })}
        </nav>
    );
}
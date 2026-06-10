import {LuUsersRound, LuLayoutDashboard} from "react-icons/lu";
import {MdWorkspacesOutline, MdManageHistory} from "react-icons/md";
import {GrUpgrade} from "react-icons/gr";
import {IoChatbubblesOutline, IoWarningOutline} from "react-icons/io5";
import {FaPeopleRobbery} from "react-icons/fa6";
import React from "react";

export interface NavItem {
    to: string;
    label: string;
    icon: React.ReactNode;
    activePattern?: string;
    allowedRoles: string[];
}

export const navItems: NavItem[] = [
    {
        to: "/hr-dashboard",
        label: "Дашборд HR",
        icon: <LuLayoutDashboard size={22}/>,
        allowedRoles: ['hr']
    },
    {
        to: "/teamlead-dashboard",
        label: "Дашборд тимлида",
        icon: <LuLayoutDashboard size={22}/>,
        allowedRoles: ['teamlead', 'hr']
    },
    {
        to: "/teamlead-panel",
        label: "Управление онбордингами",
        icon: <MdManageHistory size={24}/>,
        allowedRoles: ['teamlead', 'hr']
    },
    {
        to: "/chat",
        label: "Чаты",
        activePattern: "/chat",
        icon: <IoChatbubblesOutline size={24}/>,
        allowedRoles: ['intern', 'teamlead', 'hr']
    },
    {
        to: "/teamlead-issues",
        label: "Активность стажеров",
        icon: <IoWarningOutline size={22}/>,
        allowedRoles: ['teamlead', 'hr']
    },

    {
        to: "/hr/interns",
        label: "Управление стажерами",
        icon: <FaPeopleRobbery size={22}/>,
        allowedRoles: ['hr']
    },
    {
        to: "/team",
        label: "Все пользователя",
        icon: <LuUsersRound size={22}/>,
        allowedRoles: ['hr']
    },
    {
        to: "/positions",
        label: "Должности",
        icon: <MdWorkspacesOutline size={22}/>,
        allowedRoles: ['hr']
    },

    {
        to: "/onboarding/stages",
        activePattern: "/onboarding",
        label: "Мой онбординг",
        icon: <GrUpgrade size={22}/>,
        allowedRoles: ['intern']
    },
    {
        to: "/issues",
        label: "Доработки",
        icon: <IoWarningOutline size={22}/>,
        allowedRoles: ['intern']
    },


];
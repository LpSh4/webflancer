
export function getUserStatus(lastOnline: string | Date | null | undefined) {
    if (!lastOnline) return { isOnline: false, label: "Офлайн" };

    const lastSeen = new Date(lastOnline).getTime();
    const now = Date.now();

    // Если последняя активность была меньше 5 минут назад — считаем Онлайн
    const isOnline = now - lastSeen < 1000 * 60 * 5;

    if (isOnline) return { isOnline: true, label: "В сети" };

    const date = new Date(lastOnline);
    // Форматируем время "Был(а) в 14:30"
    const time = date.toLocaleTimeString("ru-RU", { hour: '2-digit', minute: '2-digit' });
    return { isOnline: false, label: `Был(а) в ${time}` };
}
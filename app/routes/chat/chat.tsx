import type {Route} from "./+types/chat";
import {api} from "~/shared/utils/api.server";
import {ChatMain} from "~/features/chat/components/ChatMain";
import {requireAuth} from "~/shared/utils/auth.server";

export async function loader({request}: Route.LoaderArgs) {
    const {headers, token} = await requireAuth(request);

    const url = new URL(request.url);
    const activeChatId = url.searchParams.get("chatId");
    const userIdFromUrl = url.searchParams.get("userId");

    try {
        const [contactsRes] = await Promise.all([
            api.get('/chats', {headers})
        ]);
        const contacts = contactsRes.data.data || contactsRes.data;

        let initialMessages = [];
        let tempContact = null;

        // Если открыт существующий чат
        if (activeChatId) {
            const messagesRes = await api.get(
                `/chats/${activeChatId}/messages`,
                {headers}
            );
            initialMessages = messagesRes.data;
        }
        // Если мы начинаем новый чат (выбрали юзера из поиска)
        else if (userIdFromUrl) {
            try {
                // Подтягиваем инфу о юзере, чтобы показать заголовок в чате
                const userRes = await api.get(`/users/${userIdFromUrl}`, {headers});
                tempContact = userRes.data;
            } catch (e) {
                console.error("User not found");
            }
        }

        return {
            initialContacts: contacts,
            initialMessages,
            activeChatId,
            userIdFromUrl,
            tempContact,   // Данные временного контакта
            token
        };
    } catch (e) {
        console.error("Ошибка при загрузке чата:", e);
        return {
            initialContacts: [],
            initialMessages: [],
            activeChatId: null,
            userIdFromUrl: userIdFromUrl || null,
            tempContact: null,
            token
        };
    }
}

export default function ChatPage({loaderData}: Route.ComponentProps) {
    const {initialContacts, initialMessages, activeChatId, token, userIdFromUrl, tempContact} = loaderData;

    return (
        <main className="flex-1 flex overflow-hidden">
            <ChatMain
                initialContacts={initialContacts}
                initialMessages={initialMessages}
                activeChatId={activeChatId}
                token={token}
                userIdFromUrl={userIdFromUrl}
                tempContact={tempContact}
            />
        </main>
    );
}
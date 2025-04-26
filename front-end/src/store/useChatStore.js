import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  unreadMessages: {},
  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },
  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  // subscribeToMessages: () => {
  //   const { selectedUser } = get();
  //   if (!selectedUser) return;

  //   const socket = useAuthStore.getState().socket;

  //   socket.on("newMessage", (newMessage) => {
  //     const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
  //     if (!isMessageSentFromSelectedUser) return;

  //     set({
  //       messages: [...get().messages, newMessage],
  //     });
  //   });
  // },
  subscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      const { selectedUser, messages, unreadMessages } = get();

      const isActiveChat = selectedUser && newMessage.senderId === selectedUser._id;

      if (isActiveChat) {
        set({ messages: [...messages, newMessage] });
      } else {
        // Not currently chatting with sender — count as unread
        const currentUnread = unreadMessages[newMessage.senderId] || 0;
        set({
          unreadMessages: {
            ...unreadMessages,
            [newMessage.senderId]: currentUnread + 1,
          },
        });
      }
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },

  //setSelectedUser: (selectedUser) => set({ selectedUser }),
  setSelectedUser: (selectedUser) => {
    // Clear unread when selecting a user
    const { unreadMessages } = get();
    const updatedUnread = { ...unreadMessages };
    if (updatedUnread[selectedUser._id]) {
      delete updatedUnread[selectedUser._id];
    }
    set({ selectedUser, unreadMessages: updatedUnread });
  },
  clearUnreadMessages: () => set({ unreadMessages: {} }),
}));
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateUser, type Page, type User } from "../api";
import { userKeys } from "./userKeys";

type UpdateParams = {
    id: string;
    patch: Partial<User>;
};

export const useUpadateUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, patch }: UpdateParams) => updateUser(id, patch),
        onMutate: async ({ id, patch }: UpdateParams) => {
            await queryClient.cancelQueries({ queryKey: userKeys.all });

            const prevDetails = queryClient.getQueryData(userKeys.detail(id));
            const prevLists = queryClient.getQueriesData<Page<User>>({ queryKey: userKeys.lists() });

            queryClient.setQueryData(userKeys.detail(id), (user: User) => user && { ...user, ...patch });
            queryClient.setQueriesData<Page<User>>(
                { queryKey: userKeys.lists() },
                (page) => page && { ...page, items: page.items.map((u) => (u.id === id ? { ...u, ...patch } : u)) },
            );

            return { prevDetails, prevLists };
        },
        onError: (_err, { id }, ctx) => {
            if (!ctx) return;
            queryClient.setQueryData(userKeys.detail(id), ctx.prevDetails);
            ctx.prevLists.forEach(([key, data]) => queryClient.setQueryData(key, data));
        },
        onSuccess: (updated) => {
            queryClient.setQueryData(userKeys.detail(updated.id), updated); // źródło prawdy z serwera
        },
        onSettled: () => {
            return queryClient.invalidateQueries({ queryKey: userKeys.lists() });
        },
    });
};

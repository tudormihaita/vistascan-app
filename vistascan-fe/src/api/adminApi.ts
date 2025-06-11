import {apiSlice} from "./apiSlice.ts";
import {UpdateUserRequestDto, UserDto} from "../types/dtos/UserDto.ts";
import {ConsultationDto} from "../types/dtos/ConsultationDto.ts";

export const adminApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getAllUsers: builder.query<UserDto[], void>({
            query: () => '/admin/users',
            providesTags: ['usersCache'],
        }),
        getAllConsultations: builder.query<ConsultationDto[], void>({
            query: () => '/admin/consultations',
            providesTags: ['allConsultationsCache'],
        }),
        updateUser: builder.mutation<UserDto, { userId: string; updateData: UpdateUserRequestDto }>({
            query: ({ userId, updateData }) => ({
                url: `/admin/users/${userId}`,
                method: 'PUT',
                body: updateData,
            }),
            invalidatesTags: ['usersCache'],
        }),
        deleteUser: builder.mutation<void, string>({
            query: (userId) => ({
                url: `/admin/users/${userId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['usersCache'],
        }),
        deleteConsultation: builder.mutation<void, string>({
            query: (consultationId) => ({
                url: `/admin/consultations/${consultationId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['allConsultationsCache'],
        })
    }),
});

export const {
    useGetAllUsersQuery,
    useGetAllConsultationsQuery,
    useUpdateUserMutation,
    useDeleteUserMutation,
    useDeleteConsultationMutation,
} = adminApi;
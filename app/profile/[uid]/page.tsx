"use client";

import {
    useParams,
} from "next/navigation";

import ProfileView from "@/app/components/ProfileView";


export default function UserProfilePage() {
    const params =
        useParams();

    const uid =
        params.uid as string;

    return (
        <ProfileView
            profileUid={uid}
        />
    );
}
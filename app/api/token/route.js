import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(req) {
    try {
        const cookieStore = await cookies();

        const session_token = cookieStore.get("sess")?.value;

        const oauth_token = session_token;

        if (!session_token) {
            return NextResponse.json(
                { error: "No session token found" },
                { status: 400 },
            );
        }

        return NextResponse.json(session_token, { status: 200 });
    } catch (error) {
        console.error("Error in GET /api/auth/oauth/articles/details:", error);
        return new Response(
            JSON.stringify({ error: "Internal Server Error" }),
            { status: 500 },
        );
    }
}

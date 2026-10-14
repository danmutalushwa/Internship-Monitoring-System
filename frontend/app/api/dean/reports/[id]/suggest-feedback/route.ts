import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    console.log(" suggest-feedback API route HIT");

    const { userId } = await req.json();
    const { id } = params;

    console.log("User ID:", userId);
    console.log("Report ID:", id);

    const token = req.headers.get("authorization");

    const backendRes = await fetch(
      `${process.env.BACKEND_URL}/dean/reports/${id}/suggest-feedback`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token || "",
        },
        body: JSON.stringify({ userId }),
      }
    );

    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });

  } catch (err: any) {
    console.error("❌ suggest-feedback ERROR:", err);
    return NextResponse.json(
      { error: "Route crashed", details: err?.message },
      { status: 500 }
    );
  }
}
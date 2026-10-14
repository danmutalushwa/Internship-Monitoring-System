import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const token = req.headers.get("authorization");

  const backendRes = await fetch(
    `http://localhost:4000/dean/reports/${id}`,
    {
      method: "GET",
      headers: {
        Authorization: token || "",
      }
    }
  );

  const data = await backendRes.json();
  return NextResponse.json(data, { status: backendRes.status });
}
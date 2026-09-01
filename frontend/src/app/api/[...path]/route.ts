import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = "http://127.0.0.1:5000";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const apiPath = path.join("/");
  const search = request.nextUrl.search;
  const targetUrl = `${BACKEND_URL}/api/${apiPath}${search}`;

  try {
    const res = await fetch(targetUrl, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json({ error: "Backend unreachable" }, { status: 502 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const apiPath = path.join("/");
  const targetUrl = `${BACKEND_URL}/api/${apiPath}`;
  const body = await request.text();

  try {
    const res = await fetch(targetUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      cache: "no-store",
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json({ error: "Backend unreachable" }, { status: 502 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const apiPath = path.join("/");
  const targetUrl = `${BACKEND_URL}/api/${apiPath}`;
  const body = await request.text();

  try {
    const res = await fetch(targetUrl, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body,
      cache: "no-store",
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json({ error: "Backend unreachable" }, { status: 502 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const apiPath = path.join("/");
  const targetUrl = `${BACKEND_URL}/api/${apiPath}`;
  const body = await request.text();

  try {
    const res = await fetch(targetUrl, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body,
      cache: "no-store",
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json({ error: "Backend unreachable" }, { status: 502 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const apiPath = path.join("/");
  const targetUrl = `${BACKEND_URL}/api/${apiPath}`;

  try {
    const res = await fetch(targetUrl, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json({ error: "Backend unreachable" }, { status: 502 });
  }
}

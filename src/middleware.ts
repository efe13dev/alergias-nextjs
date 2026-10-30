import { type NextRequest, NextResponse } from "next/server";
import { isAuthorized } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const password = process.env.APP_PASSWORD;
  if (!password || !/^[\x21-\x7e]{32,}$/.test(password)) {
    return new NextResponse(
      "Configura APP_PASSWORD con al menos 32 caracteres ASCII sin espacios.",
      {
        status: 503,
      },
    );
  }

  if (!(await isAuthorized(request.headers.get("authorization"), password))) {
    return new NextResponse("Acceso requerido", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="Alergias", charset="UTF-8"' },
    });
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

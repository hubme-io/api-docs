import { type NextRequest, NextResponse } from "next/server";

const API_BASE_URL = "https://api.managefy.com.br/integration";

export async function GET(request: NextRequest) {
  return handleProxyRequest(request, "GET");
}

export async function POST(request: NextRequest) {
  return handleProxyRequest(request, "POST");
}

export async function PUT(request: NextRequest) {
  return handleProxyRequest(request, "PUT");
}

export async function DELETE(request: NextRequest) {
  return handleProxyRequest(request, "DELETE");
}

export async function PATCH(request: NextRequest) {
  return handleProxyRequest(request, "PATCH");
}

async function handleProxyRequest(request: NextRequest, method: string) {
  try {
    const url = new URL(request.url);
    const path = url.searchParams.get("path");
    const accessToken = request.headers.get("access-token");

    if (!path) {
      return NextResponse.json(
        { error: "Path parameter is required" },
        { status: 400 }
      );
    }

    // Build the target URL
    const targetUrl = `${API_BASE_URL}${path}${url.search
      .replace("?path=" + encodeURIComponent(path), "")
      .replace(/^&/, "?")}`;

    // Prepare headers for the external API
    const headers: Record<string, string> = {
      Accept: "*/*",
      "Content-Type": "application/json",
    };

    if (accessToken) {
      headers["access-token"] = accessToken;
    }

    // Prepare request options
    const requestOptions: RequestInit = {
      method,
      headers,
    };

    // Add body for POST, PUT, PATCH requests
    if (["POST", "PUT", "PATCH"].includes(method)) {
      const body = await request.text();
      if (body) {
        requestOptions.body = body;
      }
    }

    console.log("Proxying request:", {
      url: targetUrl,
      method,
      headers: { ...headers, "access-token": accessToken ? "***" : "not set" },
    });

    // Make the request to the external API
    const response = await fetch(targetUrl, requestOptions);

    // Get response data
    const contentType = response.headers.get("content-type");
    let data: any;

    try {
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        data = await response.text();
      }
    } catch (parseError) {
      data = `Error parsing response: ${parseError}`;
    }

    // Return the response with CORS headers
    return NextResponse.json(
      {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data,
      },
      {
        status: response.status,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods":
            "GET, POST, PUT, DELETE, PATCH, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, access-token",
        },
      }
    );
  } catch (error) {
    console.error("Proxy request error:", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Proxy request failed",
        status: 0,
        statusText: "Network Error",
        headers: {},
        data: null,
      },
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods":
            "GET, POST, PUT, DELETE, PATCH, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, access-token",
        },
      }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, access-token",
    },
  });
}

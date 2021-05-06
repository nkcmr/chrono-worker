import { parseDate } from "chrono-node";
import { DateTime, IANAZone } from "luxon";
import readme from "./readme.txt";
import robots from "./robots.txt";

const ERR_NOT_FOUND = 1001;
const ERR_TEXT_REQUIRED = 1002;
const ERR_INVALID_TZ = 1003;
const ERR_TEXT_PARSE_FAILED = 1004;
const ERR_UNKNOWN = 1005;

function respondJSON(data: any, options: ResponseInit = {}): Promise<Response> {
  options.headers = {
    ...(options.headers || {}),
    "content-type": "application/json",
    "Cache-Control": "no-cache, no-store, must-revalidate",
    Pragma: "no-cache",
    Expires: "0",
  };
  return Promise.resolve(new Response(JSON.stringify(data), options));
}

function respondError(
  message: string,
  code: number,
  options?: ResponseInit
): Promise<Response> {
  if (!options?.status) {
    options = {
      ...(options || {}),
      status: 500,
    };
  }
  return respondJSON({ error: message, code }, options);
}

function badInput(code: number, message: string): Promise<Response> {
  return respondError(message, code, { status: 400 });
}

addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request));
});

function handleRequest(request: Request): Promise<Response> {
  let fullURL = new URL(request.url);
  switch (request.method) {
    case "GET":
      switch (fullURL.pathname) {
        case "/":
          return Promise.resolve(
            new Response(readme, { headers: { "content-type": "text/plain" } })
          );
        case "/robots.txt":
          return Promise.resolve(
            new Response(robots, { headers: { "content-type": "text/plain" } })
          );
        case "/parse-date":
          return parseDateHandler(request, fullURL);
      }
      break;
  }
  return respondError("not found", ERR_NOT_FOUND, { status: 404 });
}

function parseDateHandler(request: Request, fullURL: URL): Promise<Response> {
  const text = fullURL.searchParams.get("text");
  if (!text) {
    return badInput(ERR_TEXT_REQUIRED, "'text' parameter required");
  }
  const tz = fullURL.searchParams.get("tz") || "UTC";
  if (!IANAZone.isValidZone(tz)) {
    return badInput(ERR_INVALID_TZ, "'tz' parameter is invalid");
  }
  try {
    const result = parseDate(text, new Date(), {
      forwardDate: true,
    });
    if (!result || isNaN(result.valueOf())) {
      return badInput(ERR_TEXT_PARSE_FAILED, "failed to parse text");
    }
    const lresult = DateTime.fromJSDate(result, { zone: tz });
    return respondJSON({
      result: lresult.toJSON(),
      tz: tz,
    });
  } catch (e) {
    return respondError(`parse error: ${e?.message || e}`, ERR_UNKNOWN);
  }
}

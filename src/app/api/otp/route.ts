import { cookies } from "next/headers";

import { COOKIES } from "@/common/constants/cookie.constants";

export async function GET() {
  const cookieStore = await cookies();
  const variables = cookieStore.get(COOKIES.VARIABLES);
  return Response.json({
    projectName: "Next.js",
    variables: variables ? JSON.parse(variables.value) : {},
  });
}

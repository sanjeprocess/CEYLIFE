export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export type FormValue =
  | string
  | number
  | boolean
  | string[]
  | number[]
  | boolean[]
  | Record<string, FormValue>[]
  | null
  | undefined
  | File
  | File[];

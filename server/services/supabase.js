const {
  createServerClient,
  parseCookieHeader,
  serializeCookieHeader,
} = require("@supabase/ssr");

exports.createClient = (context) => {
  return createServerClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return parseCookieHeader(context.req.headers.cookie ?? "");
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            context.res.appendHeader(
              "Set-Cookie",
              serializeCookieHeader(name, value, options)
            )
          );
        },
      },
    }
  );
};

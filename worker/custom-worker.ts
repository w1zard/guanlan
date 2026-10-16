import handler from "vinext/server/fetch-handler";

type Env = CloudflareEnv & {
  CRON_SECRET: string;
};

export default {
  fetch(request: Request, env: Env, ctx: ExecutionContext) {
    return handler.fetch(request, env, ctx);
  },

  async scheduled(
    controller: ScheduledController,
    env: Env,
    ctx: ExecutionContext,
  ) {
    const request = new Request(
      "https://internal.example/api/refresh",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-cron-secret": env.CRON_SECRET,
        },
        body: "{}",
      },
    );

    const response = await handler.fetch(request, env, ctx);
    const body = await response.text();

    if (!response.ok) {
      throw new Error(
        `RSS refresh failed: ${response.status} ${body}`,
      );
    }

    console.log("RSS refresh completed:", body);
  },
} satisfies ExportedHandler<Env>;
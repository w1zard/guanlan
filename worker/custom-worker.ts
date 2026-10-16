import handler from "vinext/server/app-router-entry";

type Env = CloudflareEnv & {
  CRON_SECRET: string;
};

export default {
  fetch: handler.fetch,

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
        `RSS scheduled refresh failed: ${response.status} ${body}`,
      );
    }

    console.log("RSS scheduled refresh completed:", body);
  },
} satisfies ExportedHandler<Env>;